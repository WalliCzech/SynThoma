# core/video_exporter.py
"""
VideoExporter – promění tvé obrázky v video, že Spielberg bude žárlit! 🎬
Sekvence obrázků, zvuk, titulky a vodoznaky. Filmy se rodí v pixelech! 😈
"""
import logging
import cv2
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Callable
from main import get_next_output_filename
from utils.helpers import Config
import subprocess
import os

logger = logging.getLogger(__name__)

class VideoExporter:
    def __init__(self):
        """Inicializuje video exporter. Pixely a zvuky se chystají na filmovou slávu! 🎥"""
        self.config = Config()
        logger.info("✅ VideoExporter inicializován. Spielberg se může jít zahrabat! 😎")

    def calculate_bitrate(self, width: int, height: int, fps: float) -> int:
        """Vypočítá optimální bitrate podle rozlišení a FPS. Video bude hladké jako pivo! 🍺"""
        try:
            pixels = width * height
            bitrate = int(pixels * fps * 0.1)  # Základní pravidlo: 0.1 bit/pixel
            bitrate = max(1000, min(bitrate, 20000))  # Omezení 1–20 Mbps
            logger.info(f"🖼️ Bitrate vypočítán: {bitrate} kbps pro {width}x{height}@{fps}fps")
            return bitrate
        except Exception as e:
            logger.error(f"❌ Výpočet bitrate selhal: {e}. Default 5000 kbps! 😣")
            return 5000

    def add_watermark(self, frame: np.ndarray, watermark: str, position: str = "bottom-right") -> np.ndarray:
        """Přidá textový vodoznak. Studio si značí teritorium! 🖺"""
        try:
            height, width = frame.shape[:2]
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 1
            color = (255, 255, 255)  # Bílá
            thickness = 2
            
            text_size = cv2.getTextSize(watermark, font, font_scale, thickness)[0]
            if position == "bottom-right":
                org = (width - text_size[0] - 10, height - 10)
            elif position == "top-left":
                org = (10, 30)
            else:
                org = (width // 2 - text_size[0] // 2, height // 2)
            
            frame = cv2.putText(frame, watermark, org, font, font_scale, color, thickness, cv2.LINE_AA)
            return frame
        except Exception as e:
            logger.error(f"❌ Přidání vodoznaku selhalo: {e}. Video zůstane neoznačené! 😣")
            return frame

    def export_video(self, 
                    image_paths: List[str], 
                    audio_path: Optional[str] = None, 
                    fps: float = 30.0, 
                    transition: str = "none", 
                    watermark: Optional[str] = None, 
                    subtitles_path: Optional[str] = None, 
                    output_format: str = "mp4", 
                    quality: str = "medium", 
                    progress_callback: Optional[Callable[[int], None]] = None) -> Dict:
        """Vytvoří video ze sekvence obrázků. Pixely se mění ve film! 🎬"""
        if not image_paths or not all(Path(p).exists() for p in image_paths):
            logger.error("❗ Obrázky nenalezeny! Kde je ta filmová surovina? 🖼️")
            return {"video": None, "message": "❗ Obrázky nenalezeny!"}

        try:
            # Načtení prvního obrázku pro rozměry
            first_img = cv2.imread(image_paths[0])
            height, width = first_img.shape[:2]
            bitrate = self.calculate_bitrate(width, height, fps)
            
            # Nastavení výstupu
            output_path = self.config.OUTPUT_DIR / get_next_output_filename(output_format)
            temp_path = output_path.with_suffix(".temp.mp4")
            fourcc = cv2.VideoWriter_fourcc(*"mp4v")
            out = cv2.VideoWriter(str(temp_path), fourcc, fps, (width, height))
            
            total_frames = len(image_paths)
            for i, img_path in enumerate(image_paths):
                img = cv2.imread(img_path)
                if img.shape[:2] != (height, width):
                    img = cv2.resize(img, (width, height))
                
                # Přidání vodoznaku
                if watermark:
                    img = self.add_watermark(img, watermark)
                
                # Přechody (simulace fade)
                if transition == "fade" and i > 0:
                    prev_img = cv2.imread(image_paths[i-1])
                    if prev_img.shape[:2] != (height, width):
                        prev_img = cv2.resize(prev_img, (width, height))
                    for alpha in np.linspace(0, 1, int(fps * 0.5)):  # 0.5s přechod
                        blended = cv2.addWeighted(prev_img, 1-alpha, img, alpha, 0.0)
                        out.write(blended)
                
                out.write(img)
                if progress_callback:
                    progress_callback(int((i + 1) / total_frames * 80))  # 80% za snímky
            
            out.release()
            
            # Přidání zvuku a titulků pomocí ffmpeg
            cmd = ["ffmpeg", "-i", str(temp_path), "-c:v", "libx264", "-b:v", f"{bitrate}k"]
            if audio_path and Path(audio_path).exists():
                cmd.extend(["-i", str(audio_path), "-c:a", "aac", "-shortest"])
            else:
                cmd.append("-an")
            if subtitles_path and Path(subtitles_path).exists():
                cmd.extend(["-vf", f"subtitles={subtitles_path}"])
            cmd.extend(["-preset", quality, "-y", str(output_path)])
            subprocess.run(cmd, check=True)
            
            temp_path.unlink()  # Smazat dočasný soubor
            if progress_callback:
                progress_callback(100)  # 100% po exportu
            
            logger.info(f"✅ Video exportováno, výstup: {output_path}")
            return {
                "video": None,  # Video není numpy array
                "message": f"✅ Video exportováno jako {output_path}"
            }
        except Exception as e:
            logger.error(f"❌ Export videa selhal: {e}. Pixely nezfilmovány! 😣")
            return {"video": None, "message": f"❗ Chyba: {e}"}

    def export_batch_videos(self, 
                           sequences: List[List[str]], 
                           audio_paths: List[Optional[str]], 
                           fps: float = 30.0, 
                           transition: str = "none", 
                           watermark: Optional[str] = None, 
                           subtitles_paths: List[Optional[str]] = None, 
                           output_format: str = "mp4", 
                           quality: str = "medium", 
                           progress_callback: Optional[Callable[[int], None]] = None) -> List[Dict]:
        """Exportuje více videí z různých sekvencí. Batch export, filmy v masovce! 📚"""
        if not sequences:
            logger.error("❗ Žádné sekvence! Batch je prázdný jako hospoda o páté ráno! 🍺")
            return [{"video": None, "message": "❗ Žádné sekvence k exportu!"}]

        results = []
        total_sequences = len(sequences)
        subtitles_paths = subtitles_paths or [None] * total_sequences
        
        for i, (image_paths, audio_path, subtitles_path) in enumerate(zip(sequences, audio_paths, subtitles_paths)):
            def batch_progress(step: int):
                if progress_callback:
                    progress = int((i / total_sequences) * 100 + (step / total_sequences))
                    progress_callback(min(progress, 100))
            
            result = self.export_video(
                image_paths=image_paths,
                audio_path=audio_path,
                fps=fps,
                transition=transition,
                watermark=watermark,
                subtitles_path=subtitles_path,
                output_format=output_format,
                quality=quality,
                progress_callback=batch_progress
            )
            results.append(result)
        
        logger.info(f"✅ Batch zpracován: {len(results)} videí")
        return results

if __name__ == "__main__":
    # Testovací kód, ať vidíme, jak to exportuje! 🎬
    exporter = VideoExporter()
    test_images = ["output0001.png", "output0002.png", "output0003.png"]
    test_audio = "test_audio.wav"
    test_subtitles = "test_subtitles.srt"
    
    # Test jednoho videa
    result = exporter.export_video(
        image_paths=test_images,
        audio_path=test_audio,
        fps=24.0,
        transition="fade",
        watermark="wAllICzech AI Studio",
        subtitles_path=test_subtitles,
        output_format="mp4",
        quality="medium",
        progress_callback=lambda x: print(f"Progress: {x}%")
    )
    print(result["message"])
    
    # Test batch exportu
    sequences = [test_images, test_images]
    audio_paths = [test_audio, None]
    subtitles_paths = [test_subtitles, None]
    results = exporter.export_batch_videos(
        sequences=sequences,
        audio_paths=audio_paths,
        subtitles_paths=subtitles_paths,
        fps=24.0,
        transition="none",
        watermark="wAllICzech AI Studio",
        output_format="mp4",
        quality="medium",
        progress_callback=lambda x: print(f"Batch Progress: {x}%")
    )
    for res in results:
        print(res["message"])