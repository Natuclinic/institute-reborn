// Main Interactivity for Reborn Institute

document.addEventListener('DOMContentLoaded', () => {
    // Hero Title Animation
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const wrapText = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent.replace(/\s+/g, ' ').trim();
                if (!text) return document.createTextNode('');

                const fragment = document.createDocumentFragment();
                text.split('').forEach(char => {
                    const span = document.createElement('span');
                    span.innerHTML = char === ' ' ? '&nbsp;' : char;
                    span.className = 'hero-char';
                    fragment.appendChild(span);
                });
                return fragment;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === 'BR') return node.cloneNode(true);
                const newEl = node.cloneNode(false);
                node.childNodes.forEach(child => newEl.appendChild(wrapText(child)));
                return newEl;
            }
            return node.cloneNode(true);
        };

        const originalNodes = Array.from(heroTitle.childNodes);
        heroTitle.innerHTML = '';
        originalNodes.forEach(node => heroTitle.appendChild(wrapText(node)));

        let visibleIndex = 0;
        heroTitle.querySelectorAll('.hero-char').forEach((char) => {
            const isVisible = getComputedStyle(char.parentElement).display !== 'none';
            if (isVisible) {
                char.style.animationDelay = `${visibleIndex * 40}ms`;
                visibleIndex++;
            } else {
                char.style.animationDelay = '0ms';
            }
        });
    }

    // Scroll Reveal Animation
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Elements to reveal on scroll
    const revealElements = document.querySelectorAll('.animate-on-scroll, .card, .stat-item, .narrative-grid > div');
    revealElements.forEach(el => {
        // Prepare element for animation
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s ease-out';
        observer.observe(el);
    });

    // Handle scroll reveal logic by adding classes dynamically
    window.addEventListener('scroll', () => {
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight - 100) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background change on scroll
    const nav = document.querySelector('nav');
    const logoImg = document.querySelector('.logo img');

    const updateNavbar = () => {
        if (window.scrollY > 50) {
            nav.classList.add('nav-scrolled');
            logoImg.src = 'imgs/logo-black.png';
            logoImg.style.filter = 'none';
        } else {
            nav.classList.remove('nav-scrolled');
            logoImg.src = 'imgs/logo.png';
            logoImg.style.filter = '';
        }
    };

    // Initial check
    updateNavbar();

    window.addEventListener('scroll', updateNavbar);



    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }

    // Close mobile menu when link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = hamburger.querySelector('i');
            if (icon) {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        });
    });

    // Stats Counter Animation
    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const targetText = el.getAttribute('data-target-text');
                // Regex to split: (Prefix)(Number)(Suffix)
                const match = targetText.match(/(\D*)(\d+)(\D*)/);

                if (match) {
                    const prefix = match[1] || '';
                    const targetNum = parseInt(match[2], 10);
                    const suffix = match[3] || '';
                    const duration = 2000; // 2 seconds
                    const startTime = performance.now();

                    const updateCount = (currentTime) => {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);

                        // Ease Out Cubic
                        const ease = 1 - Math.pow(1 - progress, 3);

                        const currentNum = Math.floor(ease * targetNum);
                        el.textContent = `${prefix}${currentNum}${suffix}`;

                        if (progress < 1) {
                            requestAnimationFrame(updateCount);
                        } else {
                            el.textContent = targetText; // Ensure final value is exact
                        }
                    };

                    requestAnimationFrame(updateCount);
                }

                observer.unobserve(el);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.stat-number').forEach(el => {
        // Store original text
        el.setAttribute('data-target-text', el.textContent.trim());

        // Use regex to reset number to 0 while keeping styling/prefix
        const match = el.textContent.trim().match(/(\D*)(\d+)(\D*)/);
        if (match) {
            // Set start value to 0, wrapped in original structure
            el.textContent = `${match[1]}0${match[3]}`;
            statsObserver.observe(el);
        }
    });

    // Language Switcher Logic
    const langSelector = document.querySelector('.lang-selector');
    if (langSelector) {
        // Set initial state based on HTML lang
        const currentLang = document.documentElement.lang || 'en';
        langSelector.value = currentLang === 'pt-BR' ? 'pt' : currentLang;

        langSelector.addEventListener('change', (e) => {
            const selectedLang = e.target.value;
            // Update HTML lang attribute to trigger CSS
            document.documentElement.lang = selectedLang;

            // Recalculate animation delays for visible characters
            if (heroTitle) {
                const chars = heroTitle.querySelectorAll('.hero-char');
                let visibleIndex = 0;
                chars.forEach((char) => {
                    // Check if parent (the [lang] span) is visible
                    const isVisible = getComputedStyle(char.parentElement).display !== 'none';
                    if (isVisible) {
                        char.style.animationDelay = `${visibleIndex * 40}ms`;
                        visibleIndex++;
                        // Also restart animation by removing and re-adding it
                        char.style.animation = 'none';
                        char.offsetHeight; // trigger reflow
                        char.style.animation = 'descendBlur 0.8s ease-out forwards';
                    } else {
                        char.style.animationDelay = '0ms';
                    }
                });
            }
        });
    }
});
