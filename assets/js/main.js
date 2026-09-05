document.addEventListener('DOMContentLoaded', function () {

    // ============================================
    // MOBILE NAVIGATION TOGGLE
    // ============================================
    var menuIcon = document.querySelector('.menu-icon');
    var navContainer = document.querySelector('.navigation-container');

    if (menuIcon && navContainer) {
        menuIcon.addEventListener('click', function () {
            menuIcon.classList.toggle('active');
            navContainer.classList.toggle('open-nav');
        });

        // Close mobile nav when a link is clicked
        var navLinks = navContainer.querySelectorAll('nav a');
        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                menuIcon.classList.remove('active');
                navContainer.classList.remove('open-nav');
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

        if (servicePrev) {
            servicePrev.addEventListener('click', function () {
                showService(currentService - 1);
            });
        }

        if (serviceNext) {
            serviceNext.addEventListener('click', function () {
                showService(currentService + 1);
            });
        }

        serviceDots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showService(index);
            });
        });
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
            if (window.innerWidth <= 480) {
                e.preventDefault();
                var sublinks = this.nextElementSibling;
                if (sublinks && sublinks.classList.contains('sublinks')) {
                    sublinks.style.display = sublinks.style.display === 'flex' ? 'none' : 'flex';
                }
            }
        });
    });

});
