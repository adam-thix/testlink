/**
 * Mariage Shirel & Alan
 * Scripts principaux
 */

document.addEventListener('DOMContentLoaded', function() {

    // ===== Configuration =====
    const CONFIG = {
        // Date du mariage : 16 Mars 2026 à 18h00
        weddingDate: new Date('2026-03-16T18:00:00').getTime()
    };

    // ===== Countdown Timer =====
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = CONFIG.weddingDate - now;

        if (distance < 0) {
            // Le jour J est passé
            daysEl.textContent = '0';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Mise à jour avec animation
        animateNumber(daysEl, days.toString());
        animateNumber(hoursEl, hours.toString().padStart(2, '0'));
        animateNumber(minutesEl, minutes.toString().padStart(2, '0'));
        animateNumber(secondsEl, seconds.toString().padStart(2, '0'));
    }

    // Animation subtile lors du changement de nombre
    function animateNumber(element, newValue) {
        if (element.textContent !== newValue) {
            element.style.transform = 'scale(1.1)';
            element.textContent = newValue;
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 150);
        }
    }

    // Démarrer le countdown
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ===== Smooth Scroll pour le bouton =====
    const btnInvitation = document.querySelector('.btn-invitation');

    if (btnInvitation) {
        btnInvitation.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                // Animation de sortie du hero
                const heroContent = document.querySelector('.hero-content');
                heroContent.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                heroContent.style.opacity = '0';
                heroContent.style.transform = 'translateY(-30px)';

                setTimeout(() => {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // Reset pour retour
                    setTimeout(() => {
                        heroContent.style.opacity = '1';
                        heroContent.style.transform = 'translateY(0)';
                    }, 800);
                }, 300);
            }
        });
    }

    // ===== Parallax subtil sur le background =====
    const heroBackground = document.querySelector('.hero-background img');

    if (heroBackground && window.innerWidth <= 430) {
        let ticking = false;

        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    const scrolled = window.pageYOffset;
                    const rate = scrolled * 0.3;
                    heroBackground.style.transform = `translateY(${rate}px)`;
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ===== Animation au scroll pour la section invitation =====
    const invitationSection = document.querySelector('.invitation-section');

    if (invitationSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.2
        });

        observer.observe(invitationSection);
    }

    // ===== Effet tactile sur le bouton (mobile) =====
    if (btnInvitation) {
        btnInvitation.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });

        btnInvitation.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    }

    // ===== Préchargement des animations =====
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });

    // ===== RSVP Form =====
    const rsvpForm = document.getElementById('rsvp-form');
    const guestsGroup = document.getElementById('guests-group');
    const eventsGroup = document.getElementById('events-group');
    const presenceRadios = document.querySelectorAll('input[name="presence"]');
    const submitBtn = document.getElementById('submit-btn');
    const rsvpSuccess = document.getElementById('rsvp-success');
    const successMessage = document.getElementById('success-message');

    // Configuration RSVP
    const RSVP_CONFIG = {
        googleScriptUrl: 'https://script.google.com/macros/s/AKfycbxUALiHh58eztVJL1hNpcrV4q79YwKPSVuQ-u7CvzxK2yc14KCf_v5sXQHCf-6zk7xScA/exec',
        emailTo: 'troublea88@gmail.com'
    };

    // Afficher/masquer les champs selon la présence
    presenceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'oui') {
                guestsGroup.classList.add('visible');
                eventsGroup.classList.add('visible');
            } else {
                guestsGroup.classList.remove('visible');
                eventsGroup.classList.remove('visible');
            }
        });
    });

    // Gestion du sélecteur de nombre d'invités
    window.updateGuests = function(change) {
        const guestsInput = document.getElementById('guests');
        let value = parseInt(guestsInput.value) + change;
        value = Math.max(1, Math.min(10, value));
        guestsInput.value = value;
    };

    // Soumission du formulaire
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Animation loading
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            // Récupérer les données du formulaire
            const formData = new FormData(rsvpForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone') || '',
                presence: formData.get('presence'),
                guests: formData.get('presence') === 'oui' ? formData.get('guests') : '0',
                events: formData.getAll('events').join(', ') || 'Aucun',
                message: formData.get('message') || '',
                timestamp: new Date().toLocaleString('fr-FR')
            };

            try {
                // Envoi vers Google Sheets
                if (RSVP_CONFIG.googleScriptUrl !== 'VOTRE_GOOGLE_SCRIPT_URL') {
                    await fetch(RSVP_CONFIG.googleScriptUrl, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });
                }

                // Simulation de délai pour le test
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Succès
                rsvpForm.style.display = 'none';
                rsvpSuccess.classList.add('visible');

                // Message personnalisé
                if (data.presence === 'oui') {
                    successMessage.textContent = `Nous avons hâte de vous voir le jour J !`;
                } else {
                    successMessage.textContent = `Vous nous manquerez, mais nous pensons à vous.`;
                }

            } catch (error) {
                console.error('Erreur:', error);
                alert('Une erreur est survenue. Veuillez réessayer.');
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        });
    }

});
