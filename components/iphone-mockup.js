// iPhone Mockup Carousel Functionality
class iPhoneMockup {
    constructor(mockupElement) {
        this.mockup = mockupElement;
        this.frame = mockupElement.querySelector('.iphone-frame');
        this.screenshots = mockupElement.querySelectorAll('.screenshot-img');
        this.dots = mockupElement.querySelectorAll('.dot');
        this.prevBtn = mockupElement.querySelector('.prev-btn');
        this.nextBtn = mockupElement.querySelector('.next-btn');
        this.currentIndex = 0;
        this.autoPlay = null;

        if (this.screenshots.length > 0) {
            this.init();
        }
    }

    init() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.prev();
            });
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.next();
            });
        }

        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToSlide(index);
            });
        });

        // Auto-play carousel every 5 seconds
        this.startAutoPlay();

        // Pause auto-play on hover
        this.mockup.addEventListener('mouseenter', () => {
            this.stopAutoPlay();
        });

        this.mockup.addEventListener('mouseleave', () => {
            this.startAutoPlay();
        });

        // Add 3D mouse tracking effect
        this.init3DEffect();
    }

    init3DEffect() {
        if (!this.frame) return;

        let isHoveringFrame = false;
        let mouseX = 0;
        let mouseY = 0;
        let rafId = null;

        // Update mouse position without triggering transform
        const updateMousePosition = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        // Apply transform using requestAnimationFrame for smooth updates
        const applyTransform = () => {
            if (isHoveringFrame) {
                rafId = null;
                return;
            }

            const rect = this.mockup.getBoundingClientRect();
            const mockupCenterX = rect.left + rect.width / 2;
            const mockupCenterY = rect.top + rect.height / 2;

            const deltaX = mouseX - mockupCenterX;
            const deltaY = mouseY - mockupCenterY;

            const maxDistance = Math.max(window.innerWidth, window.innerHeight);
            const rotateY = (deltaX / maxDistance) * 15;
            const rotateX = (deltaY / maxDistance) * -15;

            this.frame.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1)`;

            rafId = requestAnimationFrame(applyTransform);
        };

        // Track mouse globally when outside mockup frame
        document.addEventListener('mousemove', (e) => {
            updateMousePosition(e);

            if (!isHoveringFrame && !rafId) {
                rafId = requestAnimationFrame(applyTransform);
            }
        }, { passive: true });

        // Center when mouse enters the frame itself
        this.frame.addEventListener('mouseenter', () => {
            isHoveringFrame = true;
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            this.frame.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1.02)';
        });

        // Resume tracking when mouse leaves the frame
        this.frame.addEventListener('mouseleave', () => {
            isHoveringFrame = false;
            if (!rafId) {
                rafId = requestAnimationFrame(applyTransform);
            }
        });
    }

    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlay = setInterval(() => this.next(), 3000);
    }

    stopAutoPlay() {
        if (this.autoPlay) {
            clearInterval(this.autoPlay);
            this.autoPlay = null;
        }
    }

    goToSlide(index) {
        if (this.screenshots[this.currentIndex]) {
            this.screenshots[this.currentIndex].classList.remove('active');
        }
        if (this.dots[this.currentIndex]) {
            this.dots[this.currentIndex].classList.remove('active');
        }

        this.currentIndex = index;

        if (this.screenshots[this.currentIndex]) {
            this.screenshots[this.currentIndex].classList.add('active');
        }
        if (this.dots[this.currentIndex]) {
            this.dots[this.currentIndex].classList.add('active');
        }
    }

    next() {
        const nextIndex = (this.currentIndex + 1) % this.screenshots.length;
        this.goToSlide(nextIndex);
    }

    prev() {
        const prevIndex = (this.currentIndex - 1 + this.screenshots.length) % this.screenshots.length;
        this.goToSlide(prevIndex);
    }

    destroy() {
        this.stopAutoPlay();
    }
}

// Initialize mockups function
function initializeMockups() {
    const mockups = document.querySelectorAll('.iphone-mockup');
    mockups.forEach(mockup => {
        if (!mockup.dataset.initialized) {
            new iPhoneMockup(mockup);
            mockup.dataset.initialized = 'true';
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeMockups);

// Re-initialize when content changes (for dynamically loaded sections)
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
            initializeMockups();
        }
    });
});

// Observe the content container for changes
if (document.getElementById('content-container')) {
    observer.observe(document.getElementById('content-container'), {
        childList: true,
        subtree: true
    });
}
