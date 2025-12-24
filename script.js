document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentContainer = document.getElementById('content-container');
    const avatarContainer = document.getElementById('avatar-container');
    const lightbox = document.getElementById('lightbox');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxBackdrop = document.querySelector('.lightbox-backdrop');
    const cvModal = document.getElementById('cv-modal');
    const cvModalClose = document.querySelector('.cv-modal-close');
    const cvModalBackdrop = document.querySelector('.cv-modal-backdrop');
    const burgerMenu = document.getElementById('burger-menu');
    const navLinksContainer = document.querySelector('.nav-links');
    const langButtons = document.querySelectorAll('.lang-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const themeToggleMobile = document.getElementById('theme-toggle-mobile');
    const profileModal = document.getElementById('profile-modal');
    const profileModalClose = document.querySelector('.profile-modal-close');
    const profileModalBackdrop = document.querySelector('.profile-modal-backdrop');

    emailjs.init("5TSZy0kQKS2UqZGAU");

    let currentLang = localStorage.getItem('language') || 'fr';

    function getDefaultTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        return 'light';
    }

    let currentTheme = getDefaultTheme();

    function updateLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('language', lang);

        langButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
        });

        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });

        const currentSection = document.querySelector('.nav-link.active')?.getAttribute('data-section') || 'about';
        loadSection(currentSection);
    }

    langButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const lang = this.getAttribute('data-lang');
            updateLanguage(lang);
        });
    });

    updateLanguage(currentLang);

    function updateTheme(theme) {
        currentTheme = theme;
        localStorage.setItem('theme', theme);

        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            if (themeToggleMobile) {
                themeToggleMobile.innerHTML = '<i class="fas fa-moon"></i>';
            }
        } else {
            document.documentElement.removeAttribute('data-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            if (themeToggleMobile) {
                themeToggleMobile.innerHTML = '<i class="fas fa-sun"></i>';
            }
        }
    }

    themeToggle.addEventListener('click', function () {
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        updateTheme(newTheme);
    });

    if (themeToggleMobile) {
        themeToggleMobile.addEventListener('click', function () {
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            updateTheme(newTheme);
        });
    }

    updateTheme(currentTheme);

    // Profile modal handlers (mobile only)
    function isMobile() {
        return window.innerWidth <= 1024;
    }

    avatarContainer.addEventListener('click', function () {
        if (isMobile()) {
            profileModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });

    function closeProfileModal() {
        profileModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (profileModalClose) {
        profileModalClose.addEventListener('click', closeProfileModal);
    }

    if (profileModalBackdrop) {
        profileModalBackdrop.addEventListener('click', closeProfileModal);
    }

    // Burger menu toggle
    burgerMenu.addEventListener('click', function () {
        burgerMenu.classList.toggle('active');
        navLinksContainer.classList.toggle('active');
    });

    // Close mobile menu when clicking on a nav link
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            burgerMenu.classList.remove('active');
            navLinksContainer.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function (e) {
        if (!burgerMenu.contains(e.target) && !navLinksContainer.contains(e.target)) {
            burgerMenu.classList.remove('active');
            navLinksContainer.classList.remove('active');
        }
    });

    async function loadSection(sectionId) {
        try {
            contentContainer.classList.add('fade-out');

            await new Promise(resolve => setTimeout(resolve, 150));

            let filename = `sections/${sectionId}.html`;
            if (sectionId === 'about' || sectionId === 'resume' || sectionId === 'portfolio') {
                filename = `sections/${sectionId}-${currentLang}.html`;
            }

            const response = await fetch(filename);
            if (!response.ok) {
                throw new Error(`Failed to load ${sectionId}`);
            }
            const html = await response.text();
            contentContainer.innerHTML = html;

            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.getAttribute('data-i18n');
                if (translations[currentLang] && translations[currentLang][key]) {
                    element.textContent = translations[currentLang][key];
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
            });

            const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }

            window.history.pushState({ section: sectionId }, '', `#${sectionId}`);

            contentContainer.classList.remove('fade-out');

            initializeAnimations();
        } catch (error) {
            console.error('Error loading section:', error);
            contentContainer.innerHTML = '<p>Error loading content. Please try again.</p>';
            contentContainer.classList.remove('fade-out');
        }
    }

    function initializeAnimations() {
        const serviceCards = document.querySelectorAll('.service-card');
        const skillCards = document.querySelectorAll('.skill-card');

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(20px)';

                    setTimeout(() => {
                        entry.target.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 100);

                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        serviceCards.forEach(card => observer.observe(card));
        skillCards.forEach(card => observer.observe(card));
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            loadSection(sectionId);
        });
    });

    window.addEventListener('popstate', function (e) {
        if (e.state && e.state.section) {
            loadSection(e.state.section);
        } else {
            const hash = window.location.hash.substring(1);
            if (hash) {
                loadSection(hash);
            } else {
                loadSection('about');
            }
        }
    });

    const initialHash = window.location.hash.substring(1);
    if (initialHash) {
        loadSection(initialHash);
    } else {
        loadSection('about');
    }

    function openLightbox() {
        if (!isMobile()) {
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    avatarContainer.addEventListener('click', openLightbox);
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxBackdrop.addEventListener('click', closeLightbox);

    function openCVModal() {
        cvModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCVModal() {
        cvModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Event delegation for CV preview button (since it's loaded dynamically)
    document.addEventListener('click', function (e) {
        if (e.target.id === 'cv-preview-btn' || e.target.closest('#cv-preview-btn')) {
            openCVModal();
        }
    });

    cvModalClose.addEventListener('click', closeCVModal);
    cvModalBackdrop.addEventListener('click', closeCVModal);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
        if (e.key === 'Escape' && cvModal.classList.contains('active')) {
            closeCVModal();
        }
    });

    document.addEventListener('submit', function (e) {
        if (e.target.id === 'contactForm') {
            e.preventDefault();

            const form = e.target;
            const formStatus = document.getElementById('formStatus');
            const submitButton = form.querySelector('.submit-button');

            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Envoi en cours...</span>';

            const templateParams = {
                from_name: form.querySelector('#name').value,
                from_email: form.querySelector('#email').value,
                phone: form.querySelector('#phone').value,
                subject: form.querySelector('#subject').value,
                message: form.querySelector('#message').value
            };

            emailjs.send('service_portfolio_18akqn', 'template_3z9b2cx', templateParams)
                .then(function (response) {
                    formStatus.className = 'form-status success';
                    formStatus.textContent = 'Message envoyé avec succès ! Je vous répondrai bientôt.';
                    form.reset();

                    setTimeout(() => {
                        formStatus.style.display = 'none';
                    }, 5000);
                }, function (error) {
                    formStatus.className = 'form-status error';
                    formStatus.textContent = 'Erreur lors de l\'envoi. Veuillez réessayer.';
                    console.error('EmailJS Error:', error);
                })
                .finally(function () {
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<i class="fas fa-paper-plane"></i><span>Envoyer</span>';
                });
        }
    });
});
