// Mobile Navigation Toggle

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle mobile menu
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    
    // Animate hamburger to X
    hamburger.classList.toggle('active');
});

// Close menu when clicking on a nav link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Toggleable Filter System
let activeFilters = new Set(['all']);

function filterProjects(category) {
    const clickedButton = event.target;
    
    if (category === 'all') {
        // If "All" is clicked, clear other filters and activate "All"
        activeFilters.clear();
        activeFilters.add('all');
        
        // Update button states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        clickedButton.classList.add('active');
        
    } else {
        // Remove "All" if it's active
        if (activeFilters.has('all')) {
            activeFilters.delete('all');
            document.querySelector('[onclick="filterProjects(\'all\')"]').classList.remove('active');
        }
        
        // Toggle the clicked filter
        if (activeFilters.has(category)) {
            activeFilters.delete(category);
            clickedButton.classList.remove('active');
        } else {
            activeFilters.add(category);
            clickedButton.classList.add('active');
        }
        
        // If no filters are active, default to "All"
        if (activeFilters.size === 0) {
            activeFilters.add('all');
            document.querySelector('[onclick="filterProjects(\'all\')"]').classList.add('active');
        }
    }
    
    // Apply filtering
    applyFilters();
}

function applyFilters() {
    const projects = document.querySelectorAll('.project-card');
    
    projects.forEach(project => {
        if (activeFilters.has('all')) {
            // Show all projects
            project.style.display = 'block';
        } else {
            // Check if project matches any active filter
            const projectMatches = Array.from(activeFilters).some(filter => 
                project.classList.contains('project-' + filter)
            );
            
            if (projectMatches) {
                project.style.display = 'block';
            } else {
                project.style.display = 'none';
            }
        }
    });
}

// Add active class to navigation links on scroll
// Navbar Background on Scroll

const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add shadow to navbar when scrolling
    if (currentScroll > 50) {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// Intersection Observer for Scroll Animations

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all project cards for animation
projectCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(card);
});

// Dynamic Year in Footer

const currentYear = new Date().getFullYear();
const footerText = document.querySelector('.footer p');
if (footerText) {
    footerText.innerHTML = footerText.innerHTML.replace('2025', currentYear);
}

// Project Card Hover Effects

const projectImages = document.querySelectorAll('.project-image');

projectImages.forEach(image => {
    image.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.02)';
        this.style.transition = 'transform 0.3s ease';
    });
    
    image.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

// Active Navigation Link Based on Scroll Position

const sections = document.querySelectorAll('section[id]');

function highlightNavigation() {
    const scrollPosition = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightNavigation);

// Preload Images for Better Performance

function preloadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    images.forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
    });
}

// Run preload when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadImages);
} else {
    preloadImages();
}

// Form Validation (if you add a contact form)

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Accessibility Improvements

// Add keyboard navigation for project cards
projectCards.forEach(card => {
    const link = card.querySelector('.project-link');
    
    card.setAttribute('tabindex', '0');
    
    card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && link) {
            link.click();
        }
    });
});

// Skip to main content functionality
const skipLink = document.createElement('a');
skipLink.href = '#work';
skipLink.textContent = 'Skip to main content';
skipLink.className = 'skip-link';
skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--primary-color);
    color: white;
    padding: 8px;
    text-decoration: none;
    z-index: 100;
`;

skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
});

skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
});

document.body.insertBefore(skipLink, document.body.firstChild);

// Fullscreen Image Viewer
document.addEventListener('DOMContentLoaded', function() {
    // Create fullscreen overlay if it doesn't exist
    if (!document.querySelector('.fullscreen-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'fullscreen-overlay';
        overlay.innerHTML = `
            <div class="fullscreen-close">&times;</div>
            <img class="fullscreen-image" src="" alt="">
            <div class="fullscreen-instructions">Click anywhere to close</div>
        `;
        document.body.appendChild(overlay);
    }

    const fullscreenOverlay = document.querySelector('.fullscreen-overlay');
    const fullscreenImage = document.querySelector('.fullscreen-image');
    const closeButton = document.querySelector('.fullscreen-close');

    // Function to open fullscreen
    function openFullscreen(imageSrc, imageAlt) {
        fullscreenImage.src = imageSrc;
        fullscreenImage.alt = imageAlt;
        fullscreenOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    // Function to close fullscreen
    function closeFullscreen() {
        fullscreenOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        setTimeout(() => {
            fullscreenImage.src = '';
        }, 300); // Wait for animation to complete
    }

    // Add click listeners to all images
    function addImageClickListeners() {
        // Target all clickable images
        const clickableImages = document.querySelectorAll(
            '.image-polaroid img, .pinned-image, .project-overview-image img, .logo-polaroid img'
        );

        clickableImages.forEach(img => {
            img.addEventListener('click', function(e) {
                e.stopPropagation();
                openFullscreen(this.src, this.alt);
            });
        });
    }

    // Close fullscreen when clicking overlay or close button
    fullscreenOverlay.addEventListener('click', closeFullscreen);
    closeButton.addEventListener('click', closeFullscreen);

    // Close fullscreen with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && fullscreenOverlay.classList.contains('active')) {
            closeFullscreen();
        }
    });

    // Prevent closing when clicking on the image itself
    fullscreenImage.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Initialize image click listeners
    addImageClickListeners();

    // Re-initialize when new content is loaded (for dynamic content)
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                addImageClickListeners();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
