// Home page - crossfade background preview on hover
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item-home');
    const layer1 = document.getElementById('bgLayer1');
    const layer2 = document.getElementById('bgLayer2');
    let activeLayer = layer1;
    let inactiveLayer = layer2;
    let currentImg = '';

    // Preload all preview images for instant display
    navItems.forEach(item => {
        const src = item.getAttribute('data-preview');
        if (src) {
            const img = new Image();
            img.src = src;
        }
    });

    navItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const img = item.getAttribute('data-preview');
            if (!img || img === currentImg) return;
            currentImg = img;

            // Set new image on the inactive layer, then crossfade
            inactiveLayer.style.backgroundImage = `url('${img}')`;
            inactiveLayer.classList.add('active');
            activeLayer.classList.remove('active');

            // Swap references
            const temp = activeLayer;
            activeLayer = inactiveLayer;
            inactiveLayer = temp;
        });

        item.addEventListener('mouseleave', () => {
            currentImg = '';
            layer1.classList.remove('active');
            layer2.classList.remove('active');
        });
    });

    // Entrance animations
    const logo = document.querySelector('.logo-wrapper');
    const nav = document.querySelector('.home-nav');

    [logo, nav].forEach((el, i) => {
        if (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 300 + i * 200);
        }
    });
});
