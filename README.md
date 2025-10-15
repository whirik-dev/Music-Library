# BGM.whirik.com
## 📌 Introduction
Whirik Music library Service

## 🚀 Tech Stack
- Frontend: React
- State Managemnet : Zustand + immer
- Backend: Next.js

## 📦 Installation & Setup
```sh
# Clone the project
git clone ___Project Url___

# Install 
npm install

# Start development server
npm run dev
```

## 📂 Project Structure
```js
/project-root
│── app/
│   ├── (app)/              # Main app pages
│   ├── (payment)/          # Payment related pages
│   └── api/                # API routes
│       └── payments/       # Payment API endpoints
│── components/             # Reusable components
│── stores/                 # Zustand state management
│── utils/                  # Utility functions
│── types/                  # Type definitions
│── public/                 # Static assets
└── README.md              # Project documentation
```

## 💳 Payment Integration
This project integrates with TossPayments for payment processing.

### Payment Flow
1. **Payment Request**: User initiates payment from checkout page
2. **Payment Processing**: Redirected to TossPayments payment window
3. **Payment Response**: Handles success/failure responses
4. **Payment Confirmation**: Server-side payment verification
5. **Webhook Processing**: Real-time payment status updates

### Payment Features
- ✅ Credit/Debit Card payments
- ✅ Virtual Account payments
- ✅ Bank Transfer payments
- ✅ Mobile payments
- ✅ Foreign payments (PayPal, etc.)
- ✅ Payment status management
- ✅ Webhook integration
- ✅ Error handling and validation

### Environment Variables
```env
# TossPayments Configuration
NEXT_PUBLIC_TOSS_CLIENT_TEST=test_ck_xxxxx
TOSS_SECRET_KEY=test_sk_xxxxx

# Google Analytics Configuration
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### API Endpoints
- `POST /api/payments/confirm` - Payment confirmation
- `POST /api/payments/webhook` - Webhook handler

### Payment Utilities
- Payment amount formatting
- Payment status translation
- Error message handling
- Payment data validation

## 📊 Google Analytics Integration
This project includes comprehensive Google Analytics tracking for user behavior analysis.

### Analytics Features
- ✅ Page view tracking
- ✅ Music play event tracking
- ✅ Search event tracking
- ✅ Payment event tracking
- ✅ Button click tracking
- ✅ Custom event tracking

### Setup Google Analytics
1. **Create Google Analytics Account**: Visit [Google Analytics](https://analytics.google.com/)
2. **Create Property**: Set up a new property for your website
3. **Get Measurement ID**: Copy your GA4 Measurement ID (format: G-XXXXXXXXXX)
4. **Update Environment Variables**: Add your Measurement ID to `.env.local`

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Analytics Implementation
The analytics system includes:

#### Core Files
- `lib/gtag.js` - Google Analytics configuration
- `lib/analytics.js` - Custom event tracking functions
- `components/GoogleAnalytics.jsx` - Analytics component
- `hooks/useGoogleAnalytics.js` - Page view tracking hook

#### Tracked Events
- **Music Events**: Play, pause, stop music tracks
- **Search Events**: Search queries and results
- **Payment Events**: Payment attempts and completions
- **Navigation Events**: Page views and route changes
- **User Interactions**: Button clicks and form submissions

#### Usage Examples
```javascript
import { trackMusicPlay, trackSearch, trackPayment } from '@/lib/analytics';

// Track music play
trackMusicPlay('Song Title', 'Artist Name');

// Track search
trackSearch('search query');

// Track payment
trackPayment('CARD', 10000);
```

### Analytics Dashboard
Monitor your analytics data in the Google Analytics dashboard:
- Real-time user activity
- Page performance metrics
- User engagement patterns
- Conversion tracking
- Custom event analysis
