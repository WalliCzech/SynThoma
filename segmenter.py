# core/segmenter.py
"""
Segmenter – rozseká pozadí jako Švejk svíčkovou! ✂️
SAM a Grounding DINO v akci, ať pixely brečí! 😈
"""
import logging
from typing import Dict
from pathlib import Path
import numpy as np
import cv2
from PIL import Image
import torch
from segment_anything import sam_model_registry, SamAutomaticMaskGenerator
from groundingdino_model import build_groundingdino
from utils.helpers import Config
from main import get_next_output_filename

logger = logging.getLogger(__name__)

class Segmenter:
    def __init__(self, use_grounding_dino: bool = False):
        """Inicializuje segmenter. Pozadí půjde pod nůž! ✂️"""
        self.config = Config()
        self.sam = None
        self.grounding_dino = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.load_sam()
        if use_grounding_dino:
            self.load_grounding_dino()
        else:
            logger.warning("⚠️ Grounding DINO je vypnutý, SAM to zvládne sám! 😎")
        
    def load_sam(self):
        """Načte SAM model. Řeže pozadí jako profík! 🔪"""
        try:
            sam_checkpoint = Path("C:/wAllICzech/ai_models/Segmentation/sam_vit_h_4b8939.pth")
            if not sam_checkpoint.exists():
                raise FileNotFoundError(f"SAM checkpoint nenalezen: {sam_checkpoint}")
            model_type = "vit_h"
            sam = sam_model_registry[model_type](checkpoint=str(sam_checkpoint))
            sam.to(device=self.device)
            self.sam = SamAutomaticMaskGenerator(sam)
            logger.info("✅ SAM model načten. Pozadí nemá šanci! 😈")
        except Exception as e:
            logger.error(f"❌ SAM se zasekl: {e}. Segmentace bez SAM je jak pivo bez pěny! 🍺")
            raise

    def load_grounding_dino(self):
        """Načte Grounding DINO pro přesnější detekci. Sherlock by záviděl! 🕵️‍♂️"""
        try:
            self.grounding_dino = build_groundingdino()
            logger.info("✅ Grounding DINO načten. Detekce na steroidech! 💪")
        except Exception as e:
            logger.error(f"❌ Grounding DINO selhal: {e}. Jdeme bez něj, ale bude to divočina! 🌪️")
            self.grounding_dino = None

    def text_guided_segmentation(self, image_path: str, text_prompt: str) -> Dict:
        """Segmentuje obrázek podle textového popisu. Pozadí pryč, nebo brečí! 😭"""
        if not Path(image_path).exists():
            logger.error("❗ Obrázek nenalezen! Kde je ten pixelový poklad? 🖼️")
            return {"image": None, "message": "❗ Obrázek nenalezen!"}

        try:
            # Načtení obrázku
            img = cv2.imread(image_path)
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Pokud je Grounding DINO zapnutý, použijeme ho pro detekci
            if self.grounding_dino and text_prompt:
                logger.info(f"🔍 Grounding DINO hledá: {text_prompt}")
                boxes, confidences, labels = self.grounding_dino.predict(img_rgb, text_prompt)
                if not boxes:
                    logger.warning("⚠️ Grounding DINO nic nenašel. SAM to zachrání! 🦸‍♂️")
                    masks = self.sam.generate(img_rgb)
                else:
                    # Převod boxů na masky přes SAM
                    masks = []
                    for box in boxes:
                        mask = self.sam.generate_from_box(img_rgb, box)
                        masks.append(mask)
            else:
                # Bez Grounding DINO použijeme jen SAM
                logger.info("🔧 SAM jede sám, žádné fancy detekce!")
                masks = self.sam.generate(img_rgb)

            if not masks:
                logger.warning("⚠️ Žádné masky! Možná je obrázek jen černá díra? 🌌")
                return {"image": img_rgb, "message": "❗ Žádné masky nenalezeny!"}

            # Kombinace masek do jedné
            combined_mask = np.zeros_like(img_rgb[:, :, 0])
            for mask in masks:
                combined_mask = np.logical_or(combined_mask, mask["segmentation"]).astype(np.uint8)
            
            # Aplikace masky na obrázek (odstranění pozadí)
            result = img_rgb.copy()
            result[combined_mask == 0] = 0  # Černé pozadí
            
            output_path = self.config.OUTPUT_DIR / get_next_output_filename("png")
            cv2.imwrite(str(output_path), cv2.cvtColor(result, cv2.COLOR_RGB2BGR))
            logger.info(f"✅ Segmentace hotova, výstup: {output_path}")
            return {
                "image": result,
                "message": f"✅ Pozadí odstraněno, uloženo jako {output_path}"
            }

        except Exception as e:
            logger.error(f"❌ Segmentace selhala: {e}. Pixely se vzbouřily! 😣")
            return {"image": None, "message": f"❗ Chyba: {e}"}

    def blur_background(self, image_path: str, output_path: str, blur_strength: int = 21) -> None:
        """Rozmaže pozadí jako po třech panácích. Vše blurry, žádná ostrost! 🍻"""
        if not Path(image_path).exists():
            logger.error("❗ Obrázek nenalezen! Kde je ten pixelový poklad? 🖼️")
            return

        try:
            # Načtení obrázku
            img = cv2.imread(image_path)
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Generování masek přes SAM
            masks = self.sam.generate(img_rgb)
            if not masks:
                logger.warning("⚠️ Žádné masky! Obrázek je asi prázdný jako hospoda o půlnoci! 🍺")
                cv2.imwrite(output_path, img)
                return

            # Kombinace masek
            combined_mask = np.zeros_like(img_rgb[:, :, 0])
            for mask in masks:
                combined_mask = np.logical_or(combined_mask, mask["segmentation"]).astype(np.uint8)
            
            # Rozmazání pozadí
            blurred = cv2.GaussianBlur(img_rgb, (blur_strength, blur_strength), 0)
            result = img_rgb.copy()
            result[combined_mask == 0] = blurred[combined_mask == 0]
            
            # Uložení výstupu
            cv2.imwrite(output_path, cv2.cvtColor(result, cv2.COLOR_RGB2BGR))
            logger.info(f"✅ Pozadí rozmazáno, výstup: {output_path}")
        
        except Exception as e:
            logger.error(f"❌ Rozmazání selhalo: {e}. Pixely jsou pořád ostré! 😣")
            cv2.imwrite(output_path, cv2.imread(image_path))  # Uloží původní obrázek

if __name__ == "__main__":
    # Testovací kód, ať vidíme, jak to řeže! 🔪
    segmenter = Segmenter(use_grounding_dino=False)
    test_image = "test_image.jpg"
    result = segmenter.text_guided_segmentation(test_image, "člověk")
    print(result["message"])
    segmenter.blur_background(test_image, str(Path("output") / get_next_output_filename("png")), blur_strength=21)