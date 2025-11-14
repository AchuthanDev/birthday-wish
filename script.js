// Global variables for timers and progression control
let progressionTimers = [];
let setupNextButtons = null; // Global function for next buttons (will be defined in initPasswordUnlock)

// Helper function to clear all section progression timers
function clearProgressionTimers() {
    progressionTimers.forEach(timer => clearTimeout(timer));
    progressionTimers = [];
}

// Helper function to transition between sections (Defined globally once)
function transitionToSection(fromSection, toSection) {
    if (!fromSection || !toSection) return;

    // Clear auto-progression when a manual transition occurs
    clearProgressionTimers();
    
    // Smooth transition logic
    if (!fromSection.classList.contains('hidden')) {
        fromSection.style.opacity = '0';
        fromSection.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            fromSection.classList.add('hidden');
            // Reset styles for next time
            fromSection.style.opacity = ''; 
            fromSection.style.transform = '';
            
            toSection.classList.remove('hidden');
            toSection.style.opacity = '0';
            toSection.style.transform = 'translateY(20px)';
            
            // Scroll into view immediately
            toSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Use requestAnimationFrame to ensure the 'hidden' class removal is processed
            // before applying the transition styles for the fade-in.
            requestAnimationFrame(() => {
                toSection.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                toSection.style.opacity = '1';
                toSection.style.transform = 'translateY(0)';
            });
            
        }, 300); // Matches CSS transition time
    }
}

// Auto-progression through all sections with smooth transitions
// startIndex: 0=entrance, 1=slideshow, 2=letter
function progressThroughSections(startIndex = 0) {
    clearProgressionTimers(); // Clear any existing timers before starting new ones
    
    const entranceSection = document.getElementById('entrance-section');
    const slideshowSection = document.getElementById('slideshow-section');
    const letterSection = document.getElementById('letter-section');
    const giftSection = document.getElementById('gift-section');

    const delays = [15000, 15000, 15000]; // 15s delay between each section

    // Entrance -> Slideshow (starts after 15s)
    if (startIndex <= 0) {
        progressionTimers.push(setTimeout(() => {
            if (entranceSection && !entranceSection.classList.contains('hidden')) {
                transitionToSection(entranceSection, slideshowSection);
                progressThroughSections(1); // Continue progression from slideshow
            }
        }, delays[0]));
        return; // Only set one timer at a time
    }
    
    // Slideshow -> Letter (starts after 15s in slideshow)
    if (startIndex <= 1) {
        progressionTimers.push(setTimeout(() => {
            if (slideshowSection && !slideshowSection.classList.contains('hidden')) {
                transitionToSection(slideshowSection, letterSection);
                progressThroughSections(2); // Continue progression from letter
            }
        }, delays[1]));
        return;
    }
    
    // Letter -> Gift Box (starts after 15s in letter)
    if (startIndex <= 2) {
        progressionTimers.push(setTimeout(() => {
            if (letterSection && !letterSection.classList.contains('hidden')) {
                transitionToSection(letterSection, giftSection);
                // Progression stops here; gift box click takes over
            }
        }, delays[2]));
    }
}


// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initParticles();
    initHearts(); // Init hearts before entrance
    initPasswordUnlock();
    initSlideshow();
    initGiftBox();
    initStars();
    initSmoothScroll(); // Must be after other inits
    
    // Setup next buttons (called after all sections are initialized)
    // No setTimeout needed, just call it directly.
    if (typeof window.setupNextButtons === 'function') {
        window.setupNextButtons();
    }
    
    // Handle image loading errors gracefully for all images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            // Replace broken image with a placeholder
            const parent = this.parentElement;
            if (parent && parent.classList.contains('slideshow-slide')) {
                 // For slideshows, replace with a styled div
                const fallbackDiv = document.createElement('div');
                fallbackDiv.className = 'image-fallback';
                fallbackDiv.innerHTML = '💜 Image Not Found 🖼️';
                parent.appendChild(fallbackDiv);
                this.remove(); // Remove the broken img tag
            } else {
                 // For other images, just hide it
                this.style.display = 'none';
                console.warn(`Image failed to load: ${this.src}`);
            }
        });
    });
});


// 1. BTS Logo Particles on Landing Page
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 30;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 20 + 10;
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * 2 - 1;
            this.opacity = Math.random() * 0.5 + 0.3;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 2 - 1;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;
            
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.globalAlpha = this.opacity;
            ctx.font = `${this.size}px Arial`;
            ctx.fillStyle = '#c084fc';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = 'transparent';
            if (!this.iconIndex) {
                const icons = ['💜', '⭐', '✨', '🦋', '🧸', '🎀', '💐', '🌸', '🦄', '💎', '🔮', '💫', '🌙', '🌟', '🎪', '🎨'];
                this.iconIndex = Math.floor(Math.random() * icons.length);
                this.icon = icons[this.iconIndex];
            }
            ctx.fillText(this.icon, 0, 0);
            ctx.restore();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// 2. Password Unlock Functionality
