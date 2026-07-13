import { Clock, Bell, Globe, Timer, Activity, Sparkles } from 'lucide-react';
import { TabType } from '../types';

interface TabBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  alarmsCount: number; // to optionally show a badge
}

interface TabItem {
  type: TabType;
  label: string;
  icon: any;
}

const TAB_ITEMS: TabItem[] = [
  { type: 'Clock', label: 'Clock', icon: Clock },
  { type: 'Alarm', label: 'Alarms', icon: Bell },
  { type: 'World Clock', label: 'World', icon: Globe },
  { type: 'Timer', label: 'Timer', icon: Timer },
  { type: 'Stopwatch', label: 'Split', icon: Activity },
  { type: 'Second Chance', label: 'Miracle', icon: Sparkles }
];

export default function TabBar({ activeTab, onChangeTab, alarmsCount }: TabBarProps) {
  return (
    <nav 
      id="tab-navigation-bar" 
      className="absolute bottom-0 left-0 right-0 border-t border-border-beige bg-paper/95 backdrop-blur-md z-40 pb-5 pt-3.5 px-2 flex justify-center"
    >
      <div className="w-full max-w-[500px] flex justify-between items-center px-4">
        {TAB_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.type;
          
          return (
            <button
              key={item.type}
              id={`tab-btn-${item.type.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onChangeTab(item.type)}
              className="flex flex-col items-center space-y-1 justify-center flex-1 py-1 focus:outline-none group relative transition-all duration-300"
            >
              <div 
                className={`p-1.5 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'text-amber-gold scale-110' 
                    : 'text-muted group-hover:text-ink hover:scale-105'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
              </div>
              <span 
                className={`text-[9px] font-sans tracking-wide transition-all duration-300 uppercase ${
                  isActive 
                    ? 'text-amber-gold font-semibold scale-105' 
                    : 'text-faint group-hover:text-muted'
                }`}
              >
                {item.label}
              </span>

              {/* Red dot badge for active alarms if needed */}
              {item.type === 'Alarm' && alarmsCount > 0 && (
                <span className="absolute top-1.5 right-1/2 translate-x-4 w-1.5 h-1.5 rounded-full bg-amber-gold"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
