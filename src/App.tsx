import { useState, useEffect, useRef } from 'react';
import { AppState, Alarm, TabType } from './types';
import Onboarding from './components/Onboarding';
import TabBar from './components/TabBar';
import ClockTab from './components/ClockTab';
import AlarmTab from './components/AlarmTab';
import WorldClockTab from './components/WorldClockTab';
import TimerTab from './components/TimerTab';
import StopwatchTab from './components/StopwatchTab';
import SecondChanceTab from './components/SecondChanceTab';
import { startAlarmChime, stopAlarmChime } from './utils/audio';
import { Bell, X } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [currentTab, setCurrentTab] = useState<TabType>('Clock');
  const [firingAlarm, setFiringAlarm] = useState<Alarm | null>(null);
  
  const lastFiredTimeRef = useRef<string>('');

  // 1. Load localStorage state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sc_state');
      if (saved) {
        const parsed = JSON.parse(saved) as AppState;
        setAppState(parsed);
        if (parsed.currentTab) {
          setCurrentTab(parsed.currentTab as TabType);
        }
      }
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
    }

    // Request notification permissions for background alarm notifications
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch((err) => {
        console.warn('Notification permission request declined:', err);
      });
    }
  }, []);

  // 2. Global Alarm Checker Loop (runs every second)
  useEffect(() => {
    if (!appState) return;

    const checkAlarms = () => {
      const now = new Date();
      const currentHM = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // If we already fired an alarm during this exact minute, skip to prevent multiple triggers
      if (lastFiredTimeRef.current === currentHM) return;

      const todayIdx = now.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday

      const matchedAlarm = appState.alarms.find(alarm => {
        if (!alarm.enabled) return false;
        if (alarm.time !== currentHM) return false;
        
        // Match repeat days or fire if it's a one-time alarm (empty list)
        return alarm.repeatDays.length === 0 || alarm.repeatDays.includes(todayIdx);
      });

      if (matchedAlarm) {
        lastFiredTimeRef.current = currentHM;
        setFiringAlarm(matchedAlarm);
        
        // Start playing the Web Audio repeating chime sequence
        startAlarmChime();

        // Push standard browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(`LTMClock Alarm: ${matchedAlarm.label}`, {
              body: 'Time to live the moment. Good morning.',
              icon: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23F7F2E8"/><text x="50%" y="60%" font-family="serif" font-size="70" fill="%23C89554" dominant-baseline="middle" text-anchor="middle">C</text></svg>`
            });
          } catch (err) {
            console.warn('Failed to push system notification:', err);
          }
        }
      }
    };

    const intervalId = setInterval(checkAlarms, 1000);
    return () => clearInterval(intervalId);
  }, [appState]);

  // 3. Onboarding complete handler
  const handleOnboardingComplete = (data: { returnAge: number; birthYear: number; onboardDate: number }) => {
    const defaultState: AppState = {
      returnAge: data.returnAge,
      birthYear: data.birthYear,
      onboardDate: data.onboardDate,
      alarms: [],
      currentTab: 'Clock'
    };
    try {
      localStorage.setItem('sc_state', JSON.stringify(defaultState));
    } catch (e) {}
    setAppState(defaultState);
    setCurrentTab('Clock');
  };

  // 4. Tab navigation handler
  const handleChangeTab = (tab: TabType) => {
    setCurrentTab(tab);
    if (appState) {
      const updated = { ...appState, currentTab: tab };
      try {
        localStorage.setItem('sc_state', JSON.stringify(updated));
      } catch (e) {}
      setAppState(updated);
    }
  };

  // 5. Alarm creation, toggle, and delete controllers
  const handleAddAlarm = (newAlarmData: Omit<Alarm, 'id'>) => {
    if (!appState) return;
    const newAlarm: Alarm = {
      ...newAlarmData,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9)
    };
    const updatedAlarms = [...appState.alarms, newAlarm];
    const updatedState = { ...appState, alarms: updatedAlarms };
    try {
      localStorage.setItem('sc_state', JSON.stringify(updatedState));
    } catch (e) {}
    setAppState(updatedState);
  };

  const handleToggleAlarm = (id: string, enabled: boolean) => {
    if (!appState) return;
    const updatedAlarms = appState.alarms.map(a => 
      a.id === id ? { ...a, enabled } : a
    );
    const updatedState = { ...appState, alarms: updatedAlarms };
    try {
      localStorage.setItem('sc_state', JSON.stringify(updatedState));
    } catch (e) {}
    setAppState(updatedState);
  };

  const handleMinusAlarm = (id: string) => {
    if (!appState) return;
    const updatedAlarms = appState.alarms.filter(a => a.id !== id);
    const updatedState = { ...appState, alarms: updatedAlarms };
    try {
      localStorage.setItem('sc_state', JSON.stringify(updatedState));
    } catch (e) {}
    setAppState(updatedState);
  };

  // 6. Dismiss alarm event
  const handleDismissAlarm = () => {
    if (firingAlarm) {
      stopAlarmChime();

      // If one-time alarm, auto-disable it so it does not toggle on again tomorrow
      if (firingAlarm.repeatDays.length === 0 && appState) {
        const updatedAlarms = appState.alarms.map(a => 
          a.id === firingAlarm.id ? { ...a, enabled: false } : a
        );
        const updatedState = { ...appState, alarms: updatedAlarms };
        try {
          localStorage.setItem('sc_state', JSON.stringify(updatedState));
        } catch (e) {}
        setAppState(updatedState);
      }

      setFiringAlarm(null);
    }
  };

  // 7. Reset all onboarding progress
  const handleResetOnboarding = () => {
    try {
      localStorage.removeItem('sc_state');
      localStorage.removeItem('sc_last_reflection_date');
    } catch (e) {}
    setAppState(null);
    setCurrentTab('Clock');
  };

  // Active Enabled alarms helper for TabBar badge
  const activeAlarmsCount = appState ? appState.alarms.filter(a => a.enabled).length : 0;

  // Render the current view
  const renderActiveTab = () => {
    if (!appState) return null;
    switch (currentTab) {
      case 'Clock':
        return <ClockTab onboardDate={appState.onboardDate} />;
      case 'Alarm':
        return (
          <AlarmTab 
            alarms={appState.alarms}
            onAddAlarm={handleAddAlarm}
            onToggleAlarm={handleToggleAlarm}
            onDeleteAlarm={handleMinusAlarm}
            onboardDate={appState.onboardDate}
          />
        );
      case 'World Clock':
        return <WorldClockTab />;
      case 'Timer':
        return <TimerTab />;
      case 'Stopwatch':
        return <StopwatchTab />;
      case 'Second Chance':
        return (
          <SecondChanceTab 
            returnAge={appState.returnAge}
            birthYear={appState.birthYear}
            onboardDate={appState.onboardDate}
            onResetOnboarding={handleResetOnboarding}
          />
        );
      default:
        return <ClockTab onboardDate={appState.onboardDate} />;
    }
  };

  // Helper date/time display for active alarm fire overlay
  const getOverlayTime = () => {
    const d = new Date();
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const bonusDaysCount = appState ? Math.floor((Date.now() - appState.onboardDate) / 86400000) : 0;

  return (
    <div id="ltmclock-app-root" className="min-h-screen w-full flex items-center justify-center bg-[#E5DCC9] p-0 sm:p-6 text-ink selection:bg-amber-soft selection:text-ink overflow-hidden font-sans">
      
      <div className="w-full h-full min-h-screen sm:min-h-0 sm:h-[720px] sm:max-w-[450px] bg-paper sm:shadow-[0_50px_100px_-20px_rgba(43,36,24,0.3)] sm:rounded-xl overflow-hidden relative flex flex-col justify-between border-0 sm:border border-border-beige/50">
        
        {!appState ? (
          <Onboarding onComplete={handleOnboardingComplete} />
        ) : (
          <>
            {/* Scrollable View Area */}
            <main className="flex-1 flex flex-col min-h-0 overflow-y-auto pb-[90px]">
              {renderActiveTab()}
            </main>

            {/* Persistent Tab Bar */}
            <TabBar 
              activeTab={currentTab}
              onChangeTab={handleChangeTab}
              alarmsCount={activeAlarmsCount}
            />
          </>
        )}

        {/* FULL-SCREEN ALARM FIRE OVERLAY */}
        {firingAlarm && (
          <div 
            id="alarm-fire-overlay" 
            className="absolute inset-0 bg-void text-paper z-50 flex flex-col justify-between p-8 select-none"
          >
            {/* Header */}
            <div className="text-center pt-12 space-y-2">
              <div className="w-16 h-16 rounded-full border border-amber-gold/30 flex items-center justify-center text-amber-gold mx-auto mb-4 animate-bounce">
                <Bell size={28} />
              </div>
              <p className="font-mono text-[10px] tracking-widest text-amber-gold uppercase">
                ALARM TRIGGERED
              </p>
            </div>

            {/* Time & Label display */}
            <div className="text-center space-y-6">
              <h2 className="font-serif text-[72px] font-extralight tracking-tight text-paper select-all leading-none">
                {getOverlayTime()}
              </h2>
              
              <div className="space-y-1.5">
                <p className="font-sans text-sm font-semibold tracking-wide text-paper/80 uppercase">
                  {firingAlarm.label}
                </p>
                
                <div className="inline-flex flex-col space-y-1 pt-2">
                  <p className="font-serif italic text-2xl text-amber-soft">"Good morning."</p>
                  <p className="font-serif italic text-base text-faint">"You earned another day."</p>
                </div>
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="text-center pb-16 space-y-6">
              <p className="font-mono text-[10px] text-faint tracking-widest uppercase">
                Bonus Day #{bonusDaysCount}
              </p>
              
              <button
                id="alarm-dismiss-btn"
                onClick={handleDismissAlarm}
                className="px-12 py-4 bg-paper text-void rounded-full font-sans text-xs tracking-widest uppercase font-medium hover:bg-paper/90 active:scale-95 transition-all duration-300 shadow-xl"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
