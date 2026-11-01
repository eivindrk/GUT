const audioPlayers = Array.from(document.querySelectorAll('[data-audio-player]'));

audioPlayers.forEach((player) => {
    const audio = player.querySelector('audio');
    const toggleButton = player.querySelector('[data-audio-toggle]');
    const seekBar = player.querySelector('[data-audio-seek]');
    const progress = player.querySelector('[data-audio-progress]');
    const icon = player.querySelector('[data-audio-icon]');
    const label = player.querySelector('[data-audio-label]');
    const playAriaLabel = toggleButton.getAttribute('aria-label');
    const pauseAriaLabel = playAriaLabel.replace(/^Spill/, 'Pause');
    const spinner = document.createElement('span');
    spinner.className = 'epk-audio-spinner';
    spinner.setAttribute('aria-hidden', 'true');
    toggleButton.insertBefore(spinner, icon);
    let isSeeking = false;

    const setLoading = (loading) => {
        toggleButton.classList.toggle('is-loading', loading);
        toggleButton.setAttribute('aria-busy', loading ? 'true' : 'false');
    };

    const progressRatio = () => {
        if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
            return 0;
        }

        return Math.min(1, Math.max(0, audio.currentTime / audio.duration));
    };

    const updateProgress = () => {
        progress.style.width = `${progressRatio() * 100}%`;
    };

    const seekFromClientX = (clientX) => {
        if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
            return;
        }

        const bounds = seekBar.getBoundingClientRect();
        const ratio = Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width));
        audio.currentTime = ratio * audio.duration;
        updateProgress();
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

            if (audio.readyState < 3) {
                setLoading(true);
            }

            audio.play().catch(() => {
                setLoading(false);
                showPlayState();
            });
        } else {
            setLoading(false);
            audio.pause();
        }
    });

    seekBar.addEventListener('pointerdown', (event) => {
        isSeeking = true;
        seekBar.setPointerCapture(event.pointerId);
        seekFromClientX(event.clientX);
    });

    seekBar.addEventListener('pointermove', (event) => {
        if (isSeeking) {
            seekFromClientX(event.clientX);
        }
    });

    const stopSeeking = () => {
        isSeeking = false;
    };

    seekBar.addEventListener('pointerup', stopSeeking);
    seekBar.addEventListener('pointercancel', stopSeeking);

    audio.addEventListener('waiting', () => {
        if (!audio.paused) {
            setLoading(true);
        }
    });
    audio.addEventListener('playing', () => setLoading(false));
    audio.addEventListener('play', showPauseState);
    audio.addEventListener('pause', () => {
        setLoading(false);
        showPlayState();
    });
    audio.addEventListener('timeupdate', () => {
        if (!isSeeking) {
            updateProgress();
        }
    });
    audio.addEventListener('seeked', updateProgress);
    audio.addEventListener('loadedmetadata', updateProgress);
    audio.addEventListener('ended', () => {
        setLoading(false);
        showPlayState();
        updateProgress();
    });
    audio.addEventListener('error', () => {
        setLoading(false);
        toggleButton.disabled = true;
        seekBar.style.pointerEvents = 'none';
    });
});
