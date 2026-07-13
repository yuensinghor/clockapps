import { useState, useEffect, useRef } from 'react';

interface ClockTabProps {
  onboardDate: number;
}

const MESSAGES = [
  "Future You Is Glad You Came Back",
  "Today Is Another Gift",
  "You Already Received The Miracle",
  "Enjoy Your Reclaimed Day",
  "Tomorrow Has Already Been Granted",
  "This Day Was Given Back To You",
  "Breathe. You Are Here Again."
];

export default function ClockTab({ onboardDate }: ClockTabProps) {
  const [time, setTime] = useState(new Date());
  const [msgIndex, setMsgIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // Time & Seconds Bar Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 100); // 100ms updates keep the progress bar extremely fluid
    return () => clearInterval(interval);
  }, []);

  // Message Rotation Loop: 6s
  useEffect(() => {
    if (prefersReducedMotion) {
      const interval = setInterval(() => {
        setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
      }, 6000);
      return () => clearInterval(interval);
    }

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
        setFade(true);
      }, 400); // fade out duration
    }, 6000);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  // Calculations
  const hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds();
  const ms = time.getMilliseconds();
  
  // Am/Pm format or standard HH representation
  const formattedHours = (hours % 12 || 12).toString();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  // Progress of the current minute (seconds + ms)
  const minuteProgress = ((seconds + ms / 1000) / 60) * 100;

  // 12 moment dots (light up progressively every 5 seconds)
  // At 0-4s: 0 lit. At 5s: 1 lit... At 55s: 11 lit. At 60s resets.
  const activeDots = Math.floor(seconds / 5);

  // Calculate Bonus/Second Chance days
  const bonusDays = Math.floor((Date.now() - onboardDate) / 86400000);

  // Formatted uppercase date
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(time).toUpperCase();

  return (
    <div id="clock-tab-container" className="flex-1 flex flex-col justify-between py-10 px-6 max-w-lg mx-auto w-full select-none">
      
      {/* Top Header Section */}
      <div className="text-center mt-4">
        <p className="font-mono text-[10px] tracking-widest text-faint uppercase">
          SECOND CHANCE DAY
        </p>
        <p className="font-serif text-3xl text-amber-gold mt-1 font-medium">
          #{bonusDays}
        </p>
      </div>

      {/* Large Digital Clock display */}
      <div className="flex-1 flex flex-col justify-center items-center my-6 space-y-6">
        <div className="flex items-baseline justify-center">
          {/* Hour */}
          <span className="font-serif font-light text-[80px] sm:text-[110px] md:text-[130px] leading-none text-ink">
            {formattedHours}
          </span>
          
          {/* Pulsing Colon (4s opacity cycle) */}
          <span 
            className="font-serif font-light text-[70px] sm:text-[100px] md:text-[125px] leading-none text-amber-gold mx-2"
            style={{
              animation: prefersReducedMotion ? 'none' : 'colon-pulse 4s ease-in-out infinite'
            }}
          >
            :
          </span>

          {/* Minute */}
          <span className="font-serif font-light text-[80px] sm:text-[110px] md:text-[130px] leading-none text-ink">
            {minutes}
          </span>

          {/* Seconds & AM/PM stacked */}
          <div className="flex flex-col items-start ml-2 sm:ml-4">
            <span className="font-mono text-xs text-muted font-bold tracking-wider leading-none mb-1">
              {ampm}
            </span>
            <span className="font-sans text-[20px] sm:text-[24px] font-extralight text-faint leading-none">
              {seconds.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Thin elegant amber divider line */}
        <div className="w-16 h-[1px] bg-amber-gold/40"></div>

        {/* Date Display */}
        <div className="text-center">
          <p className="font-sans text-xs tracking-[0.2em] font-medium text-muted uppercase">
            {formattedDate}
          </p>
        </div>
      </div>

      {/* Middle Interactive Zone: Moment dots and Motto */}
      <div className="space-y-8 mb-8 text-center">
        {/* 12 Moment Dots */}
        <div className="flex justify-center items-center space-x-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              id={`moment-dot-${i}`}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                i < activeDots 
                  ? 'bg-amber-gold scale-110 shadow-[0_0_6px_rgba(200,149,84,0.5)]' 
                  : 'bg-border-beige'
              }`}
            ></span>
          ))}
        </div>

        {/* Live the moments breathing slogan */}
        <div className="h-6 flex items-center justify-center">
          <p 
            className="font-serif italic text-base text-amber-gold/90 font-light"
            style={{
              animation: prefersReducedMotion ? 'none' : 'motto-breath 6s ease-in-out infinite'
            }}
          >
            Live the moments
          </p>
        </div>

        {/* Rotating message banner with fade */}
        <div className="h-10 flex items-center justify-center">
          <p 
            id="ambient-message-text"
            className={`font-serif italic text-base text-muted max-w-xs transition-opacity duration-400 ${
              fade ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {MESSAGES[msgIndex]}
          </p>
        </div>
      </div>

      {/* Floating 1px progress bar above the tab bar */}
      <div className="absolute left-0 right-0 bottom-[64px] h-[1.5px] bg-border-beige/20 z-10">
        <div 
          className="h-full bg-amber-gold/70 transition-all duration-100 ease-linear"
          style={{ width: `${minuteProgress}%` }}
        ></div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes colon-pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        @keyframes motto-breath {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>

    </div>
  );
}
