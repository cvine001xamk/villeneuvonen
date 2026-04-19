document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle menu
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        menuToggle.classList.toggle('active');
        
        // Animate hamburger to X
        const spans = menuToggle.querySelectorAll('span');
        if (nav.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
            
            // Reset hamburger
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });

    // Navbar scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 10px 30px -10px rgba(0, 0, 0, 0.5)';
            header.style.padding = '15px 0';
        } else {
            header.style.boxShadow = 'none';
            header.style.padding = '20px 0';
    });

    // Fetch and render markdown content
    async function loadMarkdown(url, elementId, isSkills = false) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to load ' + url);
            const markdown = await response.text();
            
            if (typeof marked !== 'undefined') {
                const element = document.getElementById(elementId);
                element.innerHTML = marked.parse(markdown);

                if (isSkills) {
                    // Restructure standard markdown to match the skills grid layout
                    const text = element.innerHTML;
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = text;
                    
                    element.innerHTML = '';
                    element.className = 'skills-grid'; // Apply the grid class
                    
                    // Group h3 and ul into skill-card
                    const elements = Array.from(tempDiv.children);
                    let currentCard = null;
                    
                    elements.forEach(el => {
                        if (el.tagName === 'H3') {
                            currentCard = document.createElement('div');
                            currentCard.className = 'skill-card';
                            el.className = 'skill-category';
                            currentCard.appendChild(el.cloneNode(true));
                            element.appendChild(currentCard);
                        } else if (el.tagName === 'UL' && currentCard) {
                            el.className = 'skill-list';
                            currentCard.appendChild(el.cloneNode(true));
                        }
                    });
                }
            } else {
                console.error("marked.js is not loaded.");
            }
        } catch (error) {
            console.error('Error fetching markdown:', error);
            document.getElementById(elementId).innerHTML = '<p>Error loading content.</p>';
        }
    }

    loadMarkdown('about.md', 'about-content');
    loadMarkdown('skills.md', 'skills-content', true);
});
