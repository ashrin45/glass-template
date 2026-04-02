// Auto-inject glassmorphism background (bg-mesh + blobs + noise overlay)
// Included once per page, avoids duplicating 8 lines of HTML in every module
(function() {
    var html = '<div class="bg-mesh" aria-hidden="true">' +
        '<div class="blob blob-1"></div>' +
        '<div class="blob blob-2"></div>' +
        '<div class="blob blob-3"></div>' +
        '<div class="blob blob-4"></div>' +
        '</div>' +
        '<div class="noise-overlay" aria-hidden="true"></div>';
    document.body.insertAdjacentHTML('afterbegin', html);
})();
