document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;

    // --- ZÁKLADNÍ ELEMENTY PANELU ---
    const togglePanelBtn = document.getElementById('toggle-panel-btn');
    const controlPanel = document.getElementById('control-panel');
    if (togglePanelBtn && controlPanel) {
        togglePanelBtn.addEventListener('click', () => {
            controlPanel.classList.toggle('hidden');
        });
    }

    // --- OVLÁDÁNÍ ANIMACÍ ---
    const toggleAnimationsBtn = document.getElementById('toggle-animations');
    if (toggleAnimationsBtn) {
        // Načtení a aplikace uloženého stavu
        function updateButtonState() {
            const areAnimationsDisabled = localStorage.getItem('animationsDisabled') === 'true';
            toggleAnimationsBtn.textContent = areAnimationsDisabled ? 'Zapnout animace' : 'Vypnout animace';
        }

        toggleAnimationsBtn.addEventListener('click', () => {
            window.animationManager.toggleAll();
            updateButtonState(); // Aktualizujeme text tlačítka po přepnutí
        });

        updateButtonState(); // Nastavíme správný text tlačítka při načtení stránky
    } else {
        console.error('Tlačítko #toggle-animations nebylo nalezeno!');
    }

    // --- OVLÁDÁNÍ FONT-SIZE A OPACITY ---
    const fontSizeSlider = document.getElementById('font-size-slider');
    const opacitySlider = document.getElementById('opacity-slider');
    function applySetting(key, value, cssVariable) {
        localStorage.setItem(key, value);
        root.style.setProperty(cssVariable, value);
    }

    if (fontSizeSlider) {
        const savedFontSize = localStorage.getItem('fontSizeMultiplier') || 1;
        fontSizeSlider.value = savedFontSize;
        root.style.setProperty('--font-size-multiplier', savedFontSize);
        fontSizeSlider.addEventListener('input', (e) => applySetting('fontSizeMultiplier', e.target.value, '--font-size-multiplier'));
    }

    if (opacitySlider) {
        const savedOpacity = localStorage.getItem('readerBgOpacity') || 0.8;
        opacitySlider.value = savedOpacity;
        root.style.setProperty('--reader-bg-opacity', savedOpacity);
        opacitySlider.addEventListener('input', (e) => applySetting('readerBgOpacity', e.target.value, '--reader-bg-opacity'));
    }

    // --- PŘEPÍNÁNÍ MOTIVŮ ---
    const themeButtons = document.querySelectorAll('.theme-button');
    if (themeButtons.length > 0) {
        const savedTheme = localStorage.getItem('theme') || 'synthoma';
        document.body.dataset.theme = savedTheme;

        themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const theme = button.dataset.theme;
                document.body.dataset.theme = theme;
                localStorage.setItem('theme', theme);
            });
        });
    }

    // --- AUDIO PŘEHRÁVAČ ---
    const playlistContainer = document.getElementById('playlist-container');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressBarContainer = document.getElementById('progress-bar-container');
    const audioTracks = [
        { title: 'SynthBachmoff', file: 'audio/SynthBachmoff.mp3' },
        { title: 'Glitch Ambient', file: 'audio/SYNTHOMA1.mp3' },
        { title: 'Dark Synth', file: 'audio/dark-synth.mp3' },
    ];
    let currentTrackIndex = -1;
    const audio = new Audio();

    function playAudio(filePath) {
        audio.src = filePath;
        audio.play();
        if (playPauseBtn) playPauseBtn.textContent = '⏸️';
    }

    function updatePlaylistActiveState() {
        document.querySelectorAll('#playlist-container a').forEach((item, index) => {
            item.classList.toggle('active', index === currentTrackIndex);
        });
    }

    function playNextTrack() {
        if (audioTracks.length === 0) return;
        currentTrackIndex = (currentTrackIndex + 1) % audioTracks.length;
        const track = audioTracks[currentTrackIndex];
        playAudio(track.file);
        updatePlaylistActiveState();
    }

    if (playlistContainer) {
        audioTracks.forEach((track, index) => {
            const trackElement = document.createElement('a');
            trackElement.href = '#';
            trackElement.textContent = track.title;
            trackElement.dataset.index = index;
            trackElement.addEventListener('click', (e) => {
                e.preventDefault();
                currentTrackIndex = index;
                playAudio(track.file);
                updatePlaylistActiveState();
            });
            playlistContainer.appendChild(trackElement);
        });
    }

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (audio.paused) {
                if (audio.src) {
                    audio.play();
                    playPauseBtn.textContent = '⏸️';
                } else {
                    playNextTrack(); // Spustí první skladbu, pokud nic nehrálo
                }
            } else {
                audio.pause();
                playPauseBtn.textContent = '▶️';
            }
        });
    }

    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            audio.pause();
            audio.currentTime = 0;
            if (playPauseBtn) playPauseBtn.textContent = '▶️';
        });
    }

    audio.addEventListener('timeupdate', () => {
        if (progressBar && audio.duration) {
            const progress = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = `${progress}%`;
        }
    });

    if (progressBarContainer) {
        progressBarContainer.addEventListener('click', (e) => {
            if(audio.duration){
                const width = progressBarContainer.clientWidth;
                const clickX = e.offsetX;
                audio.currentTime = (clickX / width) * audio.duration;
            }
        });
    }

    audio.addEventListener('ended', playNextTrack);

    // ---- Inicializace a událost pro vyskakovací okno ----
    
    if (togglePanelBtn && controlPanel) {
        togglePanelBtn.addEventListener('click', () => {
            controlPanel.classList.toggle('visible');
        });
    }

    // Načtení uloženého nastavení je zajištěno při inicializaci jednotlivých ovládacích prvků výše

    // Zobrazení pop-up okna s informacemi o tlačítku
    const hoverElements = document.querySelectorAll('[data-hover-text]');
    hoverElements.forEach(element => {
        element.addEventListener('mouseover', () => {
            element.style.transform = 'translateY(-2px)';
        });
        element.addEventListener('mouseout', () => {
            element.style.transform = 'translateY(0)';
        });
    });
});
