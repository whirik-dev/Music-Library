# 보안 규칙 (Security Rules)

## 세션 보안 (Session Security)

### SSID (Session ID) 보안 규칙
- **절대 금지**: SSID는 클라이언트에 노출되면 안 됩니다
- **서버 전용**: SSID는 서버 사이드에서만 처리되어야 합니다
- **API 응답**: API 응답에 SSID를 포함하지 마세요
- **로그**: SSID를 로그에 기록하지 마세요
- **디버깅**: 디버깅 정보에도 SSID를 포함하지 마세요

### 올바른 세션 처리 방법
```javascript
// ❌ 잘못된 예시 - SSID를 클라이언트에 노출
return NextResponse.json({
  user: userData,
  ssid: session.ssid  // 절대 금지!
});

// ✅ 올바른 예시 - SSID 노출 없이 세션 정보만 반환
return NextResponse.json({
  user: userData,
  isAuthenticated: true
});
```

### 세션 검증
- 세션 검증은 서버 사이드에서만 수행
- 클라이언트는 세션 상태만 확인 가능
- JWT 토큰 사용 시에도 민감한 정보는 페이로드에 포함하지 않기

## 일반 보안 규칙

### API 키 및 시크릿
- 환경 변수로만 관리
- 클라이언트 코드에 하드코딩 금지
- .env 파일은 .gitignore에 포함

### 사용자 데이터
- 개인정보는 최소한으로만 수집
- 비밀번호는 해시화하여 저장
- 민감한 정보는 로그에 기록