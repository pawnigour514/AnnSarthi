import React from 'react';
import { useDemoStore, JUDGE_WALKTHROUGH_STEPS } from '../../store/demoStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ArrowLeft, X, CheckCircle2 } from 'lucide-react';

export function JudgeWalkthroughOverlay() {
  const { isWalkthroughActive, walkthroughStep, nextWalkthroughStep, prevWalkthroughStep, closeWalkthrough } =
    useDemoStore();
  const { demoLogin, user } = useAuthStore();
  const navigate = useNavigate();

  if (!isWalkthroughActive) return null;

  const current = JUDGE_WALKTHROUGH_STEPS[walkthroughStep] || JUDGE_WALKTHROUGH_STEPS[0];

  const handleNavigateStep = async () => {
    // If the step requires switching to another demo role, switch automatically!
    if (current.role && current.role !== user?.role) {
      await demoLogin(current.role);
    }
    navigate(current.route);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl bg-white/95 backdrop-blur-md border-2 border-brand-500 rounded-2xl shadow-elevated p-5 transition-all text-left">
      <div className="flex items-start justify-between gap-3 border-b border-surface-border pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-600 text-white shadow-soft">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-brand-700">
              SIH26234 Evaluator Guide (Step {walkthroughStep + 1} of {JUDGE_WALKTHROUGH_STEPS.length})
            </span>
            <h4 className="text-sm font-bold font-heading text-content-primary">{current.title}</h4>
          </div>
        </div>
        <button
          onClick={closeWalkthrough}
          className="text-content-light hover:text-content-primary p-1 rounded-lg hover:bg-surface-subtle"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs sm:text-sm text-content-secondary mt-3 leading-relaxed">
        {current.description}
      </p>

      <div className="mt-4 pt-3 border-t border-surface-border flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={handleNavigateStep}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 px-3.5 py-1.5 rounded-xl shadow-soft transition-all"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Switch to {current.role} & View Screen</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={prevWalkthroughStep}
            disabled={walkthroughStep === 0}
            className="p-1.5 rounded-lg border border-surface-border text-content-secondary hover:bg-surface-subtle disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextWalkthroughStep}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-bold border border-brand-200"
          >
            <span>{walkthroughStep === JUDGE_WALKTHROUGH_STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
