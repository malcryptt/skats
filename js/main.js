document.addEventListener('DOMContentLoaded', () => {
    // Sticky Navbar
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle (Basic implementation)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');

    mobileMenuBtn.addEventListener('click', () => {
        const isHidden = window.getComputedStyle(navLinks).display === 'none';

        if (isHidden) {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.backgroundColor = 'var(--navy)';
            navLinks.style.padding = '1rem';

            navActions.style.display = 'flex';
            navActions.style.flexDirection = 'column';
            navActions.style.position = 'absolute';
            navActions.style.top = 'calc(100% + 200px)';
            navActions.style.left = '0';
            navActions.style.width = '100%';
            navActions.style.backgroundColor = 'var(--navy)';
            navActions.style.padding = '1rem';
            navActions.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        } else {
            navLinks.style.display = '';
            navActions.style.display = '';
        }
    });

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Close mobile menu if open
                if (window.innerWidth <= 768) {
                    navLinks.style.display = '';
                    navActions.style.display = '';
                }
            }
        });
    });

    // Accordion Logic
    document.addEventListener('click', (e) => {
        if (e.target.closest('.accordion-header')) {
            const header = e.target.closest('.accordion-header');
            const item = header.parentElement;
            const content = header.nextElementSibling;

            // close others
            const allItems = item.parentElement.querySelectorAll('.accordion-item');
            allItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    if (otherItem.querySelector('.accordion-content')) {
                        otherItem.querySelector('.accordion-content').style.maxHeight = null;
                    }
                }
            });

            item.classList.toggle('active');
            if (item.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + 40 + "px";
            } else {
                content.style.maxHeight = null;
            }
        }
    });

    // Reveal on scroll animations
    const revealElements = document.querySelectorAll('.service-card, .timeline-step, .testimonial-card, .content-side');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        revealElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(25px)';
            el.style.transition = 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                if (!prefersReducedMotion) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, (index % 4) * 90);
                }
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });
    revealElements.forEach(el => observer.observe(el));

    // Stats Counting
    const statNums = document.querySelectorAll('.stat-num');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetEl = entry.target;
                const targetNum = parseInt(targetEl.getAttribute('data-target'), 10);
                statsObserver.unobserve(targetEl);

                if (prefersReducedMotion) {
                    targetEl.innerText = targetNum;
                    return;
                }

                const duration = 1500;
                const startTime = performance.now();

                function updateNum(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    const current = Math.floor(easeOut * targetNum);

                    targetEl.innerText = current;
                    if (progress < 1) {
                        requestAnimationFrame(updateNum);
                    } else {
                        targetEl.innerText = targetNum;
                    }
                }
                requestAnimationFrame(updateNum);
            }
        });
    }, { threshold: 0.5 });
    statNums.forEach(el => statsObserver.observe(el));

    // Timeline SVG connection drawing
    const timelineSvgProgress = document.querySelector('.timeline-path-progress');
    const timelineSection = document.querySelector('.timeline');
    const timelineSteps = document.querySelectorAll('.timeline-step');

    if (timelineSvgProgress && timelineSection) {
        if (!prefersReducedMotion) {
            const pathLength = 1000;
            timelineSvgProgress.style.strokeDashoffset = pathLength;

            window.addEventListener('scroll', () => {
                const sectionRect = timelineSection.getBoundingClientRect();
                const windowHeight = window.innerHeight;

                const start = sectionRect.top - (windowHeight * 0.75);
                const end = sectionRect.bottom - (windowHeight * 0.4);

                let scrollProgress = 0;
                if (start < 0) {
                    scrollProgress = Math.min(1, Math.max(0, Math.abs(start) / (end - start)));
                }

                timelineSvgProgress.style.strokeDashoffset = pathLength - (scrollProgress * pathLength);

                timelineSteps.forEach((step, idx) => {
                    const triggerPoint = (idx + 1) / timelineSteps.length;
                    if (scrollProgress >= triggerPoint - 0.25) {
                        step.classList.add('active');
                    }
                });
            });
        } else {
            timelineSvgProgress.style.strokeDashoffset = 0;
            timelineSteps.forEach(step => step.classList.add('active'));
        }
    }
});
