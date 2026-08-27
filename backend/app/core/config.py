import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BASE_DIR, "financetwin.db").replace("\\", "/")

class Settings(BaseSettings):
    DATABASE_URL: str = f"sqlite:///{DB_PATH}"
    APP_ENV: str = "development"
    RANDOM_SEED: int = 42

    # Matching safety limits
    MINIMUM_MATCH_CONFIDENCE: float = 0.95
    MINIMUM_CONFIDENCE_MARGIN: float = 0.05

    # Financial thresholds
    MAX_AUTO_RESOLVE_AMOUNT: float = 5000.00
    HIGH_VALUE_TRANSACTION_THRESHOLD: float = 100000.00
    AMOUNT_TOLERANCE: float = 1.00
    DATE_TOLERANCE_DAYS: int = 2
    TAX_RATE: float = 0.18

    # AI settings
    LLM_PROVIDER: str = "mock"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = ""

    # CORS settings
    CORS_ORIGINS: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()
