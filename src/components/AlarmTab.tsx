import { useState, useEffect } from 'react';
import { Alarm } from '../types';
import { Plus, X, Moon, Clock } from 'lucide-react';

interface AlarmTabProps {
  alarms: Alarm[];
  onAddAlarm: (alarm: Omit<Alarm, 'id'>) => void;
  onToggleAlarm: (id: string, enabled: boolean) => void;
  onDeleteAlarm: (id: string) => void;
  onboardDate: number;
}

const REFLECTIONS = [
  "Rest now. You did enough today. Tomorrow is another complete gift.",
  "Close your eyes knowing that future you is already proud of your steps.",
  "Let the worries of today dissolve into the quiet evening. Breathe deep.",
  "The stars are out, and your second chance is safe. Sleep well.",
  "You don't need to earn tomorrow. It is already granted to you.",
  "Release tonight. The miracle continues when you wake up.",
  "Your life is not a race. Sleep knowing you are right where you need to be."
];

const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AlarmTab({ alarms, onAddAlarm, onToggleAlarm, onDeleteAlarm, onboardDate }: AlarmTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionMsg, setReflectionMsg] = useState('');

  // Form State
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [label, setLabel] = useState('');
  const [repeatDays, setRepeatDays] = useState<number[]>([]); // empty = one-time

  // Bedtime Reflection Check
  useEffect(() => {
    const now = new Date();
    if (now.getHours() >= 20) { // After 8 PM
      const todayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
      const lastReflectionDate = localStorage.getItem('sc_last_reflection_date');
      
      if (lastReflectionDate !== todayStr) {
        // Choose random message
        const randomMsg = REFLECTIONS[Math.floor(Math.random() * REFLECTIONS.length)];
        setReflectionMsg(randomMsg);
        setShowReflection(true);
        // Save today's date to prevent double popups
        localStorage.setItem('sc_last_reflection_date', todayStr);
      }
    }
  }, []);

  const handleSaveAlarm = () => {
    const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onAddAlarm({
      time: formattedTime,
      label: label.trim() || 'Second Chance Morning',
      repeatDays: [...repeatDays].sort(),
      enabled: true
    });
    // Reset Form
    setHour(7);
    setMinute(0);
    setLabel('');
    setRepeatDays([]);
    setShowAddModal(false);
  };

  const toggleDaySelection = (dayIdx: number) => {
    setRepeatDays(prev => 
      prev.includes(dayIdx) ? prev.filter(d => d !== dayIdx) : [...prev, dayIdx]
    );
  };

  const incrementHour = () => setHour(h => (h + 1) % 24);
  const decrementHour = () => setHour(h => (h - 1 + 24) % 24);
  const incrementMinute = () => setMinute(m => (m + 5) % 60); // 5-min increments are easier on buttons
  const decrementMinute = () => setMinute(m => (m - 5 + 60) % 60);

  return (
    <div id="alarm-tab-container" className="flex-1 flex flex-col max-w-lg mx-auto w-full p-6 select-none relative">
      
      {/* Heading section */}
      <div className="flex justify-between items-center mb-8 mt-4">
        <div>
          <h1 className="font-serif text-3xl font-light text-ink">Alarms</h1>
          <p className="font-sans text-xs text-muted mt-1">Wake up gently to your reclaimed mornings</p>
        </div>
        <button
          id="add-alarm-btn"
          onClick={() => setShowAddModal(true)}
          className="w-11 h-11 rounded-full bg-amber-gold hover:bg-amber-gold/90 text-paper flex items-center justify-center shadow-sm active:scale-95 transition-all duration-300"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Alarms List */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-20">
        {alarms.length === 0 ? (
          <div className="h-64 flex flex-col justify-center items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full border border-border-beige flex items-center justify-center text-faint">
              <Clock size={20} />
            </div>
            <p className="font-serif italic text-base text-muted">
              No alarms set. Your mornings are free.
            </p>
          </div>
        ) : (
          alarms.map((alarm) => {
            const [alarmH, alarmM] = alarm.time.split(':');
            const hNum = parseInt(alarmH, 10);
            const displayH = hNum % 12 || 12;
            const ampm = hNum >= 12 ? 'PM' : 'AM';
            
            return (
              <div
                key={alarm.id}
                id={`alarm-item-${alarm.id}`}
                className={`bg-paper border rounded-2xl p-5 flex items-center justify-between transition-all duration-300 ${
                  alarm.enabled ? 'border-amber-gold/40 shadow-sm' : 'border-border-beige opacity-60'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-baseline space-x-1.5">
                    <span className="font-serif text-3xl text-ink font-light">
                      {displayH}:{alarmM}
                    </span>
                    <span className="font-sans text-xs text-muted uppercase font-light">
                      {ampm}
                    </span>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <span className="font-sans text-xs text-muted font-medium">
                      {alarm.label}
                    </span>
                    <span className="font-mono text-[9px] text-faint tracking-wider uppercase">
                      {alarm.repeatDays.length === 0 
                        ? 'One-time' 
                        : alarm.repeatDays.length === 7 
                          ? 'Every Day'
                          : alarm.repeatDays.map(d => DAYS_SHORT[d]).join(' · ')
                      }
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Custom Toggle Switch */}
                  <button
                    id={`alarm-toggle-${alarm.id}`}
                    onClick={() => onToggleAlarm(alarm.id, !alarm.enabled)}
                    className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${
                      alarm.enabled ? 'bg-amber-gold' : 'bg-border-beige'
                    }`}
                  >
                    <div 
                      className={`w-5 h-5 rounded-full bg-paper shadow-sm transition-transform duration-300 ${
                        alarm.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    ></div>
                  </button>

                  {/* Delete button */}
                  <button
                    id={`alarm-delete-${alarm.id}`}
                    onClick={() => onDeleteAlarm(alarm.id)}
                    className="w-8 h-8 rounded-full border border-border-beige hover:border-amber-gold/40 hover:text-amber-gold text-muted/60 flex items-center justify-center transition-colors duration-300"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE BOTTOM SHEET MODAL */}
      {showAddModal && (
        <div className="absolute inset-0 bg-void/50 backdrop-blur-sm z-50 flex flex-col justify-end">
          {/* Dismiss tap area */}
          <div className="flex-1" onClick={() => setShowAddModal(false)}></div>
          
          {/* Sheet */}
          <div className="bg-paper border-t border-border-beige rounded-t-3xl p-6 space-y-6 max-h-[90%] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-border-beige pb-3">
              <h3 className="font-serif text-lg text-ink">New Alarm</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-muted hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            {/* Time Picker with +/- buttons */}
            <div className="flex justify-center items-center space-x-6 py-4">
              {/* Hour Column */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={incrementHour}
                  className="w-10 h-10 border border-border-beige hover:border-amber-gold rounded-full flex items-center justify-center text-muted text-lg active:bg-border-beige/20"
                >
                  +
                </button>
                <span className="font-serif text-5xl py-2 text-ink select-none w-16 text-center">
                  {hour.toString().padStart(2, '0')}
                </span>
                <button 
                  onClick={decrementHour}
                  className="w-10 h-10 border border-border-beige hover:border-amber-gold rounded-full flex items-center justify-center text-muted text-lg active:bg-border-beige/20"
                >
                  -
                </button>
                <span className="font-mono text-[9px] text-faint tracking-widest uppercase mt-1">HOUR</span>
              </div>

              {/* Separator */}
              <span className="font-serif text-4xl text-amber-gold leading-none pb-4">:</span>

              {/* Minute Column */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={incrementMinute}
                  className="w-10 h-10 border border-border-beige hover:border-amber-gold rounded-full flex items-center justify-center text-muted text-lg active:bg-border-beige/20"
                >
                  +
                </button>
                <span className="font-serif text-5xl py-2 text-ink select-none w-16 text-center">
                  {minute.toString().padStart(2, '0')}
                </span>
                <button 
                  onClick={decrementMinute}
                  className="w-10 h-10 border border-border-beige hover:border-amber-gold rounded-full flex items-center justify-center text-muted text-lg active:bg-border-beige/20"
                >
                  -
                </button>
                <span className="font-mono text-[9px] text-faint tracking-widest uppercase mt-1">MIN</span>
              </div>
            </div>

            {/* Label Input */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] tracking-widest text-faint uppercase block">LABEL</label>
              <input
                id="alarm-label-input"
                type="text"
                maxLength={40}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full border border-border-beige rounded-xl px-4 py-3 bg-paper text-ink font-sans text-sm focus:outline-none focus:border-amber-gold focus:ring-1 focus:ring-amber-gold"
                placeholder="Good morning..."
              />
            </div>

            {/* Repeat Days Selection */}
            <div className="space-y-3">
              <label className="font-mono text-[10px] tracking-widest text-faint uppercase block">REPEAT DAYS</label>
              <div className="flex justify-between items-center">
                {DAYS_SHORT.map((day, idx) => {
                  const isSelected = repeatDays.includes(idx);
                  return (
                    <button
                      key={idx}
                      id={`day-select-${idx}`}
                      onClick={() => toggleDaySelection(idx)}
                      className={`w-9 h-9 rounded-full font-mono text-[11px] flex items-center justify-center transition-all duration-300 ${
                        isSelected 
                          ? 'bg-amber-gold text-paper shadow-[0_0_8px_rgba(200,149,84,0.4)]' 
                          : 'border border-border-beige text-muted hover:border-amber-gold/50'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                id="alarm-cancel-btn"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 border border-border-beige rounded-full font-sans text-xs tracking-wider uppercase text-muted hover:bg-border-beige/10"
              >
                Cancel
              </button>
              <button
                id="alarm-save-btn"
                onClick={handleSaveAlarm}
                className="flex-1 py-3 bg-ink text-paper rounded-full font-sans text-xs tracking-wider uppercase font-medium hover:bg-ink/90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BEDTIME REFLECTION POPUP */}
      {showReflection && (
        <div className="absolute inset-0 bg-void/90 z-50 flex flex-col justify-center items-center p-8 text-paper">
          <div className="max-w-xs text-center space-y-6">
            <div className="w-12 h-12 rounded-full border border-amber-gold/30 flex items-center justify-center text-amber-gold mx-auto mb-4 animate-pulse">
              <Moon size={22} />
            </div>
            
            <h3 className="font-mono text-[10px] tracking-widest text-amber-gold uppercase">
              Message From Future You
            </h3>
            
            <p className="font-serif italic text-lg leading-relaxed text-paper/90 px-2">
              "{reflectionMsg}"
            </p>

            <div className="pt-6 flex flex-col items-center space-y-3">
              <button
                id="reflection-gn-btn"
                onClick={() => setShowReflection(false)}
                className="px-8 py-2.5 bg-paper text-void rounded-full font-sans text-xs tracking-wider uppercase font-medium hover:bg-paper/90 transition-all duration-300"
              >
                Good Night
              </button>
              <button
                id="reflection-skip-btn"
                onClick={() => setShowReflection(false)}
                className="text-faint hover:text-paper font-sans text-[11px] tracking-widest uppercase transition-colors duration-300"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
