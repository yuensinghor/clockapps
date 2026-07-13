// Web Audio API Sound Synthesizer for LTMClock

let alarmInterval: any = null;
let alarmAudioCtx: AudioContext | null = null;

/**
 * Play Screen 5 Magic Sound:
 * - Low sine drone at 130.81Hz (C3)
 * - Full C-Major chord at 0.5s (C4: 261.63, E4: 329.63, G4: 392.00)
 * - Four high bell sparkles at 523 (C5), 659 (E5), 784 (G5), 1046Hz (C6) staggered 0.3s apart
 * All with slow attacks and long releases
 */
export function playMagicSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // 1. Low sine drone at 130.81Hz (C3)
    const drone = ctx.createOscillator();
    const droneGain = ctx.createGain();
    drone.type = 'sine';
    drone.frequency.setValueAtTime(130.81, now);
    droneGain.gain.setValueAtTime(0, now);
    droneGain.gain.linearRampToValueAtTime(0.25, now + 0.6);
    droneGain.gain.exponentialRampToValueAtTime(0.001, now + 5.5);
    drone.connect(droneGain);
    droneGain.connect(ctx.destination);
    drone.start(now);
    drone.stop(now + 6.0);

    // 2. Full C-Major chord at 0.5s (C4, E4, G4)
    const chordFreqs = [261.63, 329.63, 392.00];
    chordFreqs.forEach(freq => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.5);
      gainNode.gain.setValueAtTime(0, now + 0.5);
      gainNode.gain.linearRampToValueAtTime(0.12, now + 1.2);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 5.5);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(now + 0.5);
      osc.stop(now + 6.0);
    });

    // 3. Four high bell sparkles (C5, E5, G5, C6) staggered 0.3s apart starting at 0.5s
    const bells = [523.25, 659.25, 783.99, 1046.50];
    bells.forEach((freq, idx) => {
      const startTime = now + 0.5 + idx * 0.3;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.05); // fast-ish attack
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 3.0); // long release
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 3.5);
    });
  } catch (err) {
    console.error("Magic sound generation failed:", err);
  }
}

/**
 * Play Alarm Chime:
 * - Web Audio 4-note sine chime (C5-E5-G5-C6) repeating every 3 seconds
 */
export function startAlarmChime() {
  if (alarmInterval) return; // Already running
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    alarmAudioCtx = ctx;

    const playNotes = () => {
      if (!alarmAudioCtx) return;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5-E5-G5-C6
      
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);
        
        gain.gain.setValueAtTime(0, now + idx * 0.15);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.15 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 1.0);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 1.2);
      });
    };

    playNotes();
    alarmInterval = setInterval(playNotes, 3000);
  } catch (err) {
    console.error("Alarm chime failed:", err);
  }
}

export function stopAlarmChime() {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
  if (alarmAudioCtx) {
    try {
      alarmAudioCtx.close();
    } catch (e) {}
    alarmAudioCtx = null;
  }
}

/**
 * Play Timer Completed Chime:
 * - 3-note chime
 */
export function playTimerDoneChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // Play sweet 3-note chime: E5, G5, C6
    const notes = [659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.15;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.0);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 1.2);
    });
  } catch (err) {
    console.error("Timer done chime failed:", err);
  }
}
