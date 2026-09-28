import { create } from 'zustand';

export const JUDGE_WALKTHROUGH_STEPS = [
  {
    step: 1,
    title: '1. Donor Creates Surplus Listing & Uploads Food Photos',
    role: 'DONOR',
    description:
      'The donor inputs surplus food details (Paneer Curry, 110 meals), preparation timestamp, and temperature storage condition (heated/ambient). Multi-image upload provides photo evidence for visual verification.',
    route: '/donor/create',
  },
  {
    step: 2,
    title: '2. Multi-Stage Food Safety Screening Pipeline',
    role: 'DONOR',
    description:
      'Watch the live pipeline run in 4 steps: (1) Time & shelf-life feasibility, (2) Storage-category matrix check, (3) Computer vision blur/exposure/duplicate image hash scan, (4) Risk classification (LOW/MEDIUM/HIGH). Persistent disclaimer is displayed.',
    route: '/donor/donations',
  },
  {
    step: 3,
    title: '3. Admin Safety Review Queue (Human-in-the-Loop)',
    role: 'ADMIN',
    description:
      'High/medium-risk donations are held safely in REVIEW_REQUIRED status. Admins inspect the audit trail and rule deductions, and can Approve, Reject, or Request More Info with mandatory audit rationale.',
    route: '/admin/safety-reviews',
  },
  {
    step: 4,
    title: '4. Transparent Smart Matching for NGOs/Receivers',
    role: 'RECEIVER',
    description:
      'Verified donations are matched with local NGOs. The UI provides a 100% transparent factor breakdown (Food type, Quantity fit, Haversine distance, Delivery window, Capacity). No black-box AI scores!',
    route: '/receiver/available',
  },
  {
    step: 5,
    title: '5. Delivery Partner Route Optimization & Pickup',
    role: 'DELIVERY_PARTNER',
    description:
      'Nearby volunteers receive optimized routes (2-opt TSP). At pickup, donor provides the 6-digit cryptographic OTP (Demo OTP: 123456) and photo proof with geofence verification.',
    route: '/delivery/requests',
  },
  {
    step: 6,
    title: '6. Receiver Delivery Confirmation & Digital Proof',
    role: 'RECEIVER',
    description:
      'The NGO receiver verifies food arrival, enters confirmation OTP (123456), inspects condition, and signs the digital delivery pad. The donation status reaches COMPLETED.',
    route: '/receiver/incoming',
  },
  {
    step: 7,
    title: '7. Real-Time Environmental Impact & Audit Trail',
    role: 'ADMIN',
    description:
      'Every gram of diverted food instantly increments CO2e diversion and water conservation metrics based on peer-reviewed FAO/UNEP LCA equations. The immutable Audit Log records the complete lifecycle.',
    route: '/analytics',
  },
];

export const useDemoStore = create((set, get) => ({
  isWalkthroughActive: false,
  walkthroughStep: 0,
  toasts: [],

  startWalkthrough: () => set({ isWalkthroughActive: true, walkthroughStep: 0 }),
  nextWalkthroughStep: () => {
    const current = get().walkthroughStep;
    if (current < JUDGE_WALKTHROUGH_STEPS.length - 1) {
      set({ walkthroughStep: current + 1 });
    } else {
      set({ isWalkthroughActive: false, walkthroughStep: 0 });
    }
  },
  prevWalkthroughStep: () => {
    const current = get().walkthroughStep;
    if (current > 0) {
      set({ walkthroughStep: current - 1 });
    }
  },
  closeWalkthrough: () => set({ isWalkthroughActive: false }),

  addToast: ({ title, message, type = 'success' }) => {
    const id = Date.now().toString();
    set((state) => ({
      toasts: [...state.toasts, { id, title, message, type }],
    }));
    setTimeout(() => {
      get().removeToast(id);
    }, 5000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
