import { useState } from 'react';
import { ExternalLink, RefreshCw, AlertTriangle, Heart } from 'lucide-react';

interface SecondChanceTabProps {
  returnAge: number;
  birthYear: number;
  onboardDate: number;
  onResetOnboarding: () => void;
}

const FUTURE_MESSAGES = [
  "You returned to this moment to live with open eyes. Notice the dust dancing in the sunlight.",
  "There is nothing you need to accomplish today. Just being here, feeling the air, is the miracle.",
  "Future you is looking back with immense warmth. You are doing so much better than you think.",
  "Listen to the silence between the clock ticks. That is where your new life resides.",
  "No matter how busy today becomes, remember: you got your chance. Savor the warm cup of tea.",
  "You left behind the regrets when you returned. Each breath is an unwritten page."
];

export default function SecondChanceTab({ returnAge, birthYear, onboardDate, onResetOnboarding }: SecondChanceTabProps) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Stats Calculations
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthYear;
  
  // Dynamic days (milliseconds to days math)
  const elapsedMs = Date.now() - onboardDate;
  const daysValue = Math.floor(elapsedMs / 86400000);

  // Message rotation based on bonus days count
  const activeMsg = FUTURE_MESSAGES[daysValue % FUTURE_MESSAGES.length];

  return (
    <div id="second-chance-tab-container" className="flex-1 flex flex-col max-w-lg mx-auto w-full p-6 select-none relative">
      
      {/* Header */}
      <div className="mb-6 mt-4">
        <h1 className="font-serif text-3xl font-light text-ink">Second Chance</h1>
        <p className="font-sans text-xs text-muted mt-1">Measuring the infinite depth of returned time</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pb-24">
        
        {/* 6 Stats Grid (2 columns) */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Card 1: Returned From */}
          <div className="bg-amber-gold/5 border border-amber-gold/15 rounded-2xl p-4 flex flex-col justify-between h-[100px] shadow-[0_1px_3px_rgba(200,149,84,0.02)]">
            <span className="font-mono text-[9px] text-faint tracking-wider uppercase">Returned From</span>
            <span className="font-serif text-3xl text-ink font-light leading-none">{returnAge}</span>
          </div>

          {/* Card 2: Current Age */}
          <div className="bg-amber-gold/5 border border-amber-gold/15 rounded-2xl p-4 flex flex-col justify-between h-[100px] shadow-[0_1px_3px_rgba(200,149,84,0.02)]">
            <span className="font-mono text-[9px] text-faint tracking-wider uppercase">Current Age</span>
            <span className="font-serif text-3xl text-ink font-light leading-none">{currentAge}</span>
          </div>

          {/* Card 3: Days Reclaimed */}
          <div className="bg-amber-gold/5 border border-amber-gold/15 rounded-2xl p-4 flex flex-col justify-between h-[100px] shadow-[0_1px_3px_rgba(200,149,84,0.02)]">
            <span className="font-mono text-[9px] text-faint tracking-wider uppercase">Days Reclaimed</span>
            <span className="font-mono text-2xl text-amber-gold font-bold leading-none">{daysValue}</span>
          </div>

          {/* Card 4: Bonus Days Earned */}
          <div className="bg-amber-gold/5 border border-amber-gold/15 rounded-2xl p-4 flex flex-col justify-between h-[100px] shadow-[0_1px_3px_rgba(200,149,84,0.02)]">
            <span className="font-mono text-[9px] text-faint tracking-wider uppercase">Bonus Days</span>
            <span className="font-mono text-2xl text-amber-gold font-bold leading-none">{daysValue}</span>
          </div>

          {/* Card 5: Mornings Experienced */}
          <div className="bg-amber-gold/5 border border-amber-gold/15 rounded-2xl p-4 flex flex-col justify-between h-[100px] shadow-[0_1px_3px_rgba(200,149,84,0.02)]">
            <span className="font-mono text-[9px] text-faint tracking-wider uppercase">Mornings</span>
            <span className="font-mono text-2xl text-amber-gold font-bold leading-none">{daysValue}</span>
          </div>

          {/* Card 6: Sunrises Revisited */}
          <div className="bg-amber-gold/5 border border-amber-gold/15 rounded-2xl p-4 flex flex-col justify-between h-[100px] shadow-[0_1px_3px_rgba(200,149,84,0.02)]">
            <span className="font-mono text-[9px] text-faint tracking-wider uppercase">Sunrises Revisited</span>
            <span className="font-mono text-2xl text-amber-gold font-bold leading-none">{daysValue}</span>
          </div>

        </div>

        {/* Message From Future You (Warm background card) */}
        <div className="bg-paper border border-border-beige rounded-2xl p-5 space-y-2 shadow-sm">
          <span className="font-mono text-[9px] text-amber-gold tracking-widest uppercase block">
            Message From Future You
          </span>
          <p className="font-serif italic text-[15px] leading-relaxed text-muted">
            "{activeMsg}"
          </p>
        </div>

        {/* Monetization / Support Section */}
        <div className="bg-[#FAF8F5] border border-border-beige rounded-2xl p-6 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-gold/10 text-amber-gold mb-1">
            <Heart size={18} fill="currentColor" className="text-amber-gold" />
          </div>
          
          <div className="space-y-1">
            <h3 className="font-serif text-lg text-ink">Keep the Miracle Alive</h3>
            <p className="font-sans text-xs text-muted max-w-xs mx-auto">
              LTMClock has no paywalls or advertising. If this clock brought warmth or perspective to your day, support its keeping.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <a
              id="support-kofi-link"
              href="https://ko-fi.com/secondchanceclock"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-amber-gold hover:bg-amber-gold/90 text-paper rounded-full font-sans text-xs tracking-widest uppercase font-medium shadow-sm transition-all duration-300"
            >
              <span>Support Second Chance</span>
              <ExternalLink size={12} />
            </a>
            <p className="font-mono text-[10px] text-faint">
              Suggested €0.99 — or pay what you want
            </p>
          </div>
        </div>

        {/* Reset Onboarding link */}
        <div className="text-center pt-4">
          <button
            id="reset-onboarding-link-btn"
            onClick={() => setShowConfirmReset(true)}
            className="text-faint hover:text-ink font-sans text-xs underline decoration-dotted transition-colors duration-300 cursor-pointer"
          >
            Reset onboarding
          </button>
        </div>

      </div>

      {/* CONFIRMATION DIALOG OVERLAY */}
      {showConfirmReset && (
        <div className="absolute inset-0 bg-void/45 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-paper border border-border-beige rounded-2xl p-6 w-full max-w-xs space-y-5 shadow-2xl text-center">
            <div className="w-10 h-10 rounded-full bg-amber-gold/10 text-amber-gold flex items-center justify-center mx-auto">
              <AlertTriangle size={20} />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif text-base text-ink">Reset Onboarding?</h3>
              <p className="font-sans text-xs text-muted">
                Your current return age, birth year, and all completed stats will be forgotten. This cannot be undone.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                id="reset-cancel-btn"
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-2.5 border border-border-beige rounded-full font-sans text-xs tracking-wider uppercase text-muted hover:bg-border-beige/10"
              >
                Keep Stats
              </button>
              <button
                id="reset-confirm-btn"
                onClick={() => {
                  setShowConfirmReset(false);
                  onResetOnboarding();
                }}
                className="flex-1 py-2.5 bg-void text-paper rounded-full font-sans text-xs tracking-wider uppercase font-medium hover:bg-void/90"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
