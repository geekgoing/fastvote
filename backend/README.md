# FastVote Backend

FastAPI 기반의 실시간 익명 투표 API 서버

## 기술 스택

- **Framework**: FastAPI
- **Python**: 3.12+
- **패키지 관리**: uv
- **Database**: Redis
- **실시간 통신**: WebSocket

## 설치 및 실행

### 사전 요구사항
- Python 3.12+
- uv (패키지 관리자)
- Redis

### 로컬 개발
```bash
# 의존성 설치
uv sync

# 개발 서버 실행
uv run uvicorn app.main:app --reload --port 8000
```

### Docker 실행
```bash
docker build -t fastvote-backend .
docker run -p 8000:8000 fastvote-backend
```

## 프로젝트 구조

```
backend/
├── app/
│   ├── main.py           # FastAPI 앱 엔트리포인트
│   ├── config.py         # 환경 설정
│   ├── database.py       # Redis 연결
│   ├── models/           # Pydantic 모델
│   │   └── room.py       # 투표방 모델
│   ├── routers/          # API 라우터
│   │   ├── rooms.py      # 투표방 API
│   │   ├── comments.py   # 댓글 API
│   │   └── websocket.py  # WebSocket
│   ├── services/         # 비즈니스 로직
│   │   ├── room.py       # 투표방 서비스
│   │   ├── vote.py       # 투표 서비스
│   │   └── comment.py    # 댓글 서비스
│   └── utils/            # 유틸리티
│       └── fingerprint.py
├── Dockerfile
├── pyproject.toml
└── uv.lock
```

## API 엔드포인트

### 투표방
| Method | Endpoint | 설명 |
|--------|----------|------|
| `POST` | `/api/rooms` | 투표방 생성 |
| `GET` | `/api/rooms` | 투표방 목록 조회 |
| `GET` | `/api/rooms/{uuid}` | 투표방 상세 조회 |
| `POST` | `/api/rooms/{uuid}/verify` | 비밀번호 검증 |
| `POST` | `/api/rooms/{uuid}/vote` | 투표 제출 |
| `GET` | `/api/rooms/{uuid}/results` | 투표 결과 조회 |

### 댓글
| Method | Endpoint | 설명 |
|--------|----------|------|
| `POST` | `/api/rooms/{uuid}/comments` | 댓글 작성 |
| `GET` | `/api/rooms/{uuid}/comments` | 댓글 목록 조회 |

### 헬스체크
| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/health` | 서버 상태 확인 |

### WebSocket
| Endpoint | 설명 |
|----------|------|
| `/ws/rooms/{uuid}` | 실시간 투표 결과 구독 |

## 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `REDIS_URL` | Redis 연결 URL | `redis://localhost:6379` |

## 데이터 구조 (Redis)

```
# 투표방 정보
room:{uuid} = {
    "uuid": "...",
    "title": "점심 메뉴 투표",
    "options": ["짜장면", "짬뽕", "탕수육"],
    "password": "hashed_password" | null,
    "tags": ["음식", "점심"],
    "allow_multiple": true,
    "is_private": false,
    "created_at": "2024-01-29T10:00:00Z",
    "expires_at": "2024-01-29T11:00:00Z"
}

# 투표 결과
votes:{uuid} = {
    "짜장면": 5,
    "짬뽕": 3,
    "탕수육": 2
}

# 댓글
comments:{uuid} = [
    {"id": "...", "content": "...", "nickname": "", "created_at": "..."},
    ...
]

# 중복 투표 방지
voted:{uuid}:{fingerprint} = "1"
```

## API 문서

서버 실행 후 http://localhost:8000/docs 에서 Swagger UI로 확인 가능

## 배포

Kubernetes 환경에서는 Ingress가 path 기반으로 라우팅:
- `/api/*` → backend
- `/ws/*` → backend
- `/*` → frontend
