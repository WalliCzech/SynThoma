# core/flux_runner.py
"""
FluxRunner – promění tvé textové fantazie v pixelové orgie! 🚀
Flux.1 od Black Forest Labs trhá SDXL na kusy. Animované variace a chytré prompty v ceně! 😈
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
import imageio

logger = logging.getLogger(__name__)

class FluxRunner:
    def __init__(self):
        """Inicializuje Flux.1 runner. Pixely se chystají na revoluci! 🎨"""
        self.config = Config()
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.load_model()
        logger.info(f"✅ FluxRunner inicializován na {self.device}. Prompty se třesou strachy! 😎")

    def load_model(self):
        """Načte Flux.1 model. Pixely se připravují na next-gen umění! 🖼️"""
        try:
            # Placeholder pro načtení Flux.1 modelu (v reálu bys použil diffusers nebo custom pipeline)
            self.model = lambda prompt, neg_prompt, cfg, steps, seed, aspect_ratio: self._simulate_flux(
                prompt, neg_prompt, cfg, steps, seed, aspect_ratio)
            logger.info("✅ Flux.1 model načten. Umění se bude rodit jako knedlíky v kuchyni! 🥟")
        except Exception as e:
            logger.error(f"❌ Načítání modelu selhalo: {e}. Pixely zůstanou prázdné! 😣")
            raise

    def _simulate_flux(self, prompt: str, negative_prompt: str, cfg_scale: float, steps: int, 
                      seed: int, aspect_ratio: tuple) -> np.ndarray:
        """Simuluje generování obrázku Flux.1. V reálu by tady byl skutečný model! 😜"""
        try:
            # Simulace: vytvoří barevný šum ovlivněný seed, promptem a aspect ratio
            np.random.seed(seed)
            width, height = self._get_dimensions(aspect_ratio)
            img = np.random.randint(0, 255, (height, width, 3), dtype=np.uint8)
            
            # Simulace vlivu promptu a negativního promptu
            if "cyberpunk" in prompt.lower():
                img[:, :, 2] = np.clip(img[:, :, 2] + 50, 0, 255)  # Modrofialové tóny
            if "realistic" in prompt.lower():
                img = cv2.GaussianBlur(img, (3, 3), 0)  # Jemnější detaily
            if negative_prompt and "dark" in negative_prompt.lower():
                img = cv2.convertScaleAbs(img, beta=50)  # Světlejší tóny
            return img
        except Exception as e:
            logger.error(f"❌ Simulace Flux.1 selhala: {e}. Pixely zůstaly v chaosu! 😣")
            return np.zeros((512, 512, 3), dtype=np.uint8)

    def _get_dimensions(self, aspect_ratio: tuple) -> tuple:
        """Vypočítá rozměry podle poměru stran. Pixely se řadí do formátu! 📏"""
        try:
            ar_width, ar_height = aspect_ratio
            if ar_width <= 0 or ar_height <= 0:
                raise ValueError("Poměr stran musí být kladný! 😤")
            base_size = 512
            if ar_width / ar_height > 1:
                width = base_size
                height = int(base_size * ar_height / ar_width)
            else:
                height = base_size
                width = int(base_size * ar_width / ar_height)
            return width, height
        except Exception as e:
            logger.error(f"❌ Výpočet rozměrů selhal: {e}. Default 512x512! 😣")
            return 512, 512

    def analyze_prompt(self, prompt: str) -> Dict:
        """Analyzuje prompt a navrhne styl a poměr stran. AI je chytřejší než Švejk! 🧠"""
        try:
            prompt_lower = prompt.lower()
            style = "general"
            aspect_ratio = (1, 1)  # Default 1:1
            if "landscape" in prompt_lower or "scenery" in prompt_lower:
                style = "landscape"
                aspect_ratio = (16, 9)
            elif "portrait" in prompt_lower or "person" in prompt_lower:
                style = "portrait"
                aspect_ratio = (3, 4)
            elif "cyberpunk" in prompt_lower or "sci-fi" in prompt_lower:
                style = "cyberpunk"
                aspect_ratio = (21, 9)
            logger.info(f"🖼️ Prompt analyzován: styl '{style}', poměr stran {aspect_ratio}")
            return {"style": style, "aspect_ratio": aspect_ratio}
        except Exception as e:
            logger.error(f"❌ Analýza promptu selhala: {e}. Default styl a 1:1! 😣")
            return {"style": "general", "aspect_ratio": (1, 1)}

    def generate_image(self, 
                      prompt: str, 
                      negative_prompt: str = "", 
                      cfg_scale: Optional[float] = 7.5, 
                      steps: Optional[int] = 30, 
                      seed: Optional[int] = None, 
                      aspect_ratio: Optional[tuple] = None, 
                      output_format: str = "png", 
                      quality: int = 95, 
                      progress_callback: Optional[Callable[[int], None]] = None) -> Dict:
        """Vygeneruje jeden obrázek podle promptu. Pixely se mění v umělecký oheň! 🔥"""
        if not prompt:
            logger.error("❗ Prompt je prázdný! Co mám malovat, Švejku? 🖌️")
            return {"image": None, "message": "❗ Prompt je prázdný!"}

        try:
            # Automatická analýza promptu, pokud není zadán aspect ratio
            if aspect_ratio is None:
                aspect_ratio = self.analyze_prompt(prompt)["aspect_ratio"]
            
            # Validace parametrů
            if cfg_scale < 1 or cfg_scale > 20:
                raise ValueError(f"cfg_scale {cfg_scale} je mimo rozsah (1–20)! 😤")
            if steps < 10 or steps > 100:
                raise ValueError(f"steps {steps} je mimo rozsah (10–100)! 😤")
            
            seed = seed or random.randint(0, 2**32 - 1)
            if progress_callback:
                progress_callback(10)  # 10% za inicializaci

            # Generování obrázku
            img = self.model(prompt, negative_prompt, cfg_scale, steps, seed, aspect_ratio)
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

    def generate_animated_variations(self, 
                                    prompt: str, 
                                    negative_prompt: str = "", 
                                    cfg_scale: float = 7.5, 
                                    steps: int = 30, 
                                    seed: Optional[int] = None, 
                                    aspect_ratio: Optional[tuple] = None, 
                                    num_frames: int = 5, 
                                    output_format: str = "gif", 
                                    progress_callback: Optional[Callable[[int], None]] = None) -> Dict:
        """Vytvoří animované variace obrázku jako GIF. Pixely tančí! 🎬"""
        if not prompt:
            logger.error("❗ Prompt je prázdný! Co mám animovat, Švejku? 🖌️")
            return {"image": None, "message": "❗ Prompt je prázdný!"}

        try:
            seed = seed or random.randint(0, 2**32 - 1)
            frames = []
            for i in range(num_frames):
                current_seed = seed + i
                result = self.generate_image(
                    prompt=prompt,
                    negative_prompt=negative_prompt,
                    cfg_scale=cfg_scale,
                    steps=steps,
                    seed=current_seed,
                    aspect_ratio=aspect_ratio,
                    output_format="png",  # Dočasně PNG pro frames
                    progress_callback=lambda x: progress_callback(
                        int((i / num_frames) * 100 + (x / num_frames)) if progress_callback else None)
                )
                if result["image"] is None:
                    raise ValueError("Generování framu selhalo! 😤")
                frames.append(Image.fromarray(result["image"]))
            
            output_path = self.config.OUTPUT_DIR / get_next_output_filename("gif")
            frames[0].save(output_path, save_all=True, append_images=frames[1:], duration=200, loop=0)
            
            logger.info(f"✅ Animované variace vytvořeny, výstup: {output_path}")
            return {
                "image": None,  # GIF není numpy array
                "message": f"✅ Animované variace uloženy jako {output_path}",
                "seed": seed
            }
        except Exception as e:
            logger.error(f"❌ Vytvoření animace selhalo: {e}. Pixely netančí! 😣")
            return {"image": None, "message": f"❗ Chyba: {e}"}

    def generate_batch_images(self, 
                             prompt: str, 
                             negative_prompt: str = "", 
                             cfg_scale: float = 7.5, 
                             steps: int = 30, 
                             num_images: int = 1, 
                             seed: Optional[int] = None, 
                             aspect_ratio: Optional[tuple] = None, 
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
            def batch_progress(step: int):
                if progress_callback:
                    progress = int((i / total_images) * 100 + (step / total_images))
                    progress_callback(min(progress, 100))
            
            result = self.generate_image(
                prompt=prompt,
                negative_prompt=negative_prompt,
                cfg_scale=cfg_scale,
                steps=steps,
                seed=current_seed,
                aspect_ratio=aspect_ratio,
                output_format=output_format,
                quality=quality,
                progress_callback=batch_progress
            )
            results.append(result)
        
        logger.info(f"✅ Batch zpracován: {len(results)} obrázků, prompt '{prompt}'")
        return results

if __name__ == "__main__":
    # Testovací kód, ať vidíme, jak to generuje! 🖌️
    runner = FluxRunner()
    test_prompt = "A cyberpunk cityscape at night, neon lights, realistic"
    test_negative_prompt = "blurry, dark, low quality"
    
    # Test jednoho obrázku
    result = runner.generate_image(
        prompt=test_prompt,
        negative_prompt=test_negative_prompt,
        cfg_scale=7.5,
        steps=30,
        seed=42,
        aspect_ratio=(16, 9),
        output_format="png",
        quality=90,
        progress_callback=lambda x: print(f"Progress: {x}%")
    )
    print(result["message"])
    
    # Test animovaných variací
    result = runner.generate_animated_variations(
        prompt=test_prompt,
        negative_prompt=test_negative_prompt,
        num_frames=5,
        progress_callback=lambda x: print(f"Animation Progress: {x}%")
    )
    print(result["message"])
    
    # Test batch generování
    results = runner.generate_batch_images(
        prompt=test_prompt,
        negative_prompt=test_negative_prompt,
        num_images=3,
        aspect_ratio=(1, 1),
        output_format="jpg",
        quality=95,
        progress_callback=lambda x: print(f"Batch Progress: {x}%")
    )
    for res in results:
        print(res["message"])
