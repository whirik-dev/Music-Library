interface PricePlan {
    id: string;
    name: string;
    description: string;
    features: string[];
    monthlyCredits: number;
    pricing: {
        usd: {
            monthly: number;
            yearlyMonthly: number; // 연간 결제 시 월 단가
            yearlyTotal: number;   // 연간 총액
            discount: number;      // 할인율 (%)
        };
        krw: {
            monthly: number;
            yearlyMonthly: number;
            yearlyTotal: number;
            savings: number;       // 연간 결제 시 절약 금액
        };
    };
}

const pricePlans: PricePlan[] = [
    {
        id: 'basic',
        name: 'BASIC',
        description: '개인 사용자를 위한 기본 플랜',
        features: [
            '무제한 라이브러리 음원 다운로드',
            '고음질 WAV 24bit 파일 제공',
        ],
        monthlyCredits: 70,
        pricing: {
            usd: {
                monthly: 7.99,
                yearlyMonthly: 8.99,
                yearlyTotal: 107.88,    // 8.99 * 12
                discount: 12.52         // ((7.99*12 - 107.88) / (7.99*12)) * 100
            },
            krw: {
                monthly: 13900,
                yearlyMonthly: 12400,
                yearlyTotal: 148800,    // 12400 * 12
                savings: 18000          // (13900*12) - 148800
            }
        }
    },
    {
        id: 'pro',
        name: 'PRO',
        description: '전문가를 위한 고급 플랜',
        features: [
            '무제한 라이브러리 음원 다운로드',
            '고음질 WAV 24bit 파일 제공',
            '고급 검색 및 필터',
        ],
        monthlyCredits: 150,
        pricing: {
            usd: {
                monthly: 14.99,
                yearlyMonthly: 15.39,
                yearlyTotal: 184.68,    // 15.39 * 12
                discount: 2.67          // ((14.99*12 - 184.68) / (14.99*12)) * 100
            },
            krw: {
                monthly: 26900,
                yearlyMonthly: 21590,
                yearlyTotal: 259080,    // 21590 * 12
                savings: 63720          // (26900*12) - 259080
            }
        }
    },
    {
        id: 'master',
        name: 'MASTER',
        description: '무제한 사용을 위한 프리미엄 플랜',
        features: [
            '무제한 라이브러리 음원 다운로드',
            '고음질 WAV 24bit 파일 제공',
            '고급 검색 및 필터',
        ],
        monthlyCredits: 500,
        pricing: {
            usd: {
                monthly: 35.99,
                yearlyMonthly: 36.49,
                yearlyTotal: 437.88,    // 36.49 * 12
                discount: 1.39          // ((35.99*12 - 437.88) / (35.99*12)) * 100
            },
            krw: {
                monthly: 69900,
                yearlyMonthly: 51900,
                yearlyTotal: 622800,    // 51900 * 12
                savings: 216000         // (69900*12) - 622800
            }
        }
    }
];

export default pricePlans;