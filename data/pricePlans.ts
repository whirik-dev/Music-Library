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
        description: 'pricing.basic_description',
        features: [
            'Unlimited library music downloads',
            'High-quality WAV 24bit files',
        ],
        monthlyCredits: 70,
        pricing: {
            usd: {
                monthly: 9.99,
                yearlyMonthly: 7.99,
                yearlyTotal: 95.88,     // 7.99 * 12
                discount: 20.02         // ((9.99*12 - 95.88) / (9.99*12)) * 100
            },
            krw: {
                monthly: 11900,
                yearlyMonthly: 9900,
                yearlyTotal: 118800,    // 9900 * 12
                savings: 24000          // (11900*12) - 118800
            }
        }
    },
    {
        id: 'pro',
        name: 'PRO',
        description: 'pricing.pro_description',
        features: [
            'Unlimited library music downloads',
            'High-quality WAV 24bit files',
            'Advanced search and filters',
        ],
        monthlyCredits: 150,
        pricing: {
            usd: {
                monthly: 19.99,
                yearlyMonthly: 14.99,
                yearlyTotal: 179.88,    // 14.99 * 12
                discount: 25.01         // ((19.99*12 - 179.88) / (19.99*12)) * 100
            },
            krw: {
                monthly: 22900,
                yearlyMonthly: 18900,
                yearlyTotal: 226800,    // 18900 * 12
                savings: 48000          // (22900*12) - 226800
            }
        }
    },
    {
        id: 'master',
        name: 'MASTER',
        description: 'pricing.master_description',
        features: [
            'Unlimited library music downloads',
            'High-quality WAV 24bit files',
            'Advanced search and filters',
        ],
        monthlyCredits: 500,
        pricing: {
            usd: {
                monthly: 49.99,
                yearlyMonthly: 35.99,
                yearlyTotal: 431.88,    // 35.99 * 12
                discount: 28.01         // ((49.99*12 - 431.88) / (49.99*12)) * 100
            },
            krw: {
                monthly: 59900,
                yearlyMonthly: 48900,
                yearlyTotal: 586800,    // 48900 * 12
                savings: 132000         // (59900*12) - 586800
            }
        }
    }
];

export default pricePlans;