import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

/**
 * Payment Store (with immer)
 */
const usePaymentStore = create(
    immer((set, get) => ({
        currentMembershipPlan: "free",
        selectedMembershipPlan: null,
        selectedPaymentType: "yearly", // 'yearly' or 'monthly'
        checkout: null,
        paymentStep: null,
        
        // 결제 결과 관련 상태
        paymentResult: null, // 결제 완료 후 토스페이먼츠 응답 데이터
        paymentStatus: 'idle', // 'idle', 'processing', 'success', 'failed'
        paymentError: null,

        // setters
        setCurrentMembershipPlan: (plan) =>
            set((state) => {
                state.currentMembershipPlan = plan;
            }),

        setSelectedMembershipPlan: (plan) =>
            set((state) => {
                state.selectedMembershipPlan = plan;
            }),

        setSelectedPaymentType: (type) =>
            set((state) => {
                state.selectedPaymentType = type;
            }),

        setCheckout: (checkoutData) =>
            set((state) => {
                state.checkout = checkoutData;
            }),


        setPaymentStep: (stepname) =>
            set((state) => {
                state.paymentStep = stepname;
            }),

        // 결제 결과 관련 setters
        setPaymentResult: (result) =>
            set((state) => {
                state.paymentResult = result;
            }),

        setPaymentStatus: (status) =>
            set((state) => {
                state.paymentStatus = status;
            }),

        setPaymentError: (error) =>
            set((state) => {
                state.paymentError = error;
            }),

        // reset all values
        resetPaymentStore: () =>
            set((state) => {
                state.currentMembershipPlan = "free";
                state.selectedMembershipPlan = null;
                state.selectedPaymentType = "yearly";
                state.checkout = null;
                state.paymentResult = null;
                state.paymentStatus = 'idle';
                state.paymentError = null;
            }),
    }))
);

export default usePaymentStore;
