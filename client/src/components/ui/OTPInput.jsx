import React, { useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

export function OTPInput({ length = 6, value = '', onChange, onComplete }) {
  const [otp, setOtp] = useState(value ? value.split('') : new Array(length).fill(''));
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = [...otp];
    // take last char entered
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    const combined = newOtp.join('');
    if (onChange) onChange(combined);

    // Auto-advance
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (combined.length === length && onComplete) {
      onComplete(combined);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').trim().slice(0, length);
    if (/^\d+$/.test(data)) {
      const newOtp = data.split('');
      while (newOtp.length < length) newOtp.push('');
      setOtp(newOtp);
      const combined = newOtp.join('');
      if (onChange) onChange(combined);
      if (combined.length === length && onComplete) onComplete(combined);
    }
  };

  const fillDemoOTP = () => {
    const demo = ['1', '2', '3', '4', '5', '6'];
    setOtp(demo);
    if (onChange) onChange('123456');
    if (onComplete) onComplete('123456');
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-center items-center gap-2 sm:gap-3" onPaste={handlePaste}>
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[i] || ''}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold font-heading rounded-xl border border-surface-border bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 shadow-sm transition-all"
          />
        ))}
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={fillDemoOTP}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg border border-brand-200 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fill Demo OTP (123456)</span>
        </button>
      </div>
    </div>
  );
}
