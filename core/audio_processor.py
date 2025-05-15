# core/audio_processor.py
"""
AudioProcessor – promění tvůj zvuk, jako bys byl DJ v hospodě U Kalicha! 🎧
Denoising, efekty, ořez ticha a smyčky. Zvuky brečí štěstím! 😈
"""
import logging
import librosa
import soundfile as sf
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Callable, Tuple
from main import get_next_output_filename
from utils.helpers import Config
import scipy.signal as signal
import subprocess

logger = logging.getLogger(__name__)

class AudioProcessor:
    def __init__(self):
        """Inicializuje procesor zvuku. Zvuky se chystají na proměnu! 🎵"""
        self.config = Config()
        self.sample_rate = 44100  # Defaultní vzorkovací frekvence
        logger.info("✅ AudioProcessor inicializován. Zvuky jsou v pohotovosti! 😎")

    def denoise_audio(self, audio: np.ndarray, sample_rate: int, strength: float = 0.5) -> np.ndarray:
        """Odstraní šum ze zvuku. Zvuk čistý jako po pivní lázni! 🧹"""
        try:
            if strength <= 0:
                logger.info("🔄 Denoising vypnutý, zvuk zůstane syrový!")
                return audio
            # Simulace denoising: redukce nízkofrekvenčního šumu
            freq = librosa.stft(audio)
            threshold = np.mean(np.abs(freq)) * strength
            freq[np.abs(freq) < threshold] *= 0.5
            denoised = librosa.istft(freq)
            logger.info("✅ Šum odstraněn, zvuk je křišťálový! 🎶")
            return denoised
        except Exception as e:
            logger.error(f"❌ Denoising selhal: {e}. Zvuk zůstane šumivý! 😣")
            return audio

    def apply_effect(self, audio: np.ndarray, sample_rate: int, effect_type: str, 
                    value: float) -> np.ndarray:
        """Aplikuje zvukový efekt (pitch, echo, reverb, speed). Zvuky se mění jako v remixu! 🎛️"""
        try:
            if effect_type == "pitch":
                steps = value * 12  # -12 až +12 půltónů
                audio = librosa.effects.pitch_shift(audio, sr=sample_rate, n_steps=steps)
            elif effect_type == "echo":
                delay_samples = int(sample_rate * 0.2 * value)  # Max 0.2s zpoždění
                echo = np.zeros_like(audio)
                echo[delay_samples:] = audio[:-delay_samples] * 0.5
                audio = audio + echo
            elif effect_type == "reverb":
                impulse = np.exp(-np.linspace(0, 2, int(sample_rate * 0.5))) * value
                audio = signal.convolve(audio, impulse, mode="full")[:len(audio)]
            elif effect_type == "speed":
                audio = librosa.effects.time_stretch(audio, rate=1 + value)
            else:
                raise ValueError(f"Neznámý efekt: {effect_type}. Vyber pitch, echo, reverb nebo speed! 😤")
            return audio
        except Exception as e:
            logger.error(f"❌ Aplikace efektu {effect_type} selhala: {e}. Zvuk zůstane nudný! 😣")
            return audio

    def trim_silence(self, audio: np.ndarray, sample_rate: int, threshold_db: float = -40) -> np.ndarray:
        """Ořeže ticho na začátku a konci. Ticho je pryč, zvuk jede! ✂️"""
        try:
            audio, _ = librosa.effects.trim(audio, top_db=-threshold_db)
            logger.info("✅ Ticho ořezáno, zvuk je připravený na akci! 🎬")
            return audio
        except Exception as e:
            logger.error(f"❌ Ořez ticha selhal: {e}. Ticho zůstane! 😣")
            return audio

    def normalize_audio(self, audio: np.ndarray) -> np.ndarray:
        """Normalizuje hlasitost. Zvuk je hlasitý, ale nezkreslený! 📣"""
        try:
            max_amplitude = np.max(np.abs(audio))
            if max_amplitude > 0:
                audio = audio / max_amplitude * 0.95  # 95% maxima pro bezpečnost
            logger.info("✅ Hlasitost normalizována, zvuk je v top formě! 💪")
            return audio
        except Exception as e:
            logger.error(f"❌ Normalizace selhala: {e}. Hlasitost je divoká! 😣")
            return audio

    def create_loop(self, audio: np.ndarray, sample_rate: int, num_loops: int) -> np.ndarray:
        """Vytvoří smyčku opakováním zvuku. Zvuk se točí jako kolotoč! 🔄"""
        try:
            if num_loops < 1:
                raise ValueError("Počet smyček musí být alespoň 1! 😤")
            looped_audio = np.tile(audio, num_loops)
            logger.info(f"✅ Smyčka vytvořena s {num_loops} opakováními. Zvuk jede dokola! 🎡")
            return looped_audio
        except Exception as e:
            logger.error(f"❌ Vytvoření smyčky selhalo: {e}. Zvuk se neopakuje! 😣")
            return audio

    def process_audio(self, 
                     audio_path: str, 
                     effects: List[Tuple[str, float]], 
                     denoise: bool = False, 
                     denoise_strength: float = 0.5, 
                     trim_silence: bool = False, 
                     normalize: bool = True, 
                     create_loop: int = 1, 
                     output_format: str = "wav", 
                     quality: str = "V3", 
                     progress_callback: Optional[Callable[[int], None]] = None) -> Dict:
        """Zpracuje jeden zvukový soubor. Zvuk se mění jako v nahrávacím studiu! 🎙️"""
        if not Path(audio_path).exists():
            logger.error("❗ Zvukový soubor nenalezen! Kde je ten hudební klenot? 🎵")
            return {"audio": None, "message": "❗ Soubor nenalezen!"}

        try:
            # Načtení zvuku
            audio, sample_rate = librosa.load(audio_path, sr=self.sample_rate)
            if progress_callback:
                progress_callback(10)  # 10% za načtení

            # Denoising
            if denoise:
                audio = self.denoise_audio(audio, sample_rate, denoise_strength)
                if progress_callback:
                    progress_callback(20)  # 20% po denoising

            # Ořez ticha
            if trim_silence:
                audio = self.trim_silence(audio, sample_rate)
                if progress_callback:
                    progress_callback(30)  # 30% po ořezu

            # Aplikace efektů
            total_effects = len(effects)
            for i, (effect_type, value) in enumerate(effects):
                audio = self.apply_effect(audio, sample_rate, effect_type, value)
                if progress_callback:
                    progress_callback(30 + (i + 1) * 30 // max(1, total_effects))  # 30–60% podle efektů

            # Normalizace
            if normalize:
                audio = self.normalize_audio(audio)
                if progress_callback:
                    progress_callback(70)  # 70% po normalizaci

            # Vytvoření smyčky
            if create_loop > 1:
                audio = self.create_loop(audio, sample_rate, create_loop)
                if progress_callback:
                    progress_callback(80)  # 80% po smyčce

            # Uložení výstupu
            output_path = self.config.OUTPUT_DIR / get_next_output_filename(output_format)
            if output_format == "wav":
                sf.write(output_path, audio, sample_rate)
            elif output_format == "mp3":
                sf.write(output_path.with_suffix(".wav"), audio, sample_rate)
                subprocess.run(["ffmpeg", "-i", str(output_path.with_suffix(".wav")), 
                              "-c:a", "mp3", "-q:a", quality, str(output_path)], check=True)
                output_path.with_suffix(".wav").unlink()  # Smazat dočasný WAV
            elif output_format == "flac":
                sf.write(output_path, audio, sample_rate, format="FLAC")
            else:
                raise ValueError(f"Nepodporovaný formát: {output_format}. Vyber wav, mp3 nebo flac! 😤")
            
            if progress_callback:
                progress_callback(100)  # 100% po uložení
            
            logger.info(f"✅ Zvuk zpracován s efekty {effects}, výstup: {output_path}")
            return {
                "audio": audio,
                "sample_rate": sample_rate,
                "message": f"✅ Zpracováno s efekty {effects}, uloženo jako {output_path}"
            }
        except Exception as e:
            logger.error(f"❌ Zpracování zvuku selhalo: {e}. Zvuk zůstal netknutý! 😣")
            return {"audio": None, "message": f"❗ Chyba: {e}"}

    def process_batch_audio(self, 
                           audio_paths: List[str], 
                           effects: List[Tuple[str, float]], 
                           denoise: bool = False, 
                           denoise_strength: float = 0.5, 
                           trim_silence: bool = False, 
                           normalize: bool = True, 
                           create_loop: int = 1, 
                           output_format: str = "wav", 
                           quality: str = "V3", 
                           progress_callback: Optional[Callable[[int], None]] = None) -> List[Dict]:
        """Zpracuje více zvukových souborů najednou. Batch processing, zvuky v masovce! 📚"""
        if not audio_paths:
            logger.error("❗ Žádné zvuky! Batch je prázdný jako hospoda o páté ráno! 🍺")
            return [{"audio": None, "message": "❗ Žádné soubory k zpracování!"}]

        results = []
        total_audios = len(audio_paths)
        
        for i, audio_path in enumerate(audio_paths):
            if not Path(audio_path).exists():
                logger.error(f"❗ Soubor {audio_path} nenalezen! Přeskakuju...")
                results.append({"audio": None, "message": f"❗ Soubor {audio_path} nenalezen!"})
                continue
            
            # Vlastní callback pro batch
            def batch_progress(step: int):
                if progress_callback:
                    progress = int((i / total_audios) * 100 + (step / total_audios))
                    progress_callback(min(progress, 100))  # Omezení na 100%
            
            result = self.process_audio(
                audio_path=audio_path,
                effects=effects,
                denoise=denoise,
                denoise_strength=denoise_strength,
                trim_silence=trim_silence,
                normalize=normalize,
                create_loop=create_loop,
                output_format=output_format,
                quality=quality,
                progress_callback=batch_progress
            )
            results.append(result)
        
        logger.info(f"✅ Batch zpracován: {len(results)} zvuků, efekty {effects}")
        return results

if __name__ == "__main__":
    # Testovací kód, ať vidíme, jak to mění zvuky! 🎧
    processor = AudioProcessor()
    test_audios = ["test_audio1.wav", "test_audio2.wav"]
    test_effects = [("pitch", 0.2), ("echo", 0.5)]
    
    # Test jednoho zvuku
    result = processor.process_audio(
        audio_path=test_audios[0],
        effects=test_effects,
        denoise=True,
        denoise_strength=0.7,
        trim_silence=True,
        normalize=True,
        create_loop=2,
        output_format="mp3",
        quality="V2",
        progress_callback=lambda x: print(f"Progress: {x}%")
    )
    print(result["message"])
    
    # Test batch processing
    results = processor.process_batch_audio(
        audio_paths=test_audios,
        effects=[("reverb", 0.3)],
        denoise=False,
        trim_silence=True,
        normalize=True,
        create_loop=1,
        output_format="wav",
        progress_callback=lambda x: print(f"Batch Progress: {x}%")
    )
    for res in results:
        print(res["message"])
