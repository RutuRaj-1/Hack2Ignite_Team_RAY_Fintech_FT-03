# Judge Questions & Answers

**1. Why alternative credit?**
Traditional banking relies on formal collateral and CIBIL scores, which MSMEs often lack. Alternative credit uses digital exhaust—real-time cash flows, UPI transactions, and behavioral telemetry—to assess actual repayment capacity, bridging the $530B MSME credit gap.

**2. Why this architecture?**
We use a microservice-ready monolith (FastAPI + Asyncpg) because it provides the speed of prototyping with the structural boundaries needed for scale. The ML and business logic are fully decoupled from the API layer, allowing us to swap out models or databases without rewriting endpoints.

**3. How is fraud detected?**
Fraud is detected via FT-02 (Risk Engine). We use a combination of deterministic rules (e.g., extreme amounts, off-hours transfers) and statistical anomaly detection to flag transactions that deviate from the business's historical baseline.

**4. Why Isolation Forest?**
Isolation Forest is an unsupervised machine learning algorithm perfectly suited for anomaly detection. Unlike clustering, it explicitly isolates outliers by randomly partitioning data. It requires very little training data and is computationally lightweight, making it ideal for real-time transaction scoring.

**5. Why not a neural network?**
Neural networks require massive, labeled datasets to avoid overfitting and are essentially "black boxes." For financial compliance, explainability is mandatory. We need to know *why* a loan was rejected or a transaction flagged, which simpler models (Isolation Forest, deterministic rules) provide natively.

**6. How is Trust Score calculated?**
The Financial Trust Score (0-100) is a composite index. It weighs Cash Flow Health (revenue, net surplus), Expense Discipline (expense-to-revenue ratio), Business Tenure (months of active data), and subtracts points based on the Fraud Alert Rate (FT-02 telemetry).

**7. How do you prevent biased scoring?**
Our underwriting engine is completely blind to demographics, gender, location, or business owner identity. The Trust Score and loan limits are calculated mathematically from pure financial telemetry (revenue, expenses, volatility).

**8. How do you explain the score?**
Transparency is a core principle. The UI explicitly lists the positive "Supporting Factors" (e.g., Strong Net Cash Flow) and negative "Caution Factors" (e.g., Operating Deficit Alert). The FT-01 AI Coach can also explain these factors in conversational language.

**9. How is data secured?**
We use Firebase for stateless JWT authentication, passwordless flows, and strict endpoint authorization. The backend prevents cross-business data access via DB row-level ownership checks. Passwords and API keys are strictly managed via environment variables.

**10. Why is FT-03 central?**
FT-03 (Alternative Credit & Micro-lending) is the core because credit distribution is the ultimate utility. The other problem statements act as feeders: FT-05 (Analytics) creates the data, FT-02 (Risk) cleans it, and FT-03 executes the loan decision based on that refined data.

**11. How do other problem statements integrate?**
- **FT-05 (Analytics)** normalizes the raw CSVs into cash flows.
- **FT-02 (Risk)** flags anomalous transactions to protect the lender.
- **FT-04 (Schemes)** uses the same financial profile to suggest government grants.
- **FT-01 (Coach)** uses the structured output of FT-03 to provide contextual advice.

**12. How does the platform scale?**
FastAPI natively supports async I/O. We use `asyncpg` for high-throughput Postgres connections. CPU-bound ML tasks can be offloaded to Celery/Redis workers. The stateless JWT architecture means we can scale API instances horizontally behind a load balancer.

**13. What happens without LLM access?**
The platform features a deterministic fallback engine. If the LLM provider (Ollama, Gemini, OpenAI) goes offline or rate-limits, the system falls back to rule-based contextual answers. The core underwriting (FT-03) does *not* rely on the LLM.

**14. What happens if a transaction is suspicious?**
The transaction is flagged in the database and contributes to the business's `fraud_alert_rate`. If this rate exceeds a threshold, it lowers the Trust Score, increases the risk tier (e.g., LOW to HIGH), and raises the recommended interest rate for loans to price in the risk.

**15. How would this become production-ready?**
1. Migrate from SQLite to a managed PostgreSQL (e.g., Supabase, AWS RDS).
2. Integrate a real bank-statement parser (e.g., Setu/Account Aggregator APIs) instead of manual CSV uploads.
3. Deploy to a managed container service (AWS ECS or Google Cloud Run) with proper CI/CD pipelines.
4. Expand the ML models with larger datasets for the FT-02 Risk engine.
