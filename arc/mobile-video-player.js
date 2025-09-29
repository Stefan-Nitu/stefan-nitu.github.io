// Mobile Video Player - Replaces interactive stage with video on mobile

function initMobileVideoPlayers() {
    if (window.innerWidth > 768) return;

    const videoMappings = {
        'strong-play': { video: 'videos/arc-strong-refs.mp4', stage: 'strong-stage' },
        'weak-play': { video: 'videos/arc-weak-refs.mp4', stage: 'weak-stage' },
        'cycle-play': { video: 'videos/arc-retain-cycle.mp4', stage: 'cycle-stage' },
        'fix-play': { video: 'videos/arc-cycle-fix.mp4', stage: 'fix-stage' }
    };

    Object.entries(videoMappings).forEach(([playBtnId, config]) => {
        const playBtn = document.getElementById(playBtnId);
        const stepBtn = document.getElementById(playBtnId.replace('-play', '-step'));
        const resetBtn = document.getElementById(playBtnId.replace('-play', '-reset'));
        const stage = document.getElementById(config.stage);

        if (!playBtn || !stage) return;

        const videoContainer = document.createElement('div');
        videoContainer.className = 'mobile-video-container';
        videoContainer.innerHTML = `
            <video
                class="mobile-video"
                src="${config.video}"
                preload="metadata"
                playsinline
                controls
            ></video>
        `;

        const video = videoContainer.querySelector('video');

        stage.style.display = 'none';
        stage.parentNode.insertBefore(videoContainer, stage);

        if (stepBtn) stepBtn.style.display = 'none';

        playBtn.addEventListener('click', () => {
            video.currentTime = 0;
            video.play();
        });

        resetBtn.addEventListener('click', () => {
            video.pause();
            video.currentTime = 0;
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileVideoPlayers);
} else {
    initMobileVideoPlayers();
}