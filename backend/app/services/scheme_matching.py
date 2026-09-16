"""
FINBRIDGE — Scheme Matching Engine (Part 07)
FT-04: Financing Opportunity Layer
"""

import uuid
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.business import Business
from app.models.government_scheme import GovernmentScheme
from app.models.scheme_match import SchemeMatch
from app.utils.logger import get_logger

logger = get_logger("finbridge.services.scheme_matching")


class SchemeMatchingEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_schemes(self) -> list[GovernmentScheme]:
        """Fetch all active schemes."""
        stmt = select(GovernmentScheme).where(GovernmentScheme.is_active == True)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def match_schemes_for_business(self, business_id: uuid.UUID) -> list[SchemeMatch]:
        """
        Fuzzy matching engine that compares business profile against all schemes.
        Returns a list of updated SchemeMatch records, ordered by match_percentage.
        """
        # Fetch business
        business = await self.db.get(Business, business_id)
        if not business:
            raise ValueError("Business not found")

        schemes = await self.get_all_schemes()
        
        # Fetch existing matches to update them instead of re-creating
        existing_stmt = select(SchemeMatch).where(SchemeMatch.business_id == business_id)
        existing_result = await self.db.execute(existing_stmt)
        existing_matches = {m.scheme_id: m for m in existing_result.scalars().all()}

        processed_matches = []

        for scheme in schemes:
            match_percentage = 0
            matched = []
            unmet = []
            
            # 1. Business Type Check (Weight: 30%)
            biz_type = (business.business_type or "").lower()
            scheme_types = [t.lower() for t in scheme.business_type]
            if "all" in scheme_types:
                match_percentage += 30
                matched.append("Open to all business sectors")
            elif biz_type and any(t in biz_type for t in scheme_types):
                match_percentage += 30
                matched.append(f"Sector match: {business.business_type}")
            elif not biz_type:
                unmet.append("Business sector unknown (Please update profile)")
            else:
                unmet.append(f"Requires specific sectors: {', '.join(scheme.business_type)}")

            # 2. Turnover Check (Weight: 30%)
            turnover = business.annual_turnover or Decimal(0)
            if scheme.maximum_turnover and turnover > scheme.maximum_turnover:
                unmet.append(f"Turnover exceeds maximum limit (₹{scheme.maximum_turnover:,.0f})")
            elif scheme.minimum_turnover and turnover < scheme.minimum_turnover:
                unmet.append(f"Turnover below minimum requirement (₹{scheme.minimum_turnover:,.0f})")
            else:
                match_percentage += 30
                matched.append("Turnover within eligible limits")

            # 3. Location Check (Weight: 20%)
            loc = (business.location or "").lower()
            loc_rules = [l.lower() for l in scheme.eligible_locations]
            if "all" in loc_rules:
                match_percentage += 20
                matched.append("Open to all regions")
            elif loc and any(rule in loc for rule in loc_rules):
                match_percentage += 20
                matched.append("Location requirement met")
            elif not loc:
                unmet.append("Location unknown (Please update profile)")
            else:
                unmet.append(f"Requires specific locations: {', '.join(scheme.eligible_locations)}")
                
            # 4. Other Rules (Weight: 20%)
            # Since we don't track demographics (caste, gender) heavily in the basic profile,
            # we assign partial points and flag them as needing verification.
            if len(scheme.eligibility_rules) == 0:
                match_percentage += 20
            else:
                match_percentage += 10 # Baseline for complex rules
                unmet.append("Additional verification required for: " + ", ".join(scheme.eligibility_rules))

            # Cap at 100
            match_percentage = min(match_percentage, 100)

            # Upsert
            if scheme.id in existing_matches:
                match = existing_matches[scheme.id]
                match.match_percentage = match_percentage
                match.matched_conditions = matched
                match.unmet_conditions = unmet
            else:
                match = SchemeMatch(
                    business_id=business.id,
                    scheme_id=scheme.id,
                    match_percentage=match_percentage,
                    matched_conditions=matched,
                    unmet_conditions=unmet
                )
                self.db.add(match)
                
            # Need to attach the scheme object so schemas can serialize it in the response
            match.scheme = scheme
            processed_matches.append(match)

        await self.db.commit()
        
        # Sort by best match
        processed_matches.sort(key=lambda x: x.match_percentage, reverse=True)
        return processed_matches
