# core/sdxl_runner.py
"""
SDXLRunner – promění tvé textové sny v pixelové mistrovství! 🖌️
Stable Diffusion XL generuje obrázky, až ti spadne čelist. Negativní prompty a batch jako bonus! 😈
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
import random
import time

logger = logging.getLogger(__name__)

class SDXLRunner:
    def __init__(self):
        """Inicializuje SDXL runner. Pixely se chystají na generování! 🎨"""
        self.config = Config()
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.load_model()
        logger.info(f"✅ SDXLRunner inicializován na {self.device}. Prompty se třesou nedočkavostí! 😎")

    def load_model(self):
        """Načte Stable Diffusion XL model. Pixely se připravují na umění! 🖼️"""
        try:
            # Placeholder pro načtení SDXL modelu (v reálu bys použil diffusers nebo ONNX)
            self.model = lambda prompt, neg_prompt, cfg, steps, seed: self._simulate_sdxl(prompt, neg_prompt, cfg, steps, seed)
            logger.info("✅ SDXL model načten. Umění se bude rodit jako pivo v pivovaru! 🍺")
        except Exception as e:
            logger.error(f"❌ Načítání modelu selhalo: {e}. Pixely zůstanou prázdné! 😣")
            raise

    def _simulate_sdxl(self, prompt: str, negative_prompt: str, cfg_scale: float, steps: int, 
                      seed: int) -> np.ndarray:
        """Simuluje generování obrázku SDXL. V reálu by tady byl skutečný model! 😜"""
        try:
            # Simulace: vytvoří barevný šum ovlivněný seed a promptem
            np.random.seed(seed)
            img = np.random.randint(0, 255, (512, 512, 3), dtype=np.uint8)
            
            # Simulace vlivu promptu a negativního promptu
            if "landscape" in prompt.lower():
                img[:, :, 1] = np.clip(img[:, :, 1] + 50, 0, 255)  # Zelenější tóny
            if "portrait" in prompt.lower():
                img[:, :, 0] = np.clip(img[:, :, 0] + 30, 0, 255)  # Teplejší tóny
            if negative_prompt and "blurry" in negative_prompt.lower():
                img = cv2.GaussianBlur(img, (5, 5), 0)  # Dodatečné zaostření
            return img
        except Exception as e:
            logger.error(f"❌ Simulace SDXL selhala: {e}. Pixely zůstaly v chaosu! 😣")
            return np.zeros((512, 512, 3), dtype=np.uint8)

    def estimate_parameters(self, prompt: str) -> Dict:
        """Odhadne optimální parametry (cfg_scale, steps) podle složitosti promptu. AI je chytrá! 🧠"""
        try:
            word_count = len(prompt.split())
            if word_count > 20:
                logger.info("🖼️ Komplexní prompt, doporučuju vyšší cfg_scale a steps!")
                return {"cfg_scale": 9.0, "steps": 50}
            elif word_count > 10:
                logger.info("🖼️ Středně složitý prompt, standardní nastavení!")
                return {"cfg_scale": 7.5, "steps": 30}
            else:
                logger.info("🖼️ Jednoduchý prompt, rychlé nastavení!")
                return {"cfg_scale": 6.0, "steps": 20}
        except Exception as e:
            logger.error(f"❌ Odhad parametrů selhal: {e}. Default nastavení! 😣")
            return {"cfg_scale": 7.5, "steps": 30}

    def generate_image(self, 
                      prompt: str, 
                      negative_prompt: str = "", 
                      cfg_scale: Optional[float] = None, 
                      steps: Optional[int] = None, 
                      seed: Optional[int] = None, 
                      output_format: str = "png", 
                      quality: int = 95, 
                      progress_callback: Optional[Callable[[int], None]] = None) -> Dict:
        """Vygeneruje jeden obrázek podle promptu. Pixely se mění v umění! 🌌"""
        if not prompt:
            logger.error("❗ Prompt je prázdný! Co mám malovat, Švejku? 🖌️")
            return {"image": None, "message": "❗ Prompt je prázdný!"}

        try:
            # Automatické parametry, pokud nejsou zadány
            if cfg_scale is None or steps is None:
                params = self.estimate_parameters(prompt)
                cfg_scale = cfg_scale or params["cfg_scale"]
                steps = steps or params["steps"]
            
            # Validace parametrů
            if cfg_scale < 1 or cfg_scale > 20:
                raise ValueError(f"cfg_scale {cfg_scale} je mimo rozsah (1–20)! 😤")
            if steps < 10 or steps > 100:
                raise ValueError(f"steps {steps} je mimo rozsah (10–100)! 😤")
            
            seed = seed or random.randint(0, 2**32 - 1)
            if progress_callback:
                progress_callback(10)  # 10% za inicializaci

            # Simulace generování
            img = self.model(prompt, negative_prompt, cfg_scale, steps, seed)
            if progress_callback:
                progress_callback(80)  # 80% po generování

            # Uložení výstupu
            output_path = self.config.OUTPUT_DIR / get_next_output_filename(output_format)
            if output_format == "png":
                cv2.imwrite(str(output_path), cv2.cvtColor(img, cv2.COLOR_RGB2BGR))
            elif output_format == "jpg":
                cv2.imwrite(str(output_path), cv2.cvtColor(img, cv2.COLOR_RGB2BGR), 
                           [int(cv2.IMWRITE_JPEG_QUALITY), quality])
            else:
                raise ValueError(f"Nepodporovaný formát: {output_format}. Vyber png nebo jpg! 😤")
            
            if progress_callback:
                progress_callback(100)  # 100% po uložení
            
            logger.info(f"✅ Obrázek vygenerován s promptem '{prompt}', výstup: {output_path}")
            return {
                "image": img,
                "message": f"✅ Vygenerováno s promptem '{prompt}', uloženo jako {output_path}",
                "seed": seed
            }
        except Exception as e:
            logger.error(f"❌ Generování selhalo: {e}. Pixely zůstaly prázdné! 😣")
            return {"image": None, "message": f"❗ Chyba: {e}"}

    def generate_batch_images(self, 
                             prompt: str, 
                             negative_prompt: str = "", 
                             cfg_scale: Optional[float] = None, 
                             steps: Optional[int] = None, 
                             num_images: int = 1, 
                             seed: Optional[int] = None, 
                             output_format: str = "png", 
                             quality: int = 95, 
                             progress_callback: Optional[Callable[[int], None]] = None) -> List[Dict]:
        """Vygeneruje více obrázků s různými seed hodnotami. Batch generování, pixely v masovce! 📚"""
        if not prompt:
            logger.error("❗ Prompt je prázdný! Co mám malovat, Švejku? 🖌️")
            return [{"image": None, "message": "❗ Prompt je prázdný!"}]
        if num_images < 1:
            logger.error("❗ Počet obrázků musí být alespoň 1! 😤")
            return [{"image": None, "message": "❗ Neplatný počet obrázků!"}]

        results = []
        total_images = num_images
        seed = seed or random.randint(0, 2**32 - 1)
        
        for i in range(num_images):
            current_seed = seed + i
            # Vlastní callback pro batch
            def batch_progress(step: int):
                if progress_callback:
                    progress = int((i / total_images) * 100 + (step / total_images))
                    progress_callback(min(progress, 100))  # Omezení na 100%
            
            result = self.generate_image(
                prompt=prompt,
                negative_prompt=negative_prompt,
                cfg_scale=cfg_scale,
                steps=steps,
                seed=current_seed,
                output_format=output_format,
                quality=quality,
                progress_callback=batch_progress
            )
            results.append(result)
        
        logger.info(f"✅ Batch zpracován: {len(results)} obrázků, prompt '{prompt}'")
        return results

if __name__ == "__main__":
    # Testovací kód, ať vidíme, jak to generuje! 🖌️
    runner = SDXLRunner()
    test_prompt = "A futuristic city at sunset, cyberpunk style"
    test_negative_prompt = "blurry, low quality"
    
    # Test jednoho obrázku
    result = runner.generate_image(
        prompt=test_prompt,
        negative_prompt=test_negative_prompt,
        cfg_scale=None,  # Automaticky odhadne
        steps=None,
        seed=42,
        output_format="png",
        quality=90,
        progress_callback=lambda x: print(f"Progress: {x}%")
    )
    print(result["message"])
    
    # Test batch generování
    results = runner.generate_batch_images(
        prompt=test_prompt,
        negative_prompt=test_negative_prompt,
        num_images=3,
        output_format="jpg",
        quality=95,
        progress_callback=lambda x: print(f"Batch Progress: {x}%")
    )
    for res in results:
        print(res["message"])
