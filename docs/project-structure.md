# Project Structure

```text
fastvote/
├── README.md
├── docs/
│   ├── README.md
│   ├── getting-started.md
│   ├── architecture.md
│   ├── tech-stack.md
│   ├── api.md
│   └── project-structure.md
├── docker-compose.yml
├── backend/
│   ├── pyproject.toml
│   ├── Dockerfile
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── database.py
│       ├── models/
│       ├── routers/
│       ├── services/
│       └── utils/
└── frontend/
    ├── package.json
    ├── Dockerfile
    ├── app/
    │   ├── page.tsx
    │   ├── create/
    │   ├── polls/
    │   ├── my-polls/
    │   └── vote/[uuid]/
    ├── components/
    │   ├── ui/
    │   ├── site/
    │   └── providers/
    ├── lib/
    └── public/
```

## 디렉토리 역할

- `backend/app/routers`: API/WS 엔드포인트
- `backend/app/services`: 비즈니스 로직
- `backend/app/models`: 요청/응답 스키마
- `frontend/app`: 페이지 라우팅(App Router)
- `frontend/components`: 재사용 UI 및 화면 컴포넌트
- `frontend/lib`: API 클라이언트, 유틸, i18n