function initPasswordUnlock() {
    const passwordInput = document.getElementById('password-input');
    const unlockBtn = document.getElementById('unlock-btn');
    const errorMessage = document.getElementById('error-message');
    const unlockSection = document.getElementById('unlock-section');
    const entranceSection = document.getElementById('entrance-section');
    
    if (!passwordInput || !unlockBtn) return;
    
    function checkPassword() {
        const password = passwordInput.value.trim();
        if (password === '09' || password === '9') {
            errorMessage.classList.add('hidden');
            createConfetti(unlockSection);
            unlockSection.style.animation = 'shake 0.5s';
            
            setTimeout(() => {
                // Use global transition function
                transitionToSection(unlockSection, entranceSection); 
                
                // Start auto-progression from the beginning
                progressThroughSections(0); 
            }, 1500);
        } else {
            errorMessage.classList.remove('hidden');
            passwordInput.style.animation = 'shake 0.5s';
            passwordInput.value = '';
            
            setTimeout(() => {
                passwordInput.style.animation = '';
            }, 500);
        }
    }
    
    // Store function globally so it can be called from outside
    window.setupNextButtons = function() {
        const entranceSection = document.getElementById('entrance-section');
        const slideshowSection = document.getElementById('slideshow-section');
        const letterSection = document.getElementById('letter-section');
        const giftSection = document.getElementById('gift-section');
        const outroSection = document.getElementById('outro-section');
        
        const entranceNextBtn = document.getElementById('entrance-next-btn');
        const slideshowNextBtn = document.getElementById('slideshow-next-btn');
        const letterNextBtn = document.getElementById('letter-next-btn');
        const giftNextBtn = document.getElementById('gift-next-btn');
        const restartBtn = document.getElementById('restart-btn');
        
        // Use global transitionToSection and clearProgressionTimers
        
        if (entranceNextBtn) {
            entranceNextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                transitionToSection(entranceSection, slideshowSection);
                progressThroughSections(1); // Start auto-progression from slideshow
            });
        }
        
        if (slideshowNextBtn) {
            slideshowNextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                transitionToSection(slideshowSection, letterSection);
                progressThroughSections(2); // Start auto-progression from letter
            });
        }
        
        if (letterNextBtn) {
            letterNextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                transitionToSection(letterSection, giftSection);
                // Auto-progression stops, waits for gift open
            });
        }
        
        if (giftNextBtn) {
            giftNextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                transitionToSection(giftSection, outroSection);
            });
        }
        
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                clearProgressionTimers();
                
                // Hide all progressing sections
                document.querySelectorAll('.section').forEach(section => {
                    const id = section.id;
                    if (id !== 'landing' && id !== 'unlock-section') {
                        section.classList.add('hidden');
                    }
                });

                // Show the initial sections
                const landingSection = document.getElementById('landing');
                const unlockSection = document.getElementById('unlock-section');
                if (landingSection) landingSection.classList.remove('hidden');
                if (unlockSection) unlockSection.classList.remove('hidden');
                
                // Reset password input
                const passwordInput = document.getElementById('password-input');
                if(passwordInput) passwordInput.value = '';
                
                // Scroll to top
                if (landingSection) {
                    landingSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    };
    
    // Also assign to global variable (for legacy access if needed)
    setupNextButtons = window.setupNextButtons;
    
    // Keep click-to-skip on entrance section
    if (entranceSection) {
        entranceSection.addEventListener('click', function(e) {
            if (e.target.id === 'entrance-next-btn' || this.classList.contains('hidden')) return;
            
            transitionToSection(this, document.getElementById('slideshow-section'));
            progressThroughSections(1); // Start auto-progression from slideshow
        });
    }
    
    unlockBtn.addEventListener('click', checkPassword);
    
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
}

