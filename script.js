/**
 * Website Mariana Genari - Scripts
 * Código puro (ES6+) focado em performance, interatividade e UX.
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Preloader Elegante
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 600);
        }, 500); // Pequeno atraso para visualização da marca
    });

    // 2. Header Inteligente (Scroll)
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Adiciona background ao rolar
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Esconde ao rolar para baixo, mostra ao rolar para cima
        if (currentScroll > lastScroll && currentScroll > 200) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }
        
        lastScroll = currentScroll;
    });

    // 3. Menu Mobile
    const mobileToggle = document.getElementById('mobile-toggle');
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navbar.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navbar.classList.remove('active');
        });
    });

    // 4. Scroll Suave para Links Internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // 5. Intersection Observer para Animações e Navbar Ativa
    const sections = document.querySelectorAll('section');
    const revealElements = document.querySelectorAll('.reveal');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Animação de contadores se for a seção de stats
                if(entry.target.classList.contains('stats-container')) {
                    startCounters();
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => revealObserver.observe(el));

    // Navbar Ativa
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                let id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(section => {
        if(section.getAttribute('id')) sectionObserver.observe(section);
    });

    // 6. Contadores Animados
    let countersStarted = false;
    function startCounters() {
        if(countersStarted) return;
        countersStarted = true;
        
        const counters = document.querySelectorAll('.counter');
        const speed = 40; 

        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const inc = target / speed;

                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 40);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    }

    // 7. Botão Voltar ao Topo
    const backToTopBtn = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 8. Accordion (FAQ)
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = header.nextElementSibling;
            const isExpanded = header.getAttribute('aria-expanded') === 'true';

            // Fecha todos
            document.querySelectorAll('.accordion-content').forEach(c => c.style.maxHeight = null);
            accordionHeaders.forEach(h => h.setAttribute('aria-expanded', 'false'));

            // Abre o clicado se não estava aberto
            if (!isExpanded) {
                header.setAttribute('aria-expanded', 'true');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // 9. Dica da Semana Dinâmica
    const dicas = [
        "Beba água! A hidratação é o pilar mais negligenciado do metabolismo saudável.",
        "O sono regula hormônios fundamentais para a saciedade, como a leptina.",
        "Não existe alimento vilão ou herói. O contexto e a quantidade são o que importam.",
        "Planejar suas refeições no domingo economiza tempo, dinheiro e evita deslizes na semana."
    ];
    
    const tipText = document.getElementById('tip-text');
    if(tipText) {
        // Seleciona uma dica baseada na semana do ano para parecer dinâmico
        const date = new Date();
        const week = Math.ceil(Math.floor((date - new Date(date.getFullYear(), 0, 1)) / (24 * 60 * 60 * 1000)) / 7);
        tipText.innerText = dicas[week % dicas.length];
    }

    // 10. Quiz Interativo
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
        if(!questionEl) return;
        
        feedbackEl.innerText = "";
        const currentData = quizData[currentQuiz];
        questionEl.innerText = currentData.question;
        optionsEl.innerHTML = '';

        currentData.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.innerText = option;
            button.classList.add('quiz-option');
            button.addEventListener('click', () => selectOption(index, button));
            optionsEl.appendChild(button);
        });
    }

    function selectOption(index, button) {
        // Desabilita botões
        const buttons = document.querySelectorAll('.quiz-option');
        buttons.forEach(btn => btn.style.pointerEvents = 'none');

        const isCorrect = index === quizData[currentQuiz].correct;
        
        if (isCorrect) {
            button.classList.add('correct');
            feedbackEl.style.color = "#137333";
            feedbackEl.innerText = "Exato! Baseado em evidências.";
        } else {
            button.classList.add('wrong');
            buttons[quizData[currentQuiz].correct].classList.add('correct');
            feedbackEl.style.color = "#c5221f";
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
            }
        }, 2000);
    }

    loadQuiz();
});