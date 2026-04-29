document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const menuSpans = menuToggle.querySelectorAll('span');
    const header = document.querySelector('.header');

    function setHamburger(active) {
        if (active) {
            menuSpans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            menuSpans[1].style.opacity = '0';
            menuSpans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            menuSpans[0].style.transform = 'none';
            menuSpans[1].style.opacity = '1';
            menuSpans[2].style.transform = 'none';
        }
    }

    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        menuToggle.classList.toggle('active');
        setHamburger(nav.classList.contains('active'));
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
            setHamburger(false);
        });
    });

    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    });

    async function loadMarkdown(url, elementId, isSkills = false) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to load ' + url);
            const markdown = await response.text();

            if (typeof marked === 'undefined') {
                console.error('marked.js is not loaded.');
                return;
            }

            const element = document.getElementById(elementId);
            element.innerHTML = marked.parse(markdown);

            if (isSkills) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = element.innerHTML;

                element.innerHTML = '';
                element.className = 'skills-grid';

                const children = Array.from(tempDiv.children);
                let currentCard = null;

                children.forEach(el => {
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
        } catch (error) {
            console.error('Error fetching markdown:', error);
            document.getElementById(elementId).innerHTML = '<p>Error loading content.</p>';
        }
    }

    loadMarkdown('content/about.md', 'about-content');
    loadMarkdown('content/skills.md', 'skills-content', true);

    async function loadStudies() {
        try {
            const response = await fetch('content/studies.json');
            if (!response.ok) throw new Error('Failed to load studies');
            const studies = await response.json();

            studies.sort((a, b) => a.course.localeCompare(b.course));

            const listElement = document.getElementById('studies-list');
            listElement.innerHTML = '';

            let totalCredits = 0;

            studies.forEach(study => {
                totalCredits += study.credits;

                const li = document.createElement('li');
                li.className = 'study-item';
                li.innerHTML = `
                    <div class="study-course">${study.course}</div>
                    <div class="study-details">
                        <span class="study-credits">${study.credits} cr</span>
                    </div>
                `;
                listElement.appendChild(li);
            });

            const totalCreditsEl = document.getElementById('total-credits');
            if (totalCreditsEl) {
                totalCreditsEl.textContent = totalCredits;
            }
        } catch (error) {
            console.error('Error loading studies:', error);
            document.getElementById('studies-list').innerHTML = '<li>Error loading studies.</li>';
        }
    }

    loadStudies();

    async function loadProjects() {
        try {
            const response = await fetch('content/projects.json');
            if (!response.ok) throw new Error('Failed to load projects');
            const projects = await response.json();

            const carousel = document.getElementById('projects-carousel');
            carousel.innerHTML = '';

            projects.forEach(project => {
                const article = document.createElement('article');
                article.className = 'project-card';

                const tagsHtml = project.tags.map(tag => `<li>${tag}</li>`).join('');

                article.innerHTML = `
                    <div class="project-image">
                        <div class="img-placeholder" style="background: ${project.gradient};"></div>
                    </div>
                    <div class="project-content">
                        <h3 class="project-title">${project.title}</h3>
                        <p class="project-description">${project.description}</p>
                        <ul class="project-tags">
                            ${tagsHtml}
                        </ul>
                        <div class="project-links">
                            <a href="${project.githubLink}" class="link-icon" aria-label="GitHub">GitHub</a>
                        </div>
                    </div>
                `;

                carousel.appendChild(article);
            });
        } catch (error) {
            console.error('Error loading projects:', error);
            document.getElementById('projects-carousel').innerHTML = '<p>Error loading projects.</p>';
        }
    }

    loadProjects();

    const carouselContainer = document.getElementById('projects-carousel');
    const prevBtn = document.getElementById('prev-project');
    const nextBtn = document.getElementById('next-project');

    if (carouselContainer && prevBtn && nextBtn) {
        const scrollAmount = 390;

        prevBtn.addEventListener('click', () => {
            carouselContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            carouselContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
});
