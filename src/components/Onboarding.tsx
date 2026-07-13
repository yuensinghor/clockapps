import { useState, useEffect } from 'react';
import { playMagicSound } from '../utils/audio';

interface OnboardingProps {
  onComplete: (data: { returnAge: number; birthYear: number; onboardDate: number }) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [screen, setScreen] = useState<number>(1);
  const [returnAge, setReturnAge] = useState<number>(60);
  const [birthYearInput, setBirthYearInput] = useState<string>('1989');
  
  // Checking system reduced motion preferences
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Screen 1: Line visibility timers
  const [s1Line, setS1Line] = useState(prefersReducedMotion ? 4 : 0);
  useEffect(() => {
    if (screen !== 1 || prefersReducedMotion) return;
    const t1 = setTimeout(() => setS1Line(1), 1500);
    const t2 = setTimeout(() => setS1Line(2), 3500);
    const t3 = setTimeout(() => setS1Line(3), 5500);
    const t4 = setTimeout(() => setS1Line(4), 7500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [screen, prefersReducedMotion]);

  // Screen 2: Line visibility timers (staggered fade-up, 0.4s between lines)
  const [s2Line, setS2Line] = useState(prefersReducedMotion ? 8 : 0);
  useEffect(() => {
    if (screen !== 2 || prefersReducedMotion) return;
    const timers = Array.from({ length: 8 }).map((_, idx) => {
      return setTimeout(() => {
        setS2Line(idx + 1);
      }, idx * 400);
    });
    return () => timers.forEach(clearTimeout);
  }, [screen, prefersReducedMotion]);

  // Screen 5: The Magic Scale Expansion & Sound Trigger
  const [glowScale, setGlowScale] = useState(0.4);
  const [s5MessageVisible, setS5MessageVisible] = useState(false);

  useEffect(() => {
    if (screen !== 5) return;

    // Play C-major pad synthesizer sound on entry
    playMagicSound();

    // Trigger radial glow scale expansion (0.4 -> 22 over 2.6s)
    const glowTimer = setTimeout(() => {
      setGlowScale(22);
    }, 100);

    // "Open your eyes." fades in at 2s, fades out by 4s
    let showTextTimer: any;
    let hideTextTimer: any;
    if (!prefersReducedMotion) {
      showTextTimer = setTimeout(() => setS5MessageVisible(true), 2000);
      hideTextTimer = setTimeout(() => setS5MessageVisible(false), 4000);
    } else {
      setS5MessageVisible(true);
    }

    // Auto-advances to screen 6 at 5.5s
    const advanceTimer = setTimeout(() => {
      setScreen(6);
    }, 5500);

    return () => {
      clearTimeout(glowTimer);
      if (showTextTimer) clearTimeout(showTextTimer);
      if (hideTextTimer) clearTimeout(hideTextTimer);
      clearTimeout(advanceTimer);
    };
  }, [screen, prefersReducedMotion]);

  // Calculate live age from input birthYear
  const currentYear = new Date().getFullYear();
  const parsedBirthYear = parseInt(birthYearInput, 10);
  const liveAge = isNaN(parsedBirthYear) ? 37 : currentYear - parsedBirthYear;

  const isBirthYearValid = !isNaN(parsedBirthYear) && parsedBirthYear >= 1900 && parsedBirthYear <= currentYear;

  const handleStartSecondChance = () => {
    onComplete({
      returnAge,
      birthYear: isBirthYearValid ? parsedBirthYear : 1989,
      onboardDate: Date.now()
    });
  };

  // Get Today's date formatted beautifully
  const getFormattedDate = () => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date());
  };

