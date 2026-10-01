document.addEventListener('DOMContentLoaded', function () {

    // ============================================
    // MOBILE NAVIGATION TOGGLE
    // ============================================
    var menuIcon = document.querySelector('.menu-icon');
    var navContainer = document.querySelector('.navigation-container');

    if (menuIcon && navContainer) {
        menuIcon.addEventListener('click', function () {
            var isOpening = !navContainer.classList.contains('open-nav');
            menuIcon.classList.toggle('active');
            navContainer.classList.toggle('open-nav');
            if (!isOpening) {
                navContainer.querySelectorAll('li.mobile-open').forEach(function (li) { li.classList.remove('mobile-open'); });
            }
        });

        // Close mobile nav when a link is clicked (but not the Services toggle)
        var navLinks = navContainer.querySelectorAll('nav a');
        navLinks.forEach(function (link) {
            if (link.classList.contains('dropdown-link')) return;
            link.addEventListener('click', function () {
                menuIcon.classList.remove('active');
                navContainer.classList.remove('open-nav');
                navContainer.querySelectorAll('li.mobile-open').forEach(function (li) { li.classList.remove('mobile-open'); });
            });
        });
    }

    // ============================================
    // HERO CAROUSEL (Home page)
    // ============================================
    var heroCarousel = document.querySelector('.header-carousel');
    if (heroCarousel) {
        var slides = heroCarousel.querySelectorAll('.slide');
        var dots = heroCarousel.querySelectorAll('.carousel-dot');
        var prevBtn = heroCarousel.querySelector('.carousel-arrow.prev');
        var nextBtn = heroCarousel.querySelector('.carousel-arrow.next');
        var currentSlide = 0;
        var slideInterval;

        function showSlide(index) {
            slides.forEach(function (slide) { slide.classList.remove('active'); });
            dots.forEach(function (dot) { dot.classList.remove('active'); });

            currentSlide = index;
            if (currentSlide >= slides.length) currentSlide = 0;
            if (currentSlide < 0) currentSlide = slides.length - 1;

            slides[currentSlide].classList.add('active');
            if (dots[currentSlide]) dots[currentSlide].classList.add('active');
        }

        function nextSlide() {
            showSlide(currentSlide + 1);
        }

        function prevSlide() {
            showSlide(currentSlide - 1);
        }

        function startAutoplay() {
            slideInterval = setInterval(nextSlide, 5000);
        }

        function stopAutoplay() {
            clearInterval(slideInterval);
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function () {
                stopAutoplay();
                prevSlide();
                startAutoplay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function () {
                stopAutoplay();
                nextSlide();
                startAutoplay();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                stopAutoplay();
                showSlide(index);
                startAutoplay();
            });
        });

        startAutoplay();
    }

    // ============================================
    // SERVICES CAROUSEL (Home page)
    // ============================================
    var servicesCarousel = document.querySelector('.services-carousel');
    if (servicesCarousel) {
        var serviceSlides = servicesCarousel.querySelectorAll('.service-slide');
        var serviceDots = servicesCarousel.querySelectorAll('.carousel-dot');
        var servicePrev = servicesCarousel.querySelector('.carousel-arrow.prev');
        var serviceNext = servicesCarousel.querySelector('.carousel-arrow.next');
        var currentService = 0;

        function showService(index) {
            serviceSlides.forEach(function (slide) { slide.classList.remove('active'); });
            serviceDots.forEach(function (dot) { dot.classList.remove('active'); });

            currentService = index;
            if (currentService >= serviceSlides.length) currentService = 0;
            if (currentService < 0) currentService = serviceSlides.length - 1;

            serviceSlides[currentService].classList.add('active');
            if (serviceDots[currentService]) serviceDots[currentService].classList.add('active');
        }

        var serviceInterval;

        function startServiceAutoplay() {
            stopServiceAutoplay();
            serviceInterval = setInterval(function () { showService(currentService + 1); }, 4500);
        }

        function stopServiceAutoplay() {
            if (serviceInterval) { clearInterval(serviceInterval); serviceInterval = null; }
        }

        if (servicePrev) {
            servicePrev.addEventListener('click', function () {
                stopServiceAutoplay();
                showService(currentService - 1);
                startServiceAutoplay();
            });
        }

        if (serviceNext) {
            serviceNext.addEventListener('click', function () {
                stopServiceAutoplay();
                showService(currentService + 1);
                startServiceAutoplay();
            });
        }

        serviceDots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                stopServiceAutoplay();
                showService(index);
                startServiceAutoplay();
            });
        });

        servicesCarousel.addEventListener('mouseenter', stopServiceAutoplay);
        servicesCarousel.addEventListener('mouseleave', startServiceAutoplay);
        servicesCarousel.addEventListener('touchstart', stopServiceAutoplay, { passive: true });
        servicesCarousel.addEventListener('touchend', startServiceAutoplay);

        startServiceAutoplay();

        function showServiceFromHash() {
            var target = window.location.hash.slice(1);
            if (!target) return;

            serviceSlides.forEach(function (slide, index) {
                if (slide.id === target) showService(index);
            });
        }

        showServiceFromHash();
        window.addEventListener('hashchange', showServiceFromHash);
    }

    // ============================================
    // FAQ ACCORDION (Home page)
    // ============================================
    var faqItems = document.querySelectorAll('.question-item-container');
    faqItems.forEach(function (item) {
        var toggleBtn = item.querySelector('.toggle-button');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', function () {
                // Close other open items
                faqItems.forEach(function (otherItem) {
                    if (otherItem !== item) {
                        otherItem.classList.remove('toggle');
                    }
                });
                item.classList.toggle('toggle');
            });
        }

        // Also allow clicking the question text to toggle
        var questionContainer = item.querySelector('.question-container');
        if (questionContainer) {
            questionContainer.addEventListener('click', function () {
                faqItems.forEach(function (otherItem) {
                    if (otherItem !== item) {
                        otherItem.classList.remove('toggle');
                    }
                });
                item.classList.toggle('toggle');
            });
        }
    });

    // ============================================
    // CONTACT FORM HANDLING
    // ============================================
    var contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            var submitBtn = contactForm.querySelector('button[type="submit"]');
            var originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span>';

            var formData = new FormData(contactForm);

            try {
                var response = await fetch('forms/contact.php', {
                    method: 'POST',
                    body: formData
                });

                var result = await response.json();

                var statusEl = contactForm.querySelector('.form-status');
                if (!statusEl) {
                    statusEl = document.createElement('div');
                    statusEl.className = 'form-status';
                    contactForm.appendChild(statusEl);
                }

                if (result.success) {
                    statusEl.className = 'form-status success show';
                    statusEl.textContent = result.message || 'Your message has been sent successfully.';
                    contactForm.reset();
                } else {
                    statusEl.className = 'form-status error show';
                    statusEl.textContent = result.message || 'Something went wrong. Please try again.';
                }
            } catch (error) {
                var statusEl = contactForm.querySelector('.form-status');
                if (!statusEl) {
                    statusEl = document.createElement('div');
                    statusEl.className = 'form-status';
                    contactForm.appendChild(statusEl);
                }
                statusEl.className = 'form-status error show';
                statusEl.textContent = 'Network error. Please check your connection and try again.';
            }

            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
    }

    // ============================================
    // ACTIVE NAVIGATION STATE
    // ============================================
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    var navLinks = document.querySelectorAll('.main-nav a.page-link');

    navLinks.forEach(function (link) {
        var href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active-route');
        }
    });

    // ============================================
    // SMOOTH SCROLLING FOR ANCHOR LINKS
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;

            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ============================================
    // CLOSE DROPDOWN ON MOBILE WHEN TOUCHING
    // ============================================
    var dropdownLinks = document.querySelectorAll('.dropdown-link');
    dropdownLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            if (window.innerWidth <= 900) {
                e.preventDefault();
                e.stopPropagation();
                var parentLi = this.closest('li');
                if (parentLi) parentLi.classList.toggle('mobile-open');
            }
        });
    });

    // ============================================
    // TEAM CAROUSEL (auto-scroll + arrows)
    // ============================================
    var teamTrack = document.querySelector('.team-track');
    if (teamTrack) {
        var teamPrev = document.querySelector('.team-prev');
        var teamNext = document.querySelector('.team-next');
        var teamTimer = null;

        function teamStep() {
            var card = teamTrack.querySelector('.team-card');
            return card ? card.offsetWidth + 24 : 320;
        }

        function teamAuto() {
            var max = teamTrack.scrollWidth - teamTrack.clientWidth - 10;
            if (teamTrack.scrollLeft >= max) {
                teamTrack.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                teamTrack.scrollBy({ left: teamStep(), behavior: 'smooth' });
            }
        }

        function startTeamAuto() {
            stopTeamAuto();
            teamTimer = setInterval(teamAuto, 3500);
        }

        function stopTeamAuto() {
            if (teamTimer) {
                clearInterval(teamTimer);
                teamTimer = null;
            }
        }

        if (teamPrev) {
            teamPrev.addEventListener('click', function () {
                stopTeamAuto();
                teamTrack.scrollBy({ left: -teamStep(), behavior: 'smooth' });
                startTeamAuto();
            });
        }

        if (teamNext) {
            teamNext.addEventListener('click', function () {
                stopTeamAuto();
                teamTrack.scrollBy({ left: teamStep(), behavior: 'smooth' });
                startTeamAuto();
            });
        }

        teamTrack.addEventListener('mouseenter', stopTeamAuto);
        teamTrack.addEventListener('mouseleave', startTeamAuto);
        teamTrack.addEventListener('touchstart', stopTeamAuto, { passive: true });
        teamTrack.addEventListener('touchend', startTeamAuto);

        startTeamAuto();
    }

    // ============================================
    // SERVICE PAGE IMAGE CAROUSEL (auto-change)
    // ============================================
    document.querySelectorAll('.service-intro-media').forEach(function (media) {
        var slides = media.querySelectorAll('img');
        if (slides.length < 2) return;

        var idx = 0;
        var timer = null;

        function showSlide(next) {
            slides[idx].classList.remove('active');
            idx = (next + slides.length) % slides.length;
            slides[idx].classList.add('active');
        }

        function stopSlides() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        function startSlides() {
            stopSlides();
            timer = setInterval(function () {
                showSlide(idx + 1);
            }, 3000);
        }

        slides[0].classList.add('active');

        media.addEventListener('mouseenter', stopSlides);
        media.addEventListener('mouseleave', startSlides);
        media.addEventListener('touchstart', stopSlides, { passive: true });
        media.addEventListener('touchend', startSlides);

        startSlides();
    });

    // ============================================
    // SCROLL REVEAL ANIMATIONS
    // ============================================
    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reduceMotion && 'IntersectionObserver' in window) {
        document.documentElement.classList.add('js-anim');

        var revealGroups = [
            { sel: '.about-card, .about-director-card', variant: '' },
            { sel: '.specialist-card', variant: 'zoom' },
            { sel: '.home-gallery-item, .resources-gallery-item', variant: 'zoom' },
            { sel: '.card-container', variant: '' },
            { sel: '.news-card', variant: '' },
            { sel: '.newsletter-archive-list li', variant: '' },
            { sel: '.faq-right .question-item-container, .faq-page-list .question-item-container', variant: '' },
            { sel: '.service-intro-text', variant: 'left' },
            { sel: '.service-intro-media', variant: 'right' },
            { sel: '.specialist-section', variant: '' },
            { sel: '.site-footer-col', variant: '' }
        ];

        var revealEls = [];

        revealGroups.forEach(function (group) {
            document.querySelectorAll(group.sel).forEach(function (el) {
                if (revealEls.indexOf(el) !== -1) return;
                if (el.closest('.header-carousel, .services-carousel, .team-viewport, .vb-wrapper')) return;
                el.setAttribute('data-reveal', group.variant);
                revealEls.push(el);
            });
        });

        var delayCounts = new Map();
        revealEls.forEach(function (el) {
            var parent = el.parentElement;
            var i = delayCounts.get(parent) || 0;
            delayCounts.set(parent, i + 1);
            el.style.transitionDelay = Math.min(i, 4) * 90 + 'ms';
        });

        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                var delay = parseInt(el.style.transitionDelay, 10) || 0;
                el.classList.add('is-visible');
                revealObserver.unobserve(el);
                setTimeout(function () {
                    el.removeAttribute('data-reveal');
                    el.style.transitionDelay = '';
                }, delay + 800);
            });
        }, { threshold: 0.01, rootMargin: '0px 0px -60px 0px' });

        revealEls.forEach(function (el) {
            revealObserver.observe(el);
        });
    }

    // ============================================
    // HEADER SCROLL STATE + SCROLL-TO-TOP BUTTON
    // ============================================
    var navContainer = document.querySelector('.navigation-container');
    var scrollTopBtn = document.createElement('button');
    scrollTopBtn.type = 'button';
    scrollTopBtn.className = 'scroll-top-btn';
    scrollTopBtn.setAttribute('aria-label', 'Back to top');
    scrollTopBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
    document.body.appendChild(scrollTopBtn);

    scrollTopBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    function onScrollState() {
        var y = window.pageYOffset || document.documentElement.scrollTop || 0;
        scrollTopBtn.classList.toggle('is-visible', y > 500);
        if (navContainer) navContainer.classList.toggle('nav-scrolled', y > 40);
    }

    window.addEventListener('scroll', onScrollState, { passive: true });
    onScrollState();

});
