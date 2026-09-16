"""
FINBRIDGE — Scheme Matching Tests (Part 07)
FT-04: Financing Opportunity Layer
"""

import uuid
from decimal import Decimal
import pytest
from app.models.government_scheme import GovernmentScheme
from app.models.business import Business
from app.models.scheme_match import SchemeMatch
from app.services.scheme_matching import SchemeMatchingEngine

@pytest.fixture
def mock_schemes():
    return [
        GovernmentScheme(
            id=uuid.uuid4(),
            name="General Subsidy Scheme",
            description="Open to all",
            business_type=["ALL"],
            minimum_turnover=None,
            maximum_turnover=Decimal("5000000"),
            eligible_locations=["ALL"],
            eligibility_rules=[],
            source_url="http://example.com",
            verification_status="Verified"
        ),
        GovernmentScheme(
            id=uuid.uuid4(),
            name="Manufacturing Growth Scheme",
            description="For manufacturers in rural areas",
            business_type=["Manufacturing"],
            minimum_turnover=Decimal("500000"),
            maximum_turnover=None,
            eligible_locations=["Rural"],
            eligibility_rules=["SC/ST only"],
            source_url="http://example.com",
            verification_status="Verified"
        )
    ]

@pytest.fixture
def mock_business_perfect_match():
    return Business(
        id=uuid.uuid4(),
        business_name="Test Mfg",
        business_type="Manufacturing Sector",
        location="Rural District 5",
        annual_turnover=Decimal("1000000")
    )

@pytest.fixture
def mock_business_mismatch():
    return Business(
        id=uuid.uuid4(),
        business_name="Test Tech",
        business_type="IT Services",
        location="Urban Center",
        annual_turnover=Decimal("10000000")
    )

class MockAsyncSession:
    def __init__(self, business=None, schemes=None):
        self.business = business
        self.schemes = schemes or []
        self.added = []
    
    async def get(self, model, ident):
        if model == Business:
            return self.business
        return None
        
    async def execute(self, stmt):
        class MockResult:
            def __init__(self, data):
                self.data = data
            def scalars(self):
                class MockScalars:
                    def __init__(self, data):
                        self.data = data
                    def all(self):
                        return self.data
                return MockScalars(self.data)
        
        # Determine if we are querying schemes or existing matches
        # This is a naive mock, just to pass unit tests without real DB setup
        stmt_str = str(stmt).lower()
        if "government_schemes" in stmt_str:
            return MockResult(self.schemes)
        if "scheme_matches" in stmt_str:
            return MockResult([]) # assume no existing matches
        return MockResult([])
        
    def add(self, obj):
        self.added.append(obj)
        
    async def commit(self):
        pass

@pytest.mark.asyncio
async def test_scheme_matching_perfect(mock_schemes, mock_business_perfect_match):
    session = MockAsyncSession(business=mock_business_perfect_match, schemes=mock_schemes)
    engine = SchemeMatchingEngine(session)
    
    matches = await engine.match_schemes_for_business(mock_business_perfect_match.id)
    assert len(matches) == 2
    
    # Sort by match percentage
    matches.sort(key=lambda m: m.match_percentage, reverse=True)
    
    # General Subsidy Scheme matched 100% (type: ALL 30, turnover: ok 30, loc: ALL 20, rules: none 20)
    general_match = matches[0]
    assert general_match.match_percentage == 100
    
    # Manufacturing Growth Scheme matched 90%
    best_match = matches[1]
    assert best_match.match_percentage == 90
    assert "Sector match" in str(best_match.matched_conditions)
    assert "Additional verification required" in str(best_match.unmet_conditions)

@pytest.mark.asyncio
async def test_scheme_matching_mismatch(mock_schemes, mock_business_mismatch):
    session = MockAsyncSession(business=mock_business_mismatch, schemes=mock_schemes)
    engine = SchemeMatchingEngine(session)
    
    matches = await engine.match_schemes_for_business(mock_business_mismatch.id)
    assert len(matches) == 2
    
    # General Subsidy Scheme:
    # type (ALL) -> +30
    # turnover (10M > 5M) -> 0 + unmet
    # location (ALL) -> +20
    # rules (none) -> +20
    # Total: 70
    
    general_match = next(m for m in matches if m.scheme.name == "General Subsidy Scheme")
    assert general_match.match_percentage == 70
    assert "Turnover exceeds maximum limit" in str(general_match.unmet_conditions)
    
    # Manufacturing Growth Scheme:
    # type (Manufacturing not in 'IT Services') -> 0 + unmet
    # turnover (10M > 500k) -> +30
    # location (Rural not in 'Urban Center') -> 0 + unmet
    # rules (SC/ST) -> +10 + unmet
    # Total: 40
    
    mfg_match = next(m for m in matches if m.scheme.name == "Manufacturing Growth Scheme")
    assert mfg_match.match_percentage == 40
    assert "Requires specific sectors: Manufacturing" in str(mfg_match.unmet_conditions)
    assert "Requires specific locations: Rural" in str(mfg_match.unmet_conditions)

@pytest.mark.asyncio
async def test_scheme_matching_missing_data(mock_schemes):
    empty_business = Business(
        id=uuid.uuid4(),
        business_name="Test Empty",
        business_type=None,
        location=None,
        annual_turnover=None
    )
    session = MockAsyncSession(business=empty_business, schemes=mock_schemes)
    engine = SchemeMatchingEngine(session)
    
    matches = await engine.match_schemes_for_business(empty_business.id)
    
    mfg_match = next(m for m in matches if m.scheme.name == "Manufacturing Growth Scheme")
    # For Mfg Scheme:
    # type (None) -> 0 + unmet "unknown"
    # turnover (None=0 < 500k) -> 0 + unmet "below min"
    # location (None) -> 0 + unmet "unknown"
    # rules -> +10
    assert mfg_match.match_percentage == 10
    assert "Business sector unknown" in str(mfg_match.unmet_conditions)
    assert "Location unknown" in str(mfg_match.unmet_conditions)
