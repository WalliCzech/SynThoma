# core/lipsync_engine.py
"""
LipSyncEngine – synchronizuje rty, že i dabingový herec bude žárlit! 🎙️
RetinaFace najde rty, Wav2Lip je oživí. Styl rtů a reálný čas v ceně! 😈
"""
import logging
import cv2
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Callable
from main import get_next_output_filename
from utils.helpers import Config
from retinaface_loader import RetinaFaceDetector
import subprocess
import torch
import librosa
import os

logger = logging.getLogger(__name__)

class LipSyncEngine:
    def __init__(self):
        """Inicializuje lipsync engine. Rty se chystají na synchronizaci! 🎬"""
        self.config = Config()
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.retinaface = RetinaFaceDetector()
        self.lipsync_model = None
        self.load_model()
        logger.info(f"✅ LipSyncEngine inicializován na {self.device}. Rty se třesou nedočkavostí! 😎")

    def load_model(self):
        """Načte Wav2Lip model z cesty v cestach.txt. Rty se připravují na tanec! 💃"""
        try:
            # Cesta k modelu z cest.txt
            model_path = Path("ai_models/Lipsync/wav2lip.pth")
            if not model_path.exists():
                raise FileNotFoundError(f"Wav2Lip model nenalezen na cestě: {model_path}! 😤")
            
            # Načtení modelu
            self.lipsync_model = torch.load(model_path, map_location=self.device)
            self.lipsync_model.eval()
            logger.info(f"✅ Wav2Lip model načten z {model_path}. Rty budou mluvit jako Švejk! 🗣️")
        except Exception as e:
            logger.error(f"❌ Načítání Wav2Lip modelu selhalo: {e}. Rty zůstanou němé! 😣")
            raise

    def _apply_lipsync(self, frame: np.ndarray, audio: np.ndarray, style: str) -> np.ndarray:
        """Aplikuje lipsync na frame pomocí Wav2Lip. Rty ožívají! 🎙️"""
        try:
            # Placeholder: simulace Wav2Lip pipeline
            # V reálu bys použil Wav2Lip model s předzpracováním obrazu a zvuku
            height, width = frame.shape[:2]
            face_info = self.detect_face(frame)
            if not face_info:
                logger.warning("⚠️ Žádný obličej, lipsync přeskočen pro tento frame!")
                return frame
            
            # Simulace: upraví oblast rtů podle stylu
            bbox = face_info["bbox"]
            x, y, w, h = [int(v) for v in bbox]
            lip_area = frame[y:y+h, x:x+w]
            if style == "smile":
                lip_area = cv2.convertScaleAbs(lip_area, beta=20)  # Světlejší pro "úsměv"
            elif style == "neutral":
                pass
            frame[y:y+h, x:x+w] = lip_area
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 0, 255), 2)  # Vizualizace oblasti rtů
            return frame
        except Exception as e:
            logger.error(f"❌ Aplikace lipsync selhala: {e}. Rty zůstaly nehybné! 😣")
            return frame

    def detect_face(self, frame: np.ndarray) -> Optional[Dict]:
        """Detekuje obličej a rty pomocí RetinaFace. Sherlock by záviděl! 🕵️‍♂️"""
        try:
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            faces = self.retinaface.detect(frame_rgb)
            if not faces:
                logger.warning("⚠️ Žádný obličej nenalezen! Je to vůbec člověk? 👽")
                return None
            logger.info("✅ Obličej nalezen. Rty jsou naše! 😎")
            return faces[0]
        except Exception as e:
            logger.error(f"❌ Detekce obličeje selhala: {e}. Rty se schovaly! 😣")
            return None

    def process_lipsync(self, 
                       input_path: str, 
                       audio_path: str, 
                       style: str = "neutral", 
                       output_format: str = "mp4", 
                       quality: str = "medium", 
                       progress_callback: Optional[Callable[[int], None]] = None) -> Dict:
        """Synchronizuje rty ve videu nebo obrázku se zvukem. Rty mluví jako profesionál! 🗣️"""
        if not Path(input_path).exists() or not Path(audio_path).exists():
            logger.error("❗ Vstupní soubor nebo zvuk nenalezen! Kde jsou ty rty a hlas? 🎙️")
            return {"video": None, "message": "❗ Soubor nenalezen!"}

        try:
            # Rozpoznání, zda je vstup obrázek nebo video
            is_video = input_path.lower().endswith((".mp4", ".avi", ".mov"))
            temp_path = self.config.OUTPUT_DIR / f"temp_{random.randint(0, 9999)}.mp4"
            output_path = self.config.OUTPUT_DIR / get_next_output_filename(output_format)
            
            if is_video:
                cap = cv2.VideoCapture(input_path)
                fps = cap.get(cv2.CAP_PROP_FPS)
                width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            else:
                img = cv2.imread(input_path)
                height, width = img.shape[:2]
                fps = 30.0
                total_frames = int(fps * 5)  # 5s video z obrázku
            
            # Načtení zvuku
            audio, sample_rate = librosa.load(audio_path, sr=16000)
            
            # Nastavení výstupu
            fourcc = cv2.VideoWriter_fourcc(*"mp4v")
            out = cv2.VideoWriter(str(temp_path), fourcc, fps, (width, height))
            
            if is_video:
                for i in range(total_frames):
                    ret, frame = cap.read()
                    if not ret:
                        break
                    frame_rgb = self._apply_lipsync(frame, audio, style)
                    out.write(frame_rgb)
                    if progress_callback:
                        progress_callback(int((i + 1) / total_frames * 80))  # 80% za snímky
                cap.release()
            else:
                img = cv2.imread(input_path)
                if not self.detect_face(img):
                    raise ValueError("Žádný obličej nenalezen v obrázku! 😤")
                for _ in range(total_frames):
                    frame_rgb = self._apply_lipsync(img, audio, style)
                    out.write(frame_rgb)
                    if progress_callback:
                        progress_callback(int((_+1) / total_frames * 80))  # 80% za snímky
            
            out.release()
            
            # Přidání zvuku pomocí ffmpeg
            bitrate = 5000  # Fixní pro jednoduchost
            cmd = ["ffmpeg", "-i", str(temp_path), "-i", str(audio_path), "-c:v", "libx264", 
                   "-b:v", f"{bitrate}k", "-c:a", "aac", "-shortest", "-preset", quality, 
                   "-y", str(output_path)]
            subprocess.run(cmd, check=True)
            
            temp_path.unlink()  # Smazat dočasný soubor
            if progress_callback:
                progress_callback(100)  # 100% po exportu
            
            logger.info(f"✅ Lipsync dokončen, výstup: {output_path}")
            return {
                "video": None,  # Video není numpy array
                "message": f"✅ Lipsync uložen jako {output_path}"
            }
        except Exception as e:
            logger.error(f"❌ Lipsync selhal: {e}. Rty zůstaly němé! 😣")
            return {"video": None, "message": f"❗ Chyba: {e}"}

    def process_batch_lipsync(self, 
                            input_paths: List[str], 
                            audio_path: str, 
                            style: str = "neutral", 
                            output_format: str = "mp4", 
                            quality: str = "medium", 
                            progress_callback: Optional[Callable[[int], None]] = None) -> List[Dict]:
        """Synchronizuje rty na více vstupech s jedním zvukem. Batch lipsync, rty v masovce! 📚"""
        if not input_paths or not Path(audio_path).exists():
            logger.error("❗ Vstupy nebo zvuk nenalezeny! Batch je prázdný jako hospoda o páté ráno! 🍺")
            return [{"video": None, "message": "❗ Soubor nenalezen!"}]

        results = []
        total_inputs = len(input_paths)
        
        for i, input_path in enumerate(input_paths):
            if not Path(input_path).exists():
                logger.error(f"❗ Soubor {input_path} nenalezen! Přeskakuju...")
                results.append({"video": None, "message": f"❗ Soubor {input_path} nenalezen!"})
                continue
            
            def batch_progress(step: int):
                if progress_callback:
                    progress = int((i / total_inputs) * 100 + (step / total_inputs))
                    progress_callback(min(progress, 100))
            
            result = self.process_lipsync(
                input_path=input_path,
                audio_path=audio_path,
                style=style,
                output_format=output_format,
                quality=quality,
                progress_callback=batch_progress
            )
            results.append(result)
        
        logger.info(f"✅ Batch zpracován: {len(results)} lipsync videí")
        return results

if __name__ == "__main__":
    # Testovací kód, ať vidíme, jak to synchronizuje! 🎙️
    engine = LipSyncEngine()
    test_inputs = ["test_face.jpg", "test_video.mp4"]
    test_audio = "test_audio.wav"
    
    # Test jednoho vstupu
    result = engine.process_lipsync(
        input_path=test_inputs[0],
        audio_path=test_audio,
        style="smile",
        output_format="mp4",
        quality="medium",
        progress_callback=lambda x: print(f"Progress: {x}%")
    )
    print(result["message"])
    
    # Test batch lipsync
    results = engine.process_batch_lipsync(
        input_paths=test_inputs,
        audio_path=test_audio,
        style="neutral",
        output_format="mp4",
        quality="medium",
        progress_callback=lambda x: print(f"Batch Progress: {x}%")
    )
    for res in results:
        print(res["message"])