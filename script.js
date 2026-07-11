// ============================================
// PARTAJ+ — Main Script
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // ========================================
    // MOBILE NAVIGATION TOGGLE
    // ========================================
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }

    // ========================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80; // navbar height
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ========================================
    // CATALOGUE FILTERS
    // ========================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const offerCards = document.querySelectorAll('.offer-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            offerCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.classList.remove('hidden');
                    card.style.animation = 'fadeInUp 0.4s ease forwards';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ========================================
    // FAQ ACCORDION
    // ========================================
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all items
            faqItems.forEach(i => i.classList.remove('active'));

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // ========================================
    // CONTACT FORM HANDLING
    // ========================================
    const contactForm = document.getElementById('contactForm');
    const contactType = document.getElementById('contact-type');

    // Update form based on contact type
    if (contactType) {
        contactType.addEventListener('change', () => {
            const companyLabel = document.querySelector('label[for="company"]');
            const employeesGroup = document.querySelector('.form-group:has(#employees)');

            if (contactType.value === 'commerce') {
                companyLabel.textContent = 'Nom du commerce / service *';
                if (employeesGroup) employeesGroup.style.display = 'none';
            } else {
                companyLabel.textContent = 'Nom de l\'entreprise *';
                if (employeesGroup) employeesGroup.style.display = 'block';
            }
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            // Simple validation
            if (!data['contact-type'] || !data.company || !data.name || !data.email || !data.commune) {
                showNotification('Veuillez remplir tous les champs obligatoires.', 'error');
                return;
            }

            // Simulate form submission
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Envoi en cours...';
            submitBtn.disabled = true;

            const messageType = data['contact-type'] === 'commerce' 
                ? 'Votre demande de partenariat a bien été envoyée. Nous vous recontacterons sous 24h.'
                : 'Votre demande d\'essai gratuit a bien été envoyée. Nous vous recontacterons sous 24h.';

            setTimeout(() => {
                showNotification('Merci ! ' + messageType, 'success');
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;

                // Reset company label
                const companyLabel = document.querySelector('label[for="company"]');
                if (companyLabel) companyLabel.textContent = 'Nom de l\'entreprise / commerce *';
                const employeesGroup = document.querySelector('.form-group:has(#employees)');
                if (employeesGroup) employeesGroup.style.display = 'block';
            }, 1500);
        });
    }

    // ========================================
    // NOTIFICATION SYSTEM
    // ========================================
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        // Add styles dynamically
        notification.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: ${type === 'success' ? '#06D6A0' : type === 'error' ? '#EF476F' : '#004E89'};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 16px;
            z-index: 10000;
            animation: slideInRight 0.4s ease;
            max-width: 400px;
            font-size: 0.9rem;
        `;

        document.body.appendChild(notification);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        });

        // Auto close after 5s
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // ========================================
    // SCROLL ANIMATIONS (Intersection Observer)
    // ========================================
    const animateElements = document.querySelectorAll(
        '.step-card, .offer-card, .benefit-card, .faq-item, .pricing-card, .impact-card, .commerce-advantage, .example-item'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });

    // ========================================
    // NAVBAR SCROLL EFFECT
    // ========================================
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
        } else {
            navbar.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });

    // ========================================
    // COPY CODE ON CLICK
    // ========================================
    document.querySelectorAll('.offer-code code').forEach(code => {
        code.style.cursor = 'pointer';
        code.title = 'Cliquer pour copier';

        code.addEventListener('click', () => {
            navigator.clipboard.writeText(code.textContent).then(() => {
                const original = code.textContent;
                code.textContent = 'Copié !';
                code.style.color = '#06D6A0';
                setTimeout(() => {
                    code.textContent = original;
                    code.style.color = '';
                }, 1500);
            });
        });
    });

});

// ========================================
// KEYFRAME ANIMATIONS (injected)
// ========================================
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100px); }
    }
`;
document.head.appendChild(style);
