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

    // ── About Us golden lines background ──
    const aboutLink = document.querySelector('.nav-item-home.about-link');
    let linesActive = false;
    let linesRAF = null;
    let linesTimeout = null;

    // Create overlay: red tint + SVG for lines
    const linesOverlay = document.createElement('div');
    Object.assign(linesOverlay.style, {
        position: 'fixed', top: '0', left: '0',
        width: '100%', height: '100%',
        background: 'rgba(134,27,28,0.35)',
        zIndex: '1', pointerEvents: 'none',
        opacity: '0', transition: 'opacity 1s ease'
    });
    const linesSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    linesSVG.setAttribute('width', '100%');
    linesSVG.setAttribute('height', '100%');
    Object.assign(linesSVG.style, {
        position: 'absolute', top: '0', left: '0',
        width: '100%', height: '100%'
    });
    linesOverlay.appendChild(linesSVG);
    document.body.appendChild(linesOverlay);

    function randomLine() {
        const W = window.innerWidth, H = window.innerHeight;
        // Pick random type: vertical, horizontal, or diagonal
        const type = Math.random();
        let x1, y1, x2, y2;
        if (type < 0.35) {
            // Vertical
            x1 = x2 = Math.random() * W;
            y1 = Math.random() * H;
            y2 = y1 + 60 + Math.random() * 200;
        } else if (type < 0.7) {
            // Horizontal
            y1 = y2 = Math.random() * H;
            x1 = Math.random() * W;
            x2 = x1 + 60 + Math.random() * 200;
        } else {
            // Diagonal
            x1 = Math.random() * W;
            y1 = Math.random() * H;
            const angle = (Math.random() - 0.5) * Math.PI * 0.6;
            const len = 80 + Math.random() * 160;
            x2 = x1 + Math.cos(angle) * len;
            y2 = y1 + Math.sin(angle) * len;
        }

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', '#D4AD3E');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('opacity', String(0.15 + Math.random() * 0.25));

        const len = Math.hypot(x2 - x1, y2 - y1);
        line.setAttribute('stroke-dasharray', String(len));
        line.setAttribute('stroke-dashoffset', String(len));
        linesSVG.appendChild(line);

        // Animate draw
        requestAnimationFrame(() => {
            line.style.transition = `stroke-dashoffset ${0.8 + Math.random() * 1.2}s ease`;
            line.setAttribute('stroke-dashoffset', '0');
        });

        // Fade out and remove
        setTimeout(() => {
            line.style.transition = 'opacity 1.5s ease';
            line.style.opacity = '0';
            setTimeout(() => { if (line.parentNode) line.parentNode.removeChild(line); }, 1500);
        }, 2000 + Math.random() * 2000);
    }

    // Also add small diamonds occasionally
    function randomDiamond() {
        const W = window.innerWidth, H = window.innerHeight;
        const cx = Math.random() * W, cy = Math.random() * H;
        const size = 4 + Math.random() * 8;
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', String(cx - size / 2));
        rect.setAttribute('y', String(cy - size / 2));
        rect.setAttribute('width', String(size));
        rect.setAttribute('height', String(size));
        rect.setAttribute('fill', 'none');
        rect.setAttribute('stroke', '#D4AD3E');
        rect.setAttribute('stroke-width', '0.8');
        rect.setAttribute('transform', `rotate(45 ${cx} ${cy})`);
        rect.setAttribute('opacity', '0');
        linesSVG.appendChild(rect);

        requestAnimationFrame(() => {
            rect.style.transition = 'opacity 0.6s ease';
            rect.setAttribute('opacity', String(0.2 + Math.random() * 0.2));
        });

        setTimeout(() => {
            rect.style.transition = 'opacity 1.5s ease';
            rect.setAttribute('opacity', '0');
            setTimeout(() => { if (rect.parentNode) rect.parentNode.removeChild(rect); }, 1500);
        }, 2500 + Math.random() * 2000);
    }

    let spawnInterval = null;

    function startLines() {
        if (linesActive) return;
        linesActive = true;
        linesOverlay.style.opacity = '1';

        // Spawn lines continuously
        spawnInterval = setInterval(() => {
            if (!linesActive) return;
            randomLine();
            if (Math.random() < 0.3) randomDiamond();
        }, 200);

        // Immediate burst
        for (let i = 0; i < 8; i++) {
            setTimeout(() => { if (linesActive) randomLine(); }, i * 80);
        }
    }

    function stopLines() {
        linesActive = false;
        clearInterval(spawnInterval);
        linesOverlay.style.opacity = '0';
        // Clean up SVG children after fade
        setTimeout(() => {
            while (linesSVG.firstChild) linesSVG.removeChild(linesSVG.firstChild);
        }, 1100);
    }

    navItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (item.classList.contains('about-link')) {
                // About Us: show lines instead of bg image
                currentImg = '';
                layer1.classList.remove('active');
                layer2.classList.remove('active');
                startLines();
                return;
            }

            // Stop lines if coming from about
            stopLines();

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
            if (item.classList.contains('about-link')) {
                stopLines();
            }
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
