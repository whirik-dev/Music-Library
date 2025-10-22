# Tailored 서비스 페이지 구조

## 개요
기존 모달 기반 Tailored 서비스를 페이지 기반으로 전환하고, 음악 업로드 기능을 추가했습니다.

## 페이지 구조

### 1. `/tailored` - 메인 페이지 (작업 목록)
**파일**: `app/(app)/tailored/page.jsx`

**기능**:
- 사용자의 Tailored 작업 목록 표시
- 새 요청 버튼으로 신규 작업 시작
- 작업 카드 클릭 시 상세 페이지로 이동
- 작업이 없을 경우 Empty State 표시

**주요 컴포넌트**:
- `TailoredWorkCard`: 개별 작업 카드
- `TailoredWorkCardSkeleton`: 로딩 스켈레톤
- `EmptyContent`: 빈 상태 표시

---

### 2. `/tailored/[id]` - 상세보기 페이지
**파일**: `app/(app)/tailored/[id]/page.jsx`

**기능**:
- 특정 작업의 상세 정보 표시
- 원본 음악 플레이어
- 요청 상세 내용 (선택 항목, 코멘트)
- 작업 진행 타임라인
- 상태별 액션 버튼 (수정, 취소, 다운로드)

**주요 컴포넌트**:
- `TailoredStatusBadge`: 작업 상태 배지
- `TailoredTimeline`: 진행 상황 타임라인
- `TailoredPlayer`: 음악 플레이어

---

### 3. `/tailored/new` - 신규 요청 페이지
**파일**: `app/(app)/tailored/new/page.jsx`

**기능**:
3단계 프로세스로 구성:
1. **요청 유형 선택**: 서비스 음악 선택 vs 음악 업로드
2. **음악 선택/업로드**: 선택한 유형에 따라 다른 UI 표시
3. **요청사항 입력 및 제출**: 수정 항목 선택 및 상세 요청사항 작성 후 바로 제출

**제출 프로세스**:
- Step 3에서 "Submit Request" 버튼 클릭 시 바로 API 호출
- 제출 중: 로딩 스피너 표시
- 성공: 성공 메시지 표시 후 2초 뒤 목록으로 이동
- 실패: 에러 메시지 표시 및 재시도 옵션 제공

**주요 컴포넌트**:
- `TailoredRequestTypeSelector`: 요청 유형 선택
- `TailoredMusicSelector`: 서비스 음악 선택
- `TailoredFileUploader`: 음악 파일 업로드
- `TailoredRequestForm`: 요청사항 입력 폼 (제출 버튼 포함)
- `TailoredRequestConfirm`: 제출 상태 표시 (로딩/성공/실패)

---

## 새로 생성된 컴포넌트

### `components/tailored2/` 폴더

1. **TailoredWorkCard.jsx**
   - 작업 목록의 개별 카드 컴포넌트
   - 작업 제목, 상태, 생성일, 요청 항목 미리보기

2. **TailoredWorkCardSkeleton.jsx**
   - 작업 카드 로딩 스켈레톤

3. **TailoredStatusBadge.jsx**
   - 작업 상태 배지 (대기중, 진행중, 완료, 취소)
   - 상태별 색상 구분

4. **TailoredTimeline.jsx**
   - 작업 진행 상황 타임라인
   - 날짜, 상태, 설명 표시

5. **TailoredRequestTypeSelector.jsx**
   - 요청 유형 선택 (서비스 음악 / 음악 업로드)
   - 2개의 큰 선택 카드

6. **TailoredMusicSelector.jsx**
   - 서비스에서 제공하는 음악 목록 표시
   - 음악 선택 기능
   - MusicItem 컴포넌트 재사용

7. **TailoredFileUploader.jsx**
   - 드래그 앤 드롭 파일 업로드
   - 파일 유효성 검사 (형식, 크기)
   - 업로드 안내사항 표시

8. **TailoredRequestForm.jsx**
   - 수정 항목 선택 (템포, 악기, 분위기 등)
   - 상세 요청사항 입력 (필수)
   - 추가 요청사항 입력 (선택)

9. **TailoredRequestConfirm.jsx**
   - 제출 상태 표시 컴포넌트
   - 제출 중: 로딩 스피너
   - 성공: 체크 아이콘 + 성공 메시지
   - 실패: X 아이콘 + 에러 메시지 + 재시도 버튼

---

## 디자인 특징

### 색상 테마
- **Primary**: Purple (보라색) - 주요 액션 버튼
- **Secondary**: Blue (파란색) - 보조 액션
- **Background**: Zinc-900 계열 - 다크 모드 기본
- **Border**: Zinc-800 - 카드 및 섹션 구분