  return (
    <div id="onboarding-root" className="h-full min-h-full w-full flex flex-col justify-between p-8 select-none transition-colors duration-1000">
      
      {/* SCREEN 1: THE QUESTION */}
      {screen === 1 && (
        <div className="flex-1 flex flex-col justify-center items-center bg-void text-paper absolute inset-0 p-8 z-50">
          <div className="max-w-md w-full space-y-8 text-center">
            <p 
              className={`font-serif text-2xl md:text-3xl leading-relaxed text-paper/90 transition-opacity duration-1000 ${
                s1Line >= 1 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              Have you ever imagined…
            </p>
            <p 
              className={`font-serif text-2xl md:text-3xl leading-relaxed text-paper/90 transition-opacity duration-1000 ${
                s1Line >= 2 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              going back in time…
            </p>
            <p 
              className={`font-serif text-2xl md:text-3xl leading-relaxed text-paper/90 transition-opacity duration-1000 ${
                s1Line >= 3 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              to fix your regrets?
            </p>
            <div className="h-6"></div>
            <p 
              className={`font-serif italic text-2xl md:text-3xl text-amber-gold transition-opacity duration-1000 ${
                s1Line >= 4 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              What if you could?
            </p>
          </div>
          
          <div className="absolute bottom-16 left-0 right-0 text-center">
            <button
              id="s1-continue-btn"
              onClick={() => setScreen(2)}
              className={`text-faint hover:text-paper font-sans text-sm tracking-widest uppercase transition-all duration-1000 ${
                s1Line >= 4 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 2: THE STORY */}
      {screen === 2 && (
        <div className="flex-1 flex flex-col justify-center items-center bg-void text-paper absolute inset-0 p-8 z-50">
          <div className="max-w-md w-full space-y-4 text-center">
            <p 
              className={`font-sans text-paper/80 transition-all duration-700 ${
                s2Line >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              You are {liveAge}.
            </p>
            <p 
              className={`font-sans text-paper/80 transition-all duration-700 ${
                s2Line >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              You have already lived to age {returnAge}.
            </p>
            <p 
              className={`font-sans text-paper/80 transition-all duration-700 ${
                s2Line >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Those years are complete.
            </p>
            
            {/* 20px breath pause */}
            <div 
              className={`h-[20px] transition-all duration-700 ${
                s2Line >= 4 ? 'opacity-100' : 'opacity-0'
              }`}
            ></div>

            <p 
              className={`font-serif italic text-amber-gold text-lg transition-all duration-700 ${
                s2Line >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              A miracle has happened.
            </p>
            <p 
              className={`font-sans text-paper/80 transition-all duration-700 ${
                s2Line >= 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              You have been given the opportunity to return.
            </p>
            <p 
              className={`font-sans text-paper/80 transition-all duration-700 ${
                s2Line >= 7 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Your memories cannot return.
            </p>
            <p 
              className={`font-serif italic text-amber-gold text-lg transition-all duration-700 ${
                s2Line >= 8 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Only your chance.
            </p>
          </div>

          <div className="absolute bottom-16 left-0 right-0 text-center">
            <button
              id="s2-continue-btn"
              onClick={() => setScreen(3)}
              className={`text-faint hover:text-paper font-sans text-sm tracking-widest uppercase transition-all duration-1000 ${
                s2Line >= 8 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 3: THE CHOICE */}
      {screen === 3 && (
        <div className="flex-1 flex flex-col justify-center items-center bg-void text-paper absolute inset-0 p-8 z-50">
          <div className="max-w-md w-full flex flex-col items-center text-center space-y-10">
            <div>
              <p className="font-mono text-xs text-faint tracking-widest uppercase mb-4">
                CHOOSE RETURN POINT
              </p>
              
              {/* Selected return age */}
              <div className="h-32 flex items-center justify-center">
                <span className="font-serif italic text-[120px] text-paper/95 leading-none select-none transition-all duration-300">
                  {returnAge}
                </span>
              </div>
            </div>

            {/* Age Track: 5 amber dots */}
            <div className="flex items-center justify-between w-64 px-2 py-4 border-t border-b border-border-beige/10">
              {[50, 60, 70, 80, 90].map((age) => (
                <button
                  key={age}
                  id={`age-dot-${age}`}
                  onClick={() => setReturnAge(age)}
                  className="group flex flex-col items-center space-y-2 focus:outline-none"
                >
                  <span 
                    className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                      returnAge === age 
                        ? 'bg-amber-gold border-amber-gold shadow-[0_0_12px_rgba(200,149,84,0.6)] scale-110' 
                        : 'border-faint hover:border-amber-gold/50 bg-transparent'
                    }`}
                  ></span>
                  <span 
                    className={`font-mono text-[10px] tracking-tight transition-colors duration-300 ${
                      returnAge === age ? 'text-amber-gold font-medium' : 'text-faint group-hover:text-paper/60'
                    }`}
                  >
                    {age}
                  </span>
                </button>
              ))}
            </div>

            {/* Birth Year Input */}
            <div className="space-y-3 w-full max-w-xs">
              <label className="font-mono text-xs text-faint tracking-widest uppercase block">
                YOUR BIRTH YEAR
              </label>
              <input
                id="birth-year-input"
                type="text"
                maxLength={4}
                value={birthYearInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setBirthYearInput(val);
                }}
                className="w-full text-center border-b border-amber-gold bg-transparent text-paper text-4xl font-serif focus:outline-none pb-2 tracking-wide font-light placeholder-faint/30"
                placeholder="1989"
              />
              <p className="font-sans text-xs text-faint">
                {isBirthYearValid ? `This returns you to age ${liveAge}.` : 'Please enter a valid birth year.'}
              </p>
            </div>
          </div>

          <div className="absolute bottom-16 left-0 right-0 text-center">
            <button
              id="s3-continue-btn"
              disabled={!isBirthYearValid}
              onClick={() => setScreen(4)}
              className={`text-faint font-sans text-sm tracking-widest uppercase transition-all duration-300 ${
                isBirthYearValid 
                  ? 'opacity-100 hover:text-paper cursor-pointer' 
                  : 'opacity-20 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 4: THE BREATH */}
      {screen === 4 && (
        <div className="flex-1 flex flex-col justify-center items-center bg-void text-paper absolute inset-0 p-8 z-50">
          <div className="max-w-md w-full flex flex-col items-center text-center space-y-12">
            
            {/* Breathing Circle */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <div 
                className={`absolute inset-0 rounded-full border border-amber-gold/80`}
                style={{
                  animation: prefersReducedMotion ? 'none' : 'breath-animation 4s ease-in-out infinite',
                }}
              ></div>
              <div className="w-4 h-4 rounded-full bg-amber-gold/20"></div>
            </div>

            <div className="space-y-4">
              <p className="font-serif text-2xl text-paper/90">Close your eyes.</p>
              <p className="font-serif text-2xl text-paper/90">Take a breath.</p>
              <p className="font-sans text-sm text-faint mt-4 max-w-xs mx-auto">
                When you open them, you will be <span className="text-amber-gold italic font-serif text-lg font-semibold">{liveAge}</span> again.
              </p>
            </div>
          </div>

          <div className="absolute bottom-16 left-0 right-0 text-center">
            <button
              id="s4-ready-btn"
              onClick={() => setScreen(5)}
              className="text-amber-gold hover:text-amber-gold/80 font-sans text-sm tracking-widest uppercase pb-1 border-b border-amber-gold transition-colors duration-300"
            >
              I am ready
            </button>
          </div>

          {/* Add CSS keyframe for breath animation directly */}
          <style>{`
            @keyframes breath-animation {
              0% {
                transform: scale(1);
                opacity: 0.4;
              }
              50% {
                transform: scale(1.16);
                opacity: 1;
              }
              100% {
                transform: scale(1);
                opacity: 0.4;
              }
            }
          `}</style>
        </div>
      )}

      {/* SCREEN 5: THE MAGIC */}
      {screen === 5 && (
        <div 
          onClick={() => setScreen(6)}
          className="flex-1 flex flex-col justify-center items-center bg-[#000000] text-paper absolute inset-0 overflow-hidden cursor-pointer z-50"
        >
          {/* Radial amber glow */}
          <div 
            className="absolute rounded-full bg-amber-gold/25 pointer-events-none"
            style={{
              width: '32px',
              height: '32px',
              transform: `scale(${glowScale})`,
              transition: prefersReducedMotion ? 'none' : 'transform 2.6s cubic-bezier(0.25, 1, 0.5, 1), opacity 2.6s ease',
              filter: 'blur(16px)',
              opacity: glowScale > 1 ? 0.7 : 0.2
            }}
          ></div>

          {/* Message fades in at 2s, out by 4s */}
          <div className="z-10 text-center px-6">
            <p 
              className={`font-serif italic text-3xl md:text-4xl text-amber-soft transition-opacity duration-1000 ${
                s5MessageVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              Open your eyes.
            </p>
          </div>
        </div>
      )}

      {/* SCREEN 6: THE ARRIVAL */}
      {screen === 6 && (
        <div 
          className="flex-1 flex flex-col justify-between bg-cover absolute inset-0 p-8 z-50 text-ink"
          style={{
            background: 'linear-gradient(180deg, #F7F2E8, #F5DDC2 38%, #EBC198 72%, #DDA974)'
          }}
        >
          <div className="w-full text-center pt-12 space-y-1">
            <p className="font-mono text-[10px] tracking-widest text-muted/70 uppercase inline-flex items-center">
              Second Chance Activated <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-gold ml-1.5"></span>
            </p>
            <h1 className="font-serif text-[42px] leading-tight text-ink mt-6">
              Welcome Back.
            </h1>
            <p className="font-serif italic text-muted text-base mt-2 px-4 max-w-sm mx-auto">
              The first day of the rest of your returned life.
            </p>
          </div>

          <div className="w-full max-w-sm mx-auto bg-paper/30 backdrop-blur-sm border border-ink/5 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-ink/5">
              <span className="font-mono text-xs text-muted/80">RECLAIMED DATE</span>
              <span className="font-sans text-sm font-semibold text-ink">{getFormattedDate()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-ink/5">
              <span className="font-mono text-xs text-muted/80">BONUS DAYS EARNED</span>
              <span className="font-mono text-xs font-bold text-amber-gold">0</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-mono text-xs text-muted/80">RETURNED FROM AGE</span>
              <span className="font-serif italic text-sm font-bold text-ink">{returnAge}</span>
            </div>
          </div>

          <div className="w-full text-center pb-12 space-y-6">
            <p className="font-sans text-xs text-muted/80 italic">
              Tomorrow is already waiting.
            </p>
            <button
              id="s6-start-btn"
              onClick={handleStartSecondChance}
              className="px-8 py-3.5 bg-ink text-paper rounded-full font-sans text-sm tracking-widest uppercase font-medium hover:bg-ink/90 active:scale-95 transition-all duration-300 shadow-md"
            >
              Start my second chance
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
