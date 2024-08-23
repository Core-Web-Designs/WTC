function toggleSidebar(id, show) {
    const elem = document.getElementById(id);
    const toggles = document.querySelectorAll('.sidebar-toggle');

    if (show !== undefined) {
        if (show && elem.classList.contains('collapsed')) {
            elem.classList.remove('collapsed');
        } else if (!show && !elem.classList.contains('collapsed')) {
            elem.classList.add('collapsed');
        }
    } else {
        if (elem.classList.contains('collapsed')) {
            elem.classList.remove('collapsed');
        } else {
            elem.classList.add('collapsed');
        }
    }

    // Adjust the z-index of the toggles
    toggles.forEach(toggle => {
        if (toggle.classList.contains(id)) {
            toggle.style.zIndex = '55'; // Ensure the toggle for this sidebar is above the sidebar itself
        } else {
            toggle.style.zIndex = '5'; // Lower z-index for other toggles
        }
    });

    elem.style.zIndex = show ? '50' : '10';  // Ensure the sidebar is above other elements or reset z-index to default
}

function handleNavigation() {
    // Ensure the main content is not shifted when navigating
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    if (sidebar.classList.contains('hidden')) {
        mainContent.classList.remove('shifted');
    } else {
        mainContent.classList.add('shifted');
    }
    
    // Additional logic for navigating content can be added here
}

// Swipe event handlers
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(event) {
    touchStartX = event.changedTouches[0].screenX;
}

function handleTouchMove(event) {
    touchEndX = event.changedTouches[0].screenX;
}

function handleTouchEnd(event) {
    if (touchStartX - touchEndX > 50) {
        // Swipe left to close the sidebar
        toggleSidebar('welcome', false);
    } else if (touchEndX - touchStartX > 50) {
        // Swipe right to open the sidebar
        toggleSidebar('welcome', true);
    }
}

const welcomeSidebar = document.getElementById('welcome');
welcomeSidebar.addEventListener('touchstart', handleTouchStart, false);
welcomeSidebar.addEventListener('touchmove', handleTouchMove, false);
welcomeSidebar.addEventListener('touchend', handleTouchEnd, false);