### 레이아웃
- **Full-width**: 전체 너비 사용
- **Max-width**: 콘텐츠는 max-w-7xl (메인), max-w-4xl (신규 요청)
- **Responsive**: 모바일, 태블릿, 데스크톱 대응

### 인터랙션
- **Hover Effects**: 카드 및 버튼에 호버 효과
- **Transitions**: 부드러운 전환 애니메이션
- **Progress Indicator**: 신규 요청 페이지의 단계 표시

---

## 기존 컴포넌트 재사용

다음 기존 컴포넌트들을 재사용합니다:
- `TailoredPlayer`: 음악 플레이어 (components/tailored/)
- `MusicItem`: 음악 아이템 (components/player/)
- `MusicItemSkeleton`: 로딩 스켈레톤 (components/skeleton/)
- `EmptyContent`: 빈 상태 표시 (components/page/)
- `Button`: 버튼 컴포넌트 (components/ui/Button2.jsx)
- `InputTextarea`: 텍스트 영역 (components/ui/)
- `Footer`: 푸터 (components/ui/)

---

## 백엔드 API 연동 완료

다음 API 엔드포인트가 연동되었습니다:

1. **GET /tailored/list** ✅
   - 사용자의 작업 목록 조회
   - Query: page, limit, status, sort, order

2. **GET /tailored/detail/:id** ✅
   - 특정 작업 상세 조회

3. **POST /tailored/create** ✅
   - 새 작업 생성
   - Body: { title, director, music-genre, due-date, invisible, sow, ref-music }

4. **PUT /tailored/approve/:id** ✅
   - 견적 승인 및 크레딧 결제

5. **PUT /tailored/cancel/:id** ✅
   - 작업 취소 (estimated 상태에서만)

6. **PUT /tailored/confirm/:id** ✅
   - 작업 확인 (confirming 상태)

7. **PUT /tailored/retry/:id** ✅
   - 작업 재시도 요청

8. **GET /tailored/preview/:id** ✅
   - 완성된 작업 미리보기 URL 조회

### 결제 시스템
- 크레딧 기반 결제 (작업 가격 × 10)
- 견적 승인 시 크레딧 차감
- 잔액 부족 시 승인 불가

---

## 다국어 지원

`messages/[locale]/tailored.json`에 다음 키들이 필요합니다:

```json
{
  "tailored_service": "Tailored Service",
  "tailored_description": "음악을 당신의 취향에 맞게 커스터마이징하세요",
  "new_request": "새 요청",
  "no_works": "아직 작업이 없습니다",
  "start_first_request": "첫 번째 맞춤 제작을 시작해보세요",
  "select_request_type": "요청 유형 선택",
  "select_music": "음악 선택",
  "upload_music": "음악 업로드",
  "enter_request_details": "요청사항 입력",
  "confirm_request": "요청 확인",
  "status_pending": "대기 중",
  "status_in_progress": "진행 중",
  "status_completed": "완료",
  "status_cancelled": "취소됨",
  "created_at": "생성일",
  "original_music": "원본 음악",
  "request_details": "요청 상세",
  "timeline": "진행 상황",
  ...
}
```

---

## 파일 구조

```
app/(app)/tailored/
├── page.jsx                    # 메인 페이지 (작업 목록)
├── [id]/
│   └── page.jsx               # 상세보기 페이지
└── new/
    └── page.jsx               # 신규 요청 페이지

components/tailored2/
├── TailoredWorkCard.jsx
├── TailoredWorkCardSkeleton.jsx
├── TailoredStatusBadge.jsx
├── TailoredTimeline.jsx
├── TailoredRequestTypeSelector.jsx
├── TailoredMusicSelector.jsx
├── TailoredFileUploader.jsx
├── TailoredRequestForm.jsx
└── TailoredRequestConfirm.jsx
```

---

## 다음 단계

1. ✅ 페이지 및 컴포넌트 구조 생성
2. ✅ 다국어 메시지 추가
3. ✅ 백엔드 API 연동
4. ✅ 크레딧 결제 시스템 연동
5. ⏳ 파일 업로드 기능 구현
6. ⏳ 사용자 크레딧 잔액 표시
7. ⏳ 테스트 및 QA

## 작업 상태 흐름

```
pending (요청 생성) 
  ↓
estimated (견적 제공) → cancelled (취소)
  ↓ (approve + 크레딧 결제)
processing (작업 진행)
  ↓
confirming (확인 대기) → retry (재작업)
  ↓ (confirm)
completed (완료)
```
