document.addEventListener('DOMContentLoaded', () => {

    // --- Notify on Visit (Trigger Serverless Function) ---
    // This function is called immediately when the main JS runs after DOM load.
    // Consider adding logic here if you only want to notify on the *first* visit
    // per session (using sessionStorage) to avoid excessive notifications.
    function notifyVisit() {
        fetch('http://localhost:3000/api/notify-visit', { method: 'POST' })
            .then(response => {
                if (!response.ok) {
                    console.warn('Visit notification request failed.');
                } else {
                    console.log('Visit notification request sent.');
                }
            })
            .catch(error => {
                console.error('Error sending visit notification:', error);
            });
    }
    // Call the notification function on page load
    notifyVisit();
    // --- End Visit Notification ---


    // --- Basic Setup: Current Year ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Mobile Navigation Toggle ---
    // (Keep the existing code for mobile menu)
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    // ... (rest of mobile menu code from previous response) ...
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    const icon = hamburger.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }


    // --- Sticky Header Background on Scroll ---
    // (Keep the existing code for sticky header)
    const header = document.querySelector('.site-header');
    // ... (rest of sticky header code from previous response) ...
     if (header) {
        const scrollThreshold = 50;
        window.addEventListener('scroll', () => {
            if (window.scrollY > scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // --- Scroll Animations (Intersection Observer) ---
    // (Keep the existing code for scroll animations)
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    // ... (rest of Intersection Observer code from previous response) ...
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        animatedElements.forEach(el => observer.observe(el));
    } else {
        animatedElements.forEach(el => el.classList.add('visible'));
    }
    const loadAnimatedElements = document.querySelectorAll('.animate-on-load');
    loadAnimatedElements.forEach((el, index) => {
        setTimeout(() => el.classList.add('visible'), 100 + index * 50);
    });


    // --- Button Ripple Effect (Optional) ---
    // (Keep the existing ripple effect code or remove if desired)
    const buttons = document.querySelectorAll('.btn');
    // ... (rest of ripple effect code from previous response) ...
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            // ... ripple logic ...
             const rect = button.getBoundingClientRect();
            const ripple = document.createElement('span');
            const diameter = Math.max(rect.width, rect.height);
            const radius = diameter / 2;
            ripple.style.width = ripple.style.height = `${diameter}px`;
            ripple.style.left = `${e.clientX - rect.left - radius}px`;
            ripple.style.top = `${e.clientY - rect.top - radius}px`;
            ripple.classList.add('ripple');
            const existingRipple = button.querySelector('.ripple');
            if (existingRipple) { existingRipple.remove(); }
            button.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });


    // --- Contact Form Handling (Using Vercel Serverless Function) ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            formStatus.textContent = 'Sending...';
            formStatus.style.color = 'var(--color-text-secondary)';
            const submitButton = contactForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;

            const formData = new FormData(contactForm);
            const object = {};
            formData.forEach((value, key) => object[key] = value);
            const json = JSON.stringify(object);

            // === Endpoint for your Vercel Serverless Function ===
            const endpoint = '/api/contact'; // Relative path to your function
            // ====================================================

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: json
                });

                if (response.ok) {
                    formStatus.textContent = "Thanks for your message! I'll be in touch soon.";
                    formStatus.style.color = 'var(--color-accent)';
                    contactForm.reset();
                    setTimeout(() => formStatus.textContent = '', 6000);
                } else {
                    const data = await response.json().catch(() => ({}));
                    const errorMessage = data?.error || `Server error ${response.status}`;
                    console.error("Form submission server error:", errorMessage);
                    formStatus.textContent = `Oops! There was a problem: ${errorMessage}`;
                    formStatus.style.color = 'red';
                }
            } catch (error) {
                console.error('Network or fetch error during form submission:', error);
                formStatus.textContent = 'Oops! A network error occurred. Please try again.';
                formStatus.style.color = 'red';
            } finally {
                 submitButton.disabled = false;
            }
        });
    }

}); // End DOMContentLoaded

function updateLagosTime() {
    const timeElement = document.getElementById('lagos-time'); // Add  in footer
    if (timeElement) {
        const now = new Date();
        const options = { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit', /* hour12: true/false */ };
        timeElement.textContent = ` ${now.toLocaleTimeString('en-NG', options)} Abeokuta`;
    }
}
updateLagosTime();
setInterval(updateLagosTime, 60000); // Update every minute