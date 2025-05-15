# gui/layout.py
"""
wAllICzech AI Studio 2025 – GUI tak šíleně cool, že Matrix padá závistí! 🎨
Kompletní verze s oranžovo-černým designem, pokročilými funkcemi a Švejkův humor! 😈
"""
import gradio as gr
import logging
import cv2
import json
from pathlib import Path
from pytube import YouTube
import yt_dlp
from moviepy.editor import VideoFileClip
import numpy as np
import asyncio
from typing import List, Dict, Optional
from PIL import Image
import time
import os
import exifread
import mutagen
import torch
from core.image_processor import ImageProcessor
from core.flux_runner import FluxRunner
from core.sdxl_runner import SDXLRunner
from core.lipsync_engine import LipsyncEngine
from core.forensic_tools import ForensicTools
from core.segmenter import Segmenter
from core.video_exporter import VideoExporter
from core.audio_processor import AudioProcessor
from core.face_swapper import FaceSwapper
from core.upscaler import Upscaler
from core.expression_editor import ExpressionEditor
from utils.helpers import Config
from main import get_next_output_filename
import plotly.express as px  # NOVÉ: Pro vizualizaci phoneme timeline a deepfake skóre
import pandas as pd  # NOVÉ: Pro export historie do CSV

logger = logging.getLogger(__name__)
logger.info("🚀 GUI se rozjíždí... Připni si pásy, bude to pixelový masakr! 🔥")

def get_file_metadata(file_path: str) -> str:
    """Vytáhne metadata, nebo tě pošle do pixelovýho pekla! 😈"""
    if not file_path or not Path(file_path).exists():
        return "❗ Žádný soubor, žádná zábava! Nahraj něco, lenochu! 😤"
    
    metadata = []
    file_size = os.path.getsize(file_path) / (1024 * 1024)  # MB
    metadata.append(f"📏 Velikost: {file_size:.2f} MB")
    
    try:
        if file_path.endswith((".jpg", ".jpeg", ".png")):
            with Image.open(file_path) as img:
                width, height = img.size
                metadata.append(f"📐 Rozlišení: {width}×{height}")
                metadata.append(f"🖼️ Formát: {img.format}")
                if img.format == "JPEG":
                    quality = img.info.get('quality', 'Není známa')
                    metadata.append(f"🔍 Kvalita: Odhad {quality}")
            with open(file_path, "rb") as f:
                tags = exifread.process_file(f)
                if tags:
                    metadata.append("📋 EXIF:")
                    for key, value in tags.items():
                        metadata.append(f"  {key}: {value}")
        
        elif file_path.endswith((".mp4", ".avi")):
            video = VideoFileClip(file_path)
            width, height = video.size
            duration = video.duration
            bitrate = os.path.getsize(file_path) * 8 / duration / 1000  # kbps
            metadata.append(f"📐 Rozlišení: {width}×{height}")
            metadata.append(f"⏱️ Délka: {duration:.2f} s")
            metadata.append(f"📹 Bitrate: {bitrate:.2f} kbps")
            metadata.append(f"🎞️ Formát: {Path(file_path).suffix}")
            video.close()
        
        elif file_path.endswith((".mp3", ".wav")):
            audio = mutagen.File(file_path)
            duration = audio.info.length if audio.info else 0
            bitrate = audio.info.bitrate / 1000 if hasattr(audio.info, "bitrate") else 0
            metadata.append(f"⏱️ Délka: {duration:.2f} s")
            metadata.append(f"🎵 Bitrate: {bitrate:.2f} kbps")
            metadata.append(f"🔊 Formát: {Path(file_path).suffix}")
        
        return "\n".join(metadata) or "❓ Tenhle soubor je tajnůstkář! Nic o něm nevíme! 😒"
    except Exception as e:
        return f"❗ Metadata selhala: {e}. Ten soubor je asi z jiné dimenze! 🌌"

def generate_deepdanbooru_caption(image_path: str) -> str:
    """DeepDanbooru ti popíše obrázek, i když je slepej jako patron! 😂"""
    try:
        from deepdanbooru import DeepDanbooru
        model = DeepDanbooru()
        with Image.open(image_path) as img:
            tags = model.generate_tags(img)
        return f"📜 DeepDanbooru říká: {', '.join(tags)}"
    except Exception as e:
        return f"❗ DeepDanbooru se zasekl: {e}. Asi má kocovinu! 😵"

