import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

CORS_ORIGINS = [
    "http://localhost:3000",
]
