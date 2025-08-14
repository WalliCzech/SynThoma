export function getSharedAudio(src = '/audio/SynthBachmoff.mp3'): HTMLAudioElement {
  const w = window as any;
  if (!w.__synthomaAudio) {
    const a = new Audio(src);
    a.loop = false;
    a.volume = 1.0;
    w.__synthomaAudio = a;
  }
  return w.__synthomaAudio as HTMLAudioElement;
}
