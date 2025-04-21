// ==========================================================================
// Portfolio JavaScript Functionality
// Theme: Dynamic Professional (Updated Interactivity)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    'use strict'; // Strict mode helps catch common coding errors

    // --- Configuration ---
    // API endpoint for the backend Express server handling contact form submissions
    const CONTACT_API_ENDPOINT = 'http://localhost:3001/api/contact'; // Use for local testing with `node server.js`
    // const CONTACT_API_ENDPOINT = '/api/contact'; // Use relative path for production if backend is deployed with frontend (e.g., on Vercel)

    // API endpoint for the backend Express server handling visit notifications
    const VISIT_API_ENDPOINT = 'http://localhost:3001/api/notify-visit'; // Use for local testing
    // const VISIT_API_ENDPOINT = '/api/notify-visit'; // Use relative path for production

    // --- Feature Flags ---
    const ENABLE_VISIT_NOTIFICATION = true; // *** SET true TO ACTIVATE visit notifications (requires backend route) ***

    // --- Location Details ---
    const LOCATION_TIME_ZONE = 'Africa/Lagos'; // Correct timezone for Abeokuta (West Africa Time)
    const LOCATION_DISPLAY_NAME = 'Abeokuta';

    // --- Global Element References ---
    const body = document.body;
    const header = document.querySelector('.site-header');
    const locationTimeElement = document.getElementById('location-time');
    const currentYearSpan = document.getElementById('current-year');
    const hamburgerOpenBtn = document.getElementById('mobile-open-btn');
    const hamburgerCloseBtn = document.getElementById('mobile-close-btn');
    const navMenu = document.querySelector('.nav-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const modalOverlay = document.getElementById('project-modal');

    // --- Initial Setup Functions ---

    // Function to update the copyright year
    function updateCopyrightYear() {
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }
    }

    // Function to update and display the location time
    function updateLocationTime() {
        if (locationTimeElement) {
            try {
                const now = new Date();
                const options = { timeZone: LOCATION_TIME_ZONE, hour: '2-digit', minute: '2-digit', hour12: true };
                locationTimeElement.textContent = `${LOCATION_DISPLAY_NAME}: ${now.toLocaleTimeString('en-NG', options)}`;
            } catch (e) {
                console.error("Error formatting location time:", e);
                locationTimeElement.textContent = ""; // Clear on error
            }
        }
    }

    // Function to send the visit notification ping to the backend
    function notifyVisit() {
        // Optional: Prevent sending on every single refresh during development
        if (sessionStorage.getItem('visitNotified')) {
            // console.log("Visit notification already sent this session.");
            return;
        }

        fetch(VISIT_API_ENDPOINT, { method: 'POST' })
            .then(response => {
                if (!response.ok) {
                    console.warn(`Visit notification API request failed: ${response.status}`);
                } else {
                     // console.log("Visit notification request sent successfully to backend."); // Optional success log
                     sessionStorage.setItem('visitNotified', 'true'); // Mark as sent for this session
                }
            })
            .catch(error => console.error('Error sending visit notification fetch request:', error));
    }

    // --- Initialize Features ---
    updateCopyrightYear();
    if (locationTimeElement) { // Initial call & interval only if element exists
        updateLocationTime();
        setInterval(updateLocationTime, 60000); // Update every minute
    }
    if (ENABLE_VISIT_NOTIFICATION) { // Trigger visit notification if enabled
        notifyVisit();
    }

    // --- Mobile Navigation (Slide-in Menu) ---
    if (hamburgerOpenBtn && hamburgerCloseBtn && navMenu && mobileMenuOverlay) {
        const navLinks = navMenu.querySelectorAll('.nav-link'); // Links inside the menu

        // Function to open the mobile menu
        const openMobileMenu = () => {
            navMenu.classList.add('active');
            mobileMenuOverlay.classList.add('active'); // Show overlay
            hamburgerOpenBtn.setAttribute('aria-expanded', 'true');
            body.classList.add('no-scroll'); // Prevent background scrolling
        };

        // Function to close the mobile menu
        const closeMobileMenu = () => {
            navMenu.classList.remove('active');
            mobileMenuOverlay.classList.remove('active'); // Hide overlay
            hamburgerOpenBtn.setAttribute('aria-expanded', 'false');
            body.classList.remove('no-scroll'); // Allow background scrolling
        };

    // --- Mobile Navigation ---
    function setupMobileNav() {
        if (!hamburgerOpenBtn || !hamburgerCloseBtn || !navMenu || !mobileMenuOverlay) {
            console.warn("Mobile nav elements missing."); return;
        }
        const navLinks = navMenu.querySelectorAll('.nav-link');
        const openMenu = () => {
            navMenu.classList.add('active'); mobileMenuOverlay.classList.add('active');
            hamburgerOpenBtn.setAttribute('aria-expanded', 'true'); body.classList.add('no-scroll');
            hamburgerCloseBtn.focus(); // Focus close button inside menu
        };
        const closeMenu = () => {
            navMenu.classList.remove('active'); mobileMenuOverlay.classList.remove('active');
            hamburgerOpenBtn.setAttribute('aria-expanded', 'false'); body.classList.remove('no-scroll');
            hamburgerOpenBtn.focus(); // Return focus to opener
        };
        hamburgerOpenBtn.addEventListener('click', openMenu);
        hamburgerCloseBtn.addEventListener('click', closeMenu);
        mobileMenuOverlay.addEventListener('click', closeMenu);
        navLinks.forEach(link => link.addEventListener('click', closeMenu));
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && navMenu.classList.contains('active')) closeMenu(); });
    }


    // --- Sticky Header ---
    if (header) {
        const scrollThreshold = 50; // Pixels scrolled before header becomes sticky
        const handleScroll = () => {
            header.classList.toggle('scrolled', window.scrollY > scrollThreshold);
        };
        // Optimized scroll listener
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // --- Scroll Animations (Intersection Observer with Stagger & Underline Trigger) ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if ('IntersectionObserver' in window) {
        const observerCallback = (entries, observer) => {
            let delay = 0; // Stagger delay counter for elements entering together

            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Apply stagger delay for entrance animation
                    entry.target.style.transitionDelay = `${delay}ms`;
                    entry.target.classList.add('visible');
                    delay += 120; // Increment stagger delay

                    // Check if it's a section title needing underline animation
                    if (entry.target.dataset.animation === 'underline') {
                        entry.target.classList.add('animate'); // Trigger CSS animation
                    }
                    observer.unobserve(entry.target); // Animate only once
                }
            });
        };
        const observerOptions = { threshold: 0.15 }; // Trigger when 15% visible
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        animatedElements.forEach(el => observer.observe(el));

    } else {
        // Fallback if Intersection Observer is not supported
        console.warn("Intersection Observer not supported, scroll animations disabled.");
        animatedElements.forEach(el => {
             el.classList.add('visible');
             if (el.dataset.animation === 'underline') el.classList.add('animate');
        });
    }

    // --- Animate elements visible on initial page load (with stagger) ---
    const loadAnimatedElements = document.querySelectorAll('.animate-on-load');
    loadAnimatedElements.forEach((el, index) => {
        el.style.transitionDelay = `${100 + index * 150}ms`; // Stagger timing
        setTimeout(() => el.classList.add('visible'), 50); // Trigger after slight delay
    });


    // --- Contact Form Submission (using Fetch API to Express Backend) ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent default page reload
            formStatus.textContent = 'Sending message...';
            formStatus.style.color = 'var(--color-text-secondary)';
            const submitButton = contactForm.querySelector('button[type="submit"]');
            submitButton.disabled = true; // Prevent multiple clicks

            const formData = new FormData(contactForm);
            const formDataObject = Object.fromEntries(formData.entries());
            const jsonPayload = JSON.stringify(formDataObject);

            try {
                // Send data to the backend endpoint (ensure CONTACT_API_ENDPOINT is correct)
                const response = await fetch(CONTACT_API_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: jsonPayload
                });

                // Process the response
                if (response.ok) {
                    const result = await response.json(); // Get success message
                    formStatus.textContent = result.message || "Message sent successfully!";
                    formStatus.style.color = 'var(--color-accent)';
                    contactForm.reset(); // Clear form fields
                    setTimeout(() => { formStatus.textContent = ''; }, 6000); // Clear status after 6s
                } else {
                    // Handle HTTP errors from the server (e.g., validation, server error)
                    const errorResult = await response.json().catch(() => ({}));
                    const errorMessage = errorResult?.error || `Request failed (Status: ${response.status})`;
                    formStatus.textContent = `Error: ${errorMessage}`;
                    formStatus.style.color = 'red';
                    console.error("Contact form submission error:", errorMessage);
                }
            } catch (error) {
                // Handle network errors (e.g., server unreachable, CORS issues if endpoint incorrect)
                formStatus.textContent = 'Network error. Please check connection or contact support.';
                formStatus.style.color = 'red';
                console.error('Contact form fetch network error:', error);
            } finally {
                 submitButton.disabled = false; // Re-enable button
            }
        });
    } else {
        if (!contactForm) console.warn("Contact form (#contact-form) not found.");
        if (!formStatus) console.warn("Form status element (#form-status) not found.");
    }

    // --- Project Modal Interaction Logic ---
    // (Keep the existing modal logic from the previous response - it's independent of other changes)
    if (modalOverlay) {
        const modalContent = modalOverlay.querySelector('.modal-content');
        const modalCloseBtn = document.getElementById('modal-close');
        const modalTitle = document.getElementById('modal-title');
        const modalDescription = document.getElementById('modal-description');
        const modalTech = document.getElementById('modal-tech');
        const modalGithubLink = document.getElementById('modal-github-link');
        const modalLiveLink = document.getElementById('modal-live-link');
        const projectTriggers = document.querySelectorAll('.project-modal-trigger');
        let previouslyFocusedElement = null;

        function openModal(data) {
             if (!modalOverlay || !data) return;
            previouslyFocusedElement = document.activeElement;
            modalTitle.textContent = data.title || 'Project Details';
            modalDescription.innerHTML = data.description?.replace(/\n/g, '<br>') || 'No details provided.';
            modalTech.textContent = data.tech || 'Not specified.';
            modalGithubLink.style.display = data.github ? 'inline-flex' : 'none';
            if(data.github) modalGithubLink.href = data.github;
            modalLiveLink.style.display = data.live ? 'inline-flex' : 'none';
            if(data.live) modalLiveLink.href = data.live;
            modalOverlay.setAttribute('aria-hidden', 'false');
            body.classList.add('modal-open');
            modalContent.setAttribute('tabindex', '-1');
            modalContent.focus();
        }

        function closeModal() {
            if (!modalOverlay) return;
            modalOverlay.setAttribute('aria-hidden', 'true');
            body.classList.remove('modal-open');
            if (previouslyFocusedElement) {
                previouslyFocusedElement.focus();
                previouslyFocusedElement = null;
            }
        }

        projectTriggers.forEach(button => button.addEventListener('click', (e) => { e.preventDefault(); openModal(button.dataset); }));
        if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (event) => { if (event.target === modalOverlay) closeModal(); });
        document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modalOverlay.getAttribute('aria-hidden') === 'false') closeModal(); });
        } else {
            console.warn("Project modal element (#project-modal) not found.");
        }
    } // End DOMContentLoaded Wrapper

}) // End DOMContentLoaded Wrapper