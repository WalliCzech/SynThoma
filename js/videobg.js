    'use strict';

(function() {
    // --- VIDEO ROTATION LOGIC ---
    const videoPaths = Array.from({length: 10}, (_, i) => `video/SYNTHOMA${i + 1}.mp4`);
    let activeVideoIndex = -1;
    let transitionTimeout = null;

    function initializeVideos() {
        const videoContainer = document.querySelector('.video-background');
        if (!videoContainer) return;

        // Vyčistíme kontejner pro případ, že by se skript spustil vícekrát
        videoContainer.innerHTML = '';

        videoPaths.forEach(path => {
            const video = document.createElement('video');
            video.src = path;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.playbackRate = 0.5;
            videoContainer.appendChild(video);
        });

        const firstVideo = videoContainer.querySelector('video');
        if (firstVideo) {
            firstVideo.classList.add('active');
            activeVideoIndex = 0;
        }
    }

    function scheduleNextTransition() {
        if (transitionTimeout) clearTimeout(transitionTimeout);
        const delay = 15000 + Math.random() * 15000; // 15-30s
        transitionTimeout = setTimeout(transitionToVideo, delay);
    }

    function transitionToVideo() {
        const videoElements = document.querySelectorAll('.video-background video');
        if (videoElements.length < 2) return; // Není kam přecházet

        const nextIndex = (activeVideoIndex + 1) % videoElements.length;
        const currentVideo = videoElements[activeVideoIndex];
        const nextVideo = videoElements[nextIndex];

        if (currentVideo) currentVideo.classList.remove('active');
        if (nextVideo) {
            nextVideo.classList.add('active');
            if (!document.body.classList.contains('animations-disabled')) {
                nextVideo.play().catch(e => console.error('Video play failed:', e));
            }
        }

        activeVideoIndex = nextIndex;
        scheduleNextTransition();
    }

    window.startVideoRotation = function() {
        console.log('Starting video rotation...');
        scheduleNextTransition();
    };

    window.stopVideoRotation = function() {
        console.log('Stopping video rotation...');
        clearTimeout(transitionTimeout);
        transitionTimeout = null;
    };

    // --- CANVAS GLITCH LOGIC ---
    const canvas = document.getElementById('glitch-bg');
    let ctx, W, H, glitchAnimationId = null;

    function initializeGlitchBg() {
        if (!canvas) return false;
        ctx = canvas.getContext('2d');
        window.addEventListener('resize', resizeGlitchBg);
        resizeGlitchBg();
        return true;
    }

    function resizeGlitchBg() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
    }

    function drawGlitch() {
        if (!ctx) return;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(0, 0, W, H);
        const colors = ['#00fff9', '#ff00c8', '#faff00', '#fff'];
        for (let i = 0; i < 30; i++) {
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)] + '1A';
            ctx.fillRect(Math.random() * W, Math.random() * H, Math.random() * 150, Math.random() * 2);
        }
        glitchAnimationId = requestAnimationFrame(drawGlitch);
    }

    window.startGlitchBg = function() {
        if (glitchAnimationId || !canvas) return;
        console.log('Starting glitch background...');
        canvas.style.display = 'block';
        drawGlitch();
    };

    window.stopGlitchBg = function() {
        if (!glitchAnimationId || !canvas) return;
        console.log('Stopping glitch background...');
        cancelAnimationFrame(glitchAnimationId);
        if(ctx) ctx.clearRect(0, 0, W, H);
        canvas.style.display = 'none';
        glitchAnimationId = null;
    };

    // --- INITIALIZATION ---
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 Video & Glitch BG modules initialized.');
        initializeVideos();
        if (initializeGlitchBg() && !document.body.classList.contains('animations-disabled')) {
            // Spustíme jen pokud jsou animace povoleny
            window.startGlitchBg();
        }
    });

})();