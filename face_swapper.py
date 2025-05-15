# core/face_swapper.py
"""
FaceSwapper – vymění tvůj ksicht, až se budeš ptát, kdo je ten frajer v zrcadle! 😎
RetinaFace detekuje obličeje, GAN je mění. Realistický blending a animace jako bonus! 😈
"""
import logging
import cv2
import numpy as np
from pathlib import Path
from PIL import Image
import torch
from typing import Dict, List, Optional, Callable
from main import get_next_output_filename
from utils.helpers import Config
from retinaface_loader import RetinaFaceDetector
import imageio

logger = logging.getLogger(__name__)

class FaceSwapper:
    def __init__(self):
        """Inicializuje swapper obličejů. Ksichty se chystají na výměnu! 🔄"""
        self.config = Config()
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.retinaface = RetinaFaceDetector()
        self.swap_model = None
        self.load_swap_model()
        logger.info(f"✅ FaceSwapper inicializován na {self.device}. Obličeje čeká divoká jízda! 😈")

    def load_swap_model(self):
        """Načte GAN model pro výměnu obličejů. DeepFaceLab by záviděl! 🦁"""
        try:
            # Placeholder pro načtení GAN modelu (např. DeepFaceLab nebo SimSwap)
            self.swap_model = lambda src, tgt, landmarks: self._simulate_face_swap(src, tgt, landmarks)
            logger.info("✅ Swap model načten. Obličeje se budou měnit jako ponožky! 🧦")
        except Exception as e:
            logger.error(f"❌ Načítání swap modelu selhalo: {e}. Ksichty zůstanou původní! 😣")
            raise

    def _simulate_face_swap(self, source_img: np.ndarray, target_img: np.ndarray, 
                           landmarks: Dict) -> np.ndarray:
        """Simuluje výměnu obličeje. V reálu by tady byl GAN! 😜"""
        try:
            # Simulace: vezme obličej ze zdroje a překopíruje ho na cíl
            bbox = landmarks["bbox"]
            x, y, w, h = [int(v) for v in bbox]
            face = source_img[y:y+h, x:x+w]
            face_resized = cv2.resize(face, (w, h))
            
            # Základní blending (v reálu bys použil GAN výstup)
            result = target_img.copy()
            result[y:y+h, x:x+w] = face_resized
            
            # Seamless cloning pro realistický výsledek
            mask = np.ones_like(face_resized) * 255
            center = (x + w // 2, y + h // 2)
            result = cv2.seamlessClone(face_resized, result, mask, center, cv2.NORMAL_CLONE)
            
            # Barevná korekce
            result = self._color_correction(result, target_img, landmarks)
            return result
        except Exception as e:
            logger.error(f"❌ Simulace výměny selhala: {e}. Obličej zůstal na svém místě! 😣")
            return target_img

    def _color_correction(self, swapped_img: np.ndarray, target_img: np.ndarray, 
                         landmarks: Dict) -> np.ndarray:
        """Upraví barvy pro realistický blending. Pixely se sladí! 🎨"""
        try:
            bbox = landmarks["bbox"]
            x, y, w, h = [int(v) for v in bbox]
            swapped_face = swapped_img[y:y+h, x:x+w]
            target_face = target_img[y:y+h, x:x+w]
            
            # Přizpůsobení průměrného jasu a kontrastu
            swapped_hsv = cv2.cvtColor(swapped_face, cv2.COLOR_RGB2HSV)
            target_hsv = cv2.cvtColor(target_face, cv2.COLOR_RGB2HSV)
            swapped_hsv[:, :, 2] = np.clip(swapped_hsv[:, :, 2] * 
                                         (np.mean(target_hsv[:, :, 2]) / np.mean(swapped_hsv[:, :, 2])), 
                                         0, 255).astype(np.uint8)
            swapped_face = cv2.cvtColor(swapped_hsv, cv2.COLOR_HSV2RGB)
            
            swapped_img[y:y+h, x:x+w] = swapped_face
            return swapped_img
        except Exception as e:
            logger.error(f"❌ Barevná korekce selhala: {e}. Barvy jsou divoký! 😣")
            return swapped_img

    def detect_faces(self, img: np.ndarray) -> List[Dict]:
        """Detekuje obličeje a klíčové body pomocí RetinaFace. Sherlock by brečel závistí! 🕵️‍♂️"""
        try:
            faces = self.retinaface.detect(img)
            if not faces:
                logger.warning("⚠️ Žádné obličeje nenalezeny! Je to fotka kamení? 🪨")
                return []
            logger.info(f"✅ Nalezeno {len(faces)} obličejů. Výměna může začít! 😎")
            return faces
        except Exception as e:
            logger.error(f"❌ Detekce obličejů selhala: {e}. Obličeje se schovaly! 😣")
            return []

    def swap_faces(self, 
                  source_image_path: str, 
                  target_image_path: str, 
                  create_gif: bool = False, 
                  output_format: str = "png", 
                  quality: int = 95, 
                  progress_callback: Optional[Callable[[int], None]] = None) -> Dict:
        """Vymění obličej ze zdrojového obrázku na cílový. Ksichty se mění jako v cirkusu! 🎪"""
        if not Path(source_image_path).exists() or not Path(target_image_path).exists():
            logger.error("❗ Jeden z obrázků nenalezen! Kde jsou ty ksichty? 🖼️")
            return {"image": None, "message": "❗ Obrázek nenalezen!"}

        try:
            # Načtení obrázků
            source_img = cv2.imread(source_image_path)
            target_img = cv2.imread(target_image_path)
            if source_img is None or target_img is None:
                raise ValueError("Nelze načíst obrázky! Jsou to vůbec obrázky? 😤")
            source_img_rgb = cv2.cvtColor(source_img, cv2.COLOR_BGR2RGB)
            target_img_rgb = cv2.cvtColor(target_img, cv2.COLOR_BGR2RGB)
            if progress_callback:
                progress_callback(10)  # 10% za načtení

            # Detekce obličejů
            source_faces = self.detect_faces(source_img_rgb)
            target_faces = self.detect_faces(target_img_rgb)
            if not source_faces or not target_faces:
                return {"image": None, "message": "❗ Žádné obličeje nenalezeny v jednom z obrázků!"}
            if progress_callback:
                progress_callback(30)  # 30% po detekci

            # Výměna prvního obličeje (v reálu bys mohl zpracovat více)
            source_face = source_faces[0]
            target_face = target_faces[0]
            swapped_img = self.swap_model(source_img_rgb, target_img_rgb, target_face)
            if progress_callback:
                progress_callback(70)  # 70% po výměně

            # Uložení výstupu
            output_path = self.config.OUTPUT_DIR / get_next_output_filename(output_format)
            if create_gif:
                # Vytvoření animace přechodu
                gif_path = self.config.OUTPUT_DIR / get_next_output_filename("gif")
                self._create_transition_gif(target_img_rgb, swapped_img, gif_path)
                logger.info(f"✅ Animace výměny uložena: {gif_path}")
                output_path = gif_path
            else:
                if output_format == "png":
                    cv2.imwrite(str(output_path), cv2.cvtColor(swapped_img, cv2.COLOR_RGB2BGR))
                elif output_format == "jpg":
                    cv2.imwrite(str(output_path), cv2.cvtColor(swapped_img, cv2.COLOR_RGB2BGR), 
                               [int(cv2.IMWRITE_JPEG_QUALITY), quality])
                else:
                    raise ValueError(f"Nepodporovaný formát: {output_format}. Vyber png nebo jpg! 😤")
            
            if progress_callback:
                progress_callback(100)  # 100% po uložení
            
            logger.info(f"✅ Obličej vyměněn, výstup: {output_path}")
            return {
                "image": swapped_img,
                "message": f"✅ Obličej vyměněn, uloženo jako {output_path}"
            }
        except Exception as e:
            logger.error(f"❌ Výměna obličeje selhala: {e}. Ksichty zůstaly na svém místě! 😣")
            return {"image": None, "message": f"❗ Chyba: {e}"}

    def _create_transition_gif(self, original_img: np.ndarray, swapped_img: np.ndarray, 
                              output_path: Path):
        """Vytvoří GIF s plynulým přechodem mezi obličeji. Divadlo v pixelech! 🎬"""
        try:
            frames = []
            num_frames = 10
            for i in range(num_frames):
                alpha = i / (num_frames - 1)
                blended = cv2.addWeighted(original_img, 1 - alpha, swapped_img, alpha, 0.0)
                frames.append(Image.fromarray(blended))
            
            frames[0].save(output_path, save_all=True, append_images=frames[1:], duration=100, loop=0)
            logger.info(f"✅ GIF vytvořen: {output_path}")
        except Exception as e:
            logger.error(f"❌ Vytvoření GIFu selhalo: {e}. Žádná animace! 😣")

    def swap_batch_faces(self, 
                        source_image_path: str, 
                        target_image_paths: List[str], 
                        create_gif: bool = False, 
                        output_format: str = "png", 
                        quality: int = 95, 
                        progress_callback: Optional[Callable[[int], None]] = None) -> List[Dict]:
        """Vymění obličej ze zdrojového obrázku na více cílových. Batch swapping, ksichty v masovce! 📚"""
        if not Path(source_image_path).exists():
            logger.error("❗ Zdrojový obrázek nenalezen! Kde je ten hlavní ksicht? 🖼️")
            return [{"image": None, "message": "❗ Zdrojový obrázek nenalezen!"}]
        if not target_image_paths:
            logger.error("❗ Žádné cílové obrázky! Batch je prázdný jako hospoda o páté ráno! 🍺")
            return [{"image": None, "message": "❗ Žádné cílové obrázky!"}]

        results = []
        total_images = len(target_image_paths)
        
        for i, target_image_path in enumerate(target_image_paths):
            if not Path(target_image_path).exists():
                logger.error(f"❗ Cílový obrázek {target_image_path} nenalezen! Přeskakuju...")
                results.append({"image": None, "message": f"❗ Obrázek {target_image_path} nenalezen!"})
                continue
            
            # Vlastní callback pro batch
            def batch_progress(step: int):
                if progress_callback:
                    progress = int((i / total_images) * 100 + (step / total_images))
                    progress_callback(min(progress, 100))  # Omezení na 100%
            
            result = self.swap_faces(
                source_image_path=source_image_path,
                target_image_path=target_image_path,
                create_gif=create_gif,
                output_format=output_format,
                quality=quality,
                progress_callback=batch_progress
            )
            results.append(result)
        
        logger.info(f"✅ Batch zpracován: {len(results)} obrázků, zdrojový obličej vyměněn")
        return results

if __name__ == "__main__":
    # Testovací kód, ať vidíme, jak to mění ksichty! 😎
    swapper = FaceSwapper()
    source_image = "source_face.jpg"
    target_images = ["target_face1.jpg", "target_face2.jpg"]
    
    # Test jednoho obrázku
    result = swapper.swap_faces(
        source_image_path=source_image,
        target_image_path=target_images[0],
        create_gif=True,
        output_format="png",
        quality=90,
        progress_callback=lambda x: print(f"Progress: {x}%")
    )
    print(result["message"])
    
    # Test batch processing
    results = swapper.swap_batch_faces(
        source_image_path=source_image,
        target_image_paths=target_images,
        create_gif=False,
        output_format="jpg",
        quality=95,
        progress_callback=lambda x: print(f"Batch Progress: {x}%")
    )
    for res in results:
        print(res["message"])