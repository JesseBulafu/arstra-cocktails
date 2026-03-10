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

            const startValue = isMobile ? 'top 70%' : 'center 60%';
            const endValue = 'bottom top';

            videoTimelineRef.current = gsap.timeline({
                scrollTrigger: {
                    trigger: 'video',
                    start: startValue,
                    end: endValue,
                    scrub: isMobile ? 0.15 : true,
                    pin: !isMobile,
                    anticipatePin: 1,
                },
            });

            if (videoRef.current) {
                const video = videoRef.current;
                const playhead = { time: 0 };

                const updateVideoTime = () => {
                    // Skip tiny seeks to reduce decoder churn on mobile browsers.
                    if (Math.abs(video.currentTime - playhead.time) > 0.016) {
                        video.currentTime = playhead.time;
                    }
                };

                const setupVideoScrub = () => {
                    video.pause();
                    video.currentTime = 0;

                    videoTimelineRef.current.to(playhead, {
                        time: Math.max(video.duration - 0.05, 0),
                        ease: 'none',
                        onUpdate: updateVideoTime,
                    });
                };

                if (video.readyState >= 1) {
                    setupVideoScrub();
                } else {
                    video.onloadedmetadata = setupVideoScrub;
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
        playsInline
                preload="metadata" />
     </div>
     </>
    )
}
export default Hero;