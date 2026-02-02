# FastVote Frontend

Next.js 기반의 실시간 익명 투표 웹 애플리케이션

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **React**: 19
- **스타일링**: TailwindCSS 4
- **차트**: Recharts
- **아이콘**: Lucide React
- **테마**: next-themes
- **테스트**: Playwright

## 설치 및 실행

### 사전 요구사항
- Node.js 18+
- npm

### 로컬 개발
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 빌드
```bash
npm run build
npm run start
```

### 테스트
```bash
npm run test:e2e
```

## 프로젝트 구조

```
frontend/
├── app/
│   ├── layout.tsx        # 루트 레이아웃
│   ├── page.tsx          # 메인 페이지
│   ├── create/           # 투표 생성 페이지
│   │   └── page.tsx
│   ├── polls/            # 투표 목록 페이지
│   │   ├── page.tsx
│   │   └── poll-filters.tsx
│   └── vote/[uuid]/      # 투표 페이지
│       └── page.tsx
├── components/
│   ├── ui/               # 공통 UI 컴포넌트 (shadcn/ui)
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── separator.tsx
│   ├── site/             # 사이트 컴포넌트
│   │   ├── navbar.tsx
│   │   ├── language-toggle.tsx
│   │   └── theme-toggle.tsx
│   └── providers/        # Context Provider
│       ├── locale-provider.tsx
│       └── theme-provider.tsx
├── lib/
│   ├── api.ts            # Backend API 클라이언트
│   ├── i18n.ts           # 다국어 지원 (ko/en)
│   └── utils.ts          # 유틸리티 함수
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 주요 기능

### 페이지

| 경로 | 설명 |
|------|------|
| `/` | 메인 페이지 - 서비스 소개, 기능 설명, FAQ |
| `/create` | 투표 생성 - 제목, 옵션, 태그, 고급 설정 |
| `/polls` | 투표 목록 - 검색, 정렬, 태그 필터 |
| `/vote/[uuid]` | 투표 페이지 - 투표, 결과, 댓글 |

### 컴포넌트

- **Navbar**: 네비게이션, 언어/테마 토글
- **LocaleProvider**: 다국어 컨텍스트 (ko/en)
- **ThemeProvider**: 다크모드 컨텍스트

### 기능

- **다국어 지원**: 한국어/영어 전환
- **다크 모드**: 시스템 설정 연동 + 수동 전환
- **실시간 결과**: WebSocket으로 투표 결과 실시간 업데이트
- **차트 시각화**: 막대/원형 그래프로 결과 표시
- **투표 효과**: 투표 완료 시 confetti 효과

## API 연동

프로덕션 환경에서는 Ingress가 path 기반으로 라우팅합니다:
- `/api/*` → backend (REST API)
- `/ws/*` → backend (WebSocket)
- `/*` → frontend

환경 변수 없이 상대 경로(`/api`)로 API 호출합니다.

## 스크립트

```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
npm run lint     # ESLint 검사
npm run test:e2e # E2E 테스트
```
# Test semantic-release
