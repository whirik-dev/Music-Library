# Design Document

## Overview

이 설계는 기존 React/Next.js 음악 스트리밍 플랫폼에 next-intl을 사용한 완전한 국제화(i18n) 시스템을 구현하는 것입니다. 현재 프로젝트에는 이미 next-intl의 기본 설정이 되어있지만, 모든 컴포넌트와 페이지의 하드코딩된 텍스트를 체계적으로 국제화 키로 대체해야 합니다.

### Current State Analysis

**기존 설정 현황:**
- next-intl 패키지 설치 완료 (v4.3.6)
- i18n/request.ts에 로케일 감지 로직 구현
- next.config.ts에 next-intl 플러그인 설정
- messages/en.json에 일부 번역 키 존재
- 일부 컴포넌트에서 useTranslations 훅 사용 중

**문제점:**
- 대부분의 컴포넌트에 하드코딩된 한국어/영어 텍스트 존재
- 번역 키 구조가 일관성 없음
- 모든 UI 텍스트가 국제화되지 않음
- 동적 콘텐츠의 국제화 처리 부족

## Architecture

### Translation Key Structure

번역 키는 다음과 같은 계층 구조로 조직화됩니다:

```
messages/
├── en.json (기본 언어)
└── ko.json (한국어 - 향후 추가)

Key Namespaces:
├── company.*          # 회사 정보
├── navigation.*       # 네비게이션 메뉴
├── ui.*              # 공통 UI 요소
├── audio.*           # 오디오 플레이어 관련
├── auth.*            # 인증 관련
├── payment.*         # 결제 관련
├── pricing.*         # 가격 정책
├── modal.*           # 모달 관련
├── tailored.*        # 맞춤 서비스
├── errors.*          # 에러 메시지
├── time.*            # 시간 관련
├── meta.*            # 메타데이터
├── search.*          # 검색 관련
├── player.*          # 플레이어 관련
├── playlist.*        # 플레이리스트 관련
└── forms.*           # 폼 관련
```

### Component Integration Strategy

1. **Hook Integration Pattern**
   ```jsx
   import { useTranslations } from 'next-intl';
   
   const Component = () => {
     const t = useTranslations('namespace');
     return <div>{t('key')}</div>;
   };
   ```

2. **Namespace Selection Strategy**
   - 컴포넌트의 주요 기능에 따라 네임스페이스 선택
   - 공통 UI 요소는 'ui' 네임스페이스 사용
   - 특정 기능은 해당 기능의 네임스페이스 사용

3. **Dynamic Content Handling**
   ```jsx
   // 매개변수가 있는 번역
   t('welcome_message', { name: userName })
   
   // 복수형 처리
   t('items_count', { count: itemCount })
   ```

## Components and Interfaces

### Core Components to Update

1. **Layout Components**
   - `app/layout.tsx` - 메타데이터 국제화
   - `components/HTMLProvider.jsx` - 언어 속성 설정
   - `components/ui/Header.jsx` - 헤더 텍스트
   - `components/ui/Footer.jsx` - 푸터 텍스트
   - `components/ui/Navigation.jsx` - 네비게이션 메뉴

2. **Page Components**
   - `app/(app)/page.jsx` - 홈페이지 텍스트
   - `app/(app)/search/page.jsx` - 검색 페이지 텍스트
   - `app/(app)/playlist/page.jsx` - 플레이리스트 페이지
   - `app/(app)/price/page.jsx` - 가격 페이지
   - `app/(payment)/checkout/page.jsx` - 결제 페이지

3. **Feature Components**
   - `components/auth/*` - 인증 관련 컴포넌트
   - `components/modal/*` - 모달 컴포넌트들
   - `components/payment/*` - 결제 관련 컴포넌트
   - `components/player/*` - 플레이어 컴포넌트들
   - `components/search/*` - 검색 관련 컴포넌트

### Translation Key Mapping Strategy

**기존 하드코딩된 텍스트 → 번역 키 매핑:**

```javascript
// 네비게이션
"explorer" → t('navigation.explorer')
"playlist" → t('navigation.playlist')
"Pricing" → t('navigation.pricing')

// 인증
"Sign In" → t('auth.sign_in')
"Sign Up" → t('auth.sign_up')
"Sign Out" → t('auth.sign_out')

// 결제
"결제방법" → t('payment.payment_method')
"국내 카드" → t('payment.domestic_card')
"해외 카드" → t('payment.foreign_card')

// 플레이어
"Now Stanby" → t('player.now_standby')
"Sub Title" → t('player.subtitle_placeholder')

// 검색
"Search" → t('search.placeholder')
"No search term entered" → t('search.no_term_entered')
```

## Data Models

### Translation File Structure

**messages/en.json 확장 구조:**

