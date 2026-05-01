import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
