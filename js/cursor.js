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

    // SVG canvas for drawing lines
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

    // Idle cursor position (virtual)
    let ix, iy, iTargetX, iTargetY;
    let idleLines = [];
    let idlePhase = 0; // 0=moving to point, 1=drawing
    let idlePoints = [];
    let idlePointIndex = 0;
    let idleShapeTimer = 0;

    function resetIdleTimer() {
        if (idleActive) stopIdle();
        clearTimeout(idleTimer);
        idleTimer = setTimeout(startIdle, IDLE_TIMEOUT);
    }

    function generateShape() {
        // Random shape center somewhere visible
        const cx = 100 + Math.random() * (window.innerWidth - 200);
        const cy = 100 + Math.random() * (window.innerHeight - 200);
        const size = 40 + Math.random() * 80;
        const sides = [3, 4, 5, 6, 8][Math.floor(Math.random() * 5)];
        const pts = [];
        const angleOff = Math.random() * Math.PI * 2;
        for (let i = 0; i <= sides; i++) {
            const a = angleOff + (i % sides) * (Math.PI * 2 / sides);
            pts.push({ x: cx + Math.cos(a) * size, y: cy + Math.sin(a) * size });
        }
        return pts;
    }

    function startIdle() {
        idleActive = true;
        ix = mx; iy = my;
        idleSVG.style.opacity = '1';
        cursor.classList.add('idle-drawing');
        trail.classList.add('idle-drawing');
        nextIdleShape();
        idleLoop();
    }

    function nextIdleShape() {
        idlePoints = generateShape();
        idlePointIndex = 0;
        iTargetX = idlePoints[0].x;
        iTargetY = idlePoints[0].y;
        idlePhase = 0; // move to first point
    }

    function idleLoop() {
        if (!idleActive) return;

        // Smoothly move virtual cursor toward target
        const speed = idlePhase === 0 ? 0.04 : 0.06;
        ix += (iTargetX - ix) * speed;
        iy += (iTargetY - iy) * speed;

        // Update real cursor position
        cursor.style.left = ix + 'px';
        cursor.style.top = iy + 'px';
        trail.style.left = ix + 'px';
        trail.style.top = iy + 'px';

        const dist = Math.hypot(iTargetX - ix, iTargetY - iy);

        if (dist < 3) {
            if (idlePhase === 0) {
                // Arrived at first point, start drawing
                idlePhase = 1;
                idlePointIndex = 1;
                iTargetX = idlePoints[1].x;
                iTargetY = idlePoints[1].y;
            } else {
                // Finished drawing to a point
                if (idlePointIndex < idlePoints.length - 1) {
                    // Draw line segment we just completed
                    drawIdleLine(
                        idlePoints[idlePointIndex - 1].x, idlePoints[idlePointIndex - 1].y,
                        idlePoints[idlePointIndex].x, idlePoints[idlePointIndex].y
                    );
                    idlePointIndex++;
                    iTargetX = idlePoints[idlePointIndex].x;
                    iTargetY = idlePoints[idlePointIndex].y;
                } else {
                    // Shape complete — draw last segment
                    drawIdleLine(
                        idlePoints[idlePointIndex - 1].x, idlePoints[idlePointIndex - 1].y,
                        idlePoints[idlePointIndex].x, idlePoints[idlePointIndex].y
                    );
                    // Start fading old lines, begin new shape after pause
                    setTimeout(() => { if (idleActive) nextIdleShape(); }, 800);
                    // Fade out completed shape lines after 3s
                    const currentLines = [...idleLines];
                    setTimeout(() => {
                        currentLines.forEach(line => {
                            line.style.transition = 'opacity 1.5s ease';
                            line.style.opacity = '0';
                            setTimeout(() => { if (line.parentNode) line.parentNode.removeChild(line); }, 1500);
                        });
                        idleLines = idleLines.filter(l => !currentLines.includes(l));
                    }, 3000);

                    idleRAF = requestAnimationFrame(idleLoop);
                    return;
                }
            }
        }

        idleRAF = requestAnimationFrame(idleLoop);
    }

    function drawIdleLine(x1, y1, x2, y2) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', '#D4AD3E');
        line.setAttribute('stroke-width', '1.2');
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('opacity', '0.6');
        // Animate: draw the line
        const len = Math.hypot(x2 - x1, y2 - y1);
        line.setAttribute('stroke-dasharray', len);
        line.setAttribute('stroke-dashoffset', len);
        idleSVG.appendChild(line);
        idleLines.push(line);
        // Trigger draw animation
        requestAnimationFrame(() => {
            line.style.transition = 'stroke-dashoffset 0.4s ease';
            line.setAttribute('stroke-dashoffset', '0');
        });
    }

    function stopIdle() {
        idleActive = false;
        if (idleRAF) cancelAnimationFrame(idleRAF);
        idleSVG.style.opacity = '0';
        cursor.classList.remove('idle-drawing');
        trail.classList.remove('idle-drawing');
        // Clean up lines after fade
        setTimeout(() => {
            while (idleSVG.firstChild) idleSVG.removeChild(idleSVG.firstChild);
            idleLines = [];
        }, 900);
    }

    // Reset idle on any activity
    document.addEventListener('mousemove', resetIdleTimer);
    document.addEventListener('mousedown', resetIdleTimer);
    document.addEventListener('keydown', resetIdleTimer);
    document.addEventListener('scroll', resetIdleTimer);

    // Start the idle timer
    resetIdleTimer();
})();
