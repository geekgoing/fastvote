FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# uv (pinned)
COPY --from=ghcr.io/astral-sh/uv:0.4.28 /uv /bin/uv

# deps
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# app
COPY . .

# non-root
RUN addgroup --system app && adduser --system --ingroup app app
USER app

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]