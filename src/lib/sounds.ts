class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isMusicMuted: boolean = false;

  private init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = this.isMuted ? 0 : 0.3;

    this.musicGain = this.ctx.createGain();
    this.musicGain.connect(this.masterGain);
    this.musicGain.gain.value = this.isMusicMuted ? 0 : 1.0;
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.3, this.ctx!.currentTime, 0.1);
    }
  }

  setMusicMute(muted: boolean) {
    this.isMusicMuted = muted;
    if (this.musicGain) {
      this.musicGain.gain.setTargetAtTime(muted ? 0 : 1.0, this.ctx!.currentTime, 0.1);
    }
  }

  toggleMute() {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  toggleMusicMute() {
    this.setMusicMute(!this.isMusicMuted);
    return this.isMusicMuted;
  }

  playLaneSwitch() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playCoin() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playPowerup() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(880, this.ctx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  playCrash() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.5);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start();
    noise.stop(this.ctx.currentTime + 0.5);
  }

  private musicOscillators: OscillatorNode[] = [];
  private musicGains: GainNode[] = [];
  private musicInterval: number | null = null;

  playMusic() {
    this.init();
    if (!this.ctx || !this.masterGain || this.musicInterval) return;

    const tempo = 120;
    const secondsPerBeat = 60 / tempo;
    let beat = 0;

    const playNote = (freq: number, time: number, duration: number, type: OscillatorType = 'sawtooth') => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      
      gain.gain.setValueAtTime(0.05, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, time);
      filter.frequency.exponentialRampToValueAtTime(200, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain!);
      
      osc.start(time);
      osc.stop(time + duration);
      
      this.musicOscillators.push(osc);
    };

    const notes = [110, 110, 130.81, 146.83]; // A2, C3, D3
    const leadNotes = [440, 493.88, 523.25, 587.33]; // A4, B4, C5, D5

    this.musicInterval = window.setInterval(() => {
      const startTime = this.ctx!.currentTime + 0.05;
      
      // Bassline
      const freq = notes[beat % notes.length];
      playNote(freq, startTime, secondsPerBeat * 0.8);
      
      // Kick Drum (simplified)
      if (beat % 4 === 0) {
        const kickOsc = this.ctx!.createOscillator();
        const kickGain = this.ctx!.createGain();
        kickOsc.frequency.setValueAtTime(150, startTime);
        kickOsc.frequency.exponentialRampToValueAtTime(0.01, startTime + 0.1);
        kickGain.gain.setValueAtTime(0.3, startTime);
        kickGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
        kickOsc.connect(kickGain);
        kickGain.connect(this.musicGain!);
        kickOsc.start(startTime);
        kickOsc.stop(startTime + 0.1);
      }

      // Lead Melody
      if (beat % 8 === 0 || beat % 8 === 3 || beat % 8 === 6) {
        const leadFreq = leadNotes[Math.floor(Math.random() * leadNotes.length)];
        playNote(leadFreq, startTime, secondsPerBeat * 0.4, 'square');
      }

      // Arpeggio
      if (beat % 2 === 0) {
        playNote(freq * 2, startTime + secondsPerBeat / 2, secondsPerBeat * 0.2, 'sine');
      }

      beat++;
    }, secondsPerBeat * 1000);
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.musicOscillators.forEach(osc => {
      try { osc.stop(); } catch(e) {}
    });
    this.musicOscillators = [];
  }

  playStart() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    this.playMusic(); // Start music on game start
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(110, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }
}

export const sounds = new SoundManager();