// 3. Confetti Effect (for successful unlock)
function createConfetti(container) {
    const colors = ['#c084fc', '#a855f7', '#9333ea', '#7e22ce'];
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = confetti.style.width;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '1000';
        
        container.appendChild(confetti);
        
        const animationDuration = Math.random() * 2 + 2;
        const horizontalMovement = (Math.random() - 0.5) * 200;
        
        // Animate the fall
        confetti.style.transition = `all ${animationDuration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        
        // Use setTimeout to apply transform after transition is set
        setTimeout(() => {
            confetti.style.transform = `translate(${horizontalMovement}px, ${window.innerHeight + 100}px) rotate(${Math.random() * 720}deg)`;
            confetti.style.opacity = '0';
        }, 10);
        
        setTimeout(() => {
            confetti.remove();
        }, animationDuration * 1000 + 100);
    }
}

// 4. Hearts and Sparkles Animation (on entrance)
function initHearts() {
    const canvas = document.getElementById('hearts-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const hearts = [];
    
    class Heart {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 15 + 5;
            this.speedY = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.5 + 0.3;
            this.rotation = Math.random() * 360;
        }
        
        update() {
            this.y -= this.speedY;
            this.rotation += 2;
            this.opacity -= 0.005;
            
            if (this.y < -50 || this.opacity <= 0) {
                this.y = canvas.height + 50;
                this.x = Math.random() * canvas.width;
                this.opacity = Math.random() * 0.5 + 0.3;
            }
        }
        
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.globalAlpha = this.opacity;
            ctx.font = `${this.size}px Arial`;
            ctx.fillStyle = '#c084fc';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = 'transparent';
            ctx.lineWidth = 0;
            if (!this.icon) {
                const icons = ['💜', '⭐', '✨', '🦋', '🧸', '🎀', '💐', '🌸', '🦄', '💎', '🔮', '💫', '🌙', '🌟'];
                this.icon = icons[Math.floor(Math.random() * icons.length)];
            }
            ctx.fillText(this.icon, 0, 0);
            ctx.restore();
        }
    }
    
    for (let i = 0; i < 20; i++) {
        hearts.push(new Heart());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hearts.forEach(heart => {
            heart.update();
            heart.draw();
        });
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// 5. Slideshow Functionality
function initSlideshow() {
    const slides = document.querySelectorAll('.slideshow-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const slideshowSection = document.getElementById('slideshow-section');
    
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    let autoSlideInterval;
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) {
                slide.classList.add('active');
            }
        });
        
        dots.forEach((dot, i) => {
            dot.classList.remove('active');
            if (i === index) {
                dot.classList.add('active');
            }
        });
        
        currentSlide = index;
    }
    
    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }
    
    function prevSlide() {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
    }
    
    function startAutoSlide() {
        stopAutoSlide(); // Ensure only one interval runs
        autoSlideInterval = setInterval(nextSlide, 4000);
    }
    
    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    }
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            stopAutoSlide();
            startAutoSlide();
        });
    });
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.target.id === 'slideshow-section' && entry.isIntersecting) {
                startAutoSlide();
            } else {
                stopAutoSlide();
            }
        });
    }, { threshold: 0.5 });
    
    if (slideshowSection) {
        observer.observe(slideshowSection);
    }
    
    showSlide(0);
}

// 6. Gift Box Reveal
function initGiftBox() {
    const giftBox = document.getElementById('gift-box');
    const giftSection = document.getElementById('gift-section');
    const giftReveal = document.getElementById('gift-reveal');
    const youtubePlayer = document.getElementById('youtube-player');
    const customVideo = document.getElementById('custom-video');
    const confettiCanvas = document.getElementById('confetti-canvas');
    const outroSection = document.getElementById('outro-section'); // Needed for progression
    
    if (!giftBox || !giftReveal) return;
    
    let isOpened = false;
    let youtubeWasPlaying = !youtubePlayer.src.includes('mute=1');
    
    // Function to handle auto-progression to Outro after gift reveal
    function startOutroProgression() {
        clearProgressionTimers(); // Clear any pre-existing timers
        
        // Auto-progress to Outro 20 seconds after the gift is opened
        progressionTimers.push(setTimeout(() => {
            if (giftSection && !giftSection.classList.contains('hidden') && outroSection) {
                 transitionToSection(giftSection, outroSection);
            }
        }, 20000)); // 20-second delay
    }
    
    // Handle custom video playback - mute YouTube music when video plays
    if (customVideo) {
        
        const postMessageToPlayer = (func) => {
             try {
                youtubePlayer.contentWindow.postMessage(`{"event":"command","func":"${func}","args":""}`, '*');
            } catch (e) {
                console.warn("Could not postMessage to YouTube player", e);
            }
        };

        customVideo.addEventListener('play', function() {
            if (youtubePlayer) {
                // Check if YouTube was unmuted before we started
                youtubeWasPlaying = !youtubePlayer.src.includes('mute=1');
                postMessageToPlayer('pauseVideo');
            }
            customVideo.volume = 1.0; 
        });
        
        const handleVideoEndOrPause = function() {
             // Unmute YouTube music when video is paused/ended (if it was playing before)
            if (youtubePlayer && youtubeWasPlaying) {
                 postMessageToPlayer('playVideo');
            }
        };
        
        customVideo.addEventListener('pause', handleVideoEndOrPause);
        customVideo.addEventListener('ended', handleVideoEndOrPause);
        
        // Handle video loading errors gracefully
        customVideo.addEventListener('error', function() {
             const container = this.parentElement;
             if(container) {
                 // Replace video with an error message
                 const errorP = document.createElement('p');
                 errorP.className = 'video-error-message'; // Added a class for styling
                 errorP.textContent = 'Video Not Found! Please check the file path: assets/video/Birthday_Wish_Video_Generated.mp4';
                 container.innerHTML = ''; // Clear the container
                 container.appendChild(errorP);
             }
        });
    }
    
    giftBox.addEventListener('click', function() {
        if (isOpened) return;
        isOpened = true;
        
        // IMPORTANT: Clear any pending auto-progression timer
        clearProgressionTimers(); 
        
        giftBox.classList.add('opened');
        
        setTimeout(() => {
            createConfettiBurst(confettiCanvas);
        }, 300);
        
        setTimeout(() => {
            giftReveal.classList.remove('hidden');
            
            setTimeout(() => {
                giftReveal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 500);
            
            // START the auto-progression to outro *after* the box is opened
            startOutroProgression(); 
        }, 800);
    });
}

// Confetti Burst Effect
function createConfettiBurst(canvas) {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const colors = ['#c084fc', '#a855f7', '#9333ea', '#7e22ce', '#ffffff'];
    const particles = [];
    const particleCount = 150;
    
    class ConfettiParticle {
        constructor() {
            // Start position is center of the viewport/canvas
            this.x = canvas.width / 2;
            this.y = canvas.height / 2; 
            this.vx = (Math.random() - 0.5) * 15;
            this.vy = (Math.random() - 1.2) * 15; // Shoot mostly upwards
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.size = Math.random() * 8 + 4;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 10;
            this.gravity = 0.5; // Stronger gravity
            this.opacity = 1;
            this.life = 1;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity;
            this.rotation += this.rotationSpeed;
            this.life -= 0.015; // Faster fade
            this.opacity = Math.max(0, this.life);
        }
        
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            ctx.restore();
        }
        
        isDead() {
            return this.life <= 0 || this.y > canvas.height + 20;
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new ConfettiParticle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
        
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            particle.update();
            particle.draw();
            
            if (particle.isDead()) {
                particles.splice(i, 1);
            }
        }
        
        if (particles.length > 0) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// 7. Trending Icons on Outro (Purple/White themed)
function initStars() {
    const canvas = document.getElementById('outro-icons-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const icons = [];
    const trendingIcons = ['💜', '⭐', '✨', '🦋', '🧸', '🎀', '💐', '🌸', '🦄', '💎', '🔮', '💫', '🌙', '🌟', '🎪', '🎨', '💖', '🤍', '💝', '🎭'];
    const colors = ['#c084fc', '#a855f7', '#ffffff', '#f3e8ff', '#e9d5ff'];
    
    class FloatingIcon {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 30 + 20;
            this.speedX = (Math.random() - 0.5) * 1;
            this.speedY = (Math.random() - 0.5) * 1;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 2;
            this.opacity = Math.random() * 0.6 + 0.4;
            this.icon = trendingIcons[Math.floor(Math.random() * trendingIcons.length)];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.floatOffset = Math.random() * Math.PI * 2;
            this.floatSpeed = Math.random() * 0.02 + 0.01;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY + Math.sin(this.floatOffset) * 0.5;
            this.rotation += this.rotationSpeed;
            this.floatOffset += this.floatSpeed;
            
            if (this.x > canvas.width + 50) this.x = -50;
            if (this.x < -50) this.x = canvas.width + 50;
            if (this.y > canvas.height + 50) this.y = -50;
            if (this.y < -50) this.y = canvas.height + 50;
        }
        
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.globalAlpha = this.opacity;
            ctx.font = `${this.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = 'transparent';
            ctx.lineWidth = 0;
            
            if (this.color !== '#ffffff') {
                ctx.shadowBlur = 15;
                ctx.shadowColor = this.color;
            }
            
            ctx.fillText(this.icon, 0, 0);
            ctx.restore();
        }
    }
    
    for (let i = 0; i < 25; i++) {
        icons.push(new FloatingIcon());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        icons.forEach(icon => {
            icon.update();
            icon.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// 8. Smooth Scroll
function initSmoothScroll() {
    // Smooth scroll for internal links (if any are added)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // REMOVED the conflicting IntersectionObserver logic.
    // The `transitionToSection` function now handles all fades.
    // We must manually set the initial opacity of sections that are part of the
    // flow but are not hidden, so they can be faded in.
    
    // Set initial opacity to 0 for sections that will be faded in
    // by the JS transition logic.
    document.querySelectorAll('.section').forEach(section => {
        if (section.id !== 'landing' && section.id !== 'unlock-section') {
             // Already hidden by 'hidden' class, but this ensures
             // they are ready for the fade-in transition
            section.style.opacity = '0';
        }
    });

    // The landing and unlock sections should be visible on load
    const landing = document.getElementById('landing');
    const unlock = document.getElementById('unlock-section');
    if (landing) landing.style.opacity = '1';
    if (unlock) unlock.style.opacity = '1';
}