document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();

    const sections = [...document.querySelectorAll('main section[id]')];
    const navLinks = [...document.querySelectorAll('.desktop-nav a, .mobile-dock a')];
    const menuToggle = document.querySelector('.menu-toggle');
    const header = document.querySelector('.site-header');
    const desktopNav = document.querySelector('.desktop-nav');
    const form = document.querySelector('#contact-form');
    const formNote = document.querySelector('#form-note');
    const roleLabel = document.querySelector('.hero-role-label');
    const themeColor = document.querySelector('meta[name="theme-color"]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const phrases = [
        'IT Student',
        'Web Developer',
        'Tech Builder',
        'Software Engineering Enthusiast',
        'Problem Solver',
        'Founder of iSAX TECH HUB'
    ];

    const setActiveLink = (id) => {
        navLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('is-active', isActive);
            if (isActive) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
    };

    const updateHeaderState = () => header?.classList.toggle('is-scrolled', window.scrollY > 18);
    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) setActiveLink(entry.target.id);
        });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach((section) => sectionObserver.observe(section));

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));

    const updateThemeColor = () => {
        if (themeColor) themeColor.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--ink').trim());
    };
    updateThemeColor();
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', updateThemeColor);

    if (roleLabel && !reducedMotion.matches) {
        let phraseIndex = 0;
        let characterIndex = roleLabel.textContent.length;
        let deleting = true;

        const typeNextPhrase = () => {
            const phrase = phrases[phraseIndex];
            if (deleting) {
                characterIndex -= 1;
                roleLabel.textContent = phrase.slice(0, characterIndex);
                if (characterIndex === 0) {
                    deleting = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                }
            } else {
                characterIndex += 1;
                roleLabel.textContent = phrases[phraseIndex].slice(0, characterIndex);
                if (characterIndex === phrases[phraseIndex].length) deleting = true;
            }

            const pause = characterIndex === phrases[phraseIndex].length && deleting ? 1900 : deleting ? 55 : 88;
            window.setTimeout(typeNextPhrase, pause);
        };

        window.setTimeout(typeNextPhrase, 1900);
    }

    menuToggle?.addEventListener('click', () => {
        const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!expanded));
        header.classList.toggle('menu-open', !expanded);
        desktopNav.style.display = expanded ? '' : 'flex';
        desktopNav.style.position = expanded ? '' : 'absolute';
        desktopNav.style.top = expanded ? '' : '69px';
        desktopNav.style.left = expanded ? '' : '0';
        desktopNav.style.right = expanded ? '' : '0';
        desktopNav.style.flexDirection = expanded ? '' : 'column';
        desktopNav.style.gap = expanded ? '' : '0';
        desktopNav.style.padding = expanded ? '' : '8px 18px 14px';
        desktopNav.style.margin = expanded ? '' : '0';
        desktopNav.style.background = expanded ? '' : 'var(--ink)';
        desktopNav.style.borderTop = expanded ? '' : '1px solid var(--line)';
        menuToggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
    });

    navLinks.forEach((link) => link.addEventListener('click', () => {
        const targetId = link.getAttribute('href')?.slice(1);
        if (targetId) setActiveLink(targetId);
        menuToggle?.setAttribute('aria-expanded', 'false');
        header?.classList.remove('menu-open');
    }));

    form?.addEventListener('submit', (event) => {
        event.preventDefault();
        formNote.textContent = 'Thanks. Connect an email service to send this message for real.';
        form.reset();
    });
});
