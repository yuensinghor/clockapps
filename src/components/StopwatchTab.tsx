import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';

interface LapRecord {
  lapNumber: number;
  time: number; // in ms
}

export default function StopwatchTab() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // in ms
  const [laps, setLaps] = useState<LapRecord[]>([]);

  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setElapsed(accumulatedTimeRef.current + (Date.now() - startTimeRef.current));
      }, 10); // Update every 10ms for centisecond precision
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      accumulatedTimeRef.current = elapsed;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsed(0);
    accumulatedTimeRef.current = 0;
    setLaps([]);
  };

  const handleLap = () => {
    const nextLapNum = laps.length + 1;
    setLaps((prev) => [
      { lapNumber: nextLapNum, time: elapsed },
      ...prev
    ]);
  };

  // Time Formatter: MM:SS.CC
  const formatTime = (timeMs: number) => {
    const totalCentis = Math.floor(timeMs / 10);
    const cc = (totalCentis % 100).toString().padStart(2, '0');
    
    const totalSecs = Math.floor(timeMs / 1000);
    const ss = (totalSecs % 60).toString().padStart(2, '0');
    
    const mm = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    
    return {
      minutes: mm,
      seconds: ss,
      centiseconds: cc
    };
  };

  const { minutes, seconds, centiseconds } = formatTime(elapsed);

  return (
    <div id="stopwatch-tab-container" className="flex-1 flex flex-col max-w-lg mx-auto w-full p-6 select-none justify-between">
      
      {/* Header */}
      <div className="mt-4">
        <h1 className="font-serif text-3xl font-light text-ink">Stopwatch</h1>
        <p className="font-sans text-xs text-muted mt-1">Carve precision out of passing moments</p>
      </div>

      {/* Stopwatch Large Display */}
      <div className="flex-1 flex flex-col justify-center items-center my-6 space-y-6">
        <div className="flex items-baseline justify-center select-all">
          <span className="font-serif text-[56px] sm:text-[76px] md:text-[84px] leading-none text-ink font-light tracking-tight">
            {minutes}:{seconds}
          </span>
          <span className="font-sans text-xl sm:text-2xl text-amber-gold font-light ml-1 w-10">
            .{centiseconds}
          </span>
        </div>

        {/* Dynamic State Badge */}
        {elapsed > 0 && (
          <div className="flex items-center space-x-1.5 bg-border-beige/20 px-3 py-1 rounded-full">
            <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-amber-gold animate-pulse' : 'bg-muted'}`}></span>
            <span className="font-mono text-[9px] text-muted tracking-widest uppercase">
              {isRunning ? 'Running' : 'Stopped'}
            </span>
          </div>
        )}
      </div>

      {/* Laps List (rendered in reverse order) */}
      <div className="flex-1 min-h-[140px] max-h-[220px] overflow-y-auto border border-border-beige/40 rounded-2xl bg-paper/20 p-4 space-y-2 mb-6">
        {laps.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <p className="font-sans text-xs text-faint italic">No lap splits captured.</p>
          </div>
        ) : (
          <div className="space-y-2 divide-y divide-border-beige/25">
            {laps.map((lap) => {
              const lf = formatTime(lap.time);
              return (
                <div
                  key={lap.lapNumber}
                  id={`lap-item-${lap.lapNumber}`}
                  className="flex justify-between items-center py-2 font-mono text-xs text-muted first:text-ink first:font-medium"
                >
                  <span className="tracking-wide">LAP {lap.lapNumber.toString().padStart(2, '0')}</span>
                  <span className="tabular-nums font-semibold">
                    {lf.minutes}:{lf.seconds}.{lf.centiseconds}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Controls & Action buttons */}
      <div className="pb-24 flex justify-center w-full">
        <div className="flex items-center space-x-4 w-full max-w-sm">
          
          {/* LEFT BUTTON: LAP (when running) or RESET (when stopped) */}
          {elapsed > 0 && (
            isRunning ? (
              <button
                id="stopwatch-lap-btn"
                onClick={handleLap}
                className="flex-1 py-4 border border-border-beige hover:border-amber-gold/40 text-muted rounded-full font-sans text-xs tracking-wider uppercase transition-colors duration-300 flex items-center justify-center space-x-1.5 bg-paper"
              >
                <Flag size={14} />
                <span>Split Lap</span>
              </button>
            ) : (
              <button
                id="stopwatch-reset-btn"
                onClick={handleReset}
                className="flex-1 py-4 border border-border-beige hover:border-amber-gold/40 text-muted rounded-full font-sans text-xs tracking-wider uppercase transition-colors duration-300 flex items-center justify-center space-x-1.5 bg-paper"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )
          )}

          {/* RIGHT BUTTON: START (amber), STOP (dark void), or RESUME (amber) */}
          {elapsed === 0 ? (
            <button
              id="stopwatch-start-btn"
              onClick={handleStartStop}
              className="flex-1 py-4 bg-amber-gold hover:bg-amber-gold/90 text-paper rounded-full font-sans text-xs tracking-wider uppercase font-medium transition-colors duration-300 flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <Play size={14} fill="currentColor" />
              <span>Start</span>
            </button>
          ) : isRunning ? (
            <button
              id="stopwatch-stop-btn"
              onClick={handleStartStop}
              className="flex-1 py-4 bg-void hover:bg-void/90 text-paper rounded-full font-sans text-xs tracking-wider uppercase font-medium transition-colors duration-300 flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <Pause size={14} fill="currentColor" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              id="stopwatch-resume-btn"
              onClick={handleStartStop}
              className="flex-1 py-4 bg-amber-gold hover:bg-amber-gold/90 text-paper rounded-full font-sans text-xs tracking-wider uppercase font-medium transition-colors duration-300 flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <Play size={14} fill="currentColor" />
              <span>Resume</span>
            </button>
          )}

        </div>
      </div>

    </div>
  );
}
