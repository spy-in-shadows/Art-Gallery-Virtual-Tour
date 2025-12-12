document.addEventListener('DOMContentLoaded', () => {

    const roomContainer = document.getElementById('room-container');
    const artworkFrames = document.querySelectorAll('.artwork-frame');
    const detailOverlay = document.getElementById('artwork-detail-overlay');
    const museumContainer = document.getElementById('museum-container');

    
    const urlParams = new URLSearchParams(window.location.search);
    const currentCategory = urlParams.get('category') || 'impressionism';

    
    document.querySelector('.room-title').textContent = currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
    document.title = `${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} Exhibition - Galerie d'Art`;

    let artworksData = {};

    const loadArtworkData = () => {
        
        
        if (window.artworksData) {
            artworksData = window.artworksData;
            populateRoom();
            initMouseRotation();
            initArtworkInteractions();
        } else {
            console.error('Artwork data not found. Ensure artworks-data.js is loaded.');
        }
    };

    const populateRoom = () => {
        const categoryData = artworksData[currentCategory];
        if (!categoryData || categoryData.length < 3) return;

        artworkFrames.forEach((frame, index) => {
            const artwork = categoryData[index];
            if (!artwork) return;

            frame.dataset.id = artwork.id;
            const img = frame.querySelector('.artwork-image');
            const title = frame.querySelector('.info-title');
            const artist = frame.querySelector('.info-artist');

            
            const imageSrc = artwork.image_url.startsWith('http') ? artwork.image_url : `../${artwork.image_url}`;

            img.src = imageSrc;
            img.onerror = () => {
                console.warn(`Failed to load image: ${imageSrc}. Using placeholder.`);
                img.src = '../assets/placeholder.png';
            };

            img.alt = artwork.title;
            title.textContent = artwork.title;
            artist.textContent = artwork.artist;
        });
    };

    const initMouseRotation = () => {
        const maxRotation = 5;

        museumContainer.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;

            const rotateY = (mouseX - 0.5) * -2 * maxRotation;
            const rotateX = (mouseY - 0.5) * 2 * maxRotation;

            gsap.to(roomContainer, {
                rotationY: rotateY,
                rotationX: rotateX,
                duration: 1.0,
                ease: 'power2.out'
            });

            gsap.to(artworkFrames, {
                x: (mouseX - 0.5) * 10,
                y: (mouseY - 0.5) * 10,
                duration: 1.2,
                ease: 'power1.out'
            });
        });
    };

    const showArtworkDetail = (artwork) => {
        const imageSrc = artwork.image_url.startsWith('http') ? artwork.image_url : `../${artwork.image_url}`;

        detailOverlay.innerHTML = `
            <div class="detail-content">
                <button class="close-button">X</button>
                <div class="detail-image-wrapper">
                    <img src="${imageSrc}" alt="${artwork.title}">
                </div>
                <div class="detail-text">
                    <h2>${artwork.title}</h2>
                    <p class="artist-year">${artwork.artist}, ${artwork.year}</p>
                    <p class="medium">${artwork.medium}</p>
                    <p class="description">${artwork.description}</p>
                </div>
            </div>
        `;

        detailOverlay.style.display = 'flex';
        gsap.set(detailOverlay, { opacity: 0 });

        const detailImageWrapper = detailOverlay.querySelector('.detail-image-wrapper');
        const detailText = detailOverlay.querySelector('.detail-text');

        const detailTimeline = gsap.timeline();

        detailTimeline.to(detailOverlay, { opacity: 1, duration: 0.3 });

        detailTimeline.from(detailImageWrapper, {
            y: '100%',
            opacity: 0,
            duration: 1.2,
            ease: 'expo.out'
        }, 0);

        detailTimeline.from(detailText.children, {
            y: 50,
            opacity: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: 'power3.out'
        }, 0.5);

        detailOverlay.querySelector('.close-button').addEventListener('click', () => {
            gsap.to(detailOverlay, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    detailOverlay.style.display = 'none';
                }
            });
        });
    };

    const initArtworkInteractions = () => {
        artworkFrames.forEach(frame => {
            frame.addEventListener('click', () => {
                const id = frame.dataset.id;
                const selectedArtwork = artworksData[currentCategory].find(art => art.id === id);
                if (selectedArtwork) {
                    showArtworkDetail(selectedArtwork);
                }
            });

            frame.addEventListener('mouseenter', () => {
                gsap.to(frame, { scale: 1.02, z: 5, duration: 0.3 });
            });
            frame.addEventListener('mouseleave', () => {
                gsap.to(frame, { scale: 1, z: 0, duration: 0.3 });
            });
        });
    };

    loadArtworkData();

    document.querySelector('.exit-button').addEventListener('click', () => {
        window.location.href = '../index.html';
    });
});
