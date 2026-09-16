# FINBRIDGE API Documentation

This document outlines the core APIs for the FINBRIDGE alternative credit scoring and micro-lending platform.

## Health Check
**Method**: `GET`
**Endpoint**: `/api/v1/health`
**Authentication**: None

**Request**:
None or Path/Query Parameters

**Responses**:
- `200`: Successful Response

---

## Register user in FINBRIDGE database
**Method**: `POST`
**Endpoint**: `/api/v1/auth/register`
**Authentication**: None

**Request**:
JSON Body Schema: `RegisterRequest`

**Responses**:
- `201`: Successful Response
- `422`: Validation Error

---

## Verify Firebase token and return user info
**Method**: `POST`
**Endpoint**: `/api/v1/auth/login`
**Authentication**: None

**Request**:
JSON Body Schema: `LoginRequest`

**Responses**:
- `200`: Successful Response
- `422`: Validation Error

---

## Get authenticated user information
**Method**: `GET`
**Endpoint**: `/api/v1/auth/me`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
None or Path/Query Parameters

**Responses**:
- `200`: Successful Response

---

## Get own business profile
**Method**: `GET`
**Endpoint**: `/api/v1/business/profile`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
None or Path/Query Parameters

**Responses**:
- `200`: Successful Response

---

## Update own business profile
**Method**: `PUT`
**Endpoint**: `/api/v1/business/profile`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
JSON Body Schema: `BusinessUpdate`

**Responses**:
- `200`: Successful Response
- `422`: Validation Error

---

## Create business profile
**Method**: `POST`
**Endpoint**: `/api/v1/business/profile`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
JSON Body Schema: `BusinessCreate`

**Responses**:
- `201`: Successful Response
- `422`: Validation Error

---

## Submit a loan application
**Method**: `POST`
**Endpoint**: `/api/v1/loans/apply`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
JSON Body Schema: `LoanApplicationCreate`

**Responses**:
- `201`: Successful Response
- `422`: Validation Error

---

## Assess loan request and produce prototype recommendation
**Method**: `POST`
**Endpoint**: `/api/v1/loans/assess`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
JSON Body Schema: `LoanAssessmentRequest`

**Responses**:
- `200`: Successful Response
- `422`: Validation Error

---

## Dynamic loan repayment simulator
**Method**: `POST`
**Endpoint**: `/api/v1/loans/simulate`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
JSON Body Schema: `LoanSimulationRequest`

**Responses**:
- `200`: Successful Response
- `422`: Validation Error

---

## Simulate parameters for a specific loan application
**Method**: `POST`
**Endpoint**: `/api/v1/loans/{application_id}/simulate`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
JSON Body Schema: `LoanSimulationRequest`

**Responses**:
- `200`: Successful Response
- `422`: Validation Error

---

## List loan applications for current business
**Method**: `GET`
**Endpoint**: `/api/v1/loans/applications`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
None or Path/Query Parameters

**Responses**:
- `200`: Successful Response

---

## Get loan application by ID
**Method**: `GET`
**Endpoint**: `/api/v1/loans/{application_id}`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
None or Path/Query Parameters

**Responses**:
- `200`: Successful Response
- `422`: Validation Error

---

## Assess business credit & generate Financial Trust Score
**Method**: `POST`
**Endpoint**: `/api/v1/credit/assess`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:

**Responses**:
- `200`: Successful Response
- `422`: Validation Error

---

## Get current Financial Trust Score & Credit Profile
**Method**: `GET`
**Endpoint**: `/api/v1/credit/profile`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
None or Path/Query Parameters

**Responses**:
- `200`: Successful Response

---

## Get credit score by business ID
**Method**: `GET`
**Endpoint**: `/api/v1/credit/score/{business_id}`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
None or Path/Query Parameters

**Responses**:
- `200`: Successful Response
- `422`: Validation Error

---

## Upload transactions via CSV
**Method**: `POST`
**Endpoint**: `/api/v1/transactions/upload`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
Form Data (File Upload)

**Responses**:
- `200`: Successful Response
- `422`: Validation Error

---

## List transactions for the authenticated business
**Method**: `GET`
**Endpoint**: `/api/v1/transactions/`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
None or Path/Query Parameters

**Responses**:
- `200`: Successful Response
- `422`: Validation Error

---

## Financial health summary
**Method**: `GET`
**Endpoint**: `/api/v1/analytics/summary`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
None or Path/Query Parameters

**Responses**:
- `200`: Successful Response

---

## Monthly cash-flow trend
**Method**: `GET`
**Endpoint**: `/api/v1/analytics/cashflow`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
None or Path/Query Parameters

**Responses**:
- `200`: Successful Response

---

## Expense breakdown by category
**Method**: `GET`
**Endpoint**: `/api/v1/analytics/expenses`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
None or Path/Query Parameters

**Responses**:
- `200`: Successful Response

---

## Monthly revenue trend
**Method**: `GET`
**Endpoint**: `/api/v1/analytics/revenue-trend`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
None or Path/Query Parameters

**Responses**:
- `200`: Successful Response

---

## Run fraud/risk analysis on all transactions
**Method**: `POST`
**Endpoint**: `/api/v1/fraud/analyze`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:

**Responses**:
- `200`: Successful Response
- `422`: Validation Error

---

## List fraud alerts for the authenticated business
**Method**: `GET`
**Endpoint**: `/api/v1/fraud/alerts`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
None or Path/Query Parameters

**Responses**:
- `200`: Successful Response
- `422`: Validation Error

---

## Aggregate fraud risk summary
**Method**: `GET`
**Endpoint**: `/api/v1/fraud/summary`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
None or Path/Query Parameters

**Responses**:
- `200`: Successful Response

---

## List all active government schemes
**Method**: `GET`
**Endpoint**: `/api/v1/schemes`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
None or Path/Query Parameters

**Responses**:
- `200`: Successful Response

---

## Get scheme matches for the user's business
**Method**: `GET`
**Endpoint**: `/api/v1/schemes/matches`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
None or Path/Query Parameters

**Responses**:
- `200`: Successful Response

---

## Ask the AI Financial Coach
**Method**: `POST`
**Endpoint**: `/api/v1/coach/ask`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
JSON Body Schema: `CoachQueryRequest`

**Responses**:
- `200`: Successful Response
- `422`: Validation Error

---

## Get structured financial context for current business
**Method**: `GET`
**Endpoint**: `/api/v1/coach/context`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
None or Path/Query Parameters

**Responses**:
- `200`: Successful Response

---

## Get 7 contextual educational financial literacy cards
**Method**: `GET`
**Endpoint**: `/api/v1/coach/education`
**Authentication**: None

**Request**:
None or Path/Query Parameters

**Responses**:
- `200`: Successful Response

---

## Explain why a transaction was flagged
**Method**: `POST`
**Endpoint**: `/api/v1/coach/explain-fraud`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
JSON Body Schema: `ExplainFraudRequest`

**Responses**:
- `200`: Successful Response
- `422`: Validation Error

---

## Explain government scheme alignment
**Method**: `POST`
**Endpoint**: `/api/v1/coach/explain-scheme`
**Authentication**: Required (Firebase JWT Bearer Token)

**Request**:
JSON Body Schema: `ExplainSchemeRequest`

**Responses**:
- `200`: Successful Response
- `422`: Validation Error

---
