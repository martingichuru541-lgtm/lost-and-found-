import QRCode from 'qrcode';
import confetti from 'canvas-confetti';

/**
 * Generates a clean QR code as a PNG data URL.
 */
export async function generateQRCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Failed to generate QR code data URL:', err);
    return '';
  }
}

/**
 * Play a futuristic pleasant success chime via Web Audio API.
 */
export function playHandoverSuccessChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    
    // Primary harmonic chord (E5, G#5, B5, E6)
    const freqs = [659.25, 830.61, 987.77, 1318.51];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.75);
    });
  } catch (err) {
    // Non-blocking if audio not allowed by user gesture
  }
}

/**
 * Trigger celebratory confetti burst on successful handover verification.
 */
export function triggerCelebrationConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#38bdf8', '#fbbf24', '#ffffff', '#ec4899']
    });
    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10b981', '#38bdf8']
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10b981', '#fbbf24']
      });
    }, 250);
  } catch (err) {
    // Graceful fallback
  }
}
