import torch
from pathlib import Path
from utils.helpers import Config
from tools.retinaface.retinaface import RetinaFace
from tools.retinaface.retinaface_utils import cfg_re50
import threading
import logging

logger = logging.getLogger(__name__)

class AsyncModelLoader:
    """Asynchronní načítání modelů."""
    def __init__(self):
        self.model = None
        self.lock = threading.Lock()
        self.loading_thread = None

    def load_retinaface_model(self, model_path: str, device: str = "cpu"):
        """Spustí načítání modelu v samostatném vlákně."""
        model_path = Path(model_path)
        if not model_path.exists():
            raise FileNotFoundError(f"Soubor modelu {model_path} neexistuje.")

        def load_model():
            logger.info(f"⏳ Načítám RetinaFace model: {model_path}")
            model = detection_Resnet50_Final(network_name='resnet50', phase='test')
            checkpoint = torch.load(str(model_path), map_location=device)
            if isinstance(checkpoint, dict) and 'state_dict' in checkpoint:
                model.load_state_dict(checkpoint['state_dict'], strict=False)
            else:
                model.load_state_dict(checkpoint, strict=False)
            model.to(device)
            model.eval()
            with self.lock:
                self.model = model
            logger.info(f"✅ Model {model_path} načten!")

        self.loading_thread = threading.Thread(target=load_model)
        self.loading_thread.start()

    def get_model(self, timeout: float = 30.0) -> torch.nn.Module:
        """Vrátí načtený model nebo čeká na dokončení načítání."""
        if self.loading_thread:
            self.loading_thread.join(timeout)
        with self.lock:
            if self.model is None:
                raise RuntimeError("Model není načten! Švejk asi zapomněl spustit načítání.")
            return self.model
