import sys
import os
import logging
import locale
import threading
from pathlib import Path
from datetime import datetime
from gui.layout import create_gui
from utils.helpers import Config

# Nastavení UTF-8, ať se neposereme s kódováním
if sys.platform == "win32":
    os.system("chcp 65001")
    try:
        locale.setlocale(locale.LC_ALL, 'cs_CZ.UTF-8')
    except locale.Error:
        locale.setlocale(locale.LC_ALL, '')
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# Logování – protože bez záznamu je to jen chaos
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    encoding='utf-8',
    handlers=[
        logging.FileHandler("logs/app.log", encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Globální čítač pro výstupní soubory – žádné přepisování, jen pořádek!
output_counter = 0
counter_lock = threading.Lock()

def get_next_output_filename(extension="png"):
    """Vrátí další název souboru typu output0001.png. Bez chaosu!"""
    global output_counter
    with counter_lock:
        output_counter += 1
        return f"output{output_counter:04d}.{extension}"

def main():
    """Hlavní funkce – rozjede to mašinu, ať Švejk závidí! 🚂"""
    config = Config()
    try:
        logger.info("🔥 Spouštím AI peklo... Připravte se na pixelovou apokalypsu! 😈")
        app = create_gui()
        app.launch(
            inbrowser=True,
            server_name="0.0.0.0",
            server_port=7860,
            max_threads=10,
            queue_max_size=100
        )
        logger.info("✅ Studio běží na http://0.0.0.0:7860. Jdi tvořit, nebo zemři! 💀")
    except Exception as e:
        logger.error(f"💥 Mašina se rozsypala: {e}. To je masakr, kámo! 😣")
        raise

if __name__ == "__main__":
    main()