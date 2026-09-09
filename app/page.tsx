'use client';

import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import {
  ArrowDown,
  ArrowRight,
  LockKeyhole,
  Volume2,
  VolumeX,
} from 'lucide-react';

const LandingScene = lazy(() => import('@/components/booth/LandingScene'));
const BoothInterior = lazy(() => import('@/components/booth/BoothInterior'));

function CursorEffect() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia('(pointer: coarse)').matches) return;
    let x = -100;
    let y = -100;
    let ringX = -100;
    let ringY = -100;
    let frame = 0;

    const move = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (dot.current)
        dot.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      const target = event.target as HTMLElement;
      ring.current?.classList.toggle(
        'is-active',
        Boolean(target.closest('button,a,[data-cursor]')),
      );
      ring.current?.classList.toggle(
        'is-booth',
        Boolean(target.closest('[data-cursor="booth"]')),
      );
    };
    const tick = () => {
      ringX += (x - ringX) * 0.14;
      ringY += (y - ringY) * 0.14;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringX}px,${ringY}px,0)`;
      }
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', move);
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" ref={dot} />
      <div className="cursor-ring" ref={ring}>
        <span>ENTER</span>
      </div>
    </>
  );
}

export default function Home() {
  const [stage, setStage] = useState<
    'outside' | 'entering' | 'inside' | 'exiting'
  >('outside');
  const [sound, setSound] = useState(false);
  const [scroll, setScroll] = useState(0);
  const landing = useRef<HTMLElement>(null);

  useEffect(() => {
    if (stage === 'inside') return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const node = landing.current;
      if (!node) return;
      const distance = Math.max(1, node.offsetHeight - innerHeight);
      setScroll(
        Math.max(0, Math.min(1, -node.getBoundingClientRect().top / distance)),
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [stage]);

  function enter() {
    if (stage !== 'outside') return;
    setStage('entering');
    setTimeout(
      () => setStage('inside'),
      matchMedia('(prefers-reduced-motion: reduce)').matches ? 250 : 2300,
    );
  }

  function exit() {
    setStage('exiting');
    setTimeout(() => {
      setStage('outside');
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, 900);
  }

  function scrollLanding(progress: number) {
    const node = landing.current;
    if (!node) return;
    const distance = Math.max(0, node.offsetHeight - innerHeight);
    window.scrollTo({
      top: node.offsetTop + distance * progress,
      behavior: 'smooth',
    });
  }

  const fade = (start: number, end: number) =>
    Math.max(0, Math.min(1, (scroll - start) / (end - start)));
  const heroOpacity = 1 - fade(0.12, 0.32);
  const storyOpacity = Math.min(fade(0.25, 0.4), 1 - fade(0.57, 0.7));
  const finalOpacity = fade(0.68, 0.84);
  const boothOpacity = 1 - fade(0.1, 0.27);

  return (
    <main className={`experience stage-${stage}`}>
      <CursorEffect />
      <header className="site-header cinematic-header">
        <a className="brand" href="#top" aria-label="SNAPSULE home">
          <span>
            SNAPSULE<sup>+</sup>
            <small>
              A VIRTUAL PHOTOBOOTH
              <br />
              FOR REAL MOMENTS.
            </small>
          </span>
        </a>
        {stage !== 'inside' && (
          <nav aria-label="Landing navigation">
            <button onClick={() => scrollLanding(0.38)}>About</button>
            <button onClick={() => scrollLanding(0.52)}>Features</button>
            <button onClick={() => scrollLanding(0.86)}>Privacy</button>
            <button className="nav-enter" onClick={enter}>
              Enter booth
            </button>
          </nav>
        )}
        <button
          className="icon-button"
          onClick={() => setSound(!sound)}
          aria-label={sound ? 'Mute sound' : 'Enable sound'}
        >
          {sound ? <Volume2 size={19} /> : <VolumeX size={19} />}
        </button>
      </header>

      {stage !== 'inside' ? (
        <section
          ref={landing}
          className="landing-cinematic"
          id="top"
          style={{ '--scroll': scroll } as CSSProperties}
        >
          <div className="landing-sticky">
            <div className="cinematic-grain" aria-hidden="true" />
            <div className="cinematic-glow" aria-hidden="true" />
            <div
              className="cinematic-scene"
              data-cursor="booth"
              style={{
                opacity: boothOpacity,
                transform: `translate3d(${scroll * 5}vw,0,0)`,
                pointerEvents: boothOpacity > 0.05 ? 'auto' : 'none',
              }}
            >
              <Suspense
                fallback={
                  <div className="scene-loading">
                    Warming the booth lights...
                  </div>
                }
              >
                <LandingScene
                  progress={scroll}
                  entering={stage === 'entering'}
                  exiting={stage === 'exiting'}
                  onEnter={enter}
                />
              </Suspense>
            </div>

            <div
              className="memory-collage"
              aria-hidden="true"
              style={{
                opacity: storyOpacity,
                transform: `translate3d(0,${(0.45 - scroll) * 80}px,0)`,
              }}
            >
              <div className="memory-card memory-card-one">
                <i />
                <span>same energy</span>
              </div>
              <div className="memory-card memory-card-two">
                <i />
                <span>different stories</span>
              </div>
              <div className="memory-card memory-card-three">
                <i />
                <span>keep this one</span>
              </div>
            </div>

            <div
              className="keepsake-strip"
              aria-hidden="true"
              style={{
                opacity: finalOpacity,
                transform: `translate3d(0,${(0.82 - scroll) * 80}px,0) rotate(-4deg)`,
              }}
            >
              <div />
              <div />
              <div />
              <div />
              <strong>SNAPSULE</strong>
              <span>little moments, kept forever.</span>
            </div>

            <section
              className="hero-copy scroll-copy"
              style={{
                opacity: heroOpacity,
                transform: `translate3d(0,${scroll * -70}px,0)`,
              }}
            >
              <p className="handwritten">
                Step in.
                <br />
                <span>Take a few.</span>
                <br />
                <span>Keep it forever.</span>
              </p>
              <h1>SNAPSULE</h1>
              <h2>
                More than photos.
                <br />
                It is a time capsule.
              </h2>
              <button
                className="round-enter"
                onClick={enter}
                data-cursor="booth"
              >
                <span>
                  Enter
                  <br />
                  booth
                </span>
                <ArrowRight size={18} />
              </button>
            </section>

            <section
              id="about"
              className="story-copy scroll-copy"
              style={{
                opacity: storyOpacity,
                transform: `translate3d(0,${(0.48 - scroll) * 100}px,0)`,
              }}
            >
              <span className="section-index">01 / THE FEELING</span>
              <h2>
                Some moments
                <br />
                ask to be <em>kept.</em>
              </h2>
              <p>
                Gather your people. Make a face. Let the booth turn a handful of
                seconds into something you can hold.
              </p>
            </section>

            <section
              id="features"
              className="feature-copy scroll-copy"
              style={{
                opacity: storyOpacity,
                transform: `translate3d(0,${(scroll - 0.45) * -45}px,0)`,
              }}
            >
              <span>CAPTURE</span>
              <i>+</i>
              <span>CUSTOMIZE</span>
              <i>+</i>
              <span>KEEP</span>
            </section>

            <section
              className="final-copy scroll-copy"
              style={{
                opacity: finalOpacity,
                transform: `translate3d(0,${(0.82 - scroll) * 80}px,0)`,
              }}
            >
              <span className="section-index">02 / YOUR TURN</span>
              <h2>
                Ready when
                <br />
                you are.
              </h2>
              <button
                className="cinematic-enter"
                onClick={enter}
                data-cursor="booth"
              >
                Step inside <ArrowRight size={18} />
              </button>
              <p id="privacy">
                <LockKeyhole size={13} /> Photos stay on your device.
              </p>
            </section>

            <div className="neon-note" aria-hidden="true">
              Memories
              <br />
              look good
              <br />
              <em>on you</em>
            </div>
            <div
              className="scroll-cue"
              style={{ opacity: 1 - fade(0.04, 0.18) }}
            >
              <span>Scroll to explore</span>
              <i />
              <ArrowDown size={16} />
            </div>
            <div className="landing-count">
              <strong>
                {String(Math.round(scroll * 3) + 1).padStart(2, '0')}
              </strong>
              <span>/ 04</span>
            </div>
          </div>
        </section>
      ) : (
        <Suspense
          fallback={
            <div className="scene-loading">Switching on the lights...</div>
          }
        >
          <BoothInterior sound={sound} onExit={exit} />
        </Suspense>
      )}
      <div className="curtain-transition" aria-hidden="true" />
    </main>
  );
}
