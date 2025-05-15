# utils/logger.py
import logging
from pathlib import Path
from utils.helpers import Config

def setup_logger():
    """Nastaví logování do konzole a souboru. 📜"""
    config = Config()
    log_dir = config.LOG_DIR
    log_file = log_dir / "app.log"

    # Vytvoření logovacího formátu
    formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")

    # File handler
    file_handler = logging.FileHandler(log_file, encoding="utf-8")
    file_handler.setFormatter(formatter)

    # Stream handler s UTF-8
    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)
    try:
        stream_handler.stream.reconfigure(encoding="utf-8")
    except Exception:
        pass  # Fallback pro starší Python

    # Základní konfigurace
    logging.basicConfig(
        level=logging.INFO,
        handlers=[file_handler, stream_handler]
    )
    logger = logging.getLogger(__name__)
    logger.info("📜 Logování nastaveno. Připraven zachytit všechny Švejkovy kousky!")
    return logger
