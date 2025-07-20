// Audio Player Module
class AudioPlayer {
    constructor() {
        this.audio = null;
        this.currentTrack = '';
        this.isPlaying = false;
        this.initialize();
    }

    initialize() {
        this.audio = new Audio();
        document.body.appendChild(this.audio);
        
        // Přidáme event listenery pro lepší správu stavu
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.updateUI();
        });
        
        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updateUI();
        });
        
        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.updateUI();
        });
    }
    
    play(track) {
        if (!track) {
            if (this.currentTrack) {
                // Pokus o pokračování aktuální stopy
                return this.audio.play().catch(console.error);
            }
            return Promise.reject('No track selected');
        }
        
        // Pokud už hraje jiná stopa, nejdřív ji zastavíme
        if (this.currentTrack !== track) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.audio.src = track;
            this.currentTrack = track;
        }
        
        return this.audio.play().catch(console.error);
    }
    
    pause() {
        this.audio.pause();
    }
    
    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
    }
    
    changeTrack(track) {
        if (this.currentTrack === track) return;
        
        const wasPlaying = this.isPlaying;
        this.stop();
        this.currentTrack = track;
        
        if (wasPlaying && track) {
            this.audio.src = track;
            this.play();
        } else if (track) {
            this.audio.src = track;
        }
    }
    
    updateUI() {
        // Aktualizace UI tlačítek
        const stopBtns = document.querySelectorAll('.stop-audio-btn');
        const playBtns = document.querySelectorAll('.play-audio-btn');
        
        if (this.isPlaying) {
            stopBtns.forEach(btn => btn.style.display = 'inline-block');
            playBtns.forEach(btn => btn.style.display = 'none');
        } else {
            stopBtns.forEach(btn => btn.style.display = 'none');
            playBtns.forEach(btn => btn.style.display = 'inline-block');
        }
    }
}

// Vytvoříme globální instanci přehrávače
window.audioPlayer = new AudioPlayer();

// Funkce pro zpracování kliknutí na tlačítka
function handleAudioButtonClick(e) {
    // Zpracování tlačítek pro přehrávání
    if (e.target.classList.contains('play-audio-btn')) {
        e.preventDefault();
        e.stopPropagation();  // Zastavíme šíření události
        const audioFile = e.target.getAttribute('data-audio') || 'audio/ambient.mp3';
        window.audioPlayer.play(audioFile);
    }
    
    // Zpracování tlačítek pro zastavení
    if (e.target.classList.contains('stop-audio-btn')) {
        e.preventDefault();
        window.audioPlayer.stop();
    }
    
    // Zpracování tlačítek pro změnu skladby
    if (e.target.classList.contains('change-track-btn')) {
        e.preventDefault();
        const audioFile = e.target.getAttribute('data-audio') || 'audio/ambient.mp3';
        window.audioPlayer.changeTrack(audioFile);
    }
}

// Inicializace tlačítek po načtení stránky
document.addEventListener('DOMContentLoaded', () => {
    // Delegace událostí na document pro podporu dynamicky přidaných tlačítek
    document.addEventListener('click', handleAudioButtonClick);
    
    // Inicializace tlačítek, která už jsou v DOMu
    const initButtons = () => {
        const playButtons = document.querySelectorAll('.play-audio-btn');
        const stopButtons = document.querySelectorAll('.stop-audio-btn');
        const changeTrackButtons = document.querySelectorAll('.change-track-btn');
        
        // Pokud jsou nějaká tlačítka viditelná, aktualizujeme UI
        if (playButtons.length > 0 || stopButtons.length > 0) {
            window.audioPlayer.updateUI();
        }
    };
    
    // Spustíme inicializaci hned a pak s malým zpožděním pro případ, že by se DOM načetl později
    initButtons();
    setTimeout(initButtons, 500);
});
