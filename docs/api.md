# API Overview

Backend base URL: `http://localhost:8000`  
REST prefix: `/api`  
WebSocket prefix: `/ws`

## Rooms

| Method | Endpoint | 설명 |
|---|---|---|
| `POST` | `/api/rooms` | 투표방 생성 |
| `GET` | `/api/rooms` | 투표방 목록 조회 (검색/태그/정렬/페이지네이션) |
| `GET` | `/api/rooms/{uuid}` | 투표방 상세 조회 |
| `POST` | `/api/rooms/{uuid}/verify` | 비밀번호 또는 share token 검증 |
| `POST` | `/api/rooms/{uuid}/vote` | 투표 제출 |
| `GET` | `/api/rooms/{uuid}/results` | 결과 조회 (만료 후 share token 필요) |

## Comments

| Method | Endpoint | 설명 |
|---|---|---|
| `POST` | `/api/rooms/{uuid}/comments` | 댓글 작성 |
| `GET` | `/api/rooms/{uuid}/comments` | 댓글 목록 조회 |

## Health

| Method | Endpoint | 설명 |
|---|---|---|
| `GET` | `/api/health` | 서버 상태 확인 |

## WebSocket

| Endpoint | 설명 |
|---|---|
| `/ws/rooms/{uuid}` | 투표 결과 실시간 구독 |

## API 문서

- Swagger UI: `http://localhost:8000/docs`
