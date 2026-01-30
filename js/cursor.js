// Custom gold square cursor
(function() {
    // Don't show on touch devices
    if ('ontouchstart' in window) return;

    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    const trail = document.createElement('div');
    trail.className = 'custom-cursor-trail';
    document.body.appendChild(trail);

    let mx = -100, my = -100;
    let tx = -100, ty = -100;

    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
    });

    // Smooth trail follow
    function animate() {
        tx += (mx - tx) * 0.15;
        ty += (my - ty) * 0.15;

        cursor.style.left = mx + 'px';
        cursor.style.top = my + 'px';

        trail.style.left = tx + 'px';
        trail.style.top = ty + 'px';

        requestAnimationFrame(animate);
    }
    animate();

    // Expand on hover over interactive elements
    const hoverTargets = 'a, button, .theme-pill, .design-option, .color-circle, .quiz-option, .btn-order, .btn-pay, .btn-quiz-nav, .nav-item-home, .back-accordion-toggle, .collection-img';

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverTargets)) {
            cursor.classList.add('hover');
            trail.classList.add('hover');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverTargets)) {
            cursor.classList.remove('hover');
            trail.classList.remove('hover');
        }
    });

    // Shrink on click (focus effect)
    document.addEventListener('mousedown', () => {
        cursor.classList.add('clicking');
        trail.classList.add('clicking');
    });
    document.addEventListener('mouseup', () => {
        cursor.classList.remove('clicking');
        trail.classList.remove('clicking');
    });

    // Hide when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        trail.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        trail.style.opacity = '1';
    });

    // ── Idle animation: after 20s of no activity, cursor draws golden shapes ──
    let idleTimer = null;
    let idleActive = false;
    let idleRAF = null;
    const IDLE_TIMEOUT = 20000;

    const idleSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    idleSVG.setAttribute('width', '100%');
    idleSVG.setAttribute('height', '100%');
    Object.assign(idleSVG.style, {
        position: 'fixed', top: '0', left: '0',
        width: '100vw', height: '100vh',
        pointerEvents: 'none', zIndex: '99997', opacity: '0',
        transition: 'opacity 0.8s ease'
    });
    document.body.appendChild(idleSVG);

    let ix, iy;

    // All steps the cursor must take: { type:'move'|'draw', x, y }
    let idleSteps = [];
    let idleStepIndex = 0;
    // For draw steps, the live SVG line
    let activeLine = null;
    let stepFrom = null;
    let stepProgress = 0;

    function generateShape() {
        const W = window.innerWidth, H = window.innerHeight;
        const cx = 100 + Math.random() * (W - 200);
        const cy = 100 + Math.random() * (H - 200);
        const size = 35 + Math.random() * 65;
        const sides = [3, 4, 5, 6, 7, 8][Math.floor(Math.random() * 6)];
        const pts = [];
        const off = Math.random() * Math.PI * 2;
        for (let i = 0; i <= sides; i++) {
            const a = off + (i % sides) * (Math.PI * 2 / sides);
            pts.push({ x: cx + Math.cos(a) * size, y: cy + Math.sin(a) * size });
        }
        return pts;
    }

    function buildSteps() {
        // Build a sequence of 5 shapes worth of steps
        for (let s = 0; s < 5; s++) {
            const pts = generateShape();
            // First point: move (no line)
            idleSteps.push({ type: 'move', x: pts[0].x, y: pts[0].y });
            // Remaining points: draw lines
            for (let i = 1; i < pts.length; i++) {
                idleSteps.push({ type: 'draw', x: pts[i].x, y: pts[i].y });
            }
        }
    }

    function resetIdleTimer() {
        if (idleActive) stopIdle();
        clearTimeout(idleTimer);
        idleTimer = setTimeout(startIdle, IDLE_TIMEOUT);
    }

    function startIdle() {
        idleActive = true;
        ix = mx; iy = my;
        idleSVG.style.opacity = '1';
        cursor.classList.add('idle-drawing');
        trail.classList.add('idle-drawing');
        idleSteps = [];
        idleStepIndex = 0;
        activeLine = null;
        stepFrom = null;
        buildSteps();
        idleRAF = requestAnimationFrame(idleLoop);
    }

    function idleLoop() {
        if (!idleActive) return;

        // Refill steps if running low
        if (idleStepIndex >= idleSteps.length - 2) {
            buildSteps();
        }

        const step = idleSteps[idleStepIndex];

        if (step.type === 'move') {
            // Glide cursor to this point — no line drawn
            const dx = step.x - ix, dy = step.y - iy;
            const dist = Math.hypot(dx, dy);
            if (dist > 1.5) {
                // Smooth constant speed: 5px/frame
                const spd = Math.min(5, dist * 0.08);
                ix += (dx / dist) * spd;
                iy += (dy / dist) * spd;
            } else {
                ix = step.x; iy = step.y;
                idleStepIndex++;
            }
        } else {
            // Draw: extend a line from previous position to target
            if (!activeLine) {
                stepFrom = { x: ix, y: iy };
                stepProgress = 0;
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', ix);
                line.setAttribute('y1', iy);
                line.setAttribute('x2', ix);
                line.setAttribute('y2', iy);
                line.setAttribute('stroke', '#D4AD3E');
                line.setAttribute('stroke-width', '1.2');
                line.setAttribute('stroke-linecap', 'round');
                line.setAttribute('opacity', '0.5');
                idleSVG.appendChild(line);
                activeLine = line;
            }

            // Advance progress — 0.025/frame ≈ 40 frames per segment
            stepProgress += 0.025;
            if (stepProgress > 1) stepProgress = 1;

            const px = stepFrom.x + (step.x - stepFrom.x) * stepProgress;
            const py = stepFrom.y + (step.y - stepFrom.y) * stepProgress;

            activeLine.setAttribute('x2', px);
            activeLine.setAttribute('y2', py);
            ix = px; iy = py;

            if (stepProgress >= 1) {
                activeLine = null;
                stepFrom = null;
                idleStepIndex++;
            }
        }

        // Update cursor position
        cursor.style.left = ix + 'px';
        cursor.style.top = iy + 'px';
        trail.style.left = ix + 'px';
        trail.style.top = iy + 'px';

        idleRAF = requestAnimationFrame(idleLoop);
    }

    function stopIdle() {
        idleActive = false;
        if (idleRAF) cancelAnimationFrame(idleRAF);
        activeLine = null;
        stepFrom = null;
        cursor.classList.remove('idle-drawing');
        trail.classList.remove('idle-drawing');

        // Slowly fade all drawn lines, then clean up
        const allLines = idleSVG.querySelectorAll('line');
        allLines.forEach(line => {
            line.style.transition = 'opacity 3s ease';
            line.style.opacity = '0';
        });
        setTimeout(() => {
            idleSVG.style.opacity = '0';
            setTimeout(() => {
                while (idleSVG.firstChild) idleSVG.removeChild(idleSVG.firstChild);
                idleSteps = [];
                idleStepIndex = 0;
            }, 900);
        }, 3000);
    }

    // Reset idle on any activity
    document.addEventListener('mousemove', resetIdleTimer);
    document.addEventListener('mousedown', resetIdleTimer);
    document.addEventListener('keydown', resetIdleTimer);
    document.addEventListener('scroll', resetIdleTimer);

    resetIdleTimer();
})();
