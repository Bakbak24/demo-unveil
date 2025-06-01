// Stripe Configuration
export const STRIPE_CONFIG = {
  // Test publishable key - replace with your actual Stripe publishable key
  PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51OkdVkFMFVlMh1B6BYM6eMG8R8122EXauUo6s4HjLZ3d1Ik8kDiDLEV15xaallSRpOSlf9N4yQtyJH1kGNXEdr1B008Jz1bFK3',
  
  // Test mode settings
  TEST_MODE: true,
  
  // Supported payment methods
  PAYMENT_METHODS: ['card'],
  
  // Currency
  CURRENCY: 'eur',
  
  // Test card numbers for development
  TEST_CARDS: {
    VISA: '4242424242424242',
    VISA_DEBIT: '4000056655665556',
    MASTERCARD: '5555555555554444',
    AMEX: '378282246310005',
    DECLINED: '4000000000000002',
  }
};

export default STRIPE_CONFIG; 