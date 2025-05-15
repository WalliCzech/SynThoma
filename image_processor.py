# core/image_processor.py
"""
ImageProcessor – promění tvé obrázky, jako bys byl Picasso na steroidech! 🎨
Filtry, umělecké efekty, AI vylepšení a batch processing. Pixely brečí štěstím! 😈
"""
import logging
import cv2
import numpy as np
from pathlib import Path
from PIL import Image
from typing import Dict, List, Optional, Callable, Tuple
from main import get_next_output_filename
from utils.helpers import Config

logger = logging.getLogger(__name__)

class ImageProcessor:
    def __init__(self):
        """Inicializuje procesor obrázků. Pixely se chystají na proměnu! 🖌️"""
        self.config = Config()
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.history = []  # Historie aplikovaných filtrů
        logger.info(f"✅ ImageProcessor inicializován na {self.device}. Pixely jsou v pohotovosti! 😎")

    def apply_basic_filter(self, img: np.ndarray, filter_type: str, value: float) -> np.ndarray:
        """Aplikuje základní filtr (jas, kontrast, ostrost, saturace). Pixely se třesou! 🔧"""
        try:
            if filter_type == "brightness":
                img = cv2.convertScaleAbs(img, beta=value * 100)
            elif filter_type == "contrast":
                img = cv2.convertScaleAbs(img, alpha=1 + value)
            elif filter_type == "sharpness":
                kernel = np.array([[0, -value, 0], [-value, 1 + 4 * value, -value], [0, -value, 0]])
                img = cv2.filter2D(img, -1, kernel)
            elif filter_type == "saturation":
                hsv = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)
                hsv[:, :, 1] = np.clip(hsv[:, :, 1] * (1 + value), 0, 255).astype(np.uint8)
                img = cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)
            else:
                raise ValueError(f"Neznámý filtr: {filter_type}. Vyber brightness, contrast, sharpness nebo saturation! 😤")
            return img
        except Exception as e:
            logger.error(f"❌ Aplikace filtru {filter_type} selhala: {e}. Pixely zůstanou nudný! 😣")
            return img

    def apply_artistic_filter(self, img: np.ndarray, filter_type: str) -> np.ndarray:
        """Aplikuje umělecký filtr (kresba, akvarel, olejomalba). Pixely se mění v umění! 🎨"""
        try:
            if filter_type == "sketch":
                gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
                inv = cv2.bitwise_not(gray)
                blurred = cv2.GaussianBlur(inv, (21, 21), 0)
                img = cv2.divide(gray, 255 - blurred, scale=256)
                img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
            elif filter_type == "watercolor":
                img = cv2.stylization(img, sigma_s=60, sigma_r=0.6)
            elif filter_type == "oil_painting":
                img = cv2.xphoto.oilPainting(img, size=7, dynRatio=1)
            else:
                raise ValueError(f"Neznámý umělecký filtr: {filter_type}. Vyber sketch, watercolor nebo oil_painting! 😤")
            return img
        except Exception as e:
            logger.error(f"❌ Aplikace uměleckého filtru {filter_type} selhala: {e}. Pixely nejsou umělci! 😣")
            return img

    def auto_enhance(self, img: np.ndarray) -> np.ndarray:
        """Automaticky vylepší obrázek. AI dělá kouzla! 🧠"""
        try:
            # Simulace AI vylepšení: optimalizace jasu, kontrastu a saturace
            lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            l = clahe.apply(l)
            lab = cv2.merge((l, a, b))
            img = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
            img = cv2.convertScaleAbs(img, alpha=1.1, beta=10)  # Jemný kontrast a jas
            logger.info("✅ Obrázek automaticky vylepšen. Pixely září jako po pivu! 🍺")
            return img
        except Exception as e:
            logger.error(f"❌ Automatické vylepšení selhalo: {e}. Pixely zůstanou fádní! 😣")
            return img

    def process_image(self, 
                     image_path: str, 
                     filters: List[Tuple[str, Optional[float]]], 
                     auto_enhance: bool = False, 
                     output_format: str = "png", 
                     quality: int = 95, 
                     progress_callback: Optional[Callable[[int], None]] = None) -> Dict:
        """Zpracuje jeden obrázek s danými filtry. Pixely se mění jako v kaleidoskopu! 🌈"""
        if not Path(image_path).exists():
            logger.error("❗ Obrázek nenalezen! Kde je ten pixelový poklad? 🖼️")
            return {"image": None, "message": "❗ Obrázek nenalezen!"}

        try:
            # Načtení obrázku
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError("Nelze načíst obrázek! Je to vůbec obrázek? 😤")
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            if progress_callback:
                progress_callback(10)  # 10% za načtení

            # Automatické vylepšení (pokud je zapnuto)
            if auto_enhance:
                img_rgb = self.auto_enhance(img_rgb)
                self.history.append(("auto_enhance", None))
                if progress_callback:
                    progress_callback(20)  # 20% po auto_enhance

            # Aplikace filtrů
            total_filters = len(filters)
            for i, (filter_type, value) in enumerate(filters):
                if filter_type in ["brightness", "contrast", "sharpness", "saturation"]:
                    if value is None:
                        raise ValueError(f"Filtr {filter_type} potřebuje hodnotu! 😤")
                    img_rgb = self.apply_basic_filter(img_rgb, filter_type, value)
                elif filter_type in ["sketch", "watercolor", "oil_painting"]:
                    img_rgb = self.apply_artistic_filter(img_rgb, filter_type)
                else:
                    raise ValueError(f"Neznámý filtr: {filter_type}. Čti manuál, Švejku! 😤")
                self.history.append((filter_type, value))
                if progress_callback:
                    progress_callback(20 + (i + 1) * 60 // total_filters)  # Lineární pokrok podle filtrů
            
            # Uložení výstupu
            output_path = self.config.OUTPUT_DIR / get_next_output_filename(output_format)
            if output_format == "png":
                cv2.imwrite(str(output_path), cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR))
            elif output_format == "jpg":
                cv2.imwrite(str(output_path), cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR), 
                           [int(cv2.IMWRITE_JPEG_QUALITY), quality])
            elif output_format == "tiff":
                Image.fromarray(img_rgb).save(output_path, compression="tiff_lzw")
            else:
                raise ValueError(f"Nepodporovaný formát: {output_format}. Vyber png, jpg nebo tiff! 😤")
            
            if progress_callback:
                progress_callback(100)  # 100% po uložení
            
            logger.info(f"✅ Obrázek zpracován s filtry {filters}, výstup: {output_path}")
            return {
                "image": img_rgb,
                "message": f"✅ Zpracováno s filtry {filters}, uloženo jako {output_path}",
                "history": self.history
            }
        except Exception as e:
            logger.error(f"❌ Zpracování selhalo: {e}. Pixely zůstaly netknuté! 😣")
            return {"image": None, "message": f"❗ Chyba: {e}", "history": self.history}

    def undo_last_filter(self, image_path: str, output_format: str = "png", quality: int = 95) -> Dict:
        """Vrátí poslední filtr. Pixely se vrací v čase! ⏪"""
        if not self.history:
            logger.warning("⚠️ Žádná historie! Nic k vrácení, Švejku! 😤")
            return {"image": None, "message": "❗ Žádná historie filtrů!"}

        try:
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError("Nelze načíst obrázek! Je to vůbec obrázek? 😤")
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Odstranění posledního filtru z historie
            self.history.pop()
            
            # Znovu aplikovat všechny zbývající filtry
            temp_filters = [(f, v) for f, v in self.history if f != "auto_enhance"]
            auto_enhance = any(f == "auto_enhance" for f, _ in self.history)
            result = self.process_image(image_path, temp_filters, auto_enhance, output_format, quality)
            
            logger.info(f"✅ Poslední filtr vrácen, nový výstup: {result['message']}")
            return result
        except Exception as e:
            logger.error(f"❌ Vrácení filtru selhalo: {e}. Pixely jsou tvrdohlavý! 😣")
            return {"image": None, "message": f"❗ Chyba: {e}", "history": self.history}

    def process_batch(self, 
                     image_paths: List[str], 
                     filters: List[Tuple[str, Optional[float]]], 
                     auto_enhance: bool = False, 
                     output_format: str = "png", 
                     quality: int = 95, 
                     progress_callback: Optional[Callable[[int], None]] = None) -> List[Dict]:
        """Zpracuje více obrázků najednou. Batch processing, pixely v masovce! 📚"""
        if not image_paths:
            logger.error("❗ Žádné obrázky! Batch je prázdný jako hospoda o páté ráno! 🍺")
            return [{"image": None, "message": "❗ Žádné obrázky k zpracování!"}]

        results = []
        total_images = len(image_paths)
        self.history = []  # Reset historie pro batch
        
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
            
            result = self.process_image(
                image_path=image_path,
                filters=filters,
                auto_enhance=auto_enhance,
                output_format=output_format,
                quality=quality,
                progress_callback=batch_progress
            )
            results.append(result)
            self.history = []  # Reset historie po každém obrázku
        
        logger.info(f"✅ Batch zpracován: {len(results)} obrázků, filtry {filters}")
        return results

if __name__ == "__main__":
    # Testovací kód, ať vidíme, jak to mění obrázky! 🖌️
    processor = ImageProcessor()
    test_images = ["test_image1.jpg", "test_image2.jpg"]
    test_filters = [("brightness", 0.2), ("contrast", 0.3), ("watercolor", None)]
    
    # Test jednoho obrázku
    result = processor.process_image(
        image_path=test_images[0],
        filters=test_filters,
        auto_enhance=True,
        output_format="jpg",
        quality=90,
        progress_callback=lambda x: print(f"Progress: {x}%")
    )
    print(result["message"])
    
    # Test vrácení filtru
    undo_result = processor.undo_last_filter(test_images[0], output_format="png")
    print(undo_result["message"])
    
    # Test batch processing
    results = processor.process_batch(
        image_paths=test_images,
        filters=[("sketch", None)],
        auto_enhance=False,
        output_format="png",
        progress_callback=lambda x: print(f"Batch Progress: {x}%")
    )
    for res in results:
        print(res["message"])