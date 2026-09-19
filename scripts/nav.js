/* ===========================
   GUT — Navigation & Interactions
   =========================== */

document.addEventListener('DOMContentLoaded', () => {
    // ---------- HAMBURGER MENU ----------
    const hamburger = document.querySelector('.hamburger-btn');
    const mobileNav = document.querySelector('.nav-mobile');

    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
            const isOpen = mobileNav.classList.contains('open');

            if (isOpen) {
                // Close
                mobileNav.style.opacity = '0';
                setTimeout(() => {
                    mobileNav.classList.remove('open');
                    mobileNav.style.opacity = '';
                    document.body.style.overflow = '';
                }, 250);
            } else {
                // Open
                mobileNav.classList.add('open');
                mobileNav.style.opacity = '0';
                requestAnimationFrame(() => {
                    mobileNav.style.opacity = '1';
                });
                document.body.style.overflow = 'hidden';
            }

            hamburger.classList.toggle('open');
        });

        // Close mobile nav when clicking a link
        mobileNav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('open');
                hamburger.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // ---------- HEADER SCROLL (index page) ----------
    const header = document.querySelector('.site-header');
    if (header && document.body.classList.contains('page-index')) {
        const onScroll = () => {
            if (window.scrollY > 80) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // Run once on load
    }

    // ---------- FADE-IN ON SCROLL ----------
    const fadeElements = document.querySelectorAll('.fade-in');
    if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        fadeElements.forEach(el => observer.observe(el));
    }

    // ---------- RELEASE CATALOG ----------
    const catalogTrack = document.querySelector('.catalog-track');
    const catalogPrev = document.querySelector('.catalog-arrow--prev');
    const catalogNext = document.querySelector('.catalog-arrow--next');

    if (catalogTrack && catalogPrev && catalogNext) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const updateCatalogControls = () => {
            const maxScroll = catalogTrack.scrollWidth - catalogTrack.clientWidth;
            catalogPrev.disabled = catalogTrack.scrollLeft <= 2;
            catalogNext.disabled = catalogTrack.scrollLeft >= maxScroll - 2;
        };

        const scrollCatalog = (direction) => {
            const card = catalogTrack.querySelector('.release-card');
            const gap = parseFloat(getComputedStyle(catalogTrack).columnGap) || 0;
            const distance = card ? card.getBoundingClientRect().width + gap : catalogTrack.clientWidth;

            catalogTrack.scrollBy({
                left: direction * distance,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        };

        catalogPrev.addEventListener('click', () => scrollCatalog(-1));
        catalogNext.addEventListener('click', () => scrollCatalog(1));
        catalogTrack.addEventListener('scroll', () => requestAnimationFrame(updateCatalogControls), { passive: true });
        window.addEventListener('resize', updateCatalogControls, { passive: true });
        updateCatalogControls();
    }
});