```json
{
  "company": {
    "company_name": "whirik inc.",
    "company_owner": "Sunjo Lee, Jeongwoo Choi",
    // ... 기존 회사 정보
  },
  "navigation": {
    "explorer": "Explorer",
    "playlist": "Playlist",
    "tailored_service": "Tailored Service",
    "pricing": "Pricing"
  },
  "ui": {
    "service_title": "probgm",
    "service_description": "explorer unlimited background music",
    // ... 기존 UI 요소들 + 새로운 요소들
  },
  "search": {
    "placeholder": "Search",
    "no_term_entered": "No search term entered. Please enter a search term.",
    "other_suggestions": "Other search suggestions (clickable)",
    "related_keywords": "Related Keywords"
  },
  "player": {
    "now_standby": "Now Standby",
    "subtitle_placeholder": "Sub Title",
    "play": "Play",
    "pause": "Pause",
    "stop": "Stop",
    "next": "Next",
    "previous": "Previous"
  },
  "playlist": {
    "page_title": "Playlist Page",
    "page_content": "Playlist Page Content"
  },
  "forms": {
    "input_reset_warning": "Input information will be reset.",
    "terms_agreement": "I agree to the terms of service.",
    "select_payment_method": "Please select a payment method"
  },
  "checkout": {
    "payment_methods": "Payment Methods",
    "domestic_card": "Domestic Card",
    "foreign_card": "Foreign Card",
    "credit_debit_card": "Credit/Debit Card",
    "visa_master_description": "VISA, Master, JCB, UnionPay",
    "foreign_card_guide_title": "Foreign Card Payment Guide",
    "foreign_card_guide_description": "You can select VISA, Master, JCB, or UnionPay in the payment window.",
    "monthly_price": "Monthly Price",
    "discount": "Discount",
    "yearly_total": "Yearly Total",
    "total_discount": "Total Discount",
    "final_payment": "Final Payment Amount",
    "monthly_fee": "Monthly Fee",
    "discount_amount": "Discount Amount"
  }
}
```

### Component Props Interface

```typescript
interface TranslationProps {
  namespace?: string;
  fallback?: string;
}

interface DynamicTranslationProps extends TranslationProps {
  params?: Record<string, string | number>;
}
```

## Error Handling

### Translation Key Validation

1. **Missing Key Handling**
   - 개발 환경에서 누락된 키 경고 표시
   - 프로덕션에서는 키 이름을 fallback으로 표시
   - 콘솔에 누락된 키 로그 출력

2. **Namespace Validation**
   - 존재하지 않는 네임스페이스 접근 시 경고
   - 기본 네임스페이스로 fallback

3. **Parameter Validation**
   - 필수 매개변수 누락 시 경고
   - 기본값 제공 또는 매개변수 없는 버전으로 fallback

### Error Recovery Strategy

```javascript
// 안전한 번역 함수 래퍼
const safeTranslate = (key, params = {}, fallback = key) => {
  try {
    return t(key, params);
  } catch (error) {
    console.warn(`Translation error for key: ${key}`, error);
    return fallback;
  }
};
```

## Testing Strategy

### Translation Coverage Testing

1. **Static Analysis**
   - 모든 JSX 파일에서 하드코딩된 텍스트 검색
   - 사용되지 않는 번역 키 식별
   - 누락된 번역 키 식별

2. **Runtime Testing**
   - 각 컴포넌트의 번역 키 사용 확인
   - 동적 매개변수 전달 테스트
   - 네임스페이스 접근 테스트

3. **Integration Testing**
   - 전체 애플리케이션 플로우에서 번역 동작 확인
   - 로케일 변경 시 텍스트 업데이트 확인

### Test Cases

```javascript
// 예시 테스트 케이스
describe('Internationalization', () => {
  test('should render translated navigation items', () => {
    render(<Navigation />);
    expect(screen.getByText('Explorer')).toBeInTheDocument();
  });

  test('should handle missing translation keys gracefully', () => {
    const { container } = render(<ComponentWithMissingKey />);
    expect(container).toHaveTextContent('fallback_text');
  });

  test('should interpolate parameters correctly', () => {
    render(<WelcomeMessage userName="John" />);
    expect(screen.getByText('Welcome, John!')).toBeInTheDocument();
  });
});
```

### Performance Considerations

1. **Bundle Size Optimization**
   - 사용되지 않는 번역 키 제거
   - 네임스페이스별 코드 분할 고려

2. **Runtime Performance**
   - 번역 함수 호출 최적화
   - 메모이제이션 적용 고려

3. **Loading Strategy**
   - 초기 로드 시 필수 번역만 로드
   - 지연 로딩으로 추가 번역 로드

## Implementation Phases

### Phase 1: Core Infrastructure
- 번역 키 구조 정의 및 en.json 확장
- 공통 컴포넌트 국제화 (Header, Footer, Navigation)
- 기본 페이지 컴포넌트 국제화

### Phase 2: Feature Components
- 인증 관련 컴포넌트 국제화
- 검색 및 플레이어 컴포넌트 국제화
- 모달 컴포넌트들 국제화

### Phase 3: Advanced Features
- 결제 관련 컴포넌트 국제화
- 동적 콘텐츠 및 폼 국제화
- 에러 처리 및 검증 메시지 국제화

### Phase 4: Quality Assurance
- 전체 애플리케이션 번역 검증
- 사용되지 않는 키 정리
- 성능 최적화 및 테스트