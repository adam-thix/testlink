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

    // ===== État de l'application =====
    let currentSection = null;
    const isHouppaOnly = document.body.classList.contains('houppa-only');
    let musicStarted = false;

    // ===== Musique de fond =====
    const bgMusic = document.getElementById('bg-music');

    function startBackgroundMusic() {
        if (bgMusic && !musicStarted) {
            bgMusic.currentTime = 55; // Commencer à 55 secondes
            bgMusic.volume = 0; // Commencer à 0
            bgMusic.play().then(() => {
                musicStarted = true;
                // Fade in de 0 à 30% en 5 secondes
                let volume = 0;
                const targetVolume = 0.3;
                const fadeInterval = setInterval(() => {
                    volume += 0.006; // 0.3 / 50 steps (5s / 100ms)
                    if (volume >= targetVolume) {
                        volume = targetVolume;
                        clearInterval(fadeInterval);
                    }
                    bgMusic.volume = volume;
                }, 100);
            }).catch(err => {
                console.log('Autoplay bloqué:', err);
            });
        }
    }

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

    // ===== Navigation entre sections =====
    const hero = document.querySelector('.hero');
    const henneSection = document.getElementById('henne');
    const houppaSection = document.getElementById('houppa');
    const rsvpSection = document.getElementById('rsvp');
    const eventButtons = document.querySelectorAll('.btn-event');
    const houppaFromHenneBtn = document.querySelector('.btn-to-houppa');
    const footer = document.querySelector('.site-footer');

    // Fonction pour afficher une section
    function showSection(sectionId) {
        // D'abord faire le fade out du hero
        hero.classList.add('hidden');

        // Masquer toutes les sections
        document.querySelectorAll('.section-page').forEach(section => {
            section.classList.remove('active');
        });

        // Petit délai pour le fade out, puis afficher la nouvelle section
        setTimeout(() => {
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                currentSection = sectionId;

                // Scroll en haut de la section
                targetSection.scrollTop = 0;

                // Animer le contenu
                const content = targetSection.querySelector('.henne-card, .houppa-content, .rsvp-content');
                if (content) {
                    content.classList.add('animate');
                }

                // Afficher le footer sur la section RSVP
                if (footer) {
                    footer.classList.toggle('visible', sectionId === 'rsvp');
                }
            }
        }, 100);
    }

    // Fonction retour au hero
    window.goBack = function() {
        // D'abord masquer la section active avec fade out
        document.querySelectorAll('.section-page').forEach(section => {
            section.classList.remove('active');
        });

        // Masquer le footer
        if (footer) {
            footer.classList.remove('visible');
        }

        // Puis afficher le hero avec fade in
        setTimeout(() => {
            hero.classList.remove('hidden');
            currentSection = null;
            window.scrollTo(0, 0);
        }, 100);
    };

    // Gestionnaire des boutons événements
    eventButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Démarrer la musique au premier clic (requis pour iOS)
            startBackgroundMusic();

            const target = this.getAttribute('data-target');
            showSection(target);
        });
    });

    // Bouton Houppa depuis la section Henné
    if (houppaFromHenneBtn) {
        houppaFromHenneBtn.addEventListener('click', function() {
            showSection('houppa');
        });
    }

    // ===== Boutons vers RSVP =====
    const rsvpButtons = document.querySelectorAll('.btn-to-rsvp, .section-next-btn[href="#rsvp"]');

    rsvpButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            showSection('rsvp');
        });
    });

    // ===== RSVP Form =====
    const rsvpForm = document.getElementById('rsvp-form');
    const guestsHenneGroup = document.getElementById('guests-henne-group');
    const guestsHouppaGroup = document.getElementById('guests-houppa-group');
    const presenceRadios = document.querySelectorAll('input[name="presence"]');
    const submitBtn = document.getElementById('submit-btn');
    const rsvpSuccess = document.getElementById('rsvp-success');
    const successMessage = document.getElementById('success-message');

    // Configuration RSVP
    const RSVP_CONFIG = {
        googleScriptUrl: 'https://script.google.com/macros/s/AKfycbxAQZmrSd8urninRAiv-CfOrzJgCktdfFI4gASX5_dC0Z_kRW-bViFAHkRzoxg3eaRmKA/exec',
        emailTo: 'troublea88@gmail.com'
    };

    // Afficher/masquer les champs selon la présence
    presenceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'oui') {
                // Toujours afficher Houppa
                if (guestsHouppaGroup) guestsHouppaGroup.classList.add('visible');

                // Afficher Henné seulement si pas en mode houppa-only
                if (!isHouppaOnly && guestsHenneGroup) {
                    guestsHenneGroup.classList.add('visible');
                }
            } else {
                if (guestsHenneGroup) guestsHenneGroup.classList.remove('visible');
                if (guestsHouppaGroup) guestsHouppaGroup.classList.remove('visible');
            }
        });
    });

    // Gestion du sélecteur de nombre d'invités
    window.updateGuests = function(event, change) {
        const inputId = 'guests-' + event;
        const guestsInput = document.getElementById(inputId);
        if (guestsInput) {
            let value = parseInt(guestsInput.value) + change;
            value = Math.max(0, Math.min(20, value));
            guestsInput.value = value;
        }
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

            // Récupérer les valeurs des invités directement depuis les inputs
            const henneInput = document.getElementById('guests-henne');
            const houppaInput = document.getElementById('guests-houppa');
            const guestsHenne = isHouppaOnly ? '0' : (henneInput ? henneInput.value : '0');
            const guestsHouppa = houppaInput ? houppaInput.value : '0';

            const data = {
                name: formData.get('name'),
                presence: formData.get('presence'),
                guests_henne: guestsHenne,
                guests_houppa: guestsHouppa,
                message: formData.get('message') || '',
                timestamp: new Date().toLocaleString('fr-FR'),
                source: isHouppaOnly ? 'houppa-only' : 'full-invite'
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

    // ===== Préchargement des animations =====
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
    });

    // ===== Effet tactile sur les boutons (mobile) =====
    eventButtons.forEach(btn => {
        btn.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });

        btn.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });

});
