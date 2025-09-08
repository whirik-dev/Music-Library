import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

// 지원하는 로케일 목록
const supportedLocales = ['en', 'ko'];
const defaultLocale = 'en';

function detectLocaleFromHeaders(acceptLanguage: string | null): string {
  // console.log('🌐 [Locale Detection] Accept-Language header:', acceptLanguage);

  if (!acceptLanguage) {
    // console.log('🌐 [Locale Detection] No Accept-Language header, using default:', defaultLocale);
    return defaultLocale;
  }

  // Accept-Language 헤더에서 언어 우선순위 파싱
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [locale, q = '1'] = lang.trim().split(';q=');
      return { locale: locale.toLowerCase(), priority: parseFloat(q) };
    })
    .sort((a, b) => b.priority - a.priority);

  // console.log('🌐 [Locale Detection] Parsed languages with priority:', languages);

  // 지원하는 로케일 중에서 매칭되는 것 찾기
  for (const { locale } of languages) {
    const matchedLocale = supportedLocales.find(supported =>
      locale.startsWith(supported) || supported.startsWith(locale.split('-')[0])
    );
    if (matchedLocale) {
      // console.log(`🌐 [Locale Detection] Matched locale "${locale}" to supported locale "${matchedLocale}"`);
      return matchedLocale;
    }
  }

  // console.log('🌐 [Locale Detection] No matching locale found, using default:', defaultLocale);
  return defaultLocale;
}

export default getRequestConfig(async () => {
  // console.log('🚀 [Locale Detection] Starting locale detection process...');

  const store = await cookies();
  const headersList = await headers();

  // 1. 쿠키에서 로케일 확인 (최우선)
  let locale = store.get('locale')?.value;
  // console.log('🍪 [Locale Detection] Cookie locale:', locale);

  // 2. 쿠키에 없으면 Accept-Language 헤더에서 감지
  if (!locale || !supportedLocales.includes(locale)) {
    if (locale && !supportedLocales.includes(locale)) {
      // console.log(`⚠️ [Locale Detection] Cookie locale "${locale}" is not supported, falling back to header detection`);
    } else {
      // console.log('🔍 [Locale Detection] No valid cookie locale found, checking Accept-Language header');
    }

    const acceptLanguage = headersList.get('accept-language');
    locale = detectLocaleFromHeaders(acceptLanguage);
    // console.log('🌐 [Locale Detection] Locale from headers:', locale);
  } else {
    // console.log('✅ [Locale Detection] Using cookie locale:', locale);
  }

  // 3. 최종 fallback
  if (!supportedLocales.includes(locale)) {
    // console.log(`⚠️ [Locale Detection] Final fallback: "${locale}" is not supported, using default "${defaultLocale}"`);
    locale = defaultLocale;
  }

  // console.log(`🎯 [Locale Detection] Final selected locale: "${locale}"`);

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});