// Preloader - waits for all images to load then fades out
(function() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    function hidePreloader() {
        preloader.classList.add('hidden');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 600);
    }

    // Collect all images on the page
    const images = Array.from(document.images);
    // Also check for background images in video posters
    const videos = Array.from(document.querySelectorAll('video[poster]'));
    videos.forEach(v => {
        const img = new Image();
        img.src = v.poster;
        images.push(img);
    });

    if (images.length === 0) {
        hidePreloader();
        return;
    }

    let loaded = 0;
    const total = images.length;

    function onLoad() {
        loaded++;
        if (loaded >= total) {
            hidePreloader();
        }
    }

    images.forEach(img => {
        if (img.complete) {
            onLoad();
        } else {
            img.addEventListener('load', onLoad);
            img.addEventListener('error', onLoad); // Don't block on broken images
        }
    });

    // Safety timeout - never block more than 5 seconds
    setTimeout(hidePreloader, 5000);
})();
