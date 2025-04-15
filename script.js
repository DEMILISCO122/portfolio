document.addEventListener('DOMContentLoaded', () => {

    // --- Basic Setup ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Mobile Navigation ---
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    hamburger.querySelector('i').classList.remove('fa-times');
                    hamburger.querySelector('i').classList.add('fa-bars');
                }
            });
        });
    }

    // --- Sticky Header on Scroll ---
    const header = document.querySelector('.site-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // --- Scroll Animations (Intersection Observer) ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
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
        animatedElements.forEach(el => el.classList.add('visible')); // Fallback
    }

    // --- Animate elements visible on load ---
    const loadAnimatedElements = document.querySelectorAll('.animate-on-load');
    loadAnimatedElements.forEach(el => {
        setTimeout(() => el.classList.add('visible'), 100);
    });

    // --- Button Ripple Effect ---
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const rect = button.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.style.width = ripple.style.height = Math.max(rect.width, rect.height) + 'px';
            ripple.style.left = e.clientX - rect.left - ripple.offsetWidth / 2 + 'px';
            ripple.style.top = e.clientY - rect.top - ripple.offsetHeight / 2 + 'px';
            ripple.classList.add('ripple');
            // Ensure the ripple is removed after animation
            const existingRipple = button.querySelector('.ripple');
            if (existingRipple) { existingRipple.remove(); }
            button.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600); // Corresponds to CSS animation duration
        });
    });

    // --- Contact Form Handling (Requires Backend Integration) ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent default browser submission

            formStatus.textContent = 'Sending...';
            formStatus.style.color = 'var(--color-text-secondary)';

            const formData = new FormData(contactForm);
            const object = {};
            formData.forEach((value, key) => object[key] = value);
            const json = JSON.stringify(object);

            // --- !!! POINT OF INTEGRATION !!! ---
            // Replace '#' with your actual backend endpoint (e.g., Formspree URL)
            const endpoint = '#'; // Example: 'https://formspree.io/f/your_form_id'

            if (endpoint === '#') {
                 console.error("Contact form endpoint not configured.");
                 formStatus.textContent = 'Error: Form endpoint not set up.';
                 formStatus.style.color = 'red';
                 // alert('Contact form submission requires backend integration!');
                 return; // Stop if no endpoint is set
            }

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json' // Important for Formspree
                    },
                    body: json
                });

                if (response.ok) {
                    formStatus.textContent = "Thanks for your message! I'll get back to you soon.";
                    formStatus.style.color = 'var(--color-primary)';
                    contactForm.reset(); // Clear the form
                    setTimeout(() => formStatus.textContent = '', 5000); // Clear status after 5s
                } else {
                     const data = await response.json(); // Try to get error details
                     if (Object.hasOwn(data, 'errors')) {
                        formStatus.textContent = data["errors"].map(error => error["message"]).join(", ");
                     } else {
                        formStatus.textContent = 'Oops! There was a problem submitting your form.';
                     }
                     formStatus.style.color = 'red';
                }
            } catch (error) {
                console.error('Form submission error:', error);
                formStatus.textContent = 'Oops! There was a network problem submitting your form.';
                formStatus.style.color = 'red';
            }
            // --- End Integration Point ---
        });
    }


    // --- GSAP Integration (Placeholder - Uncomment library in <head> first) ---
    /*
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Example animation (needs GSAP library linked in <head>)
        gsap.utils.toArray('.project-card.animate-on-scroll').forEach((card, index) => {
             gsap.from(card, {
                 opacity: 0, y: 50, duration: 0.6, delay: index * 0.1,
                 scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none none" }
             });
        });
        console.log("GSAP animations initialized (Example)");
    } else {
         console.log("GSAP library not found. Skipping GSAP animations.");
    }
    */


    // --- Three.js Integration (Placeholder - Uncomment library in <head> first) ---
    /*
    if (typeof THREE !== 'undefined') {
        const heroCanvas = document.getElementById('hero-canvas');
        if (heroCanvas) {
            try {
                // --- Setup Three.js Scene for Hero ---
                const scene = new THREE.Scene();
                const container = document.getElementById('hero-3d-container');
                const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
                const renderer = new THREE.WebGLRenderer({ canvas: heroCanvas, alpha: true, antialias: true });

                renderer.setSize(container.clientWidth, container.clientHeight);
                renderer.setPixelRatio(window.devicePixelRatio);

                // --- Lights ---
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
                scene.add(ambientLight);
                const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
                directionalLight.position.set(5, 10, 7.5);
                scene.add(directionalLight);

                // --- Simple Cube Example ---
                const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
                const material = new THREE.MeshStandardMaterial({ color: 0x008751, metalness: 0.3, roughness: 0.6 }); // Nigerian Green-ish
                const cube = new THREE.Mesh(geometry, material);
                scene.add(cube);

                camera.position.z = 4;

                // --- Animation Loop ---
                function animateHero() {
                    requestAnimationFrame(animateHero);
                    cube.rotation.x += 0.005;
                    cube.rotation.y += 0.007;
                    renderer.render(scene, camera);
                }
                animateHero();

                // --- Handle Resize ---
                 const handleResize = () => {
                    const width = container.clientWidth;
                    const height = container.clientHeight;
                    if (width > 0 && height > 0) { // Ensure dimensions are valid
                        camera.aspect = width / height;
                        camera.updateProjectionMatrix();
                        renderer.setSize(width, height);
                    }
                 }
                 window.addEventListener('resize', handleResize);
                 handleResize(); // Initial call

                console.log("Three.js hero animation initialized (Example Cube)");

            } catch (error) {
                console.error("Error initializing Three.js:", error);
                heroCanvas.style.display = 'none'; // Hide canvas on error
            }
        } else {
             console.log("Hero canvas element not found for Three.js.");
        }
         // --- Add Skills Canvas logic here if implementing ---

    } else {
        console.log("Three.js library not found. Skipping 3D elements.");
         // Optionally hide canvas elements if Three.js is not loaded
         const canvasElements = document.querySelectorAll('canvas');
         canvasElements.forEach(canvas => canvas.style.display = 'none');
    }
    */

}); // End DOMContentLoaded