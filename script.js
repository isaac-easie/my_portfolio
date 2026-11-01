document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const navLinks = [...document.querySelectorAll('.site-nav a, .mobile-bottom-nav a')];
    const year = document.getElementById('year');
    const revealItems = [...document.querySelectorAll('.reveal, .reveal-text')];
    const typingText = document.querySelector('.typing-text');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const applyTheme = (theme) => {
        root.setAttribute('data-theme', theme);
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const applySystemTheme = () => {
        applyTheme(mediaQuery.matches ? 'light' : 'dark');
    };

    applySystemTheme();
    mediaQuery.addEventListener('change', applySystemTheme);

    const setActiveNav = (id) => {
        navLinks.forEach((link) => {
            const active = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('is-active', active);
        });
    };

    const sections = [...document.querySelectorAll('main section[id]')];
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                setActiveNav(entry.target.id);
            }
        });
    }, { rootMargin: '-25% 0px -55% 0px' });

    sections.forEach((section) => observer.observe(section));

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        revealItems.forEach((item) => revealObserver.observe(item));
    } else {
        revealItems.forEach((item) => item.classList.add('is-visible'));
    }

    if (typingText && !reducedMotion) {
        const phrases = JSON.parse(typingText.dataset.phrases || '[]');
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let timerId = null;

        const tick = () => {
            const currentPhrase = phrases[phraseIndex] || '';

            if (!isDeleting) {
                charIndex += 1;
                typingText.textContent = currentPhrase.slice(0, charIndex);

                if (charIndex === currentPhrase.length) {
                    isDeleting = true;
                    timerId = window.setTimeout(tick, 1400);
                    return;
                }
            } else {
                charIndex -= 1;
                typingText.textContent = currentPhrase.slice(0, charIndex);

                if (charIndex === 0) {
                    isDeleting = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                    timerId = window.setTimeout(tick, 260);
                    return;
                }
            }

            const speed = isDeleting ? 38 : 92;
            timerId = window.setTimeout(tick, speed);
        };

        typingText.textContent = '';
        timerId = window.setTimeout(tick, 500);

        window.addEventListener('beforeunload', () => {
            if (timerId) {
                window.clearTimeout(timerId);
            }
        }, { once: true });
    } else if (typingText) {
        const safePhrases = JSON.parse(typingText.dataset.phrases || '[]');
        typingText.textContent = safePhrases[0] || 'IT Student';
    }

    if (year) {
        year.textContent = new Date().getFullYear();
    }
});
