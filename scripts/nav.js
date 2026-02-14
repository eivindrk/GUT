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
});
