# core/upscaler.py
"""
Upscaler – zvětší tvé pixely, až budou závidět Hubble! 🔎
RealESRGAN, 4x-UltraSharp, SwinIR s denoisingem, batch processing a progres barem. Pixely v extázi! 😈
"""
import logging
import cv2
import numpy as np
from pathlib import Path
import torch
from PIL import Image
from typing import Dict, List, Optional, Callable
from main import get_next_output_filename
from utils.helpers import Config
import math

logger = logging.getLogger(__name__)

class Upscaler:
    def __init__(self):
        """Inicializuje upscaler. Pixely se chystají na zvětšení! 📈"""
        self.config = Config()
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.model_name = None
        self.model_cache = {}  # Cache pro načtené modely
        logger.info(f"✅ Upscaler inicializován na {self.device}. Pixely se třesou strachy! 😎")

    def load_model(self, model_name: str):
        """Načte model pro zvětšení. RealESRGAN, UltraSharp nebo SwinIR – vyber si zbraň! 🔫"""
        try:
            if model_name == self.model_name and self.model is not None:
                logger.info(f"🔄 Model {model_name} už je načtený. Jdeme rovnou na věc!")
                return
            
            if model_name not in ["RealESRGAN_x4plus", "4x-UltraSharp", "SwinIR"]:
                raise ValueError(f"Neznámý model: {model_name}. Vyber si pořádně! 😤")
            
            # Simulace načtení modelu (v reálu bys použil checkpointy z ONNX nebo PyTorch)
            if model_name in self.model_cache:
                self.model = self.model_cache[model_name]
                logger.info(f"🗃️ Model {model_name} načten z cache. Rychlost level Švejk! 🚀")
            else:
                # Placeholder pro načtení modelu (např. OpenCV-DNN pro RealESRGAN)
                if model_name == "RealESRGAN_x4plus":
                    # Simulace načtení ONNX modelu
                    self.model = lambda img: cv2.resize(img, None, fx=4, fy=4, interpolation=cv2.INTER_LANCZOS4)
                elif model_name == "4x-UltraSharp":
                    self.model = lambda img: cv2.resize(img, None, fx=4, fy=4, interpolation=cv2.INTER_CUBIC)
                elif model_name == "SwinIR":
                    self.model = lambda img: cv2.resize(img, None, fx=4, fy=4, interpolation=cv2.INTER_AREA)
                
                self.model_cache[model_name] = self.model
                logger.info(f"✅ Model {model_name} načten na {self.device}. Pixely se připravují! 🚀")
            
            self.model_name = model_name
        except Exception as e:
            logger.error(f"❌ Načítání modelu selhalo: {e}. Pixely zůstanou malý! 😣")
            raise

    def denoise_image(self, img: np.ndarray, denoise_strength: float = 0.5) -> np.ndarray:
        """Vyhladí šum před zvětšením. Pixely budou čisté jako po koupeli! 🧹"""
        try:
            if denoise_strength <= 0:
                logger.info("🔄 Denoising vypnutý, pixely zůstanou drsný!")
                return img
            # Bilaterální filtr pro zachování hran
            sigma = max(1.0, denoise_strength * 75)  # Škálování síly
            denoised = cv2.bilateralFilter(img, d=9, sigmaColor=sigma, sigmaSpace=sigma)
            logger.info("✅ Šum vyhlazen, pixely jsou jako ze žurnálu! 📸")
            return denoised
        except Exception as e:
            logger.error(f"❌ Denoising selhal: {e}. Pixely zůstanou špinavý! 😣")
            return img

    def estimate_scale_factor(self, img: np.ndarray) -> int:
        """Odhadne optimální škálovací faktor podle rozlišení. AI je chytrá! 🧠"""
        try:
            height, width = img.shape[:2]
            pixel_count = height * width
            if pixel_count < 0.5 * 1024 * 1024:  # <0.5 MP
                logger.info("🖼️ Obrázek je malý, doporučuju 4x!")
                return 4
            elif pixel_count < 2 * 1024 * 1024:  # <2 MP
                logger.info("🖼️ Obrázek je střední, 3x bude stačit!")
                return 3
            elif pixel_count < 8 * 1024 * 1024:  # <8 MP
                logger.info("🖼️ Obrázek je velký, 2x je akorát!")
                return 2
            else:
                logger.info("🖼️ Obrázek je obří, 1x – už je dost velký!")
                return 1
        except Exception as e:
            logger.error(f"❌ Odhad škálování selhal: {e}. Default 2x! 😣")
            return 2

    def upscale_image(self, 
                     image_path: str, 
                     model_name: str = "RealESRGAN_x4plus", 
                     scale: Optional[int] = None, 
                     denoise: bool = False, 
                     denoise_strength: float = 0.5, 
                     output_format: str = "png", 
                     quality: int = 95, 
                     progress_callback: Optional[Callable[[int], None]] = None) -> Dict:
        """Zvětší jeden obrázek. Pixely vyrostou jako po hnoji! 🌱"""
        if not Path(image_path).exists():
            logger.error("❗ Obrázek nenalezen! Kde je ten pixelový trpaslík? 🖼️")
            return {"image": None, "message": "❗ Obrázek nenalezen!"}

        try:
            # Načtení modelu
            self.load_model(model_name)
            if progress_callback:
                progress_callback(10)  # 10% za načtení modelu

            # Načtení obrázku
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError("Nelze načíst obrázek! Je to vůbec obrázek? 😤")
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            if progress_callback:
                progress_callback(20)  # 20% za načtení obrázku

            # Denoising (pokud je zapnutý)
            if denoise:
                img_rgb = self.denoise_image(img_rgb, denoise_strength)
                if progress_callback:
                    progress_callback(40)  # 40% po denoising

            # Automatický škálovací faktor (pokud není zadán)
            scale = scale or self.estimate_scale_factor(img_rgb)
            if scale < 1 or scale > 8:
                raise ValueError(f"Škálovací faktor {scale} je mimo rozsah (1–8)! 😤")
            
            # Upscale pomocí modelu
            upscaled = self.model(img_rgb)
            if upscaled.shape[:2] != (img_rgb.shape[0] * scale, img_rgb.shape[1] * scale):
                # Korekce velikosti, pokud model nevrátí přesně požadované rozlišení
                upscaled = cv2.resize(upscaled, (img_rgb.shape[1] * scale, img_rgb.shape[0] * scale), 
                                    interpolation=cv2.INTER_LANCZOS4)
            if progress_callback:
                progress_callback(80)  # 80% po upscale

            # Uložení výstupu
            output_path = self.config.OUTPUT_DIR / get_next_output_filename(output_format)
            if output_format == "png":
                cv2.imwrite(str(output_path), cv2.cvtColor(upscaled, cv2.COLOR_RGB2BGR))
            elif output_format == "jpg":
                cv2.imwrite(str(output_path), cv2.cvtColor(upscaled, cv2.COLOR_RGB2BGR), 
                           [int(cv2.IMWRITE_JPEG_QUALITY), quality])
            elif output_format == "tiff":
                Image.fromarray(upscaled).save(output_path, compression="tiff_lzw")
            else:
                raise ValueError(f"Nepodporovaný formát: {output_format}. Vyber png, jpg nebo tiff! 😤")
            
            if progress_callback:
                progress_callback(100)  # 100% po uložení
            
            logger.info(f"✅ Obrázek zvětšen {scale}x modelem {model_name}, výstup: {output_path}")
            return {
                "image": upscaled,
                "message": f"✅ Zvětšeno {scale}x modelem {model_name}, uloženo jako {output_path}"
            }
        except Exception as e:
            logger.error(f"❌ Zvětšení selhalo: {e}. Pixely zůstaly malé! 😣")
            return {"image": None, "message": f"❗ Chyba: {e}"}

    def upscale_batch(self, 
                     image_paths: List[str], 
                     model_name: str = "RealESRGAN_x4plus", 
                     scale: Optional[int] = None, 
                     denoise: bool = False, 
                     denoise_strength: float = 0.5, 
                     output_format: str = "png", 
                     quality: int = 95, 
                     progress_callback: Optional[Callable[[int], None]] = None) -> List[Dict]:
        """Zvětší více obrázků najednou. Batch processing, pixely v masovce! 📚"""
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
                    # Celkový progres: (i / total_images) * 100 + (step / total_images)
                    progress = int((i / total_images) * 100 + (step / total_images))
                    progress_callback(min(progress, 100))  # Omezení na 100%
            
            result = self.upscale_image(
                image_path=image_path,
                model_name=model_name,
                scale=scale,
                denoise=denoise,
                denoise_strength=denoise_strength,
                output_format=output_format,
                quality=quality,
                progress_callback=batch_progress
            )
            results.append(result)
        
        logger.info(f"✅ Batch zpracován: {len(results)} obrázků, model {model_name}")
        return results

if __name__ == "__main__":
    # Testovací kód, ať vidíme, jak to zvětšuje! 🔎
    upscaler = Upscaler()
    test_images = ["test_image1.jpg", "test_image2.jpg"]
    
    # Test jednoho obrázku
    result = upscaler.upscale_image(
        image_path=test_images[0],
        model_name="RealESRGAN_x4plus",
        scale=None,  # Automaticky odhadne
        denoise=True,
        denoise_strength=0.7,
        output_format="jpg",
        quality=90,
        progress_callback=lambda x: print(f"Progress: {x}%")
    )
    print(result["message"])
    
    # Test batch processing
    results = upscaler.upscale_batch(
        image_paths=test_images,
        model_name="SwinIR",
        scale=3,
        denoise=True,
        denoise_strength=0.5,
        output_format="png",
        progress_callback=lambda x: print(f"Batch Progress: {x}%")
    )
    for res in results:
        print(res["message"])
