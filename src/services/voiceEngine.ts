// Voice Engine: Web Speech API & ElevenLabs Conversational AI Integration

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

class VoiceEngine {
  private recognition: any = null;
  private isListening = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private isMuted = false;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'es-ES';
    }
  }

  public isRecognitionSupported(): boolean {
    return !!this.recognition;
  }

  public startListening(onResult: (text: string) => void, onError?: (err: any) => void): boolean {
    if (!this.recognition) {
      this.initRecognition();
      if (!this.recognition) {
        if (onError) onError('Speech recognition not supported');
        return false;
      }
    }

    try {
      this.recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        this.isListening = false;
        onResult(text);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        if (onError) onError(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (e) {
      this.isListening = false;
      if (onError) onError(e);
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.error('Error stopping speech recognition:', e);
      }
      this.isListening = false;
    }
  }

  public speak(
    text: string, 
    onStart?: () => void, 
    onEnd?: () => void, 
    voiceProfile?: 'BANKING' | 'FRAUD' | 'LOANS'
  ): Promise<void> {
    return new Promise((resolve) => {
      if (this.isMuted) {
        if (onStart) onStart();
        setTimeout(() => {
          if (onEnd) onEnd();
          resolve();
        }, 800);
        return;
      }

      if (!('speechSynthesis' in window)) {
        if (onStart) onStart();
        setTimeout(() => {
          if (onEnd) onEnd();
          resolve();
        }, 1200);
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;
      utterance.lang = 'es-ES';

      // Pick Spanish voices if available
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(v => v.lang.startsWith('es') || v.lang.includes('ES') || v.name.includes('Spanish') || v.name.includes('Monica') || v.name.includes('Jorge') || v.name.includes('Paulina'));
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }

      // Slightly alter pitch depending on agent character
      if (voiceProfile === 'FRAUD') {
        utterance.pitch = 0.95;
        utterance.rate = 1.02;
      } else if (voiceProfile === 'LOANS') {
        utterance.pitch = 1.05;
        utterance.rate = 1.0;
      } else {
        utterance.pitch = 1.0;
        utterance.rate = 1.05;
      }

      utterance.onstart = () => {
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
        resolve();
      };

      utterance.onerror = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  public stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopSpeaking();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }
}

export const voiceEngine = new VoiceEngine();
