"""
FINBRIDGE — ML Pipeline Stubs
Placeholder modules for credit scoring and fraud detection ML pipelines.
Full implementation: Part 03.
"""


class DataLoader:
    """
    Loads and preprocesses raw financial data for ML pipelines.
    [STUB] — Part 03.
    """

    def load_transactions(self) -> None:
        raise NotImplementedError("DataLoader.load_transactions — Part 03")

    def load_business_data(self) -> None:
        raise NotImplementedError("DataLoader.load_business_data — Part 03")


class FeatureEngineer:
    """
    Extracts features from raw financial data for model input.
    Signals: UPI velocity, GST consistency, seasonal income, utility regularity.
    [STUB] — Part 03.
    """

    def extract_credit_features(self) -> None:
        raise NotImplementedError("FeatureEngineer.extract_credit_features — Part 03")

    def extract_fraud_features(self) -> None:
        raise NotImplementedError("FeatureEngineer.extract_fraud_features — Part 03")


class ModelRegistry:
    """
    Loads and serves trained scikit-learn models.
    [STUB] — Part 03.
    """

    def load_credit_model(self) -> None:
        raise NotImplementedError("ModelRegistry.load_credit_model — Part 03")

    def load_fraud_model(self) -> None:
        raise NotImplementedError("ModelRegistry.load_fraud_model — Part 03")

    def predict(self) -> None:
        raise NotImplementedError("ModelRegistry.predict — Part 03")
