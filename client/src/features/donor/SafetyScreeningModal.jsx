import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { RiskBadge } from '../../components/badges/RiskBadge';
import { CheckCircle2, ShieldAlert, Sparkles, Loader2, Info, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export function SafetyScreeningModal({ isOpen, onClose, assessment, donation, onProceed }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'Validation', desc: 'Validating preparation time and pickup feasibility' },
    { title: 'Shelf-Life Matrix', desc: 'Checking elapsed time against category & storage limits' },
    { title: 'Computer Vision Scan', desc: 'Analyzing image sharpness, exposure, and pHash duplicates' },
    { title: 'Risk Classification', desc: 'Computing final risk score and routing decision' },
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      const timer1 = setTimeout(() => setCurrentStep(1), 600);
      const timer2 = setTimeout(() => setCurrentStep(2), 1200);
      const timer3 = setTimeout(() => {
        setCurrentStep(3);
        if (assessment?.riskLevel === 'LOW') {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        }
      }, 1800);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isOpen, assessment]);

  if (!isOpen || !assessment) return null;

  const isCompleted = currentStep === 3;
  const isLowRisk = assessment.riskLevel === 'LOW';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI-Assisted Food Safety Screening" maxWidth="max-w-xl">
      <div className="space-y-4 text-left">
        {/* Animated Step Tracker */}
        <div className="p-4 bg-surface-subtle border border-surface-border rounded-xl space-y-3">
          {steps.map((st, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep > i
                    ? 'bg-brand-600 text-white'
                    : currentStep === i
                    ? 'bg-brand-100 text-brand-800 ring-2 ring-brand-500'
                    : 'bg-white border border-surface-border text-content-light'
                }`}
              >
                {currentStep > i ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : currentStep === i ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
                ) : (
                  i + 1
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-xs font-bold ${
                    currentStep >= i ? 'text-content-primary' : 'text-content-light'
                  }`}
                >
                  {st.title}
                </p>
                <p className="text-[11px] text-content-secondary leading-snug">{st.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Screening Result Card */}
        {isCompleted && (
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isLowRisk
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-amber-50/60 border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-content-secondary">
                  Screening Outcome
                </span>
                <h4 className="text-base font-bold font-heading text-content-primary">
                  {isLowRisk ? 'Verified For Redistribution' : 'Manual Review Required'}
                </h4>
              </div>
              <RiskBadge
                riskLevel={assessment.riskLevel}
                score={assessment.score}
                showMethod={true}
                method={assessment.method}
                size="lg"
              />
            </div>

            {/* Explanation List */}
            <div className="mt-3 space-y-1.5 border-t border-black/5 pt-3">
              <span className="text-xs font-bold text-content-primary">Screening Observations:</span>
              <ul className="space-y-1 text-xs text-content-secondary">
                {assessment.reasons?.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-brand-600 font-bold">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Non-Negotiable Safety Disclaimer */}
            <div className="mt-4 p-3 bg-white/80 border border-surface-border rounded-xl text-[11px] text-content-secondary flex items-start gap-2 leading-relaxed">
              <Info className="w-4 h-4 text-content-light flex-shrink-0 mt-0.5" />
              <span>{assessment.disclaimer}</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        {isCompleted && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onProceed || onClose}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-soft transition-all"
            >
              <span>View Tracking & Live Matches</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
