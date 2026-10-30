const audioPlayers = Array.from(document.querySelectorAll('[data-audio-player]'));

audioPlayers.forEach((player) => {
    const audio = player.querySelector('audio');
    const toggleButton = player.querySelector('[data-audio-toggle]');
    const restartButton = player.querySelector('[data-audio-restart]');
    const icon = player.querySelector('[data-audio-icon]');
    const label = player.querySelector('[data-audio-label]');
    const playAriaLabel = toggleButton.getAttribute('aria-label');
    const pauseAriaLabel = playAriaLabel.replace(/^Spill/, 'Pause');

    const updateRestartButton = () => {
        restartButton.disabled = audio.currentTime <= 0.05;
    };

    const showPlayState = () => {
        icon.textContent = '▶';
        label.textContent = 'PLAY';
        toggleButton.setAttribute('aria-label', playAriaLabel);
    };

    const showPauseState = () => {
        icon.textContent = 'Ⅱ';
        label.textContent = 'PAUSE';
        toggleButton.setAttribute('aria-label', pauseAriaLabel);
    };

    toggleButton.addEventListener('click', () => {
        if (audio.paused) {
            audioPlayers.forEach((otherPlayer) => {
                const otherAudio = otherPlayer.querySelector('audio');

                if (otherAudio !== audio) {
                    otherAudio.pause();
                }
            });

            audio.play().catch(showPlayState);
        } else {
            audio.pause();
        }
    });

    restartButton.addEventListener('click', () => {
        audio.currentTime = 0;
        updateRestartButton();
    });

    audio.addEventListener('play', showPauseState);
    audio.addEventListener('pause', showPlayState);
    audio.addEventListener('timeupdate', updateRestartButton);
    audio.addEventListener('seeked', updateRestartButton);
    audio.addEventListener('ended', showPlayState);
    audio.addEventListener('error', () => {
        toggleButton.disabled = true;
        restartButton.disabled = true;
    });
});
