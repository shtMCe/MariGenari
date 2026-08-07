/**
 * Website Mariana Genari - Scripts
 * Código puro (ES6+) focado em performance, interatividade e UX.
 *
 * Índice:
 *  1. Preferências do usuário (movimento reduzido, ponteiro)
 *  2. Preloader elegante
 *  3. Scroll unificado (header, progresso, voltar ao topo, linha da jornada)
 *  4. Menu mobile
 *  5. Scroll suave para links internos
 *  6. Revelação ao rolar (IntersectionObserver) + navbar ativa
 *  7. Contadores animados
 *  8. Acordeão (FAQ)
 *  9. Dica da semana dinâmica
 * 10. Quiz interativo
 * 11. Mitos e verdades
 * 12. Micro-interações: ondulação em botões, spotlight em cards, inclinação da foto
 * 13. Rodapé: ano dinâmico
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ============================================================
       1. PREFERÊNCIAS DO USUÁRIO
       ============================================================ */
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ============================================================
       2. PRELOADER ELEGANTE
       ============================================================ */
    const preloader = document.getElementById('preloader');

    const hidePreloader = () => {
        if (!preloader) return;
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, prefersReducedMotion ? 0 : 600);
    };

    if (document.readyState === 'complete') {
        setTimeout(hidePreloader, prefersReducedMotion ? 0 : 400);
    } else {
        window.addEventListener('load', () => {
            setTimeout(hidePreloader, prefersReducedMotion ? 0 : 500);
        });
    }
    // Rede de segurança: nunca deixa o preloader travado cobrindo o site.
    setTimeout(hidePreloader, 4000);

    /* ============================================================
       3. SCROLL UNIFICADO
       Um único listener (passivo, com rAF) cuida de: header
       inteligente, barra de progresso, botão voltar-ao-topo e o
       preenchimento da linha do tempo — evita múltiplos listeners
       de scroll concorrentes e leituras de layout repetidas.
       ============================================================ */
    const header = document.getElementById('header');
    const backToTopBtn = document.getElementById('back-to-top');
    const scrollProgressBar = document.getElementById('scroll-progress');
    const timelineEl = document.querySelector('.timeline');
    const timelineProgressEl = document.querySelector('.timeline-progress');

    let lastScroll = 0;
    let ticking = false;

    function updateTimelineProgress() {
        if (!timelineEl || !timelineProgressEl) return;
        const rect = timelineEl.getBoundingClientRect();
        const vh = window.innerHeight;
        const startLine = vh * 0.85;
        const endLine = vh * 0.4;
        const total = rect.height + (startLine - endLine);
        const traveled = startLine - rect.top;
        let progress = total > 0 ? traveled / total : 0;
        progress = Math.max(0, Math.min(1, progress));
        timelineProgressEl.style.setProperty('--progress', progress.toFixed(3));
    }

    function onScrollFrame() {
        const y = window.scrollY;

        if (header) {
            header.classList.toggle('scrolled', y > 50);
            header.classList.toggle('hidden', y > lastScroll && y > 200);
        }
        lastScroll = y;

        if (backToTopBtn) {
            backToTopBtn.classList.toggle('visible', y > 500);
        }

        if (scrollProgressBar) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? y / docHeight : 0;
            scrollProgressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
        }

        updateTimelineProgress();

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(onScrollFrame);
            ticking = true;
        }
    }, { passive: true });

    // Estado inicial (caso a página carregue já rolada, ex: âncora direta)
    onScrollFrame();

    /* ============================================================
       4. MENU MOBILE
       ============================================================ */
    const mobileToggle = document.getElementById('mobile-toggle');
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const navBackdrop = document.getElementById('nav-backdrop');

    function closeMobileMenu() {
        mobileToggle.classList.remove('active');
        navbar.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        if (navBackdrop) navBackdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (mobileToggle && navbar) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = navbar.classList.toggle('active');
            mobileToggle.classList.toggle('active', isOpen);
            mobileToggle.setAttribute('aria-expanded', String(isOpen));
            if (navBackdrop) navBackdrop.classList.toggle('active', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        navLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        if (navBackdrop) {
            navBackdrop.addEventListener('click', closeMobileMenu);
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navbar.classList.contains('active')) {
                closeMobileMenu();
                mobileToggle.focus();
            }
        });
    }

    /* ============================================================
       5. SCROLL SUAVE PARA LINKS INTERNOS
       ============================================================ */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });

                // Move o foco para a seção de destino após a rolagem, mantendo
                // a navegação por teclado e leitor de tela sincronizada.
                targetElement.setAttribute('tabindex', '-1');
                targetElement.addEventListener('blur', () => targetElement.removeAttribute('tabindex'), { once: true });
                setTimeout(() => targetElement.focus({ preventScroll: true }), prefersReducedMotion ? 0 : 500);
            }
        });
    });

    /* ============================================================
       6. REVELAÇÃO AO ROLAR + NAVBAR ATIVA
       ============================================================ */
    const sections = document.querySelectorAll('section[id]');
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');

                if (entry.target.classList.contains('stats-container')) {
                    startCounters();
                }

                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    link.removeAttribute('aria-current');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                        link.setAttribute('aria-current', 'true');
                    }
                });
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(section => sectionObserver.observe(section));

    /* ============================================================
       7. CONTADORES ANIMADOS
       Easing suave via requestAnimationFrame (ease-out-cubic) em vez
       de incrementos lineares por setTimeout — resultado mais
       premium e independente da taxa de quadros do dispositivo.
       ============================================================ */
    let countersStarted = false;

    function animateCounter(counter) {
        const target = +counter.getAttribute('data-target');

        if (prefersReducedMotion) {
            counter.textContent = target;
            return;
        }

        const duration = 1400;
        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = Math.floor(target * eased);

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                counter.textContent = target;
            }
        }

        requestAnimationFrame(tick);
    }

    function startCounters() {
        if (countersStarted) return;
        countersStarted = true;
        document.querySelectorAll('.counter').forEach(animateCounter);
    }

    /* ============================================================
       8. ACORDEÃO (FAQ)
       ============================================================ */
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = header.nextElementSibling;
            const isExpanded = header.getAttribute('aria-expanded') === 'true';

            document.querySelectorAll('.accordion-content').forEach(c => { c.style.maxHeight = null; });
            accordionHeaders.forEach(h => h.setAttribute('aria-expanded', 'false'));

            if (!isExpanded) {
                header.setAttribute('aria-expanded', 'true');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });

    /* ============================================================
       9. DICA DA SEMANA DINÂMICA
       ============================================================ */
    const dicas = [
        "Beba água! A hidratação é o pilar mais negligenciado do metabolismo saudável.",
        "O sono regula hormônios fundamentais para a saciedade, como a leptina.",
        "Não existe alimento vilão ou herói. O contexto e a quantidade são o que importam.",
        "Planejar suas refeições no domingo economiza tempo, dinheiro e evita deslizes na semana."
    ];

    const tipText = document.getElementById('tip-text');
    if (tipText) {
        const date = new Date();
        const week = Math.ceil(Math.floor((date - new Date(date.getFullYear(), 0, 1)) / (24 * 60 * 60 * 1000)) / 7);
        tipText.innerText = dicas[week % dicas.length];
    }

    /* ============================================================
       10. QUIZ INTERATIVO
       ============================================================ */
    const quizData = [
        {
            question: "Qual macronutriente é o mais importante para a manutenção da massa muscular?",
            options: ["Carboidrato", "Proteína", "Gordura", "Fibra"],
            correct: 1
        },
        {
            question: "É obrigatório comer de 3 em 3 horas para acelerar o metabolismo?",
            options: ["Sim, mantém o corpo trabalhando", "Não, é um mito superado"],
            correct: 1
        }
    ];

    let currentQuiz = 0;
    const questionEl = document.getElementById('question');
    const optionsEl = document.getElementById('options');
    const feedbackEl = document.getElementById('feedback');

    function loadQuiz() {
        if (!questionEl) return;

        feedbackEl.innerText = "";
        const currentData = quizData[currentQuiz];
        questionEl.innerText = currentData.question;
        optionsEl.innerHTML = '';

        currentData.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.innerText = option;
            button.classList.add('quiz-option');
            button.addEventListener('click', () => selectOption(index, button));
            optionsEl.appendChild(button);
        });
    }

    function selectOption(index, button) {
        const buttons = document.querySelectorAll('.quiz-option');
        buttons.forEach(btn => { btn.style.pointerEvents = 'none'; });

        const isCorrect = index === quizData[currentQuiz].correct;

        if (isCorrect) {
            button.classList.add('correct');
            feedbackEl.style.color = "";
            feedbackEl.classList.remove('is-wrong');
            feedbackEl.classList.add('is-correct');
            feedbackEl.innerText = "Exato! Baseado em evidências.";
        } else {
            button.classList.add('wrong');
            buttons[quizData[currentQuiz].correct].classList.add('correct');
            feedbackEl.classList.remove('is-correct');
            feedbackEl.classList.add('is-wrong');
            feedbackEl.innerText = "Não foi dessa vez. A ciência diz o contrário.";
        }

        setTimeout(() => {
            currentQuiz++;
            if (currentQuiz < quizData.length) {
                loadQuiz();
            } else {
                questionEl.innerText = "Quiz concluído!";
                optionsEl.innerHTML = "<p>Obrigada por participar! Continue acompanhando os conteúdos para aprender mais.</p>";
                feedbackEl.innerText = "";
                feedbackEl.classList.remove('is-correct', 'is-wrong');
            }
        }, 2200);
    }

    loadQuiz();

    /* ============================================================
       11. MITOS E VERDADES
       Cards acessíveis via teclado: são <button> reais (não mais
       div com onclick inline), então Enter/Espaço funcionam nativamente.
       ============================================================ */
    document.querySelectorAll('.myth-card').forEach(card => {
        card.addEventListener('click', () => {
            const back = card.querySelector('.myth-back');
            const isActive = card.classList.toggle('active');
            card.setAttribute('aria-expanded', String(isActive));
            if (back) {
                back.style.maxHeight = isActive ? back.scrollHeight + 'px' : null;
            }
        });
    });

    /* ============================================================
       12. MICRO-INTERAÇÕES
       ============================================================ */

    // -- Ondulação sutil ao clicar em botões (.btn) --
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            if (prefersReducedMotion) return;
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height) * 1.4;
            ripple.className = 'ripple';
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
            this.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());
        });
    });

    // -- Spotlight: brilho sutil que segue o cursor em cards premium --
    // Um único listener delegado no documento (em vez de um por card) —
    // mais leve e escala automaticamente para cards adicionados no futuro.
    if (hasFinePointer && !prefersReducedMotion) {
        let spotlightTicking = false;
        let lastSpotlightEvent = null;

        document.addEventListener('pointermove', (e) => {
            const card = e.target.closest('.stat-card, .social-card, .recipe-card');
            if (!card) return;
            lastSpotlightEvent = { card, x: e.clientX, y: e.clientY };

            if (!spotlightTicking) {
                requestAnimationFrame(() => {
                    if (lastSpotlightEvent) {
                        const { card, x, y } = lastSpotlightEvent;
                        const r = card.getBoundingClientRect();
                        card.style.setProperty('--mx', `${x - r.left}px`);
                        card.style.setProperty('--my', `${y - r.top}px`);
                    }
                    spotlightTicking = false;
                });
                spotlightTicking = true;
            }
        }, { passive: true });
    }

    // -- Inclinação sutil da foto do hero, acompanhando o cursor --
    const tiltWrapper = document.querySelector('[data-tilt]');
    const tiltFrame = tiltWrapper ? tiltWrapper.querySelector('.hero-photo-frame') : null;

    if (tiltWrapper && tiltFrame && hasFinePointer && !prefersReducedMotion) {
        tiltWrapper.addEventListener('pointermove', (e) => {
            const r = tiltWrapper.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            tiltFrame.style.setProperty('--ry', `${(px * 7).toFixed(2)}deg`);
            tiltFrame.style.setProperty('--rx', `${(-py * 7).toFixed(2)}deg`);
        });

        tiltWrapper.addEventListener('pointerleave', () => {
            tiltFrame.style.setProperty('--rx', '0deg');
            tiltFrame.style.setProperty('--ry', '0deg');
        });
    }

    /* ============================================================
       13. RODAPÉ: ANO DINÂMICO
       ============================================================ */
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

});
