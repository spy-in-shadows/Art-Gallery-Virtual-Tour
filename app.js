
document.addEventListener('DOMContentLoaded', () => {
    
    const carousel = document.getElementById('artCarousel');
    const cards = document.querySelectorAll('.art-card');
    const isDesktop = window.innerWidth > 768;
    let rotationTimeline;
    
    if (isDesktop) {

        const totalCards = cards.length;
        
        const cardWidthWithGap = 800;
        const calculatedRadius = Math.round((totalCards * cardWidthWithGap) / (2 * Math.PI));
        const radius = Math.max(1000, calculatedRadius);
        const anglePerCard = 360 / totalCards;

        gsap.set(carousel, { z: -radius - 1000 });

        console.log(`[3D Setup] Total Cards: ${totalCards}, Radius: ${radius}px`);

        cards.forEach((card, index) => {
            const angle = index * anglePerCard;

            
            
            card.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;

            
            card.dataset.rotationY = angle;
            card.dataset.z = radius;
        });

        
        rotationTimeline = gsap.timeline({ repeat: -1, defaults: { ease: 'none' } });

        
        rotationTimeline.to(carousel, {
            rotationY: 360,
            duration: 60, 
        });

        
        cards.forEach(card => {

            
            card.addEventListener('mouseenter', () => {
                rotationTimeline.pause();

                
                gsap.to(card, {
                    scale: 1.1,
                    boxShadow: '0 0 50px rgba(255, 255, 255, 0.3)',
                    duration: 0.5,
                    ease: 'power2.out',
                    zIndex: 100 
                });
            });

            
            card.addEventListener('mouseleave', () => {
                rotationTimeline.resume();

                
                gsap.to(card, {
                    scale: 1.0,
                    boxShadow: '0 0 40px rgba(255, 255, 255, 0.15)',
                    duration: 0.5,
                    ease: 'power2.out',
                    zIndex: 1 
                });
            });
        });
    }

    
    cards.forEach(card => {
        card.addEventListener('click', (event) => {
            const category = card.dataset.category;

            
            if (rotationTimeline) {
                rotationTimeline.kill();
            }
            gsap.killTweensOf('*');

            
            const enterTimeline = gsap.timeline({
                onComplete: () => {
                    
                    window.location.href = `museum-room/room.html?category=${category}`;
                }
            });

            
            enterTimeline.to('.gallery-header', { opacity: 0, duration: 0.5 }, 0);

            
            const otherCards = Array.from(cards).filter(c => c !== card);

            
            enterTimeline.to(otherCards, {
                opacity: 0,
                x: 'random(-1000, 1000)', 
                y: 'random(-500, 500)',
                z: 'random(-500, -2000)', 
                rotationX: 'random(-90, 90)',
                rotationY: 'random(-90, 90)',
                scale: 0,
                duration: 1.0,
                ease: 'power3.in',
            }, 0);

            
            enterTimeline.to(card, {
                
                rotationY: 0,
                z: 0, 

                
                x: 0,
                y: 0,
                scale: 30, 
                opacity: 0, 
                duration: 1.8,
                ease: 'expo.in', 
            }, 0.1);
        });
    });
    
    
    gsap.utils.toArray('.content-wrapper').forEach(section => {
        gsap.to(section, {
            scrollTrigger: {
                trigger: section,
                start: "top 80%", 
                toggleActions: "play none none reverse"
            },
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power2.out"
        });
    });

    
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
