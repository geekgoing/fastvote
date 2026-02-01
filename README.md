# FastVote

로그인 없이 빠르게 익명 투표를 생성하고 공유할 수 있는 실시간 투표 플랫폼

## 주요 기능

### 즉석 투표방 생성
- 주제와 선택지를 입력하면 고유한 UUID 기반의 투표방 생성
- 임시 공유 링크 자동 생성 (`/vote/{uuid}`)
- 회원가입/로그인 불필요

### 다양한 투표 옵션
- **복수 선택**: 여러 옵션에 투표 가능
- **비공개 투표**: 목록에 표시되지 않고 링크로만 접근
- **비밀번호 보호**: 투표방 입장 시 비밀번호 검증
- **태그 시스템**: 투표에 태그 추가하여 분류

### 실시간 결과
- WebSocket을 통한 실시간 투표 결과 업데이트
- 막대/원형 그래프로 결과 시각화
- 새로고침 없이 즉시 결과 확인

### 댓글 시스템
- 익명 또는 닉네임으로 댓글 작성
- 투표에 대한 의견 공유

### 다국어 지원
- 한국어/영어 지원
- 언어 설정 쿠키 저장

### 다크 모드
- 시스템 설정 연동
- 수동 테마 전환

### 자동 데이터 만료
- Redis TTL을 활용한 투표 데이터 수명 관리
- 1시간 ~ 24시간 만료 시간 설정

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **Frontend** | Next.js 16, React 19, TailwindCSS 4, Recharts |
| **Backend** | FastAPI, Python 3.12, uv |
| **Database** | Redis (In-memory, TTL 지원) |
| **실시간 통신** | WebSocket |
| **컨테이너** | Docker, Docker Compose |

---

## 아키텍처

### 로컬 개발
```
┌─────────────────┐     WebSocket      ┌─────────────────┐
│                 │◄──────────────────►│                 │
│    Frontend     │                    │     Backend     │
│   (Next.js)     │────── REST ───────►│   (FastAPI)     │
│   Port: 3000    │                    │   Port: 8000    │
└─────────────────┘                    └────────┬────────┘
                                                │
                                       ┌────────▼────────┐
                                       │      Redis      │
                                       │   Port: 6379    │
                                       └─────────────────┘
```

### Kubernetes (k3s + ArgoCD)
```
                    ┌─────────────────────────────────────┐
                    │            Ingress                  │
    Browser ───────►│  /api/* /ws/* → backend:8000       │
                    │  /*           → frontend:3000       │
                    └───────────────┬─────────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
     ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
     │    Frontend     │   │     Backend     │   │      Redis      │
     │   (Next.js)     │   │   (FastAPI)     │   │     (alpine)    │
     └─────────────────┘   └────────┬────────┘   └─────────────────┘
                                    │                     ▲
                                    └─────────────────────┘
```

---

## 시작하기

### 사전 요구사항
- Docker & Docker Compose

### 실행
```bash
# 프로젝트 클론
git clone <repository-url>
cd fastvote

# 전체 서비스 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### 로컬 개발
```bash
# Backend
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

### 접속
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs

---

## API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| `POST` | `/api/rooms` | 투표방 생성 |
| `GET` | `/api/rooms` | 투표방 목록 조회 |
| `GET` | `/api/rooms/{uuid}` | 투표방 정보 조회 |
| `POST` | `/api/rooms/{uuid}/verify` | 비밀방 비밀번호 검증 |
| `POST` | `/api/rooms/{uuid}/vote` | 투표 제출 |
| `GET` | `/api/rooms/{uuid}/results` | 투표 결과 조회 |
| `POST` | `/api/rooms/{uuid}/comments` | 댓글 작성 |
| `GET` | `/api/rooms/{uuid}/comments` | 댓글 목록 조회 |
| `WS` | `/ws/rooms/{uuid}` | 실시간 결과 구독 |

---

## 프로젝트 구조

```
fastvote/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── database.py
│       ├── models/
│       ├── routers/
│       ├── services/
│       └── utils/
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── app/
    │   ├── page.tsx          # 메인 페이지
    │   ├── create/           # 투표 생성
    │   ├── polls/            # 투표 목록
    │   └── vote/[uuid]/      # 투표 페이지
    ├── components/
    │   ├── ui/               # 공통 UI 컴포넌트
    │   ├── site/             # 사이트 컴포넌트
    │   └── providers/        # Context Provider
    └── lib/
        ├── api.ts            # API 클라이언트
        └── i18n.ts           # 다국어 지원
```

---

## 라이선스

MIT License
