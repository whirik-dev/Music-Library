import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

/**
 * Payment Store (with immer)
 */
const paymentStore = create(
    immer((set, get) => ({
        currentMembershipPlan: "free",
        selectedMembershipPlan: null,
        checkout: null,
        paymentStep: null,

        // setters
        setCurrentMembershipPlan: (plan) =>
            set((state) => {
                state.currentMembershipPlan = plan;
            }),

        setSelectedMembershipPlan: (plan) =>
            set((state) => {
                state.selectedMembershipPlan = plan;
            }),

        setCheckout: (checkoutData) =>
            set((state) => {
                state.checkout = checkoutData;
            }),


        setPaymentStep: (stepname) =>
            set((state) => {
                state.paymentStep = stepname;
            }),

        // reset all values
        resetPaymentStore: () =>
            set((state) => {
                state.currentMembershipPlan = "free";
                state.selectedMembershipPlan = null;
                state.checkout = null;
            }),
    }))
);

export default paymentStore;
