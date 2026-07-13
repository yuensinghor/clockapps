export interface Alarm {
  id: string;
  time: string; // "HH:MM"
  label: string;
  repeatDays: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  enabled: boolean;
}

export interface AppState {
  returnAge: number;
  birthYear: number;
  onboardDate: number; // Date.now() timestamp
  alarms: Alarm[];
  currentTab: string;
}

export type TabType = 'Clock' | 'Alarm' | 'World Clock' | 'Timer' | 'Stopwatch' | 'Second Chance';
