// JavaScript for Expanded Birthday Surprise Website with 3D Scrapbook

document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------------------
    // 0. Configuration Settings
    // -------------------------------------------------------------------------
    // Set his exact birthday (YYYY-MM-DD format, e.g. July 30th)
    const TARGET_BIRTHDAY_STR = "2026-07-30T00:00:00"; 
    
    // Passcode to unlock the padlock (Format: uppercase for comparison)
    const SECRET_PASSCODE = "LOVE";
    const ALT_PASSCODE = "0729"; // Anniversary date MMDD
    const NICKNAME_PASSCODE = "MY LOVE";

    // Relationship Quiz Questions
    const quizQuestions = [
        {
            question: "Where did we go on our first official date?",
            options: ["The Movie Theater", "The Cozy Café", "The Beach Sunset Walk"],
            correctIndex: 0,
            feedback: "Correct! That cozy movie theater was the start of something beautiful... 🎬"
        },
        {
            question: "Who said 'I love you' first?",
            options: ["You did!", "I did!", "We said it at the exact same time!"],
            correctIndex: 1, // "I did!" - customizable
            feedback: "Yes! I couldn't hold it in any longer. ❤️"
        },
        {
            question: "What is my absolute favorite thing about you?",
            options: ["Your handsome smile", "Your warm kindness", "Everything! I can't choose!"],
            correctIndex: 2,
            feedback: "Spot on! Every single thing about you is perfect to me. 💕"
        }
    ];

    // Easter Egg secret love messages
    const easterEggQuotes = [
        "Secret Note #1: You are my favorite star in the entire universe. 🌟",
        "Secret Note #2: I love you to the moon and back, to infinity and beyond. 🚀",
        "Secret Note #3: Every ordinary day becomes a fairytale when I'm with you. 💖",
        "Secret Note #4: Thank you for being my rock and my happiest memory. 💕",
        "Secret Note #5: I fell for your soul before I could even touch your hand. ❤️"
    ];

    // -------------------------------------------------------------------------
    // 1. Audio Synthesis Engine (Web Audio API)
    // -------------------------------------------------------------------------
    let audioCtx = null;
    let synthInterval = null;
    let isSynthMusicPlaying = false;
    let musicVolumeNode = null;
    
    // Fallback HTML5 Audio Element for MP3
    const bgMusicEl = document.getElementById("bg-music");
    const musicToggleBtn = document.getElementById("music-toggle");
    
    function initAudioContext() {
        try {
            if (!audioCtx) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) {
                    audioCtx = new AudioContextClass();
                    musicVolumeNode = audioCtx.createGain();
                    musicVolumeNode.gain.value = 0.12; // Ambient volume soft
                    musicVolumeNode.connect(audioCtx.destination);
                }
            }
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        } catch (e) {
            console.warn("Web Audio Context initialization failed:", e);
            audioCtx = null;
        }
    }

    // Play custom synthesized sounds
    function playSound(type) {
        try {
            if (!audioCtx) return;
            initAudioContext();
            if (!audioCtx) return;
            
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            const now = audioCtx.currentTime;
            
            if (type === 'click') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
            } else if (type === 'lock-click') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.setValueAtTime(120, now + 0.05);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
            } else if (type === 'lock-open') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
                
                setTimeout(() => {
                    playChime(1500, 0.4);
                }, 100);
            } else if (type === 'tick') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(150, now);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.08);
            } else if (type === 'explode') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(120, now);
                osc.frequency.exponentialRampToValueAtTime(30, now + 0.8);
                
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(100, now);
                filter.frequency.exponentialRampToValueAtTime(20, now + 0.8);
                
                osc.disconnect(gain);
                osc.connect(filter);
                filter.connect(gain);
                
                gain.gain.setValueAtTime(0.6, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
                osc.start(now);
                osc.stop(now + 0.8);
            } else if (type === 'blow') {
                const bufferSize = audioCtx.sampleRate * 0.4;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                const noise = audioCtx.createBufferSource();
                noise.buffer = buffer;
                
                const noiseFilter = audioCtx.createBiquadFilter();
                noiseFilter.type = 'bandpass';
                noiseFilter.frequency.value = 400;
                
                const noiseGain = audioCtx.createGain();
                noiseGain.gain.setValueAtTime(0.2, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                
                noise.connect(noiseFilter);
                noiseFilter.connect(noiseGain);
                noiseGain.connect(audioCtx.destination);
                
                noise.start(now);
                noise.stop(now + 0.4);
            } else if (type === 'error-buzzer') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(130, now);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.setValueAtTime(0, now + 0.1);
                
                setTimeout(() => {
                    const osc2 = audioCtx.createOscillator();
                    const gain2 = audioCtx.createGain();
                    osc2.type = 'sawtooth';
                    osc2.frequency.setValueAtTime(130, audioCtx.currentTime);
                    osc2.connect(gain2);
                    gain2.connect(audioCtx.destination);
                    gain2.gain.setValueAtTime(0.25, audioCtx.currentTime);
                    gain2.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
                    osc2.start(audioCtx.currentTime);
                    osc2.stop(audioCtx.currentTime + 0.15);
                }, 130);
                
                gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
            } else if (type === 'success-bell') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
                osc.frequency.setValueAtTime(783.99, now + 0.24); // G5
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
            } else if (type === 'page-flip') {
                // Synthesize a soft sweeping paper-flip sound using highpass noise
                const bufferSize = audioCtx.sampleRate * 0.35;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                const noise = audioCtx.createBufferSource();
                noise.buffer = buffer;
                
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'highpass';
                filter.frequency.setValueAtTime(1200, now);
                filter.frequency.exponentialRampToValueAtTime(300, now + 0.3);
                
                const noiseGain = audioCtx.createGain();
                noiseGain.gain.setValueAtTime(0.05, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                
                noise.connect(filter);
                filter.connect(noiseGain);
                noiseGain.connect(audioCtx.destination);
                
                noise.start(now);
                noise.stop(now + 0.3);
            }
        } catch (err) {
            console.warn("playSound failed:", err);
        }
    }

    function playChime(freq, duration) {
        try {
            if (!audioCtx) return;
            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            osc.start(now);
            osc.stop(now + duration);
        } catch (err) {
            console.warn("playChime failed:", err);
        }
    }

    // Play beautiful soft ambient synthesizer loops
    function startAmbientSynthMusic() {
        try {
            if (isSynthMusicPlaying) return;
            initAudioContext();
            if (!audioCtx) return;
            isSynthMusicPlaying = true;
            
            const progressions = [
                [220.00, 261.63, 329.63, 392.00], // Am7
                [174.61, 220.00, 261.63, 329.63], // Fmaj7
                [261.63, 329.63, 392.00, 493.88], // Cmaj7
                [196.00, 246.94, 293.66, 329.63]  // G6
            ];
            
            let chordIndex = 0;
            let noteIndex = 0;
            
            synthInterval = setInterval(() => {
                try {
                    if (!audioCtx) {
                        clearInterval(synthInterval);
                        return;
                    }
                    const currentChord = progressions[chordIndex];
                    const baseFreq = currentChord[noteIndex];
                    
                    const now = audioCtx.currentTime;
                    const osc = audioCtx.createOscillator();
                    const filter = audioCtx.createBiquadFilter();
                    const delay = audioCtx.createDelay();
                    const feedback = audioCtx.createGain();
                    const oscGain = audioCtx.createGain();
                    
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(baseFreq, now);
                    
                    delay.delayTime.value = 0.35;
                    feedback.gain.value = 0.4;
                    
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(1000, now);
                    
                    oscGain.gain.setValueAtTime(0.08, now);
                    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
                    
                    osc.connect(filter);
                    filter.connect(oscGain);
                    
                    oscGain.connect(musicVolumeNode);
                    oscGain.connect(delay);
                    delay.connect(feedback);
                    feedback.connect(delay);
                    delay.connect(musicVolumeNode);
                    
                    osc.start(now);
                    osc.stop(now + 2.0);
                    
                    noteIndex = (noteIndex + 1) % currentChord.length;
                    if (noteIndex === 0) {
                        chordIndex = (chordIndex + 1) % progressions.length;
                    }
                } catch (e) {
                    console.warn("Synth loop note failed:", e);
                }
            }, 600);
        } catch (err) {
            console.warn("startAmbientSynthMusic failed:", err);
        }
    }

    function stopAmbientSynthMusic() {
        if (synthInterval) {
            clearInterval(synthInterval);
            synthInterval = null;
        }
        isSynthMusicPlaying = false;
    }

    // Music control toggle function
    function toggleMusic(forcePlay = null) {
        try {
            initAudioContext();
            let shouldPlay = forcePlay !== null ? forcePlay : !musicToggleBtn.classList.contains("playing");
            
            if (shouldPlay) {
                musicToggleBtn.classList.add("playing");
                if (bgMusicEl && bgMusicEl.src && !bgMusicEl.paused) {
                    // If already playing via HTML5 audio, do nothing
                } else if (bgMusicEl) {
                    const playPromise = bgMusicEl.play();
                    if (playPromise !== undefined && typeof playPromise.then === 'function') {
                        playPromise.then(() => {
                            stopAmbientSynthMusic(); // stop synth if mp3 is playing
                        }).catch(() => {
                            startAmbientSynthMusic();
                        });
                    } else {
                        stopAmbientSynthMusic();
                    }
                } else {
                    startAmbientSynthMusic();
                }
            } else {
                musicToggleBtn.classList.remove("playing");
                if (bgMusicEl) bgMusicEl.pause();
                stopAmbientSynthMusic();
            }
        } catch (err) {
            console.warn("toggleMusic failed:", err);
            if (forcePlay !== false) {
                startAmbientSynthMusic();
            }
        }
    }

    musicToggleBtn.addEventListener("click", () => {
        playSound('click');
        toggleMusic();
    });

    // -------------------------------------------------------------------------
    // 2. Interactive Twinkling Sky Canvas Background & Shooting Stars
    // -------------------------------------------------------------------------
    const skyCanvas = document.getElementById("sky-canvas");
    const skyCtx = skyCanvas.getContext("2d");
    
    let stars = [];
    const maxStars = 150;
    let mouse = { x: null, y: null };
    
    function resizeCanvas() {
        skyCanvas.width = window.innerWidth;
        skyCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    class Star {
        constructor() {
            this.x = Math.random() * skyCanvas.width;
            this.y = Math.random() * skyCanvas.height;
            this.size = Math.random() * 1.5 + 0.5;
            this.baseAlpha = Math.random() * 0.7 + 0.3;
            this.alpha = this.baseAlpha;
            this.speed = Math.random() * 0.05 + 0.01;
            this.twinkleDir = Math.random() > 0.5 ? 1 : -1;
            this.isGolden = Math.random() < 0.08; // Clickable easter egg stars
        }
        
        update() {
            this.y -= this.speed;
            if (this.y < 0) {
                this.y = skyCanvas.height;
                this.x = Math.random() * skyCanvas.width;
            }
            
            this.alpha += this.speed * 0.5 * this.twinkleDir;
            if (this.alpha > 1) {
                this.alpha = 1;
                this.twinkleDir = -1;
            } else if (this.alpha < 0.1) {
                this.alpha = 0.1;
                this.twinkleDir = 1;
            }
        }
        
        draw() {
            skyCtx.save();
            skyCtx.globalAlpha = this.alpha;
            skyCtx.shadowBlur = this.isGolden ? this.size * 8 : this.size * 5;
            skyCtx.shadowColor = this.isGolden ? "#ffd659" : "rgba(255, 107, 139, 0.4)";
            skyCtx.fillStyle = this.isGolden ? "#ffd659" : "#ffffff";
            skyCtx.beginPath();
            skyCtx.arc(this.x, this.y, this.isGolden ? this.size * 1.5 : this.size, 0, Math.PI * 2);
            skyCtx.fill();
            skyCtx.restore();
        }
    }

    class ShootingStar {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * skyCanvas.width;
            this.y = Math.random() * skyCanvas.height * 0.4;
            this.len = Math.random() * 80 + 40;
            this.speedX = Math.random() * 8 + 4;
            this.speedY = Math.random() * 4 + 2;
            this.opacity = 0;
            this.active = false;
            this.spawnChance = 0.001; // Spawning probability per frame
        }
        update() {
            if (!this.active) {
                if (Math.random() < this.spawnChance) {
                    this.active = true;
                    this.opacity = 1;
                }
                return;
            }
            this.x += this.speedX;
            this.y += this.speedY;
            this.opacity -= 0.015;
            if (this.opacity <= 0 || this.x > skyCanvas.width || this.y > skyCanvas.height) {
                this.reset();
            }
        }
        draw() {
            if (!this.active) return;
            skyCtx.save();
            skyCtx.strokeStyle = `rgba(255, 214, 89, ${this.opacity})`;
            skyCtx.lineWidth = 1.5;
            skyCtx.shadowBlur = 8;
            skyCtx.shadowColor = "#ffd659";
            skyCtx.beginPath();
            skyCtx.moveTo(this.x, this.y);
            skyCtx.lineTo(this.x - this.len, this.y - (this.len * 0.5));
            skyCtx.stroke();
            skyCtx.restore();
        }
    }
    
    // Initialize stars
    for (let i = 0; i < maxStars; i++) {
        stars.push(new Star());
    }

    // Add 2 shooting stars
    let shootingStars = [new ShootingStar(), new ShootingStar()];
    
    window.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        
        const glow = document.getElementById("cursor-glow");
        if (glow) {
            glow.style.left = mouse.x + "px";
            glow.style.top = mouse.y + "px";
        }
    });
    
    window.addEventListener("mouseleave", () => {
        mouse.x = null;
        mouse.y = null;
    });

    // -------------------------------------------------------------------------
    // 3. Mouse Heart Particles Trail
    // -------------------------------------------------------------------------
    let heartParticles = [];
    
    class HeartParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 8 + 4;
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * -1.5 - 0.5;
            this.alpha = 1;
            this.fadeSpeed = Math.random() * 0.015 + 0.01;
            this.rotation = Math.random() * Math.PI;
            this.rotationSpeed = Math.random() * 0.02 - 0.01;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;
            this.alpha -= this.fadeSpeed;
        }
        
        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = `rgba(255, 107, 139, ${this.alpha})`;
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-this.size/2, -this.size/2, -this.size, this.size/3, 0, this.size);
            ctx.bezierCurveTo(this.size, this.size/3, this.size/2, -this.size/2, 0, 0);
            ctx.fill();
            ctx.restore();
        }
    }
    
    window.addEventListener("mousemove", (e) => {
        if (Math.random() < 0.15) {
            heartParticles.push(new HeartParticle(e.clientX, e.clientY));
        }
    });

    window.addEventListener("touchmove", (e) => {
        if (Math.random() < 0.2 && e.touches.length > 0) {
            const touch = e.touches[0];
            heartParticles.push(new HeartParticle(touch.clientX, touch.clientY));
        }
    });

    // -------------------------------------------------------------------------
    // 4. Background Canvas Loop
    // -------------------------------------------------------------------------
    function animateBackground() {
        skyCtx.clearRect(0, 0, skyCanvas.width, skyCanvas.height);
        
        stars.forEach(star => {
            star.update();
            star.draw();
        });

        shootingStars.forEach(sStar => {
            sStar.update();
            sStar.draw();
        });
        
        if (mouse.x !== null && mouse.y !== null) {
            stars.forEach(star => {
                const dx = star.x - mouse.x;
                const dy = star.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 100) {
                    skyCtx.beginPath();
                    skyCtx.strokeStyle = `rgba(212, 175, 55, ${0.12 * (1 - dist/100)})`;
                    skyCtx.lineWidth = 0.5;
                    skyCtx.moveTo(star.x, star.y);
                    skyCtx.lineTo(mouse.x, mouse.y);
                    skyCtx.stroke();
                }
            });
        }
        
        for (let i = heartParticles.length - 1; i >= 0; i--) {
            heartParticles[i].update();
            if (heartParticles[i].alpha <= 0) {
                heartParticles.splice(i, 1);
            } else {
                heartParticles[i].draw(skyCtx);
            }
        }
        
        requestAnimationFrame(animateBackground);
    }
    animateBackground();

    // -------------------------------------------------------------------------
    // 5. Easter Egg Star Click Listener
    // -------------------------------------------------------------------------
    const easterEggModal = document.getElementById("easter-egg-modal");
    const closeEggBtn = document.getElementById("close-modal");
    const eggTextEl = document.getElementById("easter-egg-message");

    window.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON" || e.target.closest(".glass-card") || e.target.closest(".glass-container") || e.target.closest(".book-container") || e.target.closest("input")) return;
        
        stars.forEach(star => {
            if (star.isGolden) {
                const dx = e.clientX - star.x;
                const dy = e.clientY - star.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 18) {
                    triggerEasterEgg(star.x, star.y);
                }
            }
        });
    });

    function triggerEasterEgg(x, y) {
        playChime(950, 0.45);
        for (let i = 0; i < 15; i++) {
            const heart = new HeartParticle(x, y);
            heart.speedX = Math.random() * 6 - 3;
            heart.speedY = Math.random() * -6 - 1;
            heart.size = Math.random() * 10 + 8;
            heartParticles.push(heart);
        }
        
        const randomQuote = easterEggQuotes[Math.floor(Math.random() * easterEggQuotes.length)];
        if (eggTextEl) eggTextEl.textContent = randomQuote;
        if (easterEggModal) easterEggModal.classList.remove("hidden");
    }

    if (closeEggBtn) {
        closeEggBtn.addEventListener("click", () => {
            playSound('click');
            easterEggModal.classList.add("hidden");
        });
    }

    // -------------------------------------------------------------------------
    // 6. Screen Transitions & State Controller
    // -------------------------------------------------------------------------
    const screens = {
        LOADING: "loading-screen",
        LANDING: "landing-screen",
        UNLOCK: "unlock-screen",
        MEMORIES: "memories-screen",
        LOVE_NOTES: "love-notes-screen",
        COUNTDOWN: "countdown-screen",
        REVEAL: "reveal-screen",
        LETTER: "letter-screen",
        REASONS: "reasons-screen",
        DREAMS: "dreams-screen",
        QUIZ: "quiz-screen",
        GIFT: "gift-screen",
        ENDING: "ending-screen"
    };

    let currentActiveScreen = screens.LOADING;

    function transitionTo(nextScreenId, callback = null) {
        const currentScreen = document.getElementById(currentActiveScreen);
        const nextScreen = document.getElementById(nextScreenId);
        
        if (!currentScreen || !nextScreen) return;
        
        currentScreen.style.opacity = 0;
        currentScreen.style.transform = "translateY(-15px) scale(0.98)";
        
        setTimeout(() => {
            currentScreen.classList.add("hidden");
            currentScreen.classList.remove("active-screen");
            
            nextScreen.classList.remove("hidden");
            nextScreen.classList.add("active-screen");
            
            nextScreen.offsetHeight; // trigger reflow
            
            nextScreen.style.opacity = 1;
            nextScreen.style.transform = "translateY(0) scale(1)";
            
            currentActiveScreen = nextScreenId;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            if (callback) callback();
        }, 800);
    }

    // -------------------------------------------------------------------------
    // 7. Loading Screen Logic
    // -------------------------------------------------------------------------
    const loadingQuotes = [
        "Unlocking beautiful memories...",
        "Gathering floating stars...",
        "Preparing the magic...",
        "Polishing golden sparkles...",
        "Crafting a romantic escape..."
    ];
    
    let quoteIndex = 0;
    const loadingText = document.getElementById("loading-text");
    
    const quoteInterval = setInterval(() => {
        quoteIndex = (quoteIndex + 1) % loadingQuotes.length;
        if (loadingText) {
            loadingText.style.opacity = 0;
            setTimeout(() => {
                loadingText.textContent = loadingQuotes[quoteIndex];
                loadingText.style.opacity = 1;
            }, 300);
        }
    }, 1500);

    setTimeout(() => {
        clearInterval(quoteInterval);
        transitionTo(screens.LANDING, () => {
            const landingTextEl = document.querySelector(".typewriter-text");
            if (landingTextEl) {
                landingTextEl.style.borderRight = "2px solid var(--accent-pink)";
                landingTextEl.style.whiteSpace = "normal";
            }
            initBirthdayCountdown();
        });
    }, 3500);

    // -------------------------------------------------------------------------
    // 8. Live Countdown Clock to Birthday
    // -------------------------------------------------------------------------
    let countdownTimerInterval = null;
    let isCountdownFinished = false;
    const targetBirthdayDate = new Date(TARGET_BIRTHDAY_STR);
    
    const daysSpan = document.getElementById("days");
    const hoursSpan = document.getElementById("hours");
    const minutesSpan = document.getElementById("minutes");
    const secondsSpan = document.getElementById("seconds");
    const bypassBtn = document.getElementById("bypass-countdown");
    const startBtn = document.getElementById("start-journey-btn");

    function initBirthdayCountdown() {
        updateClock();
        countdownTimerInterval = setInterval(updateClock, 1000);
    }

    function updateClock() {
        const now = new Date();
        const difference = targetBirthdayDate - now;

        if (difference <= 0 || isCountdownFinished) {
            clearInterval(countdownTimerInterval);
            isCountdownFinished = true;
            
            const countdownBox = document.getElementById("bday-countdown-box");
            if (countdownBox) {
                countdownBox.innerHTML = `
                    <p class="countdown-label" style="color:var(--accent-gold); font-size: 1.25rem;">
                        🎂 The Special Day is Here! 🎂
                    </p>
                    <p style="font-style:italic; margin-top:0.5rem; color:var(--text-muted);">
                        Unlocking your birthday surprise journey...
                    </p>
                `;
            }
            startBtn.style.display = "inline-flex";
            startBtn.classList.add("visible-btn");
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        if (daysSpan) daysSpan.textContent = String(days).padStart(2, '0');
        if (hoursSpan) hoursSpan.textContent = String(hours).padStart(2, '0');
        if (minutesSpan) minutesSpan.textContent = String(minutes).padStart(2, '0');
        if (secondsSpan) secondsSpan.textContent = String(seconds).padStart(2, '0');
        
        startBtn.style.display = "none";
    }

    if (bypassBtn) {
        bypassBtn.addEventListener("click", () => {
            playSound('success-bell');
            isCountdownFinished = true;
            updateClock();
        });
    }

    startBtn.addEventListener("click", () => {
        playSound('click');
        initAudioContext();
        toggleMusic(true);
        transitionTo(screens.UNLOCK);
    });

    // -------------------------------------------------------------------------
    // 9. Passcode Gate lock Card
    // -------------------------------------------------------------------------
    const unlockBtn = document.getElementById("unlock-btn");
    const padlock = document.getElementById("main-padlock");
    const passcodeField = document.getElementById("passcode-input");
    const errorTextEl = document.getElementById("unlock-error-msg");
    let isUnlocked = false;

    function handleUnlock() {
        if (isUnlocked) return;
        
        const userInput = passcodeField.value.trim().toUpperCase();
        
        if (userInput === SECRET_PASSCODE || userInput === ALT_PASSCODE || userInput === NICKNAME_PASSCODE.toUpperCase()) {
            isUnlocked = true;
            errorTextEl.textContent = "";
            padlock.classList.add("unlock-glow");
            playSound('lock-click');
            
            setTimeout(() => {
                padlock.classList.add("unlocked");
                playSound('lock-open');
            }, 500);
            
            setTimeout(() => {
                for (let i = 0; i < 20; i++) {
                    const rect = padlock.getBoundingClientRect();
                    const heart = new HeartParticle(rect.left + rect.width/2, rect.top + rect.height/2);
                    heart.speedX = Math.random() * 8 - 4;
                    heart.speedY = Math.random() * -10 - 2;
                    heart.size = Math.random() * 15 + 10;
                    heartParticles.push(heart);
                }
            }, 800);
            
            setTimeout(() => {
                transitionTo(screens.MEMORIES, () => {
                    initScrapbookAlbum();
                });
            }, 2200);
        } else {
            playSound('error-buzzer');
            padlock.classList.add("shake-error");
            errorTextEl.textContent = "Oops! That's not the secret password. Try again!";
            passcodeField.value = "";
            passcodeField.focus();
            
            setTimeout(() => {
                padlock.classList.remove("shake-error");
            }, 500);
        }
    }

    unlockBtn.addEventListener("click", handleUnlock);
    
    if (passcodeField) {
        passcodeField.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                handleUnlock();
            }
        });
    }

    padlock.addEventListener("click", () => {
        if (passcodeField.value !== "") {
            handleUnlock();
        } else {
            playSound('error-buzzer');
            padlock.classList.add("shake-error");
            errorTextEl.textContent = "Please enter the secret password first!";
            setTimeout(() => {
                padlock.classList.remove("shake-error");
            }, 500);
        }
    });

    // -------------------------------------------------------------------------
    // 10. 3D Page-Turning Scrapbook Album & Fullscreen Lightbox
    // -------------------------------------------------------------------------
    let currentBookPage = 0;
    let bookPages = [];
    let memoriesData = [];
    let currentLightboxIndex = 0;

    const nextBookBtn = document.getElementById("next-page-btn");
    const prevBookBtn = document.getElementById("prev-page-btn");
    const scrapbookBook = document.getElementById("scrapbook");
    
    // Lightbox nodes
    const lightboxModal = document.getElementById("lightbox-modal");
    const lightboxClose = document.getElementById("lightbox-close");
    const lightboxPrev = document.getElementById("lightbox-prev");
    const lightboxNext = document.getElementById("lightbox-next");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxTitle = document.getElementById("lightbox-title");
    const lightboxDate = document.getElementById("lightbox-date");
    const lightboxDesc = document.getElementById("lightbox-desc");

    function initScrapbookAlbum() {
        bookPages = document.querySelectorAll("#scrapbook .page");
        currentBookPage = 0;
        
        // Reset pages rotation classes
        bookPages.forEach(page => page.classList.remove("flipped"));
        updateBookNavigation();
        
        // Load initial images in visible spread (Lazy load wrapper)
        lazyLoadVisiblePages();
        
        // Scrape memory data for lightbox functionality
        scrapeMemoriesData();
        
        // Listeners for book page flips
        if (nextBookBtn) {
            nextBookBtn.replaceWith(nextBookBtn.cloneNode(true));
            document.getElementById("next-page-btn").addEventListener("click", () => flipNext());
        }
        if (prevBookBtn) {
            prevBookBtn.replaceWith(prevBookBtn.cloneNode(true));
            document.getElementById("prev-page-btn").addEventListener("click", () => flipPrev());
        }
        
        // Add click listener on polaroids inside pages to open lightbox
        document.querySelectorAll(".scrapbook-polaroid").forEach(pol => {
            const frame = pol.querySelector(".scrapbook-img-frame");
            if (frame) {
                frame.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const index = parseInt(pol.getAttribute("data-index"), 10);
                    openLightbox(index);
                });
            }
        });
        
        // Setup lightbox event listeners
        initLightboxListeners();
        
        // Setup continue button inside outro page (Love Notes page removed)
        const toNotesBtnScrapbook = document.getElementById("to-love-notes-btn-scrapbook");
        if (toNotesBtnScrapbook) {
            toNotesBtnScrapbook.addEventListener("click", () => {
                playSound('click');
                transitionTo(screens.COUNTDOWN, () => {
                    startCountdown();
                });
            });
        }
    }

    function scrapeMemoriesData() {
        memoriesData = [];
        const polaroids = document.querySelectorAll(".scrapbook-polaroid");
        polaroids.forEach((pol, index) => {
            const img = pol.querySelector("img");
            const titleEl = pol.querySelector(".editable-title");
            const dateEl = pol.querySelector(".editable-date");
            const descEl = pol.querySelector(".editable-desc");
            
            memoriesData.push({
                index: index,
                src: img.getAttribute("data-src") || img.getAttribute("src"),
                title: titleEl ? titleEl.textContent : "",
                date: dateEl ? dateEl.textContent : "",
                desc: descEl ? descEl.textContent : ""
            });
        });
    }

    function lazyLoadVisiblePages() {
        const loadImg = (img) => {
            if (img && img.classList.contains("lazy-load-img")) {
                img.src = img.getAttribute("data-src");
                img.classList.remove("lazy-load-img");
            }
        };

        // Cover page (Page 1 front) has no image, but Page 1 back has memory_1
        const page1BackImg = document.querySelector("#page-1 .page-back img");
        loadImg(page1BackImg);

        // Load images on the next spread based on currentBookPage
        if (currentBookPage < bookPages.length) {
            const nextPages = [
                bookPages[currentBookPage], 
                bookPages[currentBookPage + 1]
            ];
            nextPages.forEach(p => {
                if (p) {
                    p.querySelectorAll("img").forEach(img => loadImg(img));
                }
            });
        }
    }

    function flipNext() {
        if (currentBookPage < bookPages.length) {
            playSound('page-flip');
            bookPages[currentBookPage].classList.add("flipped");
            currentBookPage++;
            
            // Increment page layout z-index details
            bookPages.forEach((page, idx) => {
                if (idx < currentBookPage) {
                    page.style.zIndex = idx + 1;
                } else {
                    page.style.zIndex = bookPages.length - idx;
                }
            });
            
            lazyLoadVisiblePages();
            updateBookNavigation();
        }
    }

    function flipPrev() {
        if (currentBookPage > 0) {
            playSound('page-flip');
            currentBookPage--;
            bookPages[currentBookPage].classList.remove("flipped");
            
            bookPages.forEach((page, idx) => {
                if (idx < currentBookPage) {
                    page.style.zIndex = idx + 1;
                } else {
                    page.style.zIndex = bookPages.length - idx;
                }
            });
            
            lazyLoadVisiblePages();
            updateBookNavigation();
        }
    }

    function updateBookNavigation() {
        const nextBtn = document.getElementById("next-page-btn");
        const prevBtn = document.getElementById("prev-page-btn");
        
        if (prevBtn) {
            if (currentBookPage === 0) {
                prevBtn.style.opacity = "0.3";
                prevBtn.style.pointerEvents = "none";
            } else {
                prevBtn.style.opacity = "1";
                prevBtn.style.pointerEvents = "auto";
            }
        }
        
        if (nextBtn) {
            if (currentBookPage === bookPages.length) {
                nextBtn.style.opacity = "0.3";
                nextBtn.style.pointerEvents = "none";
            } else {
                nextBtn.style.opacity = "1";
                nextBtn.style.pointerEvents = "auto";
            }
        }
    }

    // Lightbox modal logic
    function openLightbox(index) {
        // Re-scrape custom captions typed in book pages before loading
        scrapeMemoriesData();
        
        currentLightboxIndex = index;
        const currentPhoto = memoriesData[currentLightboxIndex];
        
        if (lightboxImg) lightboxImg.src = currentPhoto.src;
        if (lightboxTitle) lightboxTitle.textContent = currentPhoto.title;
        if (lightboxDate) lightboxDate.textContent = currentPhoto.date;
        if (lightboxDesc) lightboxDesc.textContent = currentPhoto.desc;
        
        if (lightboxModal) lightboxModal.classList.remove("hidden");
        playSound('success-bell');
        
        // Add soft zoom class
        setTimeout(() => {
            const frame = document.querySelector(".lightbox-img-frame img");
            if (frame) frame.style.transform = "scale(1)";
        }, 50);
    }

    function initLightboxListeners() {
        if (lightboxClose) {
            lightboxClose.addEventListener("click", () => {
                playSound('click');
                if (lightboxModal) lightboxModal.classList.add("hidden");
            });
        }
        
        if (lightboxPrev) {
            lightboxPrev.addEventListener("click", () => {
                playSound('click');
                currentLightboxIndex = (currentLightboxIndex - 1 + memoriesData.length) % memoriesData.length;
                openLightbox(currentLightboxIndex);
            });
        }
        
        if (lightboxNext) {
            lightboxNext.addEventListener("click", () => {
                playSound('click');
                currentLightboxIndex = (currentLightboxIndex + 1) % memoriesData.length;
                openLightbox(currentLightboxIndex);
            });
        }
        
        // Sync custom inputs typed inside the Lightbox back to the actual book polaroids
        const syncTextBackToPolaroids = () => {
            const currentPol = document.querySelector(`.scrapbook-polaroid[data-index="${currentLightboxIndex}"]`);
            if (currentPol) {
                const titleEl = currentPol.querySelector(".editable-title");
                const dateEl = currentPol.querySelector(".editable-date");
                const descEl = currentPol.querySelector(".editable-desc");
                
                if (titleEl) titleEl.textContent = lightboxTitle.textContent;
                if (dateEl) dateEl.textContent = lightboxDate.textContent;
                if (descEl) descEl.textContent = lightboxDesc.textContent;
            }
        };
        
        if (lightboxTitle) lightboxTitle.addEventListener("input", syncTextBackToPolaroids);
        if (lightboxDate) lightboxDate.addEventListener("input", syncTextBackToPolaroids);
        if (lightboxDesc) lightboxDesc.addEventListener("input", syncTextBackToPolaroids);
        
        // Close on clicking overlay background
        if (lightboxModal) {
            lightboxModal.addEventListener("click", (e) => {
                if (e.target === lightboxModal) {
                    if (lightboxModal) lightboxModal.classList.add("hidden");
                }
            });
        }
    }

    // -------------------------------------------------------------------------
    // 11. Love Notes Screen (Removed)
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    // 12. Countdown Logic
    // -------------------------------------------------------------------------
    const countdownNumber = document.getElementById("countdown-number");
    
    function startCountdown() {
        let count = 5;
        countdownNumber.textContent = count;
        
        const interval = setInterval(() => {
            count--;
            
            if (count > 0) {
                countdownNumber.textContent = count;
                playSound('tick');
                
                countdownNumber.classList.remove("countdown-digit");
                void countdownNumber.offsetWidth;
                countdownNumber.classList.add("countdown-digit");
            } else {
                clearInterval(interval);
                
                const countdownScreen = document.getElementById("countdown-screen");
                countdownScreen.classList.add("dark-black-out");
                countdownNumber.style.display = 'none';
                
                setTimeout(() => {
                    playSound('explode');
                    transitionTo(screens.REVEAL, () => {
                        initRevealEffects();
                    });
                }, 1000);
            }
        }, 1500);
    }

    // -------------------------------------------------------------------------
    // 13. Grand Reveal Fireworks & Confetti Canvas Engine
    // -------------------------------------------------------------------------
    let fireworksCanvas = null;
    let fireworksCtx = null;
    let fireworksList = [];
    let fireworkParticles = [];
    let isRevealActive = false;
    
    function initRevealEffects() {
        fireworksCanvas = document.getElementById("fireworks-canvas");
        fireworksCtx = fireworksCanvas.getContext("2d");
        
        function resizeRevealCanvas() {
            if (fireworksCanvas) {
                fireworksCanvas.width = fireworksCanvas.parentElement.clientWidth;
                fireworksCanvas.height = fireworksCanvas.parentElement.clientHeight;
            }
        }
        resizeRevealCanvas();
        window.addEventListener("resize", resizeRevealCanvas);
        
        isRevealActive = true;
        animateReveal();
        
        startSpawningFireworks();
        triggerConfettiShower();
    }
    
    let confetti = [];
    const confettiColors = ['#ff6b8b', '#ffa8b6', '#d4af37', '#ffd659', '#ffffff', '#e25473'];
    
    class ConfettiPiece {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 8 + 4;
            this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            this.speedX = Math.random() * 4 - 2;
            this.speedY = Math.random() * 3 + 2;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 4 - 2;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;
        }
        
        draw(ctx) {
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation * Math.PI / 180);
            ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
            ctx.restore();
        }
    }
    
    function triggerConfettiShower(sourceY = -10, density = 120) {
        const width = window.innerWidth;
        for (let i = 0; i < density; i++) {
            confetti.push(new ConfettiPiece(Math.random() * width, sourceY - Math.random() * 20));
        }
    }
    
    class Firework {
        constructor() {
            this.x = Math.random() * fireworksCanvas.width;
            this.y = fireworksCanvas.height;
            this.targetY = Math.random() * (fireworksCanvas.height * 0.6);
            this.speed = Math.random() * 4 + 4;
            this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            this.trail = [];
            this.trailLength = 10;
        }
        
        update() {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > this.trailLength) {
                this.trail.shift();
            }
            
            this.y -= this.speed;
            if (this.y <= this.targetY) {
                this.explode();
                return false;
            }
            return true;
        }
        
        explode() {
            const count = 50 + Math.floor(Math.random() * 30);
            playSound('explode');
            for (let i = 0; i < count; i++) {
                fireworkParticles.push(new FireworkParticle(this.x, this.y, this.color));
            }
        }
        
        draw() {
            fireworksCtx.beginPath();
            fireworksCtx.strokeStyle = this.color;
            fireworksCtx.lineWidth = 2;
            if (this.trail.length > 0) {
                fireworksCtx.moveTo(this.trail[0].x, this.trail[0].y);
                for (let i = 1; i < this.trail.length; i++) {
                    fireworksCtx.lineTo(this.trail[i].x, this.trail[i].y);
                }
            } else {
                fireworksCtx.moveTo(this.x, this.y);
                fireworksCtx.lineTo(this.x, this.y + 5);
            }
            fireworksCtx.stroke();
        }
    }
    
    class FireworkParticle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.angle = Math.random() * Math.PI * 2;
            this.speed = Math.random() * 5 + 1;
            this.friction = 0.96;
            this.gravity = 0.08;
            this.alpha = 1;
            this.fade = Math.random() * 0.02 + 0.01;
        }
        
        update() {
            this.speed *= this.friction;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed + this.gravity;
            this.alpha -= this.fade;
        }
        
        draw() {
            fireworksCtx.save();
            fireworksCtx.globalAlpha = this.alpha;
            fireworksCtx.fillStyle = this.color;
            fireworksCtx.beginPath();
            fireworksCtx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            fireworksCtx.fill();
            fireworksCtx.restore();
        }
    }
    
    let fireworkTimer = null;
    function startSpawningFireworks() {
        fireworkTimer = setInterval(() => {
            if (fireworksList.length < 5) {
                fireworksList.push(new Firework());
            }
        }, 1200);
    }
    
    function animateReveal() {
        if (!isRevealActive) return;
        
        fireworksCtx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        fireworksCtx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
        
        for (let i = fireworksList.length - 1; i >= 0; i--) {
            if (!fireworksList[i].update()) {
                fireworksList.splice(i, 1);
            } else {
                fireworksList[i].draw();
            }
        }
        
        for (let i = fireworkParticles.length - 1; i >= 0; i--) {
            fireworkParticles[i].update();
            if (fireworkParticles[i].alpha <= 0) {
                fireworkParticles.splice(i, 1);
            } else {
                fireworkParticles[i].draw();
            }
        }
        
        for (let i = confetti.length - 1; i >= 0; i--) {
            confetti[i].update();
            if (confetti[i].y > fireworksCanvas.height + 10) {
                confetti.splice(i, 1);
            } else {
                confetti[i].draw(fireworksCtx);
            }
        }
        
        requestAnimationFrame(animateReveal);
    }
    
    // Blowing out the candle & Wish Form Popup
    const flame = document.getElementById("cake-candle-flame");
    const wishModal = document.getElementById("wish-modal");
    const submitWishBtn = document.getElementById("submit-wish-btn");
    const wishInputText = document.getElementById("wish-input");

    flame.addEventListener("click", () => {
        if (flame.classList.contains("extinguished")) return;
        
        playSound('blow');
        flame.classList.add("extinguished");
        
        const rect = flame.getBoundingClientRect();
        for (let i = 0; i < 15; i++) {
            const piece = new ConfettiPiece(rect.left + rect.width/2, rect.top);
            piece.color = '#7f8c8d'; // Grey smoke
            piece.speedX = Math.random() * 2 - 1;
            piece.speedY = Math.random() * -3 - 1;
            piece.size = Math.random() * 5 + 3;
            confetti.push(piece);
        }
        
        setTimeout(() => {
            if (wishModal) wishModal.classList.remove("hidden");
        }, 1000);
    });

    if (submitWishBtn) {
        submitWishBtn.addEventListener("click", () => {
            playSound('success-bell');
            if (wishModal) wishModal.classList.add("hidden");
            
            const rect = flame.getBoundingClientRect();
            for (let i = 0; i < 30; i++) {
                const heart = new HeartParticle(rect.left + rect.width/2, rect.top);
                heart.speedX = Math.random() * 8 - 4;
                heart.speedY = Math.random() * -8 - 2;
                heart.size = Math.random() * 12 + 6;
                heartParticles.push(heart);
            }

            const textPrompt = document.querySelector(".blow-instruction");
            if (textPrompt) {
                textPrompt.textContent = "Your secret wish has been sent to the universe! ❤️";
                textPrompt.style.color = "var(--accent-pink)";
            }
        });
    }

    const toLetterBtn = document.getElementById("to-letter-btn");
    toLetterBtn.addEventListener("click", () => {
        playSound('click');
        clearInterval(fireworkTimer);
        isRevealActive = false;
        transitionTo(screens.LETTER, () => {
            startTypewriterLetter();
        });
    });

    // -------------------------------------------------------------------------
    // 14. Birthday Letter Typing Effect
    // -------------------------------------------------------------------------
    function startTypewriterLetter() {
        const sourceText = document.getElementById("source-letter-text").innerHTML;
        const targetSpan = document.getElementById("typed-letter-text");
        const nextBtn = document.getElementById("to-reasons-btn");
        
        targetSpan.textContent = "";
        let charIndex = 0;
        
        function typeChar() {
            if (charIndex < sourceText.length) {
                targetSpan.textContent += sourceText.charAt(charIndex);
                
                if (Math.random() < 0.22) {
                    playChime(1200 + Math.random() * 300, 0.04);
                }
                
                charIndex++;
                setTimeout(typeChar, 40);
            } else {
                document.querySelector(".cursor").style.display = 'none';
                if (nextBtn) {
                    nextBtn.classList.remove("hidden-btn");
                    nextBtn.classList.add("visible-btn");
                }
            }
        }
        
        setTimeout(typeChar, 800);
    }

    // -------------------------------------------------------------------------
    // 15. Cassette Voice Message Player (Fallback Synthesizer)
    // -------------------------------------------------------------------------
    // Cassette Voice Message Player (Removed)

    const toReasonsBtn = document.getElementById("to-reasons-btn");
    toReasonsBtn.addEventListener("click", () => {
        playSound('click');
        transitionTo(screens.REASONS);
    });

    // -------------------------------------------------------------------------
    // 16. Reasons Falling Hearts Clicker Board
    // -------------------------------------------------------------------------
    const heartBoxes = document.querySelectorAll(".interactive-heart-box");
    let revealedHeartsCount = 0;
    
    heartBoxes.forEach(box => {
        box.addEventListener("click", () => {
            if (box.classList.contains("revealed")) return;
            
            box.classList.add("revealed");
            revealedHeartsCount++;
            
            playChime(400 + revealedHeartsCount * 120, 0.4);
            
            const rect = box.querySelector(".interactive-heart").getBoundingClientRect();
            for (let i = 0; i < 8; i++) {
                const heart = new HeartParticle(rect.left + rect.width/2, rect.top + rect.height/2);
                heart.speedX = Math.random() * 4 - 2;
                heart.speedY = Math.random() * -4 - 1;
                heart.size = Math.random() * 8 + 4;
                heartParticles.push(heart);
            }
        });
    });

    const toDreamsBtn = document.getElementById("to-dreams-btn");
    toDreamsBtn.addEventListener("click", () => {
        playSound('click');
        transitionTo(screens.QUIZ, () => {
            initRelationshipQuiz();
        });
    });

    // -------------------------------------------------------------------------
    // 18. "How Well Do You Know Us?" Quiz Logic
    // -------------------------------------------------------------------------
    let currentQuizIndex = 0;
    const progressText = document.getElementById("quiz-progress-text");
    const progressBar = document.getElementById("quiz-progress-bar");
    const questionTitle = document.getElementById("quiz-question-title");
    const optionsBox = document.getElementById("quiz-options-box");
    const feedbackText = document.getElementById("quiz-feedback-text");
    
    function initRelationshipQuiz() {
        currentQuizIndex = 0;
        feedbackText.textContent = "";
        feedbackText.className = "quiz-feedback";
        loadQuizQuestion();
    }

    function loadQuizQuestion() {
        if (!optionsBox) return;
        
        const currentData = quizQuestions[currentQuizIndex];
        
        progressText.textContent = `Question ${currentQuizIndex + 1} of ${quizQuestions.length}`;
        const percent = ((currentQuizIndex + 1) / quizQuestions.length) * 100;
        progressBar.style.width = `${percent}%`;
        
        questionTitle.textContent = currentData.question;
        optionsBox.innerHTML = "";
        
        currentData.options.forEach((optText, optIndex) => {
            const btn = document.createElement("button");
            btn.className = "quiz-option-btn";
            btn.textContent = optText;
            btn.addEventListener("click", () => handleQuizAnswer(optIndex, btn));
            optionsBox.appendChild(btn);
        });
    }

    function handleQuizAnswer(selectedIndex, clickedBtn) {
        const currentData = quizQuestions[currentQuizIndex];
        const optionBtns = optionsBox.querySelectorAll(".quiz-option-btn");
        optionBtns.forEach(btn => btn.style.pointerEvents = "none");
        
        if (selectedIndex === currentData.correctIndex) {
            playSound('success-bell');
            clickedBtn.classList.add("correct-choice");
            feedbackText.textContent = currentData.feedback;
            feedbackText.className = "quiz-feedback success";
            
            const rect = clickedBtn.getBoundingClientRect();
            for (let i = 0; i < 15; i++) {
                const heart = new HeartParticle(rect.left + rect.width/2, rect.top + rect.height/2);
                heart.speedX = Math.random() * 4 - 2;
                heart.speedY = Math.random() * -6 - 2;
                heartParticles.push(heart);
            }
            
            setTimeout(() => {
                currentQuizIndex++;
                if (currentQuizIndex < quizQuestions.length) {
                    feedbackText.textContent = "";
                    loadQuizQuestion();
                } else {
                    triggerConfettiShower();
                    playSound('lock-open');
                    transitionTo(screens.GIFT);
                }
            }, 2200);
        } else {
            playSound('error-buzzer');
            clickedBtn.classList.add("wrong-choice");
            feedbackText.textContent = "Oops! That's not the one, try again! 😊";
            feedbackText.className = "quiz-feedback error";
            
            setTimeout(() => {
                clickedBtn.classList.remove("wrong-choice");
                feedbackText.textContent = "";
                optionBtns.forEach(btn => btn.style.pointerEvents = "auto");
            }, 1500);
        }
    }

    // -------------------------------------------------------------------------
    // 19. Final Surprise Gift Box Surprise
    // -------------------------------------------------------------------------
    const giftContainer = document.getElementById("gift-box-container");
    const toEndingBtn = document.getElementById("to-ending-btn");
    let isGiftOpened = false;

    giftContainer.addEventListener("click", () => {
        if (isGiftOpened) return;
        isGiftOpened = true;
        
        playSound('lock-open');
        giftContainer.classList.add("opened");
        
        setTimeout(() => {
            const rect = giftContainer.getBoundingClientRect();
            triggerConfettiShower(rect.top + rect.height/2, 100);
            playSound('explode');
        }, 600);
        
        setTimeout(() => {
            if (toEndingBtn) {
                toEndingBtn.classList.remove("hidden-btn");
                toEndingBtn.classList.add("visible-btn");
            }
        }, 1500);
    });

    toEndingBtn.addEventListener("click", () => {
        playSound('click');
        transitionTo(screens.ENDING);
    });

    // -------------------------------------------------------------------------
    // 20. Replay Button Loop Reset
    // -------------------------------------------------------------------------
    const replayBtn = document.getElementById("replay-btn");
    replayBtn.addEventListener("click", () => {
        playSound('click');
        
        isUnlocked = false;
        padlock.classList.remove("unlocked", "unlock-glow");
        passcodeField.value = "";
        errorTextEl.textContent = "";
        
        // Reset Scrapbook Pages flip
        bookPages.forEach(p => p.classList.remove("flipped"));
        currentBookPage = 0;
        updateBookNavigation();
        
        // Reset love notes (Removed)
        
        // Reset countdown screen
        countdownNumber.style.display = 'block';
        const countdownScreen = document.getElementById("countdown-screen");
        countdownScreen.classList.remove("dark-black-out");
        
        // Reset letter typing
        const typingLetterText = document.getElementById("typed-letter-text");
        if (typingLetterText) typingLetterText.textContent = "";
        const cursorEl = document.querySelector(".cursor");
        if (cursorEl) cursorEl.style.display = "inline";
        
        // Reset clickable heart reasons
        revealedHeartsCount = 0;
        heartBoxes.forEach(box => box.classList.remove("revealed"));
        
        document.getElementById("to-reasons-btn").classList.add("hidden-btn");
        document.getElementById("to-reasons-btn").classList.remove("visible-btn");
        
        // Reset constellation dreams (Dreams page removed)
        
        // Reset wishing candle blowout
        flame.classList.remove("extinguished");
        const textPrompt = document.querySelector(".blow-instruction");
        if (textPrompt) {
            textPrompt.textContent = "(Tap the flame to blow it out and make a wish!)";
            textPrompt.style.color = "var(--accent-gold)";
        }
        
        // Reset gift surprise box
        isGiftOpened = false;
        giftContainer.classList.remove("opened");
        toEndingBtn.classList.add("hidden-btn");
        toEndingBtn.classList.remove("visible-btn");
        
        // Go back to Landing screen
        transitionTo(screens.LANDING, () => {
            initBirthdayCountdown();
        });
    });
});
