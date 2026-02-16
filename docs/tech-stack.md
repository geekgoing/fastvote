# Tech Stack

## Frontend

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Recharts
- next-themes
- Playwright (E2E)

## Backend

- FastAPI
- Python 3.11+
- uv (패키지/실행 관리)
- redis-py
- WebSocket

## Infra

- Redis (In-memory + TTL)
- Docker / Docker Compose

## 선택 이유

- **빠른 UI 개발**: Next.js + Tailwind로 화면 개발/확장 용이
- **가벼운 API 서버**: FastAPI 기반 비동기 처리와 명확한 스키마
- **즉시성 확보**: Redis + WebSocket으로 실시간 결과 반영
- **운영 단순성**: Docker Compose로 로컬/배포 환경 재현성 확보
