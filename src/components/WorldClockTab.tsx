import { useState, useEffect } from 'react';

interface CityConfig {
  name: string;
  zone: string;
  fallbackAbbrev: string;
}

const CITIES: CityConfig[] = [
  { name: 'New York', zone: 'America/New_York', fallbackAbbrev: 'EST' },
  { name: 'London', zone: 'Europe/London', fallbackAbbrev: 'GMT' },
  { name: 'Dubai', zone: 'Asia/Dubai', fallbackAbbrev: 'GST' },
  { name: 'Tokyo', zone: 'Asia/Tokyo', fallbackAbbrev: 'JST' },
  { name: 'Sydney', zone: 'Australia/Sydney', fallbackAbbrev: 'AEST' },
  { name: 'Los Angeles', zone: 'America/Los_Angeles', fallbackAbbrev: 'PST' }
];

export default function WorldClockTab() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Auto-refreshes every 10 seconds as requested
    const interval = setInterval(() => {
      setTime(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const getCityTime = (city: CityConfig) => {
    try {
      // Get formatted time e.g. "9:14 AM"
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: city.zone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      const formattedParts = formatter.formatToParts(time);
      
      let hour = '';
      let minute = '';
      let dayPeriod = '';

      formattedParts.forEach(part => {
        if (part.type === 'hour') hour = part.value;
        if (part.type === 'minute') minute = part.value;
        if (part.type === 'dayPeriod') dayPeriod = part.value; // "AM" or "PM"
      });

      // Get timezone abbreviation
      const abbrevFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: city.zone,
        timeZoneName: 'short'
      });
      const abbrevParts = abbrevFormatter.formatToParts(time);
      const tzPart = abbrevParts.find(p => p.type === 'timeZoneName');
      const abbrev = tzPart ? tzPart.value : city.fallbackAbbrev;

      return {
        timeString: `${hour}:${minute}`,
        ampm: dayPeriod,
        abbrev
      };
    } catch (e) {
      // Soft fallback if IANA zones fail in some older browser environments
      return {
        timeString: "12:00",
        ampm: "AM",
        abbrev: city.fallbackAbbrev
      };
    }
  };

  return (
    <div id="world-clock-tab-container" className="flex-1 flex flex-col max-w-lg mx-auto w-full p-6 select-none">
      
      {/* Header */}
      <div className="mb-8 mt-4">
        <h1 className="font-serif text-3xl font-light text-ink">World Clock</h1>
        <p className="font-sans text-xs text-muted mt-1">Unified moments across global horizons</p>
      </div>

      {/* Grid List */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-20">
        <div className="grid grid-cols-1 gap-3">
          {CITIES.map((city) => {
            const { timeString, ampm, abbrev } = getCityTime(city);
            return (
              <div
                key={city.name}
                id={`world-clock-city-${city.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-paper border border-border-beige rounded-2xl p-5 flex items-center justify-between shadow-[0_1px_3px_rgba(43,36,24,0.02)]"
              >
                {/* City name & zone metadata */}
                <div className="space-y-1">
                  <h3 className="font-sans text-base font-medium text-ink">
                    {city.name}
                  </h3>
                  <p className="font-mono text-[9px] text-faint tracking-wider uppercase">
                    {abbrev} Zone
                  </p>
                </div>

                {/* Time Display */}
                <div className="flex items-baseline space-x-1.5">
                  <span className="font-serif text-2px text-2xl sm:text-3xl text-ink font-light">
                    {timeString}
                  </span>
                  <span className="font-sans text-xs text-muted uppercase font-light">
                    {ampm}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
