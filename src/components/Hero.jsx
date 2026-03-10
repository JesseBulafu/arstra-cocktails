import { useGSAP } from "@gsap/react";
import { SplitText, ScrollTrigger } from "gsap/all";
import gsap from "gsap";
import { useRef } from "react";
import { useMediaQuery } from "react-responsive";

const Hero = () => {
    const videoRef = useRef();
    const videoTimelineRef = useRef();
    const isMobile = useMediaQuery({ maxWidth: 767});

    useGSAP(() => {
        let isUnmounted = false;
        let heroSplit;
        let paragraphSplit;

        const initAnimations = async () => {
            if (document.fonts?.status !== 'loaded') {
                await document.fonts.ready;
            }

            if (isUnmounted) return;

            heroSplit = new SplitText('.title', { type: 'chars, words' });
            paragraphSplit = new SplitText('.subtitle', { type: 'lines' });

            heroSplit.chars.forEach((char) => char.classList.add('text-gradient'));

            gsap.from(heroSplit.chars, {
                yPercent: 100,
                duration: 1.8,
                ease: 'expo.out',
                stagger: 0.05,
            });

            gsap.from(paragraphSplit.lines, {
                opacity: 0,
                yPercent: 100,
                duration: 1.8,
                ease: 'expo.out',
                stagger: 0.06,
                delay: 1,
            });

            gsap.timeline({
                scrollTrigger: {
                    trigger: '#hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            })
                .to('.right-leaf', { y: 200 }, 0)
                .to('.left-leaf', { y: -200 }, 0);

            if (isMobile) {
                // Mobile fallback: avoid frame-by-frame video scrubbing for smoother touch scrolling.
                gsap.fromTo(
                    '.video',
                    { yPercent: 8, opacity: 0.9 },
                    {
                        yPercent: -8,
                        opacity: 1,
                        scrollTrigger: {
                            trigger: '#hero',
                            start: 'top top',
                            end: 'bottom top',
                            scrub: true,
                        },
                    }
                );

                if (videoRef.current) {
                    videoRef.current.play().catch(() => {
                        // Ignore autoplay rejection when browser policies block it.
                    });
                }
            } else {
                const startValue = 'center 60%';
                const endValue = 'bottom top';

                // Desktop: keep frame-by-frame scroll scrubbing.
                videoTimelineRef.current = gsap.timeline({
                    scrollTrigger: {
                        trigger: 'video',
                        start: startValue,
                        end: endValue,
                        scrub: true,
                        pin: true,
                    },
                });

                if (videoRef.current) {
                    videoRef.current.onloadedmetadata = () => {
                        videoTimelineRef.current.to(videoRef.current, {
                            currentTime: videoRef.current.duration,
                            ease: 'none',
                        });
                    };
                }
            }
        };

        initAnimations();

        return () => {
            isUnmounted = true;
            if (videoRef.current) videoRef.current.onloadedmetadata = null;
            if (videoTimelineRef.current) videoTimelineRef.current.kill();
            if (heroSplit) heroSplit.revert();
            if (paragraphSplit) paragraphSplit.revert();
        };
    }, { dependencies: [isMobile], revertOnUpdate: true });
    return(
     <>
     <section id="hero" className="noisy">
        <h1 className="title">NIGHTS</h1>

        <img
        src="/images/hero-left-leaf.png"
        alt="left-leaf"
        className="left-leaf"
        />

          <img
        src="/images/hero-right-leaf.png"
        alt="right-leaf"
        className="right-leaf"
        />

        <div className="body">
            <div className="content">
                <div className="space-y-5 hidden md:block">
                    <p>Cool. Crisp. Classic.</p>
                    <p className="subtitle">Experience night lyf <br />with elegance.</p>
                </div>

                <div className="view-cocktails">
                    <p className="subtitle">
                        Every sip, a story. Every pour, a performance. Discover a blend of premium ingredients, creative flair and timeless recipes at Nights.
                    </p>
                    <a href="#cocktails">View Cocktails</a>
                </div>
            </div>
        </div>
     </section>
     <div className="video absolute inset-0">
        <video
        ref={videoRef}
        src="/videos/output.mp4"
        muted
          autoPlay={isMobile}
          loop={isMobile}
        playsInline
          preload={isMobile ? "metadata" : "auto"} />
     </div>
     </>
    )
}
export default Hero;