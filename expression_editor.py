# core/expression_editor.py
"""
ExpressionEditor – změní tvůj ksicht, až se nepoznáš! 😜
RetinaFace detekuje obličej, GAN mění výraz. Úsměv, smutek nebo překvapení? Vyber si! 😈
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

class ExpressionEditor:
    def __init__(self):
        """Inicializuje editor výrazů. Obličeje se budou měnit jako nálady Švejka! 😎"""
        self.config = Config()
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.retinaface = RetinaFaceDetector()
        self.expression_model = None
        self.load_expression_model()
        logger.info(f"✅ ExpressionEditor inicializován na {self.device}. Ksichty se třesou! 😈")

    def load_expression_model(self):
        """Načte GAN model pro úpravu výrazů. Pixely se chystají na proměnu! 🎭"""
        try:
            # Placeholder pro načtení GAN modelu (např. StarGAN nebo podobný)
            self.expression_model = lambda img, expr, intensity: self._simulate_expression_change(img, expr, intensity)
            logger.info("✅ GAN model načten. Výrazy se budou měnit jako v divadle! 🎬")
        except Exception as e:
            logger.error(f"❌ Načítání GAN modelu selhalo: {e}. Ksichty zůstanou stejný! 😣")
            raise

    def _simulate_expression_change(self, img: np.ndarray, expression: str, intensity: float) -> np.ndarray:
        """Simuluje změnu výrazu. V reálu by tady byl GAN! 😜"""
        try:
            # Simulace změny výrazu úpravou jasu/kontrastu (placeholder)
            if expression == "smile":
                img = cv2.convertScaleAbs(img, alpha=1.1, beta=10 * intensity)
            elif expression == "sad":
                img = cv2.convertScaleAbs(img, alpha=0.9, beta=-10 * intensity)
            elif expression == "surprise":
                img = cv2.convertScaleAbs(img, alpha=1.2, beta=20 * intensity)
            elif expression == "angry":
                img = cv2.convertScaleAbs(img, alpha=1.0, beta=-20 * intensity)
            elif expression == "neutral":
                img = img  # Bez změny
            else:
                raise ValueError(f"Neznámý výraz: {expression}. Vyber smile, sad, surprise, angry nebo neutral! 😤")
            return img
        except Exception as e:
            logger.error(f"❌ Simulace výrazu selhala: {e}. Obličej zůstane bez výrazu! 😣")
            return img

    def detect_face(self, img: np.ndarray) -> Optional[Dict]:
        """Detekuje obličej a klíčové body pomocí RetinaFace. Sherlock by záviděl! 🕵️‍♂️"""
        try:
            faces = self.retinaface.detect(img)
            if not faces:
                logger.warning("⚠️ Žádný obličej nenalezen! Je to vůbec člověk? 👽")
                return None
            # Vyber první obličej (v reálu bys mohl zpracovat více)
            face = faces[0]
            logger.info("✅ Obličej nalezen. Klíčové body jsou naše! 😎")
            return face
        except Exception as e:
            logger.error(f"❌ Detekce obličeje selhala: {e}. Obličej se schoval! 😣")
            return None

    def edit_expression(self, 
                       image_path: str, 
                       expression: str = "smile", 
                       intensity: float = 0.5, 
                       create_gif: bool = False, 
                       output_format: str = "png", 
                       progress_callback: Optional[Callable[[int], None]] = None) -> Dict:
        """Upraví výraz na obrázku. Ksicht se změní jako po třech panácích! 🍻"""
        if not Path(image_path).exists():
            logger.error("❗ Obrázek nenalezen! Kde je ten ksicht na úpravu? 🖼️")
            return {"image": None, "message": "❗ Obrázek nenalezen!"}

        try:
            # Načtení obrázku
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError("Nelze načíst obrázek! Je to vůbec obrázek? 😤")
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            if progress_callback:
                progress_callback(10)  # 10% za načtení

            # Detekce obličeje
            face = self.detect_face(img_rgb)
            if not face:
                return {"image": None, "message": "❗ Žádný obličej nenalezen!"}
            if progress_callback:
                progress_callback(30)  # 30% po detekci

            # Úprava výrazu
            if intensity < 0 or intensity > 1:
                raise ValueError(f"Intenzita {intensity} je mimo rozsah (0–1)! 😤")
            edited_img = self._simulate_expression_change(img_rgb, expression, intensity)
            if progress_callback:
                progress_callback(70)  # 70% po úpravě výrazu

            # Uložení výstupu
            output_path = self.config.OUTPUT_DIR / get_next_output_filename(output_format)
            if create_gif:
                # Vytvoření animace přechodu
                gif_path = self.config.OUTPUT_DIR / get_next_output_filename("gif")
                self._create_transition_gif(img_rgb, edited_img, gif_path)
                logger.info(f"✅ Animace přechodu uložena: {gif_path}")
                output_path = gif_path
            else:
                if output_format == "png":
                    cv2.imwrite(str(output_path), cv2.cvtColor(edited_img, cv2.COLOR_RGB2BGR))
                elif output_format == "jpg":
                    cv2.imwrite(str(output_path), cv2.cvtColor(edited_img, cv2.COLOR_RGB2BGR), 
                               [int(cv2.IMWRITE_JPEG_QUALITY), 95])
                else:
                    raise ValueError(f"Nepodporovaný formát: {output_format}. Vyber png nebo jpg! 😤")
            
            if progress_callback:
                progress_callback(100)  # 100% po uložení
            
            logger.info(f"✅ Výraz změněn na {expression} (intenzita {intensity}), výstup: {output_path}")
            return {
                "image": edited_img,
                "message": f"✅ Výraz změněn na {expression}, uloženo jako {output_path}"
            }
        except Exception as e:
            logger.error(f"❌ Úprava výrazu selhala: {e}. Ksicht zůstal stejný! 😣")
            return {"image": None, "message": f"❗ Chyba: {e}"}

    def _create_transition_gif(self, original_img: np.ndarray, edited_img: np.ndarray, output_path: Path):
        """Vytvoří GIF s plynulým přechodem mezi výrazy. Divadlo v pixelech! 🎬"""
        try:
            frames = []
            num_frames = 10
            for i in range(num_frames):
                alpha = i / (num_frames - 1)
                blended = cv2.addWeighted(original_img, 1 - alpha, edited_img, alpha, 0.0)
                frames.append(Image.fromarray(blended))
            
            frames[0].save(output_path, save_all=True, append_images=frames[1:], duration=100, loop=0)
            logger.info(f"✅ GIF vytvořen: {output_path}")
        except Exception as e:
            logger.error(f"❌ Vytvoření GIFu selhalo: {e}. Žádná animace! 😣")

    def edit_batch_expressions(self, 
                              image_paths: List[str], 
                              expression: str = "smile", 
                              intensity: float = 0.5, 
                              create_gif: bool = False, 
                              output_format: str = "png", 
                              progress_callback: Optional[Callable[[int], None]] = None) -> List[Dict]:
        """Upraví výrazy na více obrázcích. Batch processing, ksichty v masovce! 📚"""
        if not image_paths:
            logger.error("❗ Žádné obrázky! Batch je prázdný jako hospoda o páté ráno! 🍺")
            return [{"image": None, "message": "❗ Žádné obrázky k zpracování!"}]

        results = []
        total_images = len(image_paths)
        
        for i, image_path in enumerate(image_paths):
            if not Path(image_path).exists():
                logger.error(f"❗ Obrázek {image_path} nenalezen! Přeskakuju...")
                results.append({"image": None, "message": f"❗ Obrázek {image_path} nenalezen!"})
                continue
            
            # Vlastní callback pro batch
            def batch_progress(step: int):
                if progress_callback:
                    progress = int((i / total_images) * 100 + (step / total_images))
                    progress_callback(min(progress, 100))  # Omezení na 100%
            
            result = self.edit_expression(
                image_path=image_path,
                expression=expression,
                intensity=intensity,
                create_gif=create_gif,
                output_format=output_format,
                progress_callback=batch_progress
            )
            results.append(result)
        
        logger.info(f"✅ Batch zpracován: {len(results)} obrázků, výraz {expression}")
        return results

if __name__ == "__main__":
    # Testovací kód, ať vidíme, jak to mění ksichty! 😜
    editor = ExpressionEditor()
    test_images = ["test_face1.jpg", "test_face2.jpg"]
    
    # Test jednoho obrázku
    result = editor.edit_expression(
        image_path=test_images[0],
        expression="smile",
        intensity=0.7,
        create_gif=True,
        output_format="png",
        progress_callback=lambda x: print(f"Progress: {x}%")
    )
    print(result["message"])
    
    # Test batch processing
    results = editor.edit_batch_expressions(
        image_paths=test_images,
        expression="sad",
        intensity=0.5,
        create_gif=False,
        output_format="jpg",
        progress_callback=lambda x: print(f"Batch Progress: {x}%")
    )
    for res in results:
        print(res["message"])