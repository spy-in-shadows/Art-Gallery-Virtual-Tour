// Ensure GSAP is loaded before running any code
document.addEventListener('DOMContentLoaded', () => {
    // 1. SELECTORS
    const carousel = document.getElementById('artCarousel');
    const cards = document.querySelectorAll('.art-card');

    // Check if the environment supports complex 3D (i.e., not mobile simplification)
    // We check the CSS property that only exists on desktop styles
    const isDesktop = window.innerWidth > 768;

    // Initialize the GSAP Timeline for the perpetual rotation
    let rotationTimeline;

    // 2. PERPETUAL ROTATION FUNCTIONALITY (Desktop Only)
    if (isDesktop) {

        const totalCards = cards.length;
        // Increase gap for more breathing room
        const cardWidthWithGap = 800;
        const calculatedRadius = Math.round((totalCards * cardWidthWithGap) / (2 * Math.PI));
        const radius = Math.max(1000, calculatedRadius);
        const anglePerCard = 360 / totalCards;

        // CRITICAL FIX: Push the whole carousel back so the front cards aren't in our face
        // This places the center of rotation 'radius' pixels deep into the scene.
        // We add an EXTRA push (e.g. -1000) to ensure the front card is not "in your face"
        gsap.set(carousel, { z: -radius - 1000 });

        // Debug logging
        console.log(`[3D Setup] Total Cards: ${totalCards}, Radius: ${radius}px`);

        cards.forEach((card, index) => {
            const angle = index * anglePerCard;

            // STRICTLY use vanilla JS string to ensure translateZ is present
            // We do NOT call gsap.set here to avoid it verifying/overwriting the matrix
            card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;

            // Store these values on the element for future reference if needed
            card.dataset.rotationY = angle;
            card.dataset.z = radius;
        });

        // --- A. Define the Continuous Rotation ---
        rotationTimeline = gsap.timeline({ repeat: -1, defaults: { ease: 'none' } });

        // Rotate the entire carousel 360 degrees on the Y-axis indefinitely
        rotationTimeline.to(carousel, {
            rotationY: 360,
            duration: 60, // Slower duration for more cards to maintain elegance
        });

        // --- B. Handle Hover Interaction (Stop/Resume) ---
        cards.forEach(card => {

            // On mouse enter, stop the rotation and slightly scale/light up the card.
            card.addEventListener('mouseenter', () => {
                rotationTimeline.pause();

                // GSAP animation for the card itself (subtle extra hover effect)
                gsap.to(card, {
                    scale: 1.1,
                    boxShadow: '0 0 50px rgba(255, 255, 255, 0.3)',
                    duration: 0.5,
                    ease: 'power2.out',
                    zIndex: 100 // Ensure it's above other cards
                });
            });

            // On mouse leave, resume the rotation.
            card.addEventListener('mouseleave', () => {
                rotationTimeline.resume();

                // GSAP animation to reset the card
                gsap.to(card, {
                    scale: 1.0,
                    boxShadow: '0 0 40px rgba(255, 255, 255, 0.15)',
                    duration: 0.5,
                    ease: 'power2.out',
                    zIndex: 1 // Reset stacking order
                });
            });
        });
    }

    // 3. DRAMATIC CLICK TRANSITION (Enter the Museum Room)
    cards.forEach(card => {
        card.addEventListener('click', (event) => {
            const category = card.dataset.category;

            // 1. Stop all current animations
            if (rotationTimeline) {
                rotationTimeline.kill();
            }
            gsap.killTweensOf('*');

            // 2. Create the "Pull-In" Transition Timeline
            const enterTimeline = gsap.timeline({
                onComplete: () => {
                    // Redirect to the generic room page with category param
                    window.location.href = `museum-room/room.html?category=${category}`;
                }
            });

            // Phase 1: Fade out the header and push all *other* cards away
            enterTimeline.to('.gallery-header', { opacity: 0, duration: 0.5 }, 0);

            // Identify non-clicked cards
            const otherCards = Array.from(cards).filter(c => c !== card);

            // Hide and push away all other cards for a clean focus
            enterTimeline.to(otherCards, {
                opacity: 0,
                x: 'random(-1000, 1000)', // Increased range for crazy effect
                y: 'random(-500, 500)',
                z: 'random(-500, -2000)', // Push them back
                rotationX: 'random(-90, 90)',
                rotationY: 'random(-90, 90)',
                scale: 0,
                duration: 1.0,
                ease: 'power3.in',
            }, 0);

            // Phase 2: The dramatic "pull-in" of the selected card
            enterTimeline.to(card, {
                // Remove 3D transform properties for the pull-in
                rotationY: 0,
                z: 0, // Reset translateZ

                // Position card at the absolute center, filling the screen slightly
                x: 0,
                y: 0,
                scale: 30, // EVEN BIGGER scale
                opacity: 0, // Fade out as it zooms past
                duration: 1.8,
                ease: 'expo.in', // Exponential ease for that "warp speed" feel
            }, 0.1);
        });
    });
    // 4. SCROLL ANIMATIONS
    // Animate the new content sections as they scroll into view
    gsap.utils.toArray('.content-wrapper').forEach(section => {
        gsap.to(section, {
            scrollTrigger: {
                trigger: section,
                start: "top 80%", // When top of section hits 80% viewport height
                toggleActions: "play none none reverse"
            },
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power2.out"
        });
    });

    // Optional: Parallax fade out for the carousel when scrolling down
    gsap.to('.carousel-wrapper', {
        scrollTrigger: {
            trigger: '.landing-container',
            start: "top top",
            end: "bottom top",
            scrub: true
        },
        opacity: 0,
        y: -200
    });

});
