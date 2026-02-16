# Getting Started

## 사전 요구사항

- Docker / Docker Compose
- Node.js 18+ (프론트 로컬 개발 시)
- Python 3.11+ 및 `uv` (백엔드 로컬 개발 시)
- Redis (백엔드 단독 실행 시)

## Docker로 전체 실행

```bash
# 프로젝트 루트에서 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

접속 주소

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`

## 로컬 개발 실행

### 1) Backend

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

## 환경 변수

Backend

- `REDIS_URL` (default: `redis://localhost:6379`)

Frontend

- `BACKEND_URL` (SSR 호출 시 사용)
- `NEXT_PUBLIC_BACKEND_URL` (브라우저 호출 시 사용, 미설정 시 `/api`)
- `NEXT_PUBLIC_SITE_URL` (사이트 기본 URL)
