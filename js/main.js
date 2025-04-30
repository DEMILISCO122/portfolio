// ==========================================================================
// Portfolio JavaScript Functionality
// Theme: Dynamic Professional v21 (Final Fixes + Unique Features)
// Features: Preloader, Custom Cursor, Animated Text, Approach Section,
//           Interactive Tech Stack, Toast Form Status, Location Time w/ Secs,
//           Custom Mobile Nav (Fullscreen), Background Shine, Placeholder Projects
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    'use strict'; // Strict mode

    // --- Configuration ---
    const CONTACT_API_ENDPOINT = 'http://localhost:3001/api/contact'; // For local Express
    const VISIT_API_ENDPOINT = 'http://localhost:3001/api/notify-visit'; // For local Express
    // const CONTACT_API_ENDPOINT = '/api/contact'; // For Production
    // const VISIT_API_ENDPOINT = '/api/notify-visit'; // For Production

    const ENABLE_VISIT_NOTIFICATION = true; // Activate visit pings?
    const ENABLE_BACKGROUND_SHINE = true;  // Activate periodic background shine?
    const ENABLE_CUSTOM_CURSOR = true; // Activate custom cursor?
    const BACKGROUND_SHINE_INTERVAL = 1800; // ms (3 minutes) - Defined correctly here
    // const GITHUB_USERNAME = 'YOUR_GITHUB_USERNAME'; // Removed

    const LOCATION_TIME_ZONE = 'Africa/Lagos'; // Correct for Abeokuta
    const LOCATION_DISPLAY_NAME = 'Abeokuta';

    // Animated Hero Subtitles Array
    const HERO_SUBTITLES = [
        "Full-Stack Developer", "Building Scalable Web Apps", "React & Node.js Expert",
        "Python & Django Enthusiast", "API & Database Designer", "Based in Abeokuta, Nigeria"
    ];

    // --- Global Element References ---
    const body = document.body;
    const header = document.querySelector('.site-header');
    const locationTimeElement = document.getElementById('location-time');
    const currentYearSpan = document.getElementById('current-year');
    const hamburgerToggleBtn = document.getElementById('mobile-menu-toggle'); // Hamburger in header
    const mobileNavMenu = document.getElementById('fullscreen-nav-menu'); // The fullscreen overlay menu
    const mobileCloseBtn = document.getElementById('mobile-close-btn'); // Close button inside overlay
    const modalOverlay = document.getElementById('project-modal');
    const animatedSubtitleSpan = document.getElementById('animated-subtitle');
    const formStatusElement = document.getElementById('form-status'); // For toast notification
    const customCursor = document.getElementById('custom-cursor');
    const customCursorDot = document.getElementById('custom-cursor-dot');
    // const activityFeed = document.getElementById('github-activity-feed'); // Removed

    // --- Timeout References ---
    let formStatusTimeout = null;
    let backgroundShineTimeout = null;
    let heroTextTimeoutId = null;
    let cursorIdleTimeout = null;
    let cursorAnimationFrameId = null;

    // --- Initial Setup Function ---
    // Runs all initialization functions after the DOM is ready
    function runInitialSetup() {
        console.log("Initializing portfolio scripts v21...");
        // Preloader hiding is handled by window.onload listener added below
        updateCopyrightYear();
        if (locationTimeElement) { updateLocationTime(); setInterval(updateLocationTime, 1000); }
        if (ENABLE_VISIT_NOTIFICATION) notifyVisit();
        setupMobileNav(); // Setup fullscreen mobile nav
        setupStickyHeader();
        initScrollAnimations();
        initLoadAnimations();
        setupContactForm();
        setupProjectModals();
        setupTechStackToggle(); // Setup interactive tech stack section
        // setupApiFlowDemo(); // Removed
        // setupInteractiveBlob(); // Removed
        if (animatedSubtitleSpan) initHeroTextAnimation();
        if (ENABLE_BACKGROUND_SHINE) initBackgroundShine();
        if (ENABLE_CUSTOM_CURSOR) setupCustomCursor();
        console.log("Portfolio scripts initialized.");
    }

    // --- Preloader Hiding Logic ---
    function hidePreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            body.classList.add('loaded'); // Trigger CSS fade-out for preloader
            console.log("Preloader hidden.");
        } else {
             body.classList.add('loaded'); // Ensure body is visible if no preloader
        }
    }
    window.addEventListener('load', hidePreloader);
    // Fallback safety timeout
    setTimeout(hidePreloader, 4500); // Adjust time if preloader animation is longer


    // --- Core Function Definitions ---

    function updateCopyrightYear() { if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear(); }
    function updateLocationTime() { if (!locationTimeElement) return; try { const now = new Date(); const options = { timeZone: LOCATION_TIME_ZONE, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }; locationTimeElement.textContent = `${LOCATION_DISPLAY_NAME}: ${now.toLocaleTimeString('en-NG', options)}`; } catch (e) { console.error("Error formatting location time:", e); locationTimeElement.textContent = ""; } }
    function notifyVisit() { if (sessionStorage.getItem('visitNotified')) return; fetch(VISIT_API_ENDPOINT, { method: 'POST' }).then(response => { if (response.ok) sessionStorage.setItem('visitNotified', 'true'); else console.warn(`Notify API Error: ${response.status}`); }).catch(error => console.error('Notify fetch error:', error)); }

    // --- Mobile Navigation (Fullscreen Overlay - FIXED) ---
    function setupMobileNav() {
        if (!hamburgerToggleBtn || !mobileNavMenu || !mobileCloseBtn) {
            console.warn("Fullscreen mobile navigation elements missing."); return;
        }
        const navLinks = mobileNavMenu.querySelectorAll('.nav-link');

        const openMobileMenu = () => {
            mobileNavMenu.classList.add('active'); // Show overlay
            mobileNavMenu.setAttribute('aria-hidden', 'false');
            hamburgerToggleBtn.classList.add('active'); // Animate hamburger to X (if styles use this)
            hamburgerToggleBtn.setAttribute('aria-expanded', 'true');
            body.classList.add('no-scroll'); // Prevent background scrolling
            mobileCloseBtn.focus(); // Focus close button for accessibility
        };

        const closeMobileMenu = () => {
            mobileNavMenu.classList.remove('active'); // Hide overlay
            mobileNavMenu.setAttribute('aria-hidden', 'true');
            hamburgerToggleBtn.classList.remove('active'); // Animate X back to hamburger
            hamburgerToggleBtn.setAttribute('aria-expanded', 'false');
            body.classList.remove('no-scroll'); // Restore scrolling
            hamburgerToggleBtn.focus(); // Return focus to opener
        };

        // Event listeners
        hamburgerToggleBtn.addEventListener('click', openMobileMenu);
        mobileCloseBtn.addEventListener('click', closeMobileMenu);

        // Close menu when a navigation link inside it is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Close menu with Escape key
         document.addEventListener('keydown', (event) => {
             if (event.key === 'Escape' && mobileNavMenu.classList.contains('active')) {
                 closeMobileMenu();
             }
         });
         console.log("Fullscreen mobile navigation setup complete.");
    }


    // --- Sticky Header ---
    function setupStickyHeader() { if (!header) return; const scrollThreshold = 50; const handleScroll = () => header.classList.toggle('scrolled', window.scrollY > scrollThreshold); let ticking = false; window.addEventListener('scroll', () => { if (!ticking) { window.requestAnimationFrame(() => { handleScroll(); ticking = false; }); ticking = true; } }, { passive: true }); }

    // --- Scroll Animations ---
    function initScrollAnimations() { const animatedElements = document.querySelectorAll('.animate-on-scroll'); if (!('IntersectionObserver' in window) || animatedElements.length === 0) { animatedElements.forEach(el => { el.classList.add('visible'); if (el.dataset.animation === 'underline') el.classList.add('animate'); }); return; } const observerCallback = (entries, observer) => { let delay = 0; entries.forEach(entry => { if (entry.isIntersecting) { entry.target.style.transitionDelay = `${delay}ms`; entry.target.classList.add('visible'); delay += 120; if (entry.target.dataset.animation === 'underline') entry.target.classList.add('animate'); observer.unobserve(entry.target); } }); }; const observerOptions = { threshold: 0.15 }; const observer = new IntersectionObserver(observerCallback, observerOptions); animatedElements.forEach(el => observer.observe(el)); }

    // --- Load Animations ---
    function initLoadAnimations() { document.querySelectorAll('.animate-on-load').forEach((el, index) => { const delay = parseInt(el.dataset.delay || "0", 10); el.style.transitionDelay = `${100 + delay + index * 50}ms`; setTimeout(() => el.classList.add('visible'), 50); }); }

    // --- Contact Form Submission (Toast Notification Style - Fixed Timeout) ---
    function setupContactForm() {
        const contactForm = document.getElementById('contact-form');
        if (!contactForm || !formStatusElement) { console.warn("Contact form/status element missing."); return; }
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); if (formStatusTimeout) clearTimeout(formStatusTimeout);
            formStatusElement.className = 'form-status'; formStatusElement.textContent = 'Sending...';
            formStatusElement.classList.add('form-status--sending'); void formStatusElement.offsetWidth;
            requestAnimationFrame(() => { requestAnimationFrame(() => { formStatusElement.classList.add('form-status--visible'); }); });
            const submitButton = contactForm.querySelector('button[type="submit"]'); submitButton.disabled = true;
            const jsonPayload = JSON.stringify(Object.fromEntries(new FormData(contactForm).entries()));
            let success = false; let message = '';
            try { const response = await fetch(CONTACT_API_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: jsonPayload }); const result = await response.json().catch(() => ({})); success = response.ok; message = success ? (result.message || "Message sent!") : `Error: ${result.error || `Request failed (${response.status})`}`; if (success) contactForm.reset(); else console.error("Contact form server error:", result.error || response.status); }
            catch (error) { success = false; message = 'Network error. Please try again.'; console.error('Contact form fetch error:', error); }
            finally { submitButton.disabled = false; formStatusElement.classList.remove('form-status--sending'); formStatusElement.textContent = message; formStatusElement.classList.add(success ? 'form-status--success' : 'form-status--error'); requestAnimationFrame(() => { requestAnimationFrame(() => { formStatusElement.classList.add('form-status--visible'); }); }); formStatusTimeout = setTimeout(() => { formStatusElement.classList.remove('form-status--visible'); formStatusTimeout = null; setTimeout(() => { formStatusElement.className = 'form-status'; formStatusElement.textContent = ''; }, 500); }, 5000); }
        });
    }

    // --- Interactive Tech Stack ---
    function setupTechStackToggle() { const techContainer = document.querySelector('.tech-stack-container'); if (!techContainer) return; const categoryBtns = techContainer.querySelectorAll('.tech-category-btn'); const detailPanes = techContainer.querySelectorAll('.tech-details'); if (categoryBtns.length === 0 || detailPanes.length === 0) return; categoryBtns.forEach(btn => { btn.addEventListener('click', (e) => { e.preventDefault(); const targetId = btn.dataset.target; const targetPane = document.querySelector(targetId); if (!targetPane || btn.classList.contains('active')) return; categoryBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); }); detailPanes.forEach(p => p.classList.remove('active')); btn.classList.add('active'); btn.setAttribute('aria-selected', 'true'); targetPane.classList.add('active'); }); }); }

    // --- Project Modal Interaction ---
    function setupProjectModals() { /* ... (modal logic remains same, inactive without triggers) ... */ if (!modalOverlay) return; const modalContent = modalOverlay.querySelector('.modal-content'); const modalCloseBtn = document.getElementById('modal-close'); const modalTitle = document.getElementById('modal-title'); const modalDescription = document.getElementById('modal-description'); const modalTech = document.getElementById('modal-tech'); const modalGithubLink = document.getElementById('modal-github-link'); const modalLiveLink = document.getElementById('modal-live-link'); const projectTriggers = document.querySelectorAll('.project-modal-trigger'); let previouslyFocusedElement = null; if (projectTriggers.length === 0) return; const openModal = (data) => { previouslyFocusedElement = document.activeElement; modalTitle.textContent = data.title || 'Project Details'; modalDescription.innerHTML = data.description?.replace(/\n/g, '<br>') || 'No details available.'; modalTech.textContent = data.tech || 'Not specified.'; modalGithubLink.style.display = data.github ? 'inline-flex' : 'none'; if(data.github) modalGithubLink.href = data.github; modalLiveLink.style.display = data.live ? 'inline-flex' : 'none'; if(data.live) modalLiveLink.href = data.live; modalOverlay.setAttribute('aria-hidden', 'false'); body.classList.add('no-scroll'); modalContent.setAttribute('tabindex', '-1'); modalContent.focus(); }; const closeModal = () => { if (!modalOverlay) return; modalOverlay.setAttribute('aria-hidden', 'true'); body.classList.remove('no-scroll'); if (previouslyFocusedElement) { previouslyFocusedElement.focus(); previouslyFocusedElement = null; } }; projectTriggers.forEach(button => button.addEventListener('click', (e) => { e.preventDefault(); openModal(button.dataset); })); if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal); modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); }); document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modalOverlay.getAttribute('aria-hidden') === 'false') closeModal(); }); }

    // --- Animated Hero Text ---
    function initHeroTextAnimation() {
        if (!animatedSubtitleSpan || typeof HERO_SUBTITLES === 'undefined' || HERO_SUBTITLES.length === 0) { if (animatedSubtitleSpan) animatedSubtitleSpan.textContent = "Full-Stack Developer"; return; }
        let subtitleIndex = 0, charIndex = 0, isDeleting = false;
        const typeSpeed = 110, deleteSpeed = 60, pauseDelay = 1800;
        function typeEffect() {
            if (heroTextTimeoutId) clearTimeout(heroTextTimeoutId);
            const currentWord = HERO_SUBTITLES[subtitleIndex];
            const displayedText = isDeleting ? currentWord.substring(0, charIndex - 1) : currentWord.substring(0, charIndex + 1);
            animatedSubtitleSpan.textContent = displayedText;
            animatedSubtitleSpan.setAttribute('aria-label', currentWord);
            if (!isDeleting && charIndex < currentWord.length) { charIndex++; heroTextTimeoutId = setTimeout(typeEffect, typeSpeed); }
            else if (!isDeleting && charIndex === currentWord.length) { isDeleting = true; heroTextTimeoutId = setTimeout(typeEffect, pauseDelay); }
            else if (isDeleting && charIndex > 0) { charIndex--; heroTextTimeoutId = setTimeout(typeEffect, deleteSpeed); }
            else { isDeleting = false; subtitleIndex = (subtitleIndex + 1) % HERO_SUBTITLES.length; heroTextTimeoutId = setTimeout(typeEffect, typeSpeed / 2); }
        }
        typeEffect(); // Start animation
    }

     // --- Periodic Background Shine ---
     function initBackgroundShine() {
         if (!ENABLE_BACKGROUND_SHINE) return;
         // Ensure constant is defined correctly
         const interval = typeof BACKGROUND_SHINE_INTERVAL !== 'undefined' ? BACKGROUND_SHINE_INTERVAL : 180000;
         const triggerShine = () => {
             if (backgroundShineTimeout) clearTimeout(backgroundShineTimeout);
             body.classList.add('body-shine');
             backgroundShineTimeout = setTimeout(() => { body.classList.remove('body-shine'); backgroundShineTimeout = null; }, 2500); // Match CSS duration
         };
         setInterval(triggerShine, interval);
         // setTimeout(triggerShine, 1500); // Optional initial shine
     }

    // --- Custom Cursor Logic ---
    function setupCustomCursor() {
        if (!ENABLE_CUSTOM_CURSOR || !customCursor || !customCursorDot || window.matchMedia("(pointer: coarse)").matches) { body.style.cursor = 'auto'; if(customCursor) customCursor.style.display = 'none'; if(customCursorDot) customCursorDot.style.display = 'none'; return; }

        body.classList.add('custom-cursor-active'); // Hide default cursor
        customCursor.classList.add('visible'); customCursorDot.classList.add('visible'); // Make elements visible

        let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
        let cursorX = mouseX, cursorY = mouseY; let dotX = mouseX, dotY = mouseY;
        const speed = 0.12; let lastMoveTime = Date.now();

        window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; lastMoveTime = Date.now(); body.classList.remove('cursor-idle'); if(cursorIdleTimeout) clearTimeout(cursorIdleTimeout); cursorIdleTimeout = setTimeout(() => body.classList.add('cursor-idle'), 1500); });

        const animateCursor = () => {
            const dxCursor = mouseX - cursorX; const dyCursor = mouseY - cursorY;
            const dxDot = mouseX - dotX; const dyDot = mouseY - dotY;
            const movedRecently = Date.now() - lastMoveTime < 100;
            // Only update if position changed significantly or recently moved
            if (movedRecently || Math.abs(dxCursor) > 0.1 || Math.abs(dyCursor) > 0.1) { cursorX += dxCursor * speed; cursorY += dyCursor * speed; customCursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`; }
            if (movedRecently || Math.abs(dxDot) > 0.1 || Math.abs(dyDot) > 0.1) { dotX += dxDot * (speed * 1.6); dotY += dyDot * (speed * 1.6); customCursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`; }
            cursorAnimationFrameId = requestAnimationFrame(animateCursor);
        };
        if(cursorAnimationFrameId) cancelAnimationFrame(cursorAnimationFrameId); // Clear previous loop if any
        animateCursor(); // Start loop

        // Add/remove hover class on body
        const interactiveElements = document.querySelectorAll('a, button, .project-card, .tech-category-btn, .approach-item, .skill-node'); // Add skill-node
        interactiveElements.forEach(el => { el.addEventListener('mouseenter', () => body.classList.add('cursor-hover')); el.addEventListener('mouseleave', () => body.classList.remove('cursor-hover')); });

         // Hide cursor visually when leaving window
         document.addEventListener('mouseleave', () => { if(customCursor) customCursor.style.opacity = '0'; if(customCursorDot) customCursorDot.style.opacity = '0'; });
         document.addEventListener('mouseenter', () => { if(customCursor) customCursor.style.opacity = '1'; if(customCursorDot) customCursorDot.style.opacity = '1'; });
    }


    // --- Run Initial Setup ---
    runInitialSetup();

}); // End DOMContentLoaded Wrapper