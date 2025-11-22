/**
 * Main JavaScript functionality for VARSTEAM website
 * Handles navigation, form validation, carousels, and interactive elements
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initMobileMenu();
    initScrollEffects();
    initCarousels();
    initFormValidation();
    initScrollToAnchors();
    initTooltips();
    initAnalytics();
});

/**
 * Navigation functionality
 */
function initNavigation() {
    const header = document.getElementById('header');
    const navLinks = document.querySelectorAll('.nav__link');

    // Add active state to navigation based on current page
    setActiveNavLink();

    // Handle scroll effects on header
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Update active link on click
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav__link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

/**
 * Mobile menu functionality
 */
function initMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navOverlay = document.getElementById('navOverlay');

    if (!navToggle || !navMenu || !navOverlay) return;

    navToggle.addEventListener('click', function() {
        toggleMobileMenu();
    });

    navOverlay.addEventListener('click', function() {
        closeMobileMenu();
    });

    // Close menu when clicking on a link (mobile)
    const navLinks = navMenu.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }
        });
    });
}

function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const navOverlay = document.getElementById('navOverlay');
    const navToggle = document.getElementById('navToggle');

    navMenu.classList.toggle('active');
    navOverlay.classList.toggle('active');
    navToggle.classList.toggle('active');

    // Prevent body scroll when menu is open
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function closeMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const navOverlay = document.getElementById('navOverlay');
    const navToggle = document.getElementById('navToggle');

    navMenu.classList.remove('active');
    navOverlay.classList.remove('active');
    navToggle.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Scroll effects and animations
 */
function initScrollEffects() {
    // Add smooth reveal animations for elements as they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements that should be revealed on scroll
    const revealElements = document.querySelectorAll('.feature-card, .workflow-step, .step, .advanced-feature');
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add revealed styles
    const style = document.createElement('style');
    style.textContent = `
        .revealed {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Carousel functionality
 */
function initCarousels() {
    const carousels = document.querySelectorAll('.carousel');

    carousels.forEach(carousel => {
        initCarousel(carousel);
    });
}

function initCarousel(carousel) {
    const container = carousel.querySelector('.carousel__container');
    const slides = carousel.querySelectorAll('.carousel__slide');
    const prevBtn = carousel.querySelector('.carousel__button:first-child');
    const nextBtn = carousel.querySelector('.carousel__button:last-child');
    const indicators = carousel.querySelectorAll('.carousel__indicator');

    if (!container || slides.length === 0) return;

    let currentIndex = 0;
    let slideWidth = 100;
    let autoplayInterval;
    let isPaused = false;

    // Initialize carousel
    updateCarousel();

    // Navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToSlide(currentIndex - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToSlide(currentIndex + 1);
        });
    }

    // Indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            goToSlide(index);
        });
    });

    // Touch/Swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                goToSlide(currentIndex + 1); // Swipe left, go to next
            } else {
                goToSlide(currentIndex - 1); // Swipe right, go to previous
            }
        }
    }

    // Keyboard navigation
    carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            goToSlide(currentIndex - 1);
        } else if (e.key === 'ArrowRight') {
            goToSlide(currentIndex + 1);
        }
    });

    // Pause on hover
    carousel.addEventListener('mouseenter', () => {
        isPaused = true;
        stopAutoplay();
    });

    carousel.addEventListener('mouseleave', () => {
        isPaused = false;
        startAutoplay();
    });

    function goToSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;

        currentIndex = index;
        updateCarousel();
    }

    function updateCarousel() {
        const offset = -currentIndex * slideWidth;
        container.style.transform = `translateX(${offset}%)`;

        // Update buttons
        if (prevBtn) {
            prevBtn.disabled = false;
            prevBtn.style.opacity = '1';
        }
        if (nextBtn) {
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
        }

        // Update indicators
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
    }

    function startAutoplay() {
        // Autoplay is optional - uncomment to enable
        // autoplayInterval = setInterval(() => {
        //     if (!isPaused) {
        //         goToSlide(currentIndex + 1);
        //     }
        // }, 5000);
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
        }
    }

    // Start autoplay if carousel has autoplay attribute
    if (carousel.hasAttribute('data-autoplay')) {
        startAutoplay();
    }
}

/**
 * Form validation
 */
function initFormValidation() {
    const forms = document.querySelectorAll('.form');

    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            // Real-time validation
            input.addEventListener('blur', () => {
                validateField(input);
            });

            input.addEventListener('input', () => {
                clearFieldError(input);
            });
        });

        // Form submission
        if (form.hasAttribute('data-validate')) {
            form.addEventListener('submit', handleFormSubmit);
        }
    });
}

function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    let isValid = true;
    let errorMessage = '';

    // Check if field is required and empty
    if (required && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }

    // Type-specific validation
    if (value && isValid) {
        switch (type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;

            case 'tel':
                const phoneRegex = /^[\d\s\-\+\(\)]+$/;
                if (!phoneRegex.test(value) || value.length < 10) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
                break;

            case 'url':
                try {
                    new URL(value);
                } catch {
                    isValid = false;
                    errorMessage = 'Please enter a valid URL';
                }
                break;
        }

        // Length validation
        const minLength = field.getAttribute('minlength');
        const maxLength = field.getAttribute('maxlength');

        if (value && minLength && value.length < parseInt(minLength)) {
            isValid = false;
            errorMessage = `Minimum ${minLength} characters required`;
        }

        if (value && maxLength && value.length > parseInt(maxLength)) {
            isValid = false;
            errorMessage = `Maximum ${maxLength} characters allowed`;
        }
    }

    // Show or clear error
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }

    return isValid;
}

function showFieldError(field, message) {
    clearFieldError(field);

    field.classList.add('error');

    const errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');

    field.parentNode.appendChild(errorElement);
}

function clearFieldError(field) {
    field.classList.remove('error');

    const errorElement = field.parentNode.querySelector('.form-error');
    if (errorElement) {
        errorElement.remove();
    }
}

function handleFormSubmit(event) {
    const form = event.target;
    const inputs = form.querySelectorAll('input, textarea, select');
    let isValid = true;

    // Validate all fields
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    // Check honeypot for bots
    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value) {
        isValid = false;
        // Silently fail for bots
    }

    if (!isValid) {
        event.preventDefault();

        // Scroll to first error
        const firstError = form.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
}

/**
 * Smooth scrolling to anchor links
 */
function initScrollToAnchors() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                e.preventDefault();

                const headerHeight = document.getElementById('header')?.offsetHeight || 70;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Tooltip functionality
 */
function initTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');

    tooltips.forEach(element => {
        const tooltipText = element.getAttribute('data-tooltip');

        if (tooltipText) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip-content';
            tooltip.textContent = tooltipText;
            document.body.appendChild(tooltip);

            element.addEventListener('mouseenter', (e) => {
                const rect = element.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
                tooltip.style.opacity = '1';
                tooltip.style.visibility = 'visible';
            });

            element.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
                tooltip.style.visibility = 'hidden';
            });
        }
    });
}

/**
 * Analytics and tracking
 */
function initAnalytics() {
    // Download tracking
    const downloadLinks = document.querySelectorAll('a[href*="download"], .download-btn');

    downloadLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const platform = getPlatformFromLink(this);
            trackDownload(platform);
        });
    });

    // Button tracking
    const trackButtons = document.querySelectorAll('[data-track]');

    trackButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-track');
            trackAction(action);
        });
    });
}

function getPlatformFromLink(link) {
    const href = link.getAttribute('href') || link.getAttribute('data-download');
    const downloadText = (link.textContent || '').toLowerCase();

    if (href.includes('windows') || downloadText.includes('windows')) return 'windows';
    if (href.includes('mac') || downloadText.includes('mac')) return 'macos';
    if (href.includes('linux') || downloadText.includes('linux')) return 'linux';
    if (href.includes('android') || downloadText.includes('android')) return 'android';

    return 'unknown';
}

function trackDownload(platform) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', 'download', {
            'app_name': 'VARSTEAM',
            'version': '1.0.0',
            'platform': platform,
            'file_size': '25MB'
        });
    }

    // Custom tracking
    console.log('Download tracked:', platform);
}

function trackAction(action) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', 'click', {
            'event_category': 'engagement',
            'event_label': action
        });
    }

    // Custom tracking
    console.log('Action tracked:', action);
}

/**
 * Utility functions
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Copy to clipboard functionality
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        showNotification('Copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy:', err);
    }

    document.body.removeChild(textArea);
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification alert alert--${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add slide animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Export functions for use in other scripts
window.AppName = {
    copyToClipboard,
    showNotification,
    validateField,
    debounce,
    throttle
};