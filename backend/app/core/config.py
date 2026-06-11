from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://postgres:root123@localhost:5432/travel_agent"

    JWT_SECRET_KEY: str = "change-this-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    MOCK_MODE: bool = True
    FRONTEND_URL: str = "https://travel-content-automation-agent-fsv9.onrender.com"

    APP_ENV: str = "local"
    # CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,https://travel-content-automation-agent-fsv9.onrender.com"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,https://travel-content-automation-agent-fsv9.onrender.com,https://travel-content-automation-agent-1.onrender.com"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()