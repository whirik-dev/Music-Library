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
```

### API Endpoints
- `POST /api/payments/confirm` - Payment confirmation
- `POST /api/payments/webhook` - Webhook handler

### Payment Utilities
- Payment amount formatting
- Payment status translation
- Error message handling
- Payment data validation
