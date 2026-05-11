document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof SplitText === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger, SplitText);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;


    function initAnimTitulo() {
    const elementos = document.querySelectorAll('.anim-titulo');

    elementos.forEach(el => {
        gsap.set(el, { visibility: 'visible' });

        const split = new SplitText(el, {
            type: 'lines, words',
            linesClass: 'anim-line',
            wordsClass: 'anim-word'
        });

        // Cada línea actúa como máscara (overflow hidden)
        gsap.set(split.lines, { overflow: 'hidden' });

        gsap.fromTo(split.words,
            {
                opacity: 0,
                y: '110%',          
                filter: 'blur(6px)'
            },
            {
                opacity: 1,
                y: '0%',
                filter: 'blur(0px)',
                duration: 0.9,
                stagger: {
                    amount: 0.45,   
                    ease: 'power1.in'
                },
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    once: true
                },
                onComplete: () => split.revert()
            }
        );
    });
}


    function initAnimTextoFade() {
        const elementos = document.querySelectorAll('.anim-texto-fade');

        elementos.forEach(el => {
            gsap.set(el, { visibility: 'visible' });

            const split = new SplitText(el, {
                type: 'lines',
                linesClass: 'anim-line'
            });

            gsap.fromTo(split.lines,
                {
                    opacity: 0,
                    y: 24,
                    filter: 'blur(4px)'
                },
                {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    duration: 0.7,
                    stagger: 0.12,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        once: true
                    },
                    onComplete: () => split.revert()
                }
            );
        });
    }


    function initAnimTextoWords() {
        const elementos = document.querySelectorAll('.anim-texto-words');

        elementos.forEach(el => {
            gsap.set(el, { visibility: 'visible' });

            const split = new SplitText(el, {
                type: 'words',
                wordsClass: 'anim-word'
            });

            gsap.fromTo(split.words,
                {
                    opacity: 0,
                    y: 20,
                    scale: 0.95
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.5,
                    stagger: 0.05,
                    ease: 'back.out(1.2)',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        once: true
                    },
                    onComplete: () => split.revert()
                }
            );
        });
    }

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            initAnimTitulo();
            initAnimTextoFade();
            initAnimTextoWords();
        });
    } else {
        // Fallback si document.fonts no existe
        setTimeout(() => {
            initAnimTitulo();
            initAnimTextoFade();
            initAnimTextoWords();
        }, 300);
    }
});