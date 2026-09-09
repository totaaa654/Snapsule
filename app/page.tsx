'use client';
import { lazy, Suspense, useState } from 'react';
import { ArrowUpRight, Volume2, VolumeX, LockKeyhole } from 'lucide-react';
const LandingScene = lazy(() => import('@/components/booth/LandingScene'));
const BoothInterior = lazy(() => import('@/components/booth/BoothInterior'));
export default function Home() {
  const [stage, setStage] = useState<
    'outside' | 'entering' | 'inside' | 'exiting'
  >('outside');
  const [sound, setSound] = useState(false);
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
    setTimeout(() => setStage('outside'), 900);
  }
  return (
    <main className={`experience stage-${stage}`}>
      <header className="site-header">
        <a className="brand" href="/" aria-label="SNAPSULE home">
          <img src="/assets/logo-mark.svg" alt="" />
          <span>
            SNAPSULE<small>little moments, kept forever.</small>
          </span>
        </a>
        <div className="header-right">
          <span className="live-label">
            <i /> A LITTLE SPACE FOR BIG MEMORIES
          </span>
          <button
            className="icon-button"
            onClick={() => setSound(!sound)}
            aria-label={sound ? 'Mute sound' : 'Enable sound'}
          >
            {sound ? <Volume2 size={19} /> : <VolumeX size={19} />}
          </button>
        </div>
      </header>
      {stage !== 'inside' ? (
        <section className="landing">
          <div className="room-caption">
            <span className="eyebrow">THE INTERNET’S COZIEST PHOTOBOOTH</span>
            <h1>
              Some moments
              <br />
              deserve a <em>little forever.</em>
            </h1>
            <p>
              Just you, your favorite people, and a few seconds
              <br className="desktop-break" /> you’ll want to keep. Step inside.
              Make a memory.
            </p>
          </div>
          <div className="scene">
            <Suspense
              fallback={
                <div className="scene-loading">
                  Warming up the booth lights…
                </div>
              }
            >
              <LandingScene
                entering={stage === 'entering'}
                exiting={stage === 'exiting'}
                onEnter={enter}
              />
            </Suspense>
          </div>
          <button className="enter-label" onClick={enter}>
            <span className="open-dot" /> THE BOOTH IS YOURS{' '}
            <ArrowUpRight size={22} />
            <small>Click the booth to step inside</small>
          </button>
          <div className="landing-note">
            <span>NO COINS NEEDED.</span>
            <p>
              Come as you are.
              <br />
              Leave with a keepsake.
            </p>
            <span className="note-star">✳</span>
          </div>
          <div className="room-number">
            BOOTH № 001 <span>OPEN ALL HOURS</span>
          </div>
          <footer className="landing-footer">
            <span>
              <LockKeyhole size={14} /> Your moments are yours. Always.
            </span>
            <span>
              2, 3, 4 OR 6 PHOTOS <b>·</b> ENDLESS LITTLE POSSIBILITIES
            </span>
            <span>
              MADE FOR THE MEMORIES <span className="red-heart">♥</span>
            </span>
          </footer>
        </section>
      ) : (
        <Suspense
          fallback={
            <div className="scene-loading">Switching on the lights…</div>
          }
        >
          <BoothInterior sound={sound} onExit={exit} />
        </Suspense>
      )}
      <div className="curtain-transition" aria-hidden="true" />
    </main>
  );
}
