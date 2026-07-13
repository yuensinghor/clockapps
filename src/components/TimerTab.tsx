import { useState, useEffect, useRef } from 'react';
import { playTimerDoneChime } from '../utils/audio';
import { Play, Pause, RotateCcw, AlertCircle } from 'lucide-react';

export default function TimerTab() {
  const [isSetting, setIsSetting] = useState(true);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);

  // Active state countdown
  const [timeLeft, setTimeLeft] = useState(300); // in seconds
  const [isRunning, setIsRunning] = useState(false);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setIsSetting(true);
            playTimerDoneChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleStart = () => {
    const totalSecs = minutes * 60 + seconds;
    if (totalSecs <= 0) return; // Prevent empty timers
    setTimeLeft(totalSecs);
    setIsSetting(false);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsSetting(true);
    setMinutes(5);
    setSeconds(0);
  };

  // Helper increments
  const adjustMin = (amt: number) => {
    setMinutes((m) => Math.max(0, Math.min(99, m + amt)));
  };

  const adjustSec = (amt: number) => {
    setSeconds((s) => {
      let next = s + amt;
      if (next < 0) next = 59;
      if (next > 59) next = 0;
      return next;
    });
  };

  // Format remaining time to MM:SS
  const formatTimeLeft = () => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div id="timer-tab-container" className="flex-1 flex flex-col max-w-lg mx-auto w-full p-6 select-none justify-between">
      
      {/* Header */}
      <div className="mt-4">
        <h1 className="font-serif text-3xl font-light text-ink">Timer</h1>
        <p className="font-sans text-xs text-muted mt-1">Savor a quiet interval of deep focus</p>
      </div>

      {/* Main Display Area */}
      <div className="flex-1 flex flex-col justify-center items-center my-8">
        {isSetting ? (
          /* SETTING MODE */
          <div className="flex items-center space-x-6 py-4">
            {/* Minutes Adjuster */}
            <div className="flex flex-col items-center">
              <button 
                onClick={() => adjustMin(1)}
                className="w-12 h-12 border border-border-beige hover:border-amber-gold rounded-full flex items-center justify-center text-muted text-xl active:bg-border-beige/20"
              >
                +
              </button>
              <span className="font-serif text-[64px] sm:text-[80px] leading-tight py-2 text-ink select-none w-20 text-center">
                {minutes.toString().padStart(2, '0')}
              </span>
              <button 
                onClick={() => adjustMin(-1)}
                className="w-12 h-12 border border-border-beige hover:border-amber-gold rounded-full flex items-center justify-center text-muted text-xl active:bg-border-beige/20"
              >
                -
              </button>
              <span className="font-mono text-[9px] text-faint tracking-widest uppercase mt-2">MINUTES</span>
            </div>

            {/* Separator */}
            <span className="font-serif text-5xl text-amber-gold leading-none pb-8">:</span>

            {/* Seconds Adjuster */}
            <div className="flex flex-col items-center">
              <button 
                onClick={() => adjustSec(5)}
                className="w-12 h-12 border border-border-beige hover:border-amber-gold rounded-full flex items-center justify-center text-muted text-xl active:bg-border-beige/20"
              >
                +
              </button>
              <span className="font-serif text-[64px] sm:text-[80px] leading-tight py-2 text-ink select-none w-20 text-center">
                {seconds.toString().padStart(2, '0')}
              </span>
              <button 
                onClick={() => adjustSec(-5)}
                className="w-12 h-12 border border-border-beige hover:border-amber-gold rounded-full flex items-center justify-center text-muted text-xl active:bg-border-beige/20"
              >
                -
              </button>
              <span className="font-mono text-[9px] text-faint tracking-widest uppercase mt-2">SECONDS</span>
            </div>
          </div>
        ) : (
          /* RUNNING/PAUSED MODE */
          <div className="flex flex-col items-center space-y-4">
            <span className="font-serif text-[80px] sm:text-[100px] leading-none text-ink select-none tracking-tight font-light">
              {formatTimeLeft()}
            </span>
            <div className="flex items-center space-x-1.5 bg-amber-gold/5 px-3 py-1.5 rounded-full border border-amber-gold/10">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-gold animate-pulse"></span>
              <span className="font-mono text-[10px] text-amber-gold tracking-widest uppercase">
                {isRunning ? 'Interval active' : 'Interval paused'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Buttons / Controls Area */}
      <div className="pb-24 flex justify-center w-full">
        {isSetting ? (
          <button
            id="timer-start-btn"
            onClick={handleStart}
            disabled={minutes === 0 && seconds === 0}
            className={`w-full max-w-sm py-4 bg-ink text-paper rounded-full font-sans text-sm tracking-widest uppercase font-medium transition-all duration-300 shadow-sm flex items-center justify-center space-x-2 ${
              minutes === 0 && seconds === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-ink/90 active:scale-95'
            }`}
          >
            <Play size={16} fill="currentColor" />
            <span>Begin Interval</span>
          </button>
        ) : (
          <div className="flex items-center space-x-4 w-full max-w-sm">
            {/* Reset Button */}
            <button
              id="timer-reset-btn"
              onClick={handleReset}
              className="flex-1 py-4 border border-border-beige hover:border-amber-gold/40 text-muted rounded-full font-sans text-xs tracking-wider uppercase transition-colors duration-300 flex items-center justify-center space-x-1.5 bg-paper"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>

            {/* Play/Pause Button */}
            {isRunning ? (
              <button
                id="timer-pause-btn"
                onClick={handlePause}
                className="flex-1 py-4 bg-[#8C3E32] hover:bg-[#743329] text-paper rounded-full font-sans text-xs tracking-wider uppercase font-medium transition-colors duration-300 flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <Pause size={14} fill="currentColor" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                id="timer-resume-btn"
                onClick={handleResume}
                className="flex-1 py-4 bg-amber-gold hover:bg-amber-gold/90 text-paper rounded-full font-sans text-xs tracking-wider uppercase font-medium transition-colors duration-300 flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <Play size={14} fill="currentColor" />
                <span>Resume</span>
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
