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

    // Hide when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        trail.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        trail.style.opacity = '1';
    });
})();
