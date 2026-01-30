# FastVote

로그인 없이 빠르게 익명 투표를 생성하고 공유할 수 있는 실시간 투표 플랫폼

## 주요 기능

### 즉석 투표방 생성
- 주제와 선택지를 입력하면 고유한 UUID 기반의 투표방 생성
- 임시 공유 링크 자동 생성 (`/vote/{uuid}`)
- 회원가입/로그인 불필요

### 비밀방 지원
- 투표방 생성 시 비밀번호 설정 가능
- 비밀방 입장 시 비밀번호 검증 필요

### 자동 데이터 만료
- Redis TTL을 활용한 투표 데이터 수명 관리
- 설정된 시간이 지나면 자동으로 투표방 삭제
- 서버 리소스 효율적 관리

### 실시간 결과 반영
- WebSocket을 통한 실시간 투표 결과 업데이트
- 새로고침 없이 즉시 결과 확인

### 익명 투표
- 로그인 없이 누구나 참여 가능
- 개인정보 수집 없음

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **Frontend** | Next.js 16, React 19, TailwindCSS |
| **Backend** | FastAPI, Python |
| **Database** | Redis (In-memory, TTL 지원) |
| **실시간 통신** | WebSocket |
| **컨테이너** | Docker, Docker Compose |

---

## 아키텍처

```
┌─────────────────┐     WebSocket      ┌─────────────────┐
│                 │◄──────────────────►│                 │
│    Frontend     │                    │     Backend     │
│   (Next.js)     │────── REST ───────►│   (FastAPI)     │
│   Port: 3000    │                    │   Port: 8000    │
└─────────────────┘                    └────────┬────────┘
                                                │
                                                │
                                       ┌────────▼────────┐
                                       │                 │
                                       │      Redis      │
                                       │   Port: 6379    │
                                       │                 │
                                       └─────────────────┘
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

### 접속
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs

---

## 기술적 과제: 중복 투표 방지

로그인 없는 익명 투표 시스템에서 중복 투표를 방지하는 것은 핵심 과제입니다.

### 접근 방식

| 방식 | 설명 | 장점 | 단점 |
|------|------|------|------|
| **브라우저 Fingerprint** | Canvas, WebGL, 폰트 등 조합 | 정확도 높음 | 프라이버시 우려, 우회 가능 |
| **IP 주소 기반** | 클라이언트 IP 해싱 저장 | 구현 간단 | 공유 IP 환경 문제 (회사, 카페) |
| **쿠키/LocalStorage** | 투표 시 고유 토큰 저장 | 구현 간단 | 시크릿 모드/쿠키 삭제로 우회 |
| **복합 방식 (권장)** | IP + Fingerprint + 쿠키 조합 | 우회 어려움 | 구현 복잡도 증가 |

### 권장 구현

```python
# 중복 투표 검증 키 생성 예시
vote_key = f"voted:{room_uuid}:{hash(ip + fingerprint)}"

# Redis에서 확인
if redis.exists(vote_key):
    raise HTTPException(status_code=409, detail="이미 투표하셨습니다")

# 투표 처리 후 키 저장 (방 TTL과 동일하게 설정)
redis.setex(vote_key, room_ttl, "1")
```

---

## 데이터 구조 (Redis)

```
# 투표방 정보
room:{uuid} = {
    "title": "점심 메뉴 투표",
    "options": ["짜장면", "짬뽕", "탕수육"],
    "password": "hashed_password" | null,
    "created_at": "2024-01-29T10:00:00Z"
}
TTL: 3600 (1시간) ~ 86400 (24시간)

# 투표 결과
votes:{uuid} = {
    "짜장면": 5,
    "짬뽕": 3,
    "탕수육": 2
}
TTL: 방과 동일

# 중복 투표 방지
voted:{uuid}:{user_hash} = "1"
TTL: 방과 동일
```

---

## API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| `POST` | `/rooms` | 투표방 생성 |
| `GET` | `/rooms/{uuid}` | 투표방 정보 조회 |
| `POST` | `/rooms/{uuid}/verify` | 비밀방 비밀번호 검증 |
| `POST` | `/rooms/{uuid}/vote` | 투표 제출 |
| `GET` | `/rooms/{uuid}/results` | 투표 결과 조회 |
| `WS` | `/ws/rooms/{uuid}` | 실시간 결과 구독 |

---

## 추가 개발 기능 제안

### 우선순위 높음
- [ ] **투표 마감 시간 설정**: 특정 시간에 자동으로 투표 마감
- [ ] **복수 선택 지원**: 여러 개의 선택지에 투표 가능
- [ ] **결과 공개 시점 설정**: 투표 종료 전까지 결과 숨김

### 우선순위 중간
- [ ] **QR 코드 생성**: 투표 링크를 QR 코드로 공유
- [ ] **투표 통계**: 시간대별 투표 추이 그래프
- [ ] **선택지 추가 허용**: 참여자가 새로운 선택지 제안
- [ ] **익명 댓글**: 선택지별 의견 남기기
- [ ] **관리자 모드**: 투표 생성자에게 관리 토큰 발급 (결과 초기화, 조기 마감 등)

### 우선순위 낮음
- [ ] **투표 템플릿**: 자주 사용하는 투표 유형 저장
- [ ] **다국어 지원**: i18n 적용
- [ ] **임베드 위젯**: 외부 사이트에 투표 삽입
- [ ] **Slack/Discord 연동**: 봇을 통한 투표 생성 및 알림
- [ ] **투표 결과 내보내기**: CSV, 이미지로 다운로드
- [ ] **카카오톡/라인 공유**: SNS 공유 버튼

### 고급 기능
- [ ] **가중치 투표**: 사용자별 투표 가중치 부여
- [ ] **순위 투표 (Ranked Choice)**: 선호도 순위 지정
- [ ] **조건부 투표**: 이전 투표 결과에 따른 후속 투표

---

## 프로젝트 구조

```
fastvote/
├── docker-compose.yml    # 서비스 오케스트레이션
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── main.py           # FastAPI 앱
│   └── requirements.txt
└── frontend/
    ├── Dockerfile
    ├── app/              # Next.js App Router
    ├── package.json
    └── ...
```

---

## 라이선스

MIT License
