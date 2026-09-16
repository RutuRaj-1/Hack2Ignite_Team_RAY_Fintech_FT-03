# FINBRIDGE Demo Script (48-Hour Hackathon)

This script outlines a 5-minute live demonstration flow showcasing the FINBRIDGE platform's alternative underwriting capabilities.

## 1. Introduction (The Persona)
* **Action**: Start at the landing page.
* **Talking Track**: "Meet Rahul. He runs Shree Digital Solutions, a growing MSME. He has steady revenue but lacks formal credit history or collateral, making traditional bank loans impossible. Today, we'll see how FINBRIDGE uses his existing business data to underwrite a fair micro-loan."

## 2. Registration
* **Action**: Click "Get Started" and register a new account (or log in via Firebase test account).
* **Talking Track**: "Rahul signs up securely. Our authentication is handled via Firebase, ensuring enterprise-grade identity management."

## 3. Create Business Profile
* **Action**: Fill out the business profile form (Name: Shree Digital Solutions, Type: Services, Turnover: ₹12,00,000, Age: 3 years).
* **Talking Track**: "Rahul registers his business details. This establishes his baseline identity in our system."

## 4. Upload Financial Transactions (Data Ingestion)
* **Action**: Navigate to 'Transactions' and upload a realistic sample CSV containing 3 months of bank data.
* **Talking Track**: "Instead of demanding audited financials, FINBRIDGE ingests raw bank statements or UPI transaction exports. Our FT-03 engine instantly normalizes, parses, and categorizes every transaction into revenue, inventory, utilities, and more."

## 5. Show Financial Analytics
* **Action**: Go to the 'Dashboard' / 'Analytics' tab.
* **Talking Track**: "Instantly, FT-05 (Financial Analytics) builds a real-time cash flow statement. We can see his average monthly revenue, operating expenses, and net surplus. We see a healthy expense ratio of 60%."

## 6. Show Suspicious Transaction (Risk & Fraud)
* **Action**: Scroll to the 'Risk Flags' or 'Transactions' table and highlight a flagged entry.
* **Talking Track**: "Our FT-02 Risk module uses Isolation Forest machine learning to detect anomalies. Notice this ₹50,000 midnight transfer to an unknown vendor? It's flagged for manual review without halting the entire process."

## 7. Generate Financial Trust Score
* **Action**: Click to generate the Credit Profile / Trust Score.
* **Talking Track**: "Combining cash flow health, expense discipline, and the fraud risk tier, FINBRIDGE generates a proprietary Financial Trust Score (e.g., 78/100). This replaces the traditional CIBIL score."

## 8. Apply for ₹75,000 Prototype Loan
* **Action**: Navigate to 'Loans' and apply for ₹75,000 for "Inventory Expansion" for 12 months.
* **Talking Track**: "Rahul applies for a ₹75,000 loan. The FT-03 Alternative Credit engine assesses the request against his net cash flow and assigns a risk-adjusted interest rate."

## 9. Run EMI Simulation
* **Action**: Show the Loan Simulation widget.
* **Talking Track**: "Before accepting, Rahul uses the simulator. He sees the exact reducing-balance EMI, total interest, and how it impacts his monthly surplus."

## 10. Explain Recommendation (Repayment Burden)
* **Action**: Highlight the 'Repayment Burden' metric.
* **Talking Track**: "The engine calculates the Repayment Burden at 22%. Since it's below our 35% safety threshold, the system confirms he can comfortably afford this without risking insolvency."

## 11. Show Scheme Matches
* **Action**: Go to the 'Government Schemes' tab.
* **Talking Track**: "Beyond loans, FT-04 (Scheme Discovery) matches Rahul with relevant government grants like the MSME Mudra Yojana, using the exact same telemetry data."

## 12. Ask Financial Coach (Financial Literacy)
* **Action**: Open the AI Coach chat and ask "How can I improve my cash flow?" or "What does repayment burden mean?"
* **Talking Track**: "Finally, FT-01 (Financial Literacy). Rahul asks the AI coach a question. The LLM grounds its answer entirely in his deterministic financial metrics, providing hyper-personalized, safe advice rather than generic web results."

**End of Demo**
