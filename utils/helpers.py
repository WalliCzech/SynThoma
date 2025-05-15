# utils/helpers.py
import logging
from pathlib import Path
import yaml

logger = logging.getLogger(__name__)

class Config:
    """Konfigurační třída pro wAllICzech. ⚙️"""
    BASE_DIR = Path("C:/wAllICzech")
    MODEL_DIR = BASE_DIR / "ai_models"
    OUTPUT_DIR = BASE_DIR / "output"
    LOG_DIR = BASE_DIR / "logs"
    TOOLS_DIR = BASE_DIR / "tools"
    PRESETS_DIR = BASE_DIR / "presets"
    PROJECTS_DIR = BASE_DIR / "projects"
    SERVER_HOST = "0.0.0.0"
    SERVER_PORT = 7860

    def __init__(self, config_path: str = "C:/wAllICzech/config.yaml"):
        """Načte konfiguraci z YAML souboru."""
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                self.config = yaml.safe_load(f) or {}
        except FileNotFoundError:
            logger.error(f"❌ Konfigurační soubor {config_path} nenalezen! Švejk ho asi zapomněl!")
            raise
        except Exception as e:
            logger.error(f"❌ Chyba při načítání konfigurace: {e}. Konfigurace je v prdeli!")
            raise

        # Kontrola povinných klíčů
        required_keys = ["base_dir", "paths", "server"]
        for key in required_keys:
            if key not in self.config:
                logger.error(f"❌ Chybí klíč '{key}' v config.yaml! Bez něj to nejde!")
                raise KeyError(f"Chybí klíč '{key}' v config.yaml")

        # Nastavení cest podle konfigurace
        self.BASE_DIR = Path(self.config["base_dir"])
        self.MODEL_DIR = self.BASE_DIR / self.config["paths"]["models_dir"]
        self.OUTPUT_DIR = self.BASE_DIR / self.config["paths"]["output_dir"]
        self.LOG_DIR = self.BASE_DIR / self.config["paths"]["logs_dir"]
        self.TOOLS_DIR = self.BASE_DIR / self.config["paths"]["tools_dir"]
        self.PRESETS_DIR = self.BASE_DIR / self.config["paths"]["presets_dir"]
        self.PROJECTS_DIR = self.BASE_DIR / self.config["paths"]["projects_dir"]
        self.SERVER_HOST = self.config["server"].get("host", "0.0.0.0")
        self.SERVER_PORT = self.config["server"].get("port", 7860)

    @staticmethod
    def ensure_dirs():
        """Vytvoří potřebné složky, pokud neexistují. 📁"""
        directories = [
            Config.OUTPUT_DIR,
            Config.LOG_DIR,
            Config.MODEL_DIR,
            Config.TOOLS_DIR,
            Config.PRESETS_DIR,
            Config.PROJECTS_DIR,
            Config.OUTPUT_DIR / "lipsynced",
            Config.OUTPUT_DIR / "segmentation",
            Config.OUTPUT_DIR / "forensic",
            Config.OUTPUT_DIR / "faceswap",
            Config.OUTPUT_DIR / "upscaled",
            Config.OUTPUT_DIR / "expression",
            Config.OUTPUT_DIR / "stylized"
        ]
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
        logger.info("📁 Všechny složky připraveny jako Švejk před výplatou!")

    def get_model_path(self, model_name: str) -> str:
        """Vrátí absolutní cestu k modelu. 🔍"""
        model_path = self.MODEL_DIR / model_name
        if not model_path.exists():
            logger.error(f"❌ Model nenalezen: {model_path}. Kde jsi ho schoval, Švejku?!")
            raise FileNotFoundError(f"Model nenalezen: {model_path}")
        return str(model_path)