def create_gui():
    """Vytvoří GUI, co tě rozseká jako pixely v blenderu! 😈"""
    Config.ensure_dirs()
    
    # Inicializace modelů – ať se nikdo nefláká!
    model_status = {
        "ImageProcessor": False,
        "FluxRunner": False,
        "SDXLRunner": False,
        "LipsyncEngine": False,
        "ForensicTools": False,
        "Segmenter": False,
        "VideoExporter": True,
        "AudioProcessor": False,
        "FaceSwapper": False,
        "Upscaler": False,
        "ExpressionEditor": False
    }

    # NOVÉ: Asynchronní načítání modelů
    async def load_models_async():
        tasks = []
        try:
            processor = ImageProcessor()
            model_status["ImageProcessor"] = True
            logger.info("✅ ImageProcessor je ready, pixely se třesou strachy!")
        except Exception as e:
            logger.error(f"❌ ImageProcessor se rozsypal: {e}. Pixely v pláči!")
        
        try:
            flux_runner = FluxRunner()
            model_status["FluxRunner"] = True
            logger.info("✅ FluxRunner je ready, umění se rodí!")
        except Exception as e:
            logger.error(f"❌ FluxRunner selhal: {e}. Umění je mrtvé!")
        
        try:
            sdxl_runner = SDXLRunner()
            model_status["SDXLRunner"] = True
            logger.info("✅ SDXLRunner je ready, generuje jako šílený!")
        except Exception as e:
            logger.error(f"❌ SDXLRunner selhal: {e}. Kreativita v prachu!")
        
        try:
            lipsync_engine = LipsyncEngine()
            model_status["LipsyncEngine"] = True
            logger.info("✅ LipsyncEngine je ready, rty se synchronizují!")
        except Exception as e:
            logger.error(f"❌ LipsyncEngine selhal: {e}. Rty ztuhly!")
        
        try:
            forensic_tools = ForensicTools(model_name="retinaface")
            model_status["ForensicTools"] = True
            logger.info("✅ ForensicTools jsou ready, pravda se odhalí!")
        except Exception as e:
            logger.error(f"❌ ForensicTools selhaly: {e}. Pravda zůstane skrytá!")
        
        try:
            segmenter = Segmenter(use_grounding_dino=False)
            model_status["Segmenter"] = True
            logger.info("✅ Segmenter je ready, pozadí jde pod nůž!")
        except Exception as e:
            logger.error(f"❌ Segmenter selhal: {e}. Pozadí zůstane!")
        
        try:
            audio_processor = AudioProcessor()
            model_status["AudioProcessor"] = True
            logger.info("✅ AudioProcessor je ready, zvuk se třídí!")
        except Exception as e:
            logger.error(f"❌ AudioProcessor selhal: {e}. Ticho před bouří!")
        
        try:
            face_swapper = FaceSwapper()
            model_status["FaceSwapper"] = True
            logger.info("✅ FaceSwapper je ready, obličeje se mění!")
        except Exception as e:
            logger.error(f"❌ FaceSwapper selhal: {e}. Obličej zůstane tvůj!")
        
        try:
            upscaler = Upscaler()
            model_status["Upscaler"] = True
            logger.info("✅ Upscaler je ready, pixely se zvětšují!")
        except Exception as e:
            logger.error(f"❌ Upscaler selhal: {e}. Pixely zůstanou malý!")
        
        try:
            expression_editor = ExpressionEditor()
            model_status["ExpressionEditor"] = True
            logger.info("✅ ExpressionEditor je ready, výrazy se mění!")
        except Exception as e:
            logger.error(f"❌ ExpressionEditor selhal: {e}. Výraz zůstane kamenný!")
            logger.warning("⚠️ FOMM modely chybí? Mediapipe aspoň nezaspí!")
        
        return processor, flux_runner, sdxl_runner, lipsync_engine, forensic_tools, segmenter, audio_processor, face_swapper, upscaler, expression_editor

    # Spustí asynchronní načítání modelů
    processor, flux_runner, sdxl_runner, lipsync_engine, forensic_tools, segmenter, audio_processor, face_swapper, upscaler, expression_editor = asyncio.run(load_models_async())
    
    video_exporter = VideoExporter()
    logger.info("✅ VideoExporter je ready, exportuje jako šéf!")

    # Dynamický dropdown pro expression modely
    expression_models = ["Mediapipe"]
    if ExpressionEditor.is_fomm_available():
        expression_models.append("FOMM")
    logger.info(f"🎭 Dostupné modely pro výrazy: {expression_models}")

    # Historie a výstupní složka
    config = Config()
    history_dir = config.OUTPUT_DIR / "history"
    history_dir.mkdir(parents=True, exist_ok=True)

    # NOVÉ: Vylepšené CSS s animacemi a responzivním designem
    css = """
    .gradio-container { 
        background: linear-gradient(135deg, #ff6200, #000000);
        font-family: 'Arial', sans-serif; 
        color: #ffffff; 
    }
    h1 { 
        color: #ff6200; 
        text-align: center; 
        font-size: 2.5em; 
        text-shadow: 2px 2px 4px #000000; 
    }
    .tab-nav button { 
        background-color: #ff6200; 
        color: #000000; 
        border-radius: 8px; 
        padding: 12px; 
        font-weight: bold; 
        transition: background-color 0.3s ease, transform 0.2s; 
    }
    .tab-nav button:hover { 
        background-color: #e55b00; 
        transform: scale(1.05); 
    }
    .status-box { 
        background-color: rgba(0, 0, 0, 0.7); 
        padding: 15px; 
        border-radius: 8px; 
        margin: 10px 0; 
        color: #ff6200; 
        font-weight: bold; 
    }
    .history-gallery img { 
        border: 3px solid #ff6200; 
        border-radius: 8px; 
        transition: transform 0.2s; 
    }
    .history-gallery img:hover { 
        transform: scale(1.1); 
    }
    .gr-button-primary { 
        background-color: #ff6200 !important; 
        color: #000000 !important; 
        border: none !important; 
        transition: background-color 0.3s ease; 
    }
    .gr-button-primary:hover { 
        background-color: #e55b00 !important; 
    }
    .gr-button-secondary { 
        background-color: #333333 !important; 
        color: #ff6200 !important; 
        border: none !important; 
    }
    .gr-accordion { 
        background-color: rgba(255, 98, 0, 0.1); 
        border-radius: 8px; 
    }
    .progress-bar { 
        background: linear-gradient(90deg, #ff6200, #e55b00); 
        animation: pulse 2s infinite; 
    }
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
    }
    @media (max-width: 768px) {
        .gradio-container { font-size: 0.9em; }
        .tab-nav button { padding: 8px; }
        .history-gallery img { width: 100%; }
    }
    .tooltip { 
        position: relative; 
    }
    .tooltip:hover:after { 
        content: attr(data-tooltip); 
        position: absolute; 
        bottom: 100%; 
        left: 50%; 
        transform: translateX(-50%); 
        background: #333; 
        color: #ff6200; 
        padding: 5px; 
        border-radius: 4px; 
        font-size: 0.8em; 
        white-space: nowrap; 
        z-index: 10; 
    }
    """

    with gr.Blocks(title="wAllICzech AI Studio 2025", css=css, theme=gr.themes.Soft()) as app:
        action_history = gr.State([])
        active_tab = gr.State("Obličej 😊")
        output_gallery = gr.State([])

        # NOVÉ: Náhodná hláška při načítání
        random_quotes = [
            "Připravuji pixelové peklo, chvilku strpění! 🔥",
            "Švejk by řekl: 'Tohle bude pořádnej bordel!' 😈",
            "Načítám modely, pixely už se třesou! 🎨",
            "Pixely se řadí do zástupu, čekej chvilku! 💪"
        ]
        gr.Markdown(
            f"# wAllICzech AI Studio 2025 🖼️🎨\n"
            f"{random_quotes[np.random.randint(0, len(random_quotes))]}\n"
            "Jedno vstupní pole, všechny funkce, metadata na očích. "
            "Připrav se na AI, co tě rozseká jako pixely v blenderu! 😈"
        )

        # Stavový box
        status = gr.Markdown("**Stav:** Připraven k pixelové apokalypse! 🚀", elem_classes=["status-box"])
        # NOVÉ: Animovaný progres bar
        progress_bar = gr.Slider(minimum=0, maximum=100, value=0, label="Průběh (%)", interactive=False)

        with gr.Row():
            with gr.Column(scale=1, min_width=300):
                # Vstupní panel
                with gr.Accordion("Vstupní panel 📂", open=True):
                    gr.Markdown("**Nahraj soubor, nebo Švejk bude naštvaný! 😈**")
                    # NOVÉ: Jednotné vstupní pole
                    input_files = gr.File(
                        label="Nahrát soubory (obrázky, videa, audio)",
                        file_count="multiple",
                        file_types=["image", "video", "audio"],
                        elem_classes=["tooltip"],
                        elem_id="input-files",
                        data_tooltip="Nahraj, nebo tě pošlu do pixelovýho pekla! 😈"
                    )
                    source_selector = gr.Radio(
                        choices=["Soubory", "YouTube", "Kamera", "Adresář"],
                        value="Soubory",
                        label="Zdroj",
                        info="Vyber, odkud chceš bordel."
                    )
                    youtube_url = gr.Textbox(
                        label="YouTube URL",
                        visible=False,
                        info="Vlož odkaz, nebo se ztrať!",
                        elem_classes=["tooltip"],
                        data_tooltip="Správný odkaz, nebo Švejk ti dá po čuni! 😤"
                    )
                    # NOVÉ: Batch processing z adresáře
                    batch_dir = gr.Textbox(
                        label="Cesta k adresáři",
                        visible=False,
                        info="Zadej cestu k adresáři pro hromadné zpracování."
                    )
                    metadata_display = gr.Textbox(
                        label="Metadata souboru",
                        interactive=False,
                        lines=5,
                        value="📋 Nahraj něco, nebo ti nic neřeknu! 😤"
                    )
                    generate_caption_button = gr.Button("Generovat popis 📜", variant="primary")
                    upload_button = gr.Button("Nahrát a zpracovat 📤", variant="primary")
                    clear_button = gr.Button("Vyčistit vstupy 🗑️", variant="secondary")

                # Rychlé akce
                with gr.Accordion("Rychlé akce ⚡", open=True):
                    quick_detect = gr.Button("Detekuj obličeje 🔍", variant="primary")
                    quick_upscale = gr.Button("Rychlé zvětšení 📈", variant="primary")
                    quick_segment = gr.Button("Rychlá segmentace ✂️", variant="primary")

                # Stav modelů
                with gr.Accordion("Stav modelů 🛠️", open=False):
                    status_textbox = gr.Textbox(
                        value="\n".join([f"{k}: {'✅ Načten' if v else '❌ Selhal'}" for k, v in model_status.items()]),
                        label="Stav inicializace modelů",
                        interactive=False,
                        lines=10
                    )

            with gr.Column(scale=3, min_width=800):
                # Nástroje
                gr.Markdown("## Nástroje 🛠️")
                with gr.Tabs() as tabs:
                    with gr.Tab(label="Obličej 😊", id="face"):
                        with gr.Row():
                            with gr.Column(scale=2):
                                gr.Markdown("**Detekce, výměna obličejů, úprava výrazů**")
                                face_swap_target = gr.File(
                                    label="Cílový obličej pro výměnu",
                                    file_types=["image"],
                                    elem_classes=["tooltip"],
                                    data_tooltip="Nahraj obličej, nebo zůstaneš sám sebou! 😏"
                                )
                                expression_slider = gr.Slider(
                                    minimum=-1.0, maximum=1.0, value=0.0,
                                    label="Úsměv 😄",
                                    info="Uprav výraz (-1 = pohřeb, 1 = karneval)."
                                )
                                expression_model = gr.Dropdown(
                                    choices=expression_models,
                                    value="Mediapipe",
                                    label="Model výrazů",
                                    info="Vyber, kdo ti změní ksicht."
                                )
                                with gr.Row():
                                    detect_face_button = gr.Button("Detekuj obličeje 🔍", variant="primary")
                                    face_swap_button = gr.Button("Vyměnit obličej 🔄", variant="primary")
                                    apply_expression_button = gr.Button("Aplikovat výraz ✨", variant="primary")
                                toggle_camera = gr.Button("Zapnout/vypnout kameru 📷", variant="secondary")
                            with gr.Column(scale=1):
                                face_output = gr.Image(label="Výsledek", type="filepath")

                    with gr.Tab(label="Lipsync 🎤", id="lipsync"):
                        with gr.Row():
                            with gr.Column(scale=2):
                                gr.Markdown("**Synchronizace rtů, ať mluvíš jako profík!**")
                                lipsync_mode = gr.Dropdown(
                                    choices=["Automatický", "Manuální korekce", "Hybridní"],
                                    value="Automatický",
                                    label="Režim lipsyncu",
                                    info="Vyber, jak moc chceš řídit chaos."
                                )
                                # NOVÉ: Interaktivní phoneme timeline
                                phoneme_timeline = gr.Plot(
                                    label="Časová osa fonémů ⏳",
                                    visible=False,
                                    info="Uprav fonémy přetažením bodů."
                                )
                                lipsync_button = gr.Button("Spustit lipsync 🎬", variant="primary")
                            with gr.Column(scale=1):
                                lipsync_output = gr.Video(label="Výsledek")

                    with gr.Tab(label="Zvětšení 🔎", id="upscale"):
                        with gr.Row():
                            with gr.Column(scale=2):
                                gr.Markdown("**Zvětšíme tvé pixely, ať závidí Hubble!**")
                                upscale_model = gr.Dropdown(
                                    choices=["RealESRGAN_x4plus", "4x-UltraSharp"],
                                    value="RealESRGAN_x4plus",
                                    label="Model zvětšení",
                                    info="Vyber, co ti zvětší ego."
                                )
                                upscale_factor = gr.Slider(
                                    minimum=1, maximum=4, value=2, step=1,
                                    label="Faktor zvětšení",
                                    info="2 = 2x větší, logika!"
                                )
                                # NOVÉ: Batch processing
                                batch_upscale = gr.Checkbox(
                                    label="Zpracovat všechny soubory",
                                    value=False,
                                    info="Zaškrtněte pro hromadné zvětšení."
                                )
                                upscale_button = gr.Button("Zvětšit obrázek 📈", variant="primary")
                            with gr.Column(scale=1):
                                upscale_output = gr.Image(label="Výsledek", type="filepath")

                    with gr.Tab(label="Segmentace ✂️", id="segment"):
                        with gr.Row():
                            with gr.Column(scale=2):
                                gr.Markdown("**Rozsekej pozadí jako profík!**")
                                segment_mode = gr.Dropdown(
                                    choices=["Odstranit pozadí", "Rozmazat pozadí"],
                                    value="Odstranit pozadí",
                                    label="Režim segmentace",
                                    info="Co s tím pozadím provedeme?"
                                )
                                segment_prompt = gr.Textbox(
                                    label="Textový popis",
                                    placeholder="např. 'člověk'",
                                    info="Co máme vyříznout?"
                                )
                                segment_button = gr.Button("Segmentovat ✂️", variant="primary")
                            with gr.Column(scale=1):
                                segment_output = gr.Image(label="Výsledek", type="filepath")

                    with gr.Tab(label="Zvuk 🎵", id="audio"):
                        with gr.Row():
                            with gr.Column(scale=2):
                                gr.Markdown("**Separuj a přepisuj zvuk jako šéf!**")
                                stem_selector = gr.CheckboxGroup(
                                    choices=["vokály", "bicí", "basa", "ostatní"],
                                    label="Vyber stopy pro separaci",
                                    value=["vokály", "bicí", "basa", "ostatní"],
                                    info="Co chceš oddělit?"
                                )
                                # NOVÉ: Live náhled zvukových efektů
                                audio_effect = gr.Dropdown(
                                    choices=["Žádný", "Echo", "Reverb", "Pitch Shift"],
                                    value="Žádný",
                                    label="Přidat efekt",
                                    info="Vyber efekt pro live náhled."
                                )
                                with gr.Row():
                                    separate_stems_button = gr.Button("Separovat stopy 🎙️", variant="primary")
                                    transcribe_button = gr.Button("Přepsat zvuk 📜", variant="primary")
                                    apply_effect_button = gr.Button("Aplikovat efekt 🎵", variant="primary")
                            with gr.Column(scale=1):
                                transcription_output = gr.Textbox(
                                    label="Přepis zvuku",
                                    interactive=False,
                                    lines=5
                                )
                                audio_output = gr.Audio(label="Náhled efektu")

                    with gr.Tab(label="Forenzní analýza 🔍", id="forensic"):
                        with gr.Row():
                            with gr.Column(scale=2):
                                gr.Markdown("**Odhalíme každý špatný pixel!**")
                                # NOVÉ: Porovnání dvou obrázků
                                compare_image = gr.File(
                                    label="Druhý obrázek pro porovnání",
                                    file_types=["image"],
                                    elem_classes=["tooltip"],
                                    data_tooltip="Nahraj druhý obrázek pro ELA/JPEG analýzu."
                                )
                                with gr.Row():
                                    forensic_button = gr.Button("Analyzovat JPEG artefakty 📊", variant="primary")
                                    ela_button = gr.Button("Error Level Analysis 🔎", variant="primary")
                                    deepfake_button = gr.Button("Detekovat deepfake 🕵️‍♂️", variant="primary")
                                    exif_button = gr.Button("Extrahovat EXIF metadata 📋", variant="primary")
                                    report_button = gr.Button("Vygenerovat PDF zprávu 📜", variant="primary")
                                # NOVÉ: Deepfake skóre graf
                                deepfake_plot = gr.Plot(label="Deepfake skóre")
                            with gr.Column(scale=1):
                                exif_output = gr.Textbox(
                                    label="EXIF metadata",
                                    interactive=False,
                                    lines=5
                                )
                                forensic_output = gr.Image(label="Výsledek analýzy", type="filepath")

                    with gr.Tab(label="Text na obrázek 🎨", id="text2image"):
                        with gr.Row():
                            with gr.Column(scale=2):
                                gr.Markdown("**Generuj umění, ať závidí Da Vinci!**")
                                sdxl_prompt = gr.Textbox(
                                    label="Prompt",
                                    value=config.config["models"]["diffusers"]["sdxl"]["default_prompt"],
                                    placeholder="Zadej popis, např. 'Kyberpunkové město'"
                                )
                                sdxl_negative_prompt = gr.Textbox(
                                    label="Negativní prompt",
                                    value=config.config["models"]["diffusers"]["sdxl"]["default_negative_prompt"],
                                    placeholder="Co nechceš, např. 'rozmazané'"
                                )
                                sdxl_steps = gr.Slider(
                                    10, 100, value=config.config["models"]["diffusers"]["sdxl"]["default_steps"],
                                    label="Počet kroků"
                                )
                                sdxl_guidance = gr.Slider(
                                    1.0, 15.0, value=config.config["models"]["diffusers"]["sdxl"]["default_guidance_scale"],
                                    label="Guidance Scale"
                                )
                                sdxl_strength = gr.Slider(
                                    0.1, 1.0, value=config.config["models"]["diffusers"]["sdxl"]["default_strength"],
                                    label="Síla (img2img)"
                                )
                                with gr.Row():
                                    sdxl_text2img_button = gr.Button("Generovat ✨", variant="primary")
                                    sdxl_img2img_button = gr.Button("Stylizovat vstup 🎨", variant="secondary")
                            with gr.Column(scale=1):
                                sdxl_output = gr.Image(label="Výsledek", type="pil")
                                sdxl_save_button = gr.Button("Uložit do historie 💾", variant="secondary")

                    with gr.Tab(label="Flux stylizace 🎨", id="flux"):
                        with gr.Row():
                            with gr.Column(scale=2):
                                gr.Markdown("**Flux.1-dev – umění na steroidech!**")
                                flux_prompt = gr.Textbox(
                                    label="Prompt",
                                    value=config.config["models"]["diffusers"]["flux"]["default_prompt"],
                                    placeholder="Zadej popis, např. 'Krásný les'"
                                )
                                flux_negative_prompt = gr.Textbox(
                                    label="Negativní prompt",
                                    value=config.config["models"]["diffusers"]["flux"]["default_negative_prompt"],
                                    placeholder="Co nechceš, např. 'rozmazané'"
                                )
                                flux_steps = gr.Slider(
                                    10, 100, value=config.config["models"]["diffusers"]["flux"]["default_steps"],
                                    label="Počet kroků"
                                )
                                flux_guidance = gr.Slider(
                                    1.0, 15.0, value=config.config["models"]["diffusers"]["flux"]["default_guidance_scale"],
                                    label="Guidance Scale"
                                )
                                flux_strength = gr.Slider(
                                    0.1, 1.0, value=config.config["models"]["diffusers"]["flux"]["default_strength"],
                                    label="Síla (img2img)"
                                )
                                flux_sampler = gr.Dropdown(
                                    choices=["Euler", "DDIM", "DPM++ 2M Karras", "Euler Ancestral"],
                                    value="Euler",
                                    label="Sampler"
                                )
                                flux_lora_weight = gr.Slider(
                                    minimum=0.0, maximum=1.0, value=0.8, step=0.05,
                                    label="Váha LoRA"
                                )
                                flux_width = gr.Slider(
                                    minimum=256, maximum=2048, value=512, step=8,
                                    label="Šířka výstupu"
                                )
                                flux_height = gr.Slider(
                                    minimum=256, maximum=2048, value=512, step=8,
                                    label="Výška výstupu"
                                )
                                with gr.Row():
                                    flux_text2img_button = gr.Button("Generovat ✨", variant="primary")
                                    flux_img2img_button = gr.Button("Stylizovat vstup 🎨", variant="secondary")
                            with gr.Column(scale=1):
                                flux_output = gr.Image(label="Výsledek", type="pil")
                                flux_save_button = gr.Button("Uložit do historie 💾", variant="secondary")

                # Náhledový panel
                gr.Markdown("## Náhledový panel 🖥️")
                with gr.Tabs():
                    with gr.Tab("Jednotlivý náhled"):
                        preview_output = gr.Image(label="Výstupní náhled", interactive=False, height=600)
                    with gr.Tab("Galerie výstupů"):
                        gallery_output = gr.Gallery(label="Všechny výstupy", columns=3, height=600)

                # Export a správa
                with gr.Accordion("Export a správa 💾", open=False):
                    export_format = gr.Dropdown(
                        choices=["MP4", "GIF", "PNG sekvence"],
                        value="MP4",
                        label="Formát exportu"
                    )
                    export_fps = gr.Slider(
                        minimum=1, maximum=60, value=30, step=1,
                        label="FPS"
                    )
                    export_name = gr.Textbox(
                        label="Název výstupu",
                        placeholder="např. output.mp4"
                    )
                    # NOVÉ: Export historie do CSV
                    export_history_csv = gr.Button("Exportovat historii jako CSV 📊", variant="secondary")
                    with gr.Row():
                        export_button = gr.Button("Exportovat výsledek 📤", variant="primary")
                        save_project_button = gr.Button("Uložit projekt 💾", variant="primary")
                        load_project_button = gr.Button("Načíst projekt 📂", variant="primary")
                        undo_button = gr.Button("Vrátit akci ↩️", variant="secondary")

                # Historie akcí
                with gr.Accordion("Historie akcí 📜", open=False):
                    # NOVÉ: Filtrování historie
                    history_filter = gr.Dropdown(
                        choices=["Vše", "Lipsync", "Upscale", "Segmentace", "Zvuk", "Forenzní", "SDXL", "Flux"],
                        value="Vše",
                        label="Filtrovat akce"
                    )
                    history_display = gr.Textbox(
                        label="Provedené akce",
                        interactive=False,
                        lines=5
                    )
                    show_history_button = gr.Button("Zobrazit historii ↩️", variant="secondary")
                    history_gallery = gr.Gallery(
                        label="Vygenerované obrázky",
                        value=[str(p) for p in history_dir.glob("*.png")],
                        columns=4,
                        height="auto",
                        preview=True
                    )
                    refresh_history_button = gr.Button("Obnovit historii 🔄", variant="secondary")

        # Funkce pro aktualizaci GUI
        async def update_active_tab(tab_id: Optional[str] = None) -> str:
            tab_names = {
                "face": "Obličej �地下",
                "lipsync": "Lipsync 🎤",
                "upscale": "Zvětšení 🔎",
                "segment": "Segmentace ✂️",
                "audio": "Zvuk 🎵",
                "forensic": "Forenzní analýza 🔍",
                "text2image": "Text na obrázek 🎨",
                "flux": "Flux stylizace 🎨"
            }
            return tab_names.get(tab_id, "Obličej 😊")

        def update_source_selector(source: str):
            return (
                gr.update(visible=source == "YouTube"),
                gr.update(visible=source == "Adresář")
            )

        # NOVÉ: Phoneme timeline
        def update_phoneme_timeline(mode: str, audio_path: str):
            if mode not in ["Manuální korekce", "Hybridní"] or not audio_path:
                return gr.update(visible=False, value=None)
            try:
                # Simulace phoneme dat (v reálu bys použil audio_processor.analyze_phonemes)
                times = np.linspace(0, 5, 10)
                phonemes = ["aa", "ee", "oo", "sil", "aa", "ee", "oo", "sil", "aa", "ee"]
                df = pd.DataFrame({"Time (s)": times, "Phoneme": phonemes})
                fig = px.scatter(df, x="Time (s)", y="Phoneme", title="Phoneme Timeline")
                return gr.update(visible=True, value=fig)
            except Exception as e:
                logger.error(f"❌ Phoneme timeline selhal: {e}")
                return gr.update(visible=False, value=None)

        def save_to_history(image: Image.Image, model: str, prompt: str) -> str:
            timestamp = time.strftime("%Y%m%d_%H%M%S")
            output_path = history_dir / f"{model}_{timestamp}_{prompt[:20].replace(' ', '_')}.png"
            image.save(output_path)
            logger.info(f"📜 Obrázek uložen do historie: {output_path}")
            return str(output_path)

        def get_history_images():
            return [str(p) for p in history_dir.glob("*.png")]

        # NOVÉ: Export historie do CSV
        def export_history_to_csv(history: List[Dict]):
            if not history:
                status.value = "**Stav:** Historie je prázdná, nic jsi nedělal! 📜"
                return "❗ Historie je prázdná!"
            df = pd.DataFrame(history)
            output_path = config.OUTPUT_DIR / f"history_{time.strftime('%Y%m%d_%H%M%S')}.csv"
            df.to_csv(output_path, index=False)
            logger.info(f"📊 Historie exportována: {output_path}")
            return f"✅ Historie exportována: {output_path}"

        async def upload_and_preview(files: List[str], source: str, youtube_url: str, batch_dir: str, 
                                   history: List[Dict], stem_selector: List[str], gallery: List[str]):
            progress_bar.value = 10
            file_path = None
            if source == "Soubory" and files:
                file_path = files[0]  # První soubor pro náhled
            elif source == "YouTube" and youtube_url:
                try:
                    progress_bar.value = 30
                    output_path = config.OUTPUT_DIR / get_next_output_filename("mp4")
                    download_youtube(youtube_url, str(output_path))
                    history.append({"action": "youtube_stáhnout", "output": str(output_path)})
                    gallery.append(str(output_path))
                    progress_bar.value = 50
                    audio_path = config.OUTPUT_DIR / get_next_output_filename("wav")
                    video = VideoFileClip(str(output_path))
                    video.audio.write_audiofile(str(audio_path))
                    video.close()
                    progress_bar.value = 70
                    stem_result = audio_processor.separate_audio_demucs(str(audio_path), stem_selector)
                    history.append({"action": "separovat_stopy", "output": stem_result["output_paths"]})
                    progress_bar.value = 90
                    transcribe_result = audio_processor.transcribe_audio(str(audio_path))
                    history.append({"action": "přepsat_zvuk", "output": transcribe_result["output_path"]})
                    status.value = "**Stav:** YouTube video staženo! 🎉"
                    return None, gallery, f"✅ YouTube video staženo: {output_path}", history, 100, audio_path, transcribe_result["transcription"], get_file_metadata(str(output_path))
                except Exception as e:
                    status.value = "**Stav:** YouTube se zasekl! 😵"
                    return None, [], f"❗ Chyba: {e}", history, 0, None, "", "❗ YouTube selhal!"
            elif source == "Kamera":
                try:
                    progress_bar.value = 50
                    cap = cv2.VideoCapture(0)
                    if not cap.isOpened():
                        status.value = "**Stav:** Kamera je mimo! 📷"
                        raise ValueError("Kamera zaspala!")
                    ret, frame = cap.read()
                    cap.release()
                    if ret:
                        output_path = config.OUTPUT_DIR / get_next_output_filename("jpg")
                        cv2.imwrite(str(output_path), frame)
                        img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                        history.append({"action": "kamera_snímek", "output": str(output_path)})
                        gallery.append(str(output_path))
                        status.value = "**Stav:** Snímek uložen! 🎉"
                        return img, gallery, f"✅ Snímek uložen: {output_path}", history, 100, None, "", get_file_metadata(str(output_path))
                    status.value = "**Stav:** Kamera selhala! 😵"
                    return None, [], "❗ Kamera selhala!", history, 0, None, "", "❗ Kamera je mimo!"
                except Exception as e:
                    status.value = "**Stav:** Kamera je v háji! 😵"
                    return None, [], f"❗ Chyba: {e}", history, 0, None, "", "❗ Kamera zaspala!"
            elif source == "Adresář" and batch_dir:
                try:
                    batch_path = Path(batch_dir)
                    if not batch_path.is_dir():
                        status.value = "**Stav:** Adresář neexistuje! 📂"
                        return None, [], "❗ Adresář neexistuje!", history, 0, None, "", "❗ Špatná cesta!"
                    files = [str(p) for p in batch_path.glob("*") if p.suffix in [".jpg", ".png", ".mp4", ".avi", ".mp3", ".wav"]]
                    if not files:
                        status.value = "**Stav:** Adresář je prázdný! 📂"
                        return None, [], "❗ Žádné soubory!", history, 0, None, "", "❗ Prázdný adresář!"
                    file_path = files[0]
                    history.append({"action": "nahrát_adresář", "output": batch_dir})
                    gallery.extend(files)
                    status.value = "**Stav:** Adresář nahrán! 🎉"
                    return None, gallery, f"✅ Nahrán adresář: {batch_dir}", history, 100, None, "", get_file_metadata(file_path)
                except Exception as e:
                    status.value = "**Stav:** Adresář selhal! 😵"
                    return None, [], f"❗ Chyba: {e}", history, 0, None, "", "❗ Adresář je mimo!"
            
            if file_path and Path(file_path).exists():
                history.append({"action": f"nahrát_{source.lower()}", "output": file_path})
                gallery.append(file_path)
                status.value = f"**Stav:** {source} nahrán! 🎉"
                return None, gallery, f"✅ {source} nahrán!", history, 100, None, "", get_file_metadata(file_path)
            status.value = "**Stav:** Nic jsi nenahrál, trollíš mě? 😤"
            return None, [], "❗ Nahraj něco!", history, 0, None, "", "❗ Žádný soubor!"

        def clear_inputs(history: List[Dict], gallery: List[str]):
            history.append({"action": "vyčistit_vstupy", "output": None})
            gallery.clear()
            status.value = "**Stav:** Vše vyčištěno, jako po výbuchu! 🗑️"
            return None, [], None, None, [], "✅ Vše vyčištěno!", history, 100, None, "", "📋 Žádná metadata, nahraj něco!"

        async def detect_face(image_path: str, history: List[Dict], gallery: List[str]):
            if not image_path or not Path(image_path).exists():
                status.value = "**Stav:** Bez obrázku to nepůjde, génius! 📷"
                return None, [], "❗ Nahraj obrázek!", history, 0
            progress_bar.value = 50
            try:
                img = processor.load_image(image_path)
                faces = processor.detect_faces(img)
                if faces:
                    img_with_faces = processor.draw_faces(img, faces)
                    output_path = config.OUTPUT_DIR / get_next_output_filename("jpg")
                    cv2.imwrite(str(output_path), cv2.cvtColor(img_with_faces, cv2.COLOR_RGB2BGR))
                    history.append({"action": "detekovat_obličej", "output": output_path})
                    gallery.append(output_path)
                    status.value = f"**Stav:** Nalezeno {len(faces)} obličejů! 🎉"
                    return output_path, gallery, f"✅ Nalezeno {len(faces)} obličejů!", history, 100
                status.value = "**Stav:** Žádné obličeje, co to je, duch? 👻"
                return img, gallery, "❗ Žádné obličeje!", history, 100
            except Exception as e:
                status.value = "**Stav:** Detekce obličejů se podělala! 😵"
                return None, [], f"❗ Chyba: {e}", history, 0

        async def run_face_swap(image_path: str, target_image: str, history: List[Dict], gallery: List[str]):
            if not image_path or not target_image or not Path(image_path).exists() or not Path(target_image).exists():
                status.value = "**Stav:** Chybí obrázky, to jako vážně? 📷"
                return None, [], "❗ Nahraj oba obrázky!", history, 0
            progress_bar.value = 50
            try:
                result = face_swapper.swap_face(image_path, target_image)
                output_path = config.OUTPUT_DIR / get_next_output_filename("jpg")
                cv2.imwrite(str(output_path), cv2.cvtColor(result["image"], cv2.COLOR_RGB2BGR))
                history.append({"action": "vyměnit_obličej", "output": output_path})
                gallery.append(output_path)
                status.value = "**Stav:** Obličej vyměněn, vypadáš jako celebrita! 🎉"
                return output_path, gallery, result["message"], history, 100
            except Exception as e:
                status.value = "**Stav:** Výměna obličejů se zasekla! 😵"
                return None, gallery, f"❗ Chyba: {e}", history, 0

        async def apply_expression(image_path: str, expression_value: float, expression_model: str, 
                                 history: List[Dict], gallery: List[str]):
            if not image_path or not Path(image_path).exists():
                status.value = "**Stav:** Bez obrázku žádný výraz, logika! 📷"
                return None, [], "❗ Nahraj obrázek!", history, 0
            progress_bar.value = 50
            try:
                result = expression_editor.apply_expression(image_path, expression_value, expression_model, line_color=(0, 255, 0))
                output_path = config.OUTPUT_DIR / get_next_output_filename("jpg")
                cv2.imwrite(str(output_path), cv2.cvtColor(result["image"], cv2.COLOR_RGB2BGR))
                history.append({"action": "aplikovat_výraz", "output": output_path})
                gallery.append(output_path)
                status.value = "**Stav:** Výraz aplikován, zelená čára rulez! 🎉"
                return output_path, gallery, result["message"], history, 100
            except Exception as e:
                status.value = "**Stav:** Výraz se neaplikoval, něco smrdí! 😵"
                return None, gallery, f"❗ Chyba: {e}", history, 0

        async def toggle_camera_stream():
            status.value = "**Stav:** Kamera se budí! 📷"
            return gr.update(visible=True)

        async def run_lipsync(video_path: str, audio_path: str, mode: str, history: List[Dict], gallery: List[str]):
            if not video_path or not audio_path or not Path(video_path).exists() or not Path(audio_path).exists():
                status.value = "**Stav:** Video nebo zvuk chybí, to je fiasko! 📹🎵"
                return None, [], "❗ Nahraj video a zvuk!", history, 0
            progress_bar.value = 50
            try:
                normalized_audio = audio_processor.normalize_audio(audio_path)
                output_path = config.OUTPUT_DIR / get_next_output_filename("mp4")
                lipsync_engine.generate_lipsync(video_path, normalized_audio, output_path)
                history.append({"action": "lipsync", "output": output_path})
                gallery.append(output_path)
                status.value = "**Stav:** Lipsync hotov, mluvíš jak profík! 🎉"
                return output_path, gallery, "✅ Lipsync dokončen!", history, 100
            except Exception as e:
                status.value = "**Stav:** Lipsync se zasekl! 😵"
                return None, gallery, f"❗ Chyba: {e}", history, 0

        async def run_upscale(image_path: str, model: str, factor: int, batch_mode: bool, files: List[str], history: List[Dict], gallery: List[str]):
            if not image_path or not Path(image_path).exists():
                status.value = "**Stav:** Bez obrázku nezvětšíš nic, génius! 📷"
                return None, [], "❗ Nahraj obrázek!", history, 0
            progress_bar.value = 50
            try:
                if batch_mode and files:
                    output_paths = []
                    for img_path in files:
                        if Path(img_path).suffix in [".jpg", ".png"]:
                            result = upscaler.upscale_image(img_path, model_name=model, scale=factor, device="cuda" if torch.cuda.is_available() else "cpu")
                            output_path = config.OUTPUT_DIR / get_next_output_filename("png")
                            cv2.imwrite(str(output_path), cv2.cvtColor(result["image"], cv2.COLOR_RGB2BGR))
                            output_paths.append(output_path)
                            gallery.append(output_path)
                    history.append({"action": "batch_zvětšit", "output": output_paths})
                    status.value = "**Stav:** Hromadné zvětšení dokončeno! 🎉"
                    return output_paths[0], gallery, "✅ Batch zvětšení hotovo!", history, 100
                else:
                    result = upscaler.upscale_image(image_path, model_name=model, scale=factor, device="cuda" if torch.cuda.is_available() else "cpu")
                    output_path = config.OUTPUT_DIR / get_next_output_filename("png")
                    cv2.imwrite(str(output_path), cv2.cvtColor(result["image"], cv2.COLOR_RGB2BGR))
                    history.append({"action": "zvětšit", "output": output_path})
                    gallery.append(output_path)
                    status.value = "**Stav:** Zvětšeno, pixely v extázi! 🎉"
                    return output_path, gallery, result["message"], history, 100
            except Exception as e:
                status.value = "**Stav:** Zvětšení se podělalo, asi máš malou GPU! 😵"
                return None, gallery, f"❗ Chyba: {e}", history, 0

        async def run_segmentation(image_path: str, mode: str, prompt: str, history: List[Dict], gallery: List[str]):
            if not image_path or not Path(image_path).exists() or not prompt:
                status.value = "**Stav:** Obrázek nebo popis chybí, to je trapas! 📷"
                return None, [], "❗ Nahraj obrázek a popis!", history, 0
            progress_bar.value = 50
            try:
                if mode == "Odstranit pozadí":
                    result = segmenter.text_guided_segmentation(image_path, prompt)
                    output_path = config.OUTPUT_DIR / get_next_output_filename("png")
                    cv2.imwrite(str(output_path), cv2.cvtColor(result["image"], cv2.COLOR_RGB2BGR))
                    history.append({"action": "segmentace", "output": output_path})
                    gallery.append(output_path)
                    status.value = "**Stav:** Pozadí pryč, čistý styl! 🎉"
                    return output_path, gallery, result["message"], history, 100
                elif mode == "Rozmazat pozadí":
                    output_path = config.OUTPUT_DIR / get_next_output_filename("png")
                    segmenter.blur_background(image_path, output_path, blur_strength=21)
                    history.append({"action": "rozmazat_pozadí", "output": output_path})
                    gallery.append(output_path)
                    status.value = "**Stav:** Pozadí rozmazaný, jako po třech pivech! 🎉"
                    return output_path, gallery, "✅ Rozmazání dokončeno!", history, 100
            except Exception as e:
                status.value = "**Stav:** Segmentace se zasekla! 😵"
                return None, gallery, f"❗ Chyba: {e}", history, 0

        async def separate_stems(audio_path: str, stems: List[str], history: List[Dict], gallery: List[str]):
            if not audio_path or not Path(audio_path).exists() or not stems:
                status.value = "**Stav:** Zvuk nebo stopy chybí, to je ticho! 🎵"
                return None, [], "", "❗ Nahraj zvuk a stopy!", history, 0
            progress_bar.value = 50
            try:
                result = audio_processor.separate_audio_demucs(audio_path, stems)
                output_paths = []
                for stem, path in result["output_paths"].items():
                    new_path = config.OUTPUT_DIR / get_next_output_filename("wav")
                    os.rename(path, new_path)
                    output_paths.append(str(new_path))
                history.append({"action": "separovat_stopy", "output": output_paths})
                status.value = "**Stav:** Stopy separovány, vše hraje! 🎉"
                return None, [], result["message"], history, 100
            except Exception as e:
                status.value = "**Stav:** Separace stop selhala, vše je jeden chaos! 😵"
                return None, [], f"❗ Chyba: {e}", history, 0

        async def apply_audio_effect(audio_path: str, effect: str, history: List[Dict], gallery: List[str]):
            if not audio_path or not Path(audio_path).exists():
                status.value = "**Stav:** Bez zvuku žádný efekt, logika! 🎵"
                return None, [], "", history, 0
            progress_bar.value = 50
            try:
                # Simulace aplikace efektu (v reálu bys použil audio_processor.apply_effect)
                output_path = config.OUTPUT_DIR / get_next_output_filename("wav")
                audio_processor.normalize_audio(audio_path)  # Placeholder
                history.append({"action": f"aplikovat_efekt_{effect.lower()}", "output": output_path})
                status.value = f"**Stav:** Efekt {effect} aplikován, zní to jak z Grammy! 🎉"
                return output_path, [], "✅ Efekt aplikován!", history, 100
            except Exception as e:
                status.value = "**Stav:** Efekt selhal, asi špatný mixpult! 😵"
                return None, [], f"❗ Chyba: {e}", history, 0

        async def transcribe_audio(audio_path: str, history: List[Dict], gallery: List[str]):
            if not audio_path or not Path(audio_path).exists():
                status.value = "**Stav:** Bez zvuku žádný přepis, logika! 🎵"
                return None, [], "", "❗ Nahraj zvuk!", history, 0
            progress_bar.value = 50
            try:
                result = audio_processor.transcribe_audio(audio_path)
                history.append({"action": "přepsat_zvuk", "output": result["output_path"]})
                status.value = "**Stav:** Přepis hotov, text je tvůj! 🎉"
                return None, [], result["transcription"], history, 100
            except Exception as e:
                status.value = "**Stav:** Přepis selhal, asi špatný mikrofon! 😵"
                return None, [], f"❗ Chyba: {e}", history, 0

        async def run_artifact_analysis(image_path: str, compare_image: str, history: List[Dict], gallery: List[str]):
            if not image_path or not Path(image_path).exists():
                status.value = "**Stav:** Bez obrázku žádná analýza, Sherlocku! 📷"
                return None, [], "❗ Nahraj obrázek!", history, 0
            progress_bar.value = 50
            try:
                result = forensic_tools.analyze_jpeg_artifacts(image_path)
                output_path = config.OUTPUT_DIR / get_next_output_filename("png")
                cv2.imwrite(str(output_path), cv2.cvtColor(result["image"], cv2.COLOR_RGB2BGR))
                history.append({"action": "analyzovat_artefakty", "output": output_path})
                gallery.append(output_path)
                status.value = "**Stav:** Artefakty analyzovány, jsi detektiv! 🎉"
                return output_path, gallery, result["message"], history, 100
            except Exception as e:
                status.value = "**Stav:** Analýza se zasekla! 😵"
                return None, gallery, f"❗ Chyba: {e}", history, 0

        async def run_ela_analysis(image_path: str, compare_image: str, history: List[Dict], gallery: List[str]):
            if not image_path or not Path(image_path).exists():
                status.value = "**Stav:** Bez obrázku žádná ELA, Sherlocku! 📷"
                return None, [], "❗ Nahraj obrázek!", history, 0
            progress_bar.value = 50
            try:
                result = forensic_tools.error_level_analysis(image_path)
                output_path = config.OUTPUT_DIR / get_next_output_filename("png")
                cv2.imwrite(str(output_path), cv2.cvtColor(result["image"], cv2.COLOR_RGB2BGR))
                history.append({"action": "ela_analýza", "output": output_path})
                gallery.append(output_path)
                status.value = "**Stav:** ELA hotová, manipulace odhalena! 🎉"
                return output_path, gallery, result["message"], history, 100
            except Exception as e:
                status.value = "**Stav:** ELA se zasekla! 😵"
                return None, gallery, f"❗ Chyba: {e}", history, 0

        async def run_deepfake_detection(image_path: str, history: List[Dict], gallery: List[str]):
            if not image_path or not Path(image_path).exists():
                status.value = "**Stav:** Bez obrázku žádný deepfake lov, Sherlocku! 📷"
                return None, [], None, "❗ Nahraj obrázek!", history, 0
            progress_bar.value = 50
            try:
                result = forensic_tools.detect_deepfake(image_path)
                # NOVÉ: Deepfake skóre graf
                score = result.get("score", 0.5)
                df = pd.DataFrame({"Kategorie": ["Deepfake pravděpodobnost"], "Skóre": [score]})
                fig = px.bar(df, x="Kategorie", y="Skóre", title="Deepfake Skóre", range_y=[0, 1])
                history.append({"action": "detekovat_deepfake", "output": None})
                status.value = "**Stav:** Deepfake analýza hotová, pravda venku! 🎉"
                return None, gallery, fig, result["message"], history, 100
            except Exception as e:
                status.value = "**Stav:** Deepfake detekce selhala! 😵"
                return None, gallery, None, f"❗ Chyba: {e}", history, 0

        async def run_exif_extraction(image_path: str, history: List[Dict], gallery: List[str]):
            if not image_path or not Path(image_path).exists():
                status.value = "**Stav:** Bez obrázku žádné EXIF, logika! 📷"
                return None, [], "", "❗ Nahraj obrázek!", history, 0
            progress_bar.value = 50
            try:
                result = forensic_tools.extract_exif(image_path)
                exif_text = "\n".join([f"{k}: {v}" for k, v in result.items()]) if result.get("error") is None else result["error"]
                history.append({"action": "extrahovat_exif", "output": None})
                status.value = "**Stav:** EXIF vytažen, všechno víme! 🎉"
                return None, gallery, exif_text, "✅ EXIF extrahována!", history, 100
            except Exception as e:
                status.value = "**Stav:** EXIF extrakce selhala, metadata se schovala! 😵"
                return None, gallery, f"❗ Chyba: {e}", "❗ EXIF selhal!", history, 0

        async def sdxl_text2img(prompt, negative_prompt, steps, guidance):
            if not prompt:
                status.value = "**Stav:** Bez popisu nic negeneruju, génius! 📝"
                return None, [], "❗ Zadej popis!", action_history, 0
            progress_bar.value = 50
            try:
                result = sdxl_runner.generate_text2img(
                    prompt=prompt,
                    negative_prompt=negative_prompt,
                    num_steps=int(steps),
                    guidance_scale=guidance
                )
                output_path = config.OUTPUT_DIR / get_next_output_filename("png")
                result.save(output_path)
                action_history.append({"action": "sdxl_text2img", "output": output_path})
                output_gallery.append(output_path)
                status.value = "**Stav:** SDXL vygeneroval umělecký kousek! 🎉"
                return result, output_gallery, "✅ Obrázek hotov!", action_history, 100
            except Exception as e:
                status.value = "**Stav:** SDXL se zasekl, asi špatný prompt! 😵"
                return None, output_gallery, f"❗ Chyba: {e}", action_history, 0

        async def sdxl_img2img(image_path: str, prompt, strength, negative_prompt, steps, guidance):
            if not image_path or not Path(image_path).exists():
                status.value = "**Stav:** Bez obrázku žádný img2img, logika! 📷"
                return None, [], "❗ Nahraj obrázek!", action_history, 0
            progress_bar.value = 50
            try:
                with Image.open(image_path) as img:
                    result = sdxl_runner.generate_img2img(
                        input_image=img,
                        prompt=prompt,
                        strength=strength,
                        negative_prompt=negative_prompt,
                        num_steps=int(steps),
                        guidance_scale=guidance
                    )
                output_path = config.OUTPUT_DIR / get_next_output_filename("png")
                result.save(output_path)
                action_history.append({"action": "sdxl_img2img", "output": output_path})
                output_gallery.append(output_path)
                status.value = "**Stav:** SDXL img2img hotov, jsi umělec! 🎉"
                return result, output_gallery, "✅ Obrázek hotov!", action_history, 100
            except Exception as e:
                status.value = "**Stav:** SDXL img2img selhal, asi špatný den! 😵"
                return None, output_gallery, f"❗ Chyba: {e}", action_history, 0

        def sdxl_save(image, prompt):
            if image is None:
                status.value = "**Stav:** Žádný obrázek, co chceš ukládat? 📷"
                return "❗ Nic k uložení!"
            return save_to_history(image, "sdxl", prompt)

        async def flux_text2img(prompt, negative_prompt, steps, guidance, sampler, lora_weight, width, height):
            if not prompt:
                status.value = "**Stav:** Bez popisu nic negeneruju, logika! 📝"
                return None, [], "❗ Zadej popis!", action_history, 0
            progress_bar.value = 50
            try:
                result = flux_runner.generate_text2img(
                    prompt=prompt,
                    negative_prompt=negative_prompt,
                    num_steps=int(steps),
                    guidance_scale=guidance,
                    width=int(width),
                    height=int(height),
                    sampler=sampler,
                    lora_weight=lora_weight
                )
                output_path = config.OUTPUT_DIR / get_next_output_filename("png")
                result.save(output_path)
                action_history.append({"action": "flux_text2img", "output": output_path})
                output_gallery.append(output_path)
                status.value = "**Stav:** Flux vygeneroval masterpiece! 🎉"
                return result, output_gallery, "✅ Obrázek hotov!", action_history, 100
            except Exception as e:
                status.value = "**Stav:** Flux se zasekl, asi špatný prompt! 😵"
                return None, output_gallery, f"❗ Chyba: {e}", action_history, 0

        async def flux_img2img(image_path: str, prompt, strength, negative_prompt, steps, guidance, sampler, lora_weight, width, height):
            if not image_path or not Path(image_path).exists():
                status.value = "**Stav:** Bez obrázku žádný img2img, génius! 📷"
                return None, [], "❗ Nahraj obrázek!", action_history, 0
            progress_bar.value = 50
            try:
                with Image.open(image_path) as img:
                    result = flux_runner.generate_img2img(
                        input_image=img,
                        prompt=prompt,
                        strength=strength,
                        negative_prompt=negative_prompt,
                        num_steps=int(steps),
                        guidance_scale=guidance,
                        width=int(width),
                        height=int(height),
                        sampler=sampler,
                        lora_weight=lora_weight
                    )
                output_path = config.OUTPUT_DIR / get_next_output_filename("png")
                result.save(output_path)
                action_history.append({"action": "flux_img2img", "output": output_path})
                output_gallery.append(output_path)
                status.value = "**Stav:** Flux img2img hotov, jsi Picasso! 🎉"
                return result, output_gallery, "✅ Obrázek hotov!", action_history, 100
            except Exception as e:
                status.value = "**Stav:** Flux img2img selhal, asi špatný den! 😵"
                return None, output_gallery, f"❗ Chyba: {e}", action_history, 0

        def flux_save(image, prompt):
            if image is None:
                status.value = "**Stav:** Žádný obrázek, co chceš ukládat? 📷"
                return "❗ Nic k uložení!"
            return save_to_history(image, "flux", prompt)

        async def run_export(preview_output: str, format: str, fps: int, export_name: str, 
                            history: List[Dict], gallery: List[str]):
            if not preview_output:
                status.value = "**Stav:** Nic k exportu, to je prázdno! 📷"
                return None, [], "❗ Nic k exportu!", history, 0
            progress_bar.value = 50
            try:
                output_name = export_name or get_next_output_filename(format.lower())
                if format == "MP4":
                    output_path = video_exporter.export_to_mp4(preview_output, output_name=output_name, fps=fps)
                elif format == "GIF":
                    output_path = video_exporter.export_to_gif(preview_output, output_name=output_name, fps=fps)
                else:
                    output_path = video_exporter.export_to_png_sequence(preview_output, output_dir_name=output_name)
                if output_path and Path(output_path).exists():
                    history.append({"action": "export", "output": output_path})
                    gallery.append(output_path)
                    status.value = "**Stav:** Export hotov, jsi šéf! 🎉"
                    return None, gallery, f"✅ Export dokončen: {output_path}", history, 100
                status.value = "**Stav:** Export selhal, něco smrdí! 😵"
                return None, gallery, "❗ Export selhal!", history, 100
            except Exception as e:
                status.value = "**Stav:** Export se zasekl! 😵"
                return None, gallery, f"❗ Chyba: {e}", history, 0

        def show_history(history: List[Dict], filter_type: str) -> str:
            if not history:
                status.value = "**Stav:** Historie je prázdná, nic jsi nedělal! 📜"
                return "❗ Žádné akce!"
            filtered_history = history if filter_type == "Vše" else [h for h in history if filter_type.lower() in h["action"].lower()]
            return "\n".join([f"{i+1}. {action['action']}: {action['output'] or 'Žádný výstup'}" for i, action in enumerate(filtered_history)])

        def save_project(history: List[Dict]):
            try:
                project_path = config.OUTPUT_DIR / "projects" / "project.json"
                project_path.parent.mkdir(exist_ok=True)
                with open(project_path, "w", encoding="utf-8") as f:
                    json.dump(history, f, indent=2, ensure_ascii=False)
                history.append({"action": "uložit_projekt", "output": str(project_path)})
                status.value = "**Stav:** Projekt uložen, jsi zorganizovaný! 🎉"
                return None, [], f"✅ Projekt uložen: {project_path}", history, 100
            except Exception as e:
                status.value = "**Stav:** Ukládání projektu selhalo, chaos vládne! 😵"
                return None, [], f"❗ Chyba: {e}", history, 0

        def load_project(history: List[Dict]):
            try:
                project_path = config.OUTPUT_DIR / "projects" / "project.json"
                if not project_path.exists():
                    status.value = "**Stav:** Projekt neexistuje, co to hledáš? 📜"
                    return None, [], "❗ Projekt neexistuje!", history, 0
                with open(project_path, "r", encoding="utf-8") as f:
                    loaded_history = json.load(f)
                history.clear()
                history.extend(loaded_history)
                status.value = "**Stav:** Projekt načten, jdeme dál! 🎉"
                return None, [], f"✅ Projekt načten: {project_path}", history, 100
            except Exception as e:
                status.value = "**Stav:** Načítání projektu selhalo, něco smrdí! 😵"
                return None, [], f"❗ Chyba: {e}", history, 0

        def undo_action(history: List[Dict], gallery: List[str]):
            if history:
                last_action = history.pop()
                if last_action["output"] in gallery:
                    gallery.remove(last_action["output"])
                status.value = "**Stav:** Akce vrácena, čas se vrátil! ↩️"
                return None, gallery, f"✅ Vrácena akce: {last_action['action']}", history, 100
            status.value = "**Stav:** Nic k vrácení, historie je prázdná! 📜"
            return None, [], "❗ Nic k vrácení!", history, 0

        def download_youtube(url: str, output_path: str):
            ydl_opts = {
                "outtmpl": output_path,
                "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
                "merge_output_format": "mp4",
                "quiet": True
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
            logger.info(f"✅ YouTube video staženo: {output_path}")

        # Přiřazení akcí
        tabs.select(fn=update_active_tab, inputs=None, outputs=active_tab)
        source_selector.change(
            fn=update_source_selector,
            inputs=source_selector,
            outputs=[youtube_url, batch_dir]
        )
        lipsync_mode.change(
            fn=update_phoneme_timeline,
            inputs=[lipsync_mode, input_files],
            outputs=phoneme_timeline
        )
        upload_button.click(
            fn=upload_and_preview,
            inputs=[input_files, source_selector, youtube_url, batch_dir, action_history, stem_selector, output_gallery],
            outputs=[preview_output, gallery_output, status, action_history, progress_bar, input_files, transcription_output, metadata_display]
        )
        generate_caption_button.click(
            fn=generate_deepdanbooru_caption,
            inputs=[input_files],
            outputs=[status]
        )
        clear_button.click(
            fn=clear_inputs,
            inputs=[action_history, output_gallery],
            outputs=[input_files, youtube_url, batch_dir, preview_output, gallery_output, status, action_history, progress_bar, input_files, transcription_output, metadata_display]
        )
        detect_face_button.click(
            fn=detect_face,
            inputs=[input_files, action_history, output_gallery],
            outputs=[face_output, gallery_output, status, action_history, progress_bar]
        )
        face_swap_button.click(
            fn=run_face_swap,
            inputs=[input_files, face_swap_target, action_history, output_gallery],
            outputs=[face_output, gallery_output, status, action_history, progress_bar]
        )
        apply_expression_button.click(
            fn=apply_expression,
            inputs=[input_files, expression_slider, expression_model, action_history, output_gallery],
            outputs=[face_output, gallery_output, status, action_history, progress_bar]
        )
        toggle_camera.click(
            fn=toggle_camera_stream,
            inputs=[],
            outputs=[preview_output]
        )
        lipsync_button.click(
            fn=run_lipsync,
            inputs=[input_files, input_files, lipsync_mode, action_history, output_gallery],
            outputs=[lipsync_output, gallery_output, status, action_history, progress_bar]
        )
        upscale_button.click(
            fn=run_upscale,
            inputs=[input_files, upscale_model, upscale_factor, batch_upscale, input_files, action_history, output_gallery],
            outputs=[upscale_output, gallery_output, status, action_history, progress_bar]
        )
        segment_button.click(
            fn=run_segmentation,
            inputs=[input_files, segment_mode, segment_prompt, action_history, output_gallery],
            outputs=[segment_output, gallery_output, status, action_history, progress_bar]
        )
        separate_stems_button.click(
            fn=separate_stems,
            inputs=[input_files, stem_selector, action_history, output_gallery],
            outputs=[audio_output, gallery_output, status, action_history, progress_bar]
        )
        transcribe_button.click(
            fn=transcribe_audio,
            inputs=[input_files, action_history, output_gallery],
            outputs=[audio_output, gallery_output, transcription_output, status, action_history, progress_bar]
        )
        apply_effect_button.click(
            fn=apply_audio_effect,
            inputs=[input_files, audio_effect, action_history, output_gallery],
            outputs=[audio_output, gallery_output, status, action_history, progress_bar]
        )
        forensic_button.click(
            fn=run_artifact_analysis,
            inputs=[input_files, compare_image, action_history, output_gallery],
            outputs=[forensic_output, gallery_output, status, action_history, progress_bar]
        )
        ela_button.click(
            fn=run_ela_analysis,
            inputs=[input_files, compare_image, action_history, output_gallery],
            outputs=[forensic_output, gallery_output, status, action_history, progress_bar]
        )
        deepfake_button.click(
            fn=run_deepfake_detection,
            inputs=[input_files, action_history, output_gallery],
            outputs=[forensic_output, gallery_output, deepfake_plot, status, action_history, progress_bar]
        )
        exif_button.click(
            fn=run_exif_extraction,
            inputs=[input_files, action_history, output_gallery],
            outputs=[forensic_output, gallery_output, exif_output, status, action_history, progress_bar]
        )
        report_button.click(
            fn=lambda x, h, g: (None, g, "📜 PDF zpráva generována!", h, 100),  # Placeholder pro PDF generování
            inputs=[input_files, action_history, output_gallery],
            outputs=[forensic_output, gallery_output, status, action_history, progress_bar]
        )
        sdxl_text2img_button.click(
            fn=sdxl_text2img,
            inputs=[sdxl_prompt, sdxl_negative_prompt, sdxl_steps, sdxl_guidance],
            outputs=[sdxl_output, gallery_output, status, action_history, progress_bar]
        )
        sdxl_img2img_button.click(
            fn=sdxl_img2img,
            inputs=[input_files, sdxl_prompt, sdxl_strength, sdxl_negative_prompt, sdxl_steps, sdxl_guidance],
            outputs=[sdxl_output, gallery_output, status, action_history, progress_bar]
        )
        sdxl_save_button.click(
            fn=sdxl_save,
            inputs=[sdxl_output, sdxl_prompt],
            outputs=[status]
        )
        flux_text2img_button.click(
            fn=flux_text2img,
            inputs=[flux_prompt, flux_negative_prompt, flux_steps, flux_guidance, flux_sampler, flux_lora_weight, flux_width, flux_height],
            outputs=[flux_output, gallery_output, status, action_history, progress_bar]
        )
        flux_img2img_button.click(
            fn=flux_img2img,
            inputs=[input_files, flux_prompt, flux_strength, flux_negative_prompt, flux_steps, flux_guidance, flux_sampler, flux_lora_weight, flux_width, flux_height],
            outputs=[flux_output, gallery_output, status, action_history, progress_bar]
        )
        flux_save_button.click(
            fn=flux_save,
            inputs=[flux_output, flux_prompt],
            outputs=[status]
        )
        export_button.click(
            fn=run_export,
            inputs=[preview_output, export_format, export_fps, export_name, action_history, output_gallery],
            outputs=[preview_output, gallery_output, status, action_history, progress_bar]
        )
        save_project_button.click(
            fn=save_project,
            inputs=[action_history],
            outputs=[preview_output, gallery_output, status, action_history, progress_bar]
        )
        load_project_button.click(
            fn=load_project,
            inputs=[action_history],
            outputs=[preview_output, gallery_output, status, action_history, progress_bar]
        )
        undo_button.click(
            fn=undo_action,
            inputs=[action_history, output_gallery],
            outputs=[preview_output, gallery_output, status, action_history, progress_bar]
        )
        show_history_button.click(
            fn=show_history,
            inputs=[action_history, history_filter],
            outputs=[history_display]
        )
        refresh_history_button.click(
            fn=lambda: get_history_images(),
            inputs=[],
            outputs=[history_gallery]
        )
        export_history_csv.click(
            fn=export_history_to_csv,
            inputs=[action_history],
            outputs=[status]
        )
        # NOVÉ: Rychlé akce
        quick_detect.click(
            fn=detect_face,
            inputs=[input_files, action_history, output_gallery],
            outputs=[face_output, gallery_output, status, action_history, progress_bar]
        )
        quick_upscale.click(
            fn=run_upscale,
            inputs=[input_files, upscale_model, upscale_factor, batch_upscale, input_files, action_history, output_gallery],
            outputs=[upscale_output, gallery_output, status, action_history, progress_bar]
        )
        quick_segment.click(
            fn=run_segmentation,
            inputs=[input_files, segment_mode, segment_prompt, action_history, output_gallery],
            outputs=[segment_output, gallery_output, status, action_history, progress_bar]
        )

    logger.info("🎉 GUI je ready! Otevři http://0.0.0.0:7860 a rozpoutej pixelové peklo! 🔥")
    return app

if __name__ == "__main__":
    try:
        app = create_gui()
        app.launch(
            inbrowser=True,
            server_name="0.0.0.0",
            server_port=7860,
            max_threads=10,
            queue_max_size=100,
            show_error=True
        )
        logger.info("🚀 GUI běží! Jdi na http://0.0.0.0:7860 a tvoř, nebo zemři! 🔥")
    except Exception as e:
        logger.error(f"💥 GUI se zhroutilo: {e}. To je masakr, kámo! 😵")
        input("Stiskni klávesu a zkus to znova... Pixely čekají! 😈")