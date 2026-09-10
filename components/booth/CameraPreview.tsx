'use client';
import { useEffect, useRef, type RefCallback } from 'react';
import { Camera, LockKeyhole } from 'lucide-react';
import { drawFrame, filters, type Settings } from '@/lib/photobooth';
export default function CameraPreview({
  attachVideo,
  status,
  error,
  onStart,
  settings,
  mirror,
  countdown,
  shot,
  count,
  showLight,
}: {
  attachVideo: RefCallback<HTMLVideoElement>;
  status: string;
  error: string;
  onStart: () => void;
  settings: Settings;
  mirror: boolean;
  countdown: number;
  shot: number;
  count: number;
  showLight: boolean;
}) {
  const overlay = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = overlay.current;
    if (!cv) return;
    const paint = () => {
      const r = cv.getBoundingClientRect();
      cv.width = Math.round(r.width * 2);
      cv.height = Math.round(r.height * 2);
      const ctx = cv.getContext('2d');
      if (ctx)
        drawFrame(
          ctx,
          { x: 0, y: 0, w: cv.width, h: cv.height },
          settings.frame,
          settings.border,
          settings.accent,
        );
    };
    paint();
    const resize = new ResizeObserver(paint);
    resize.observe(cv);
    return () => resize.disconnect();
  }, [settings.frame, settings.border, settings.accent]);
  return (
    <div className={`camera-housing ${showLight ? 'light-on' : ''}`}>
      <div className="camera-top">
        <span className="camera-lens" />
        <span>LOOK HERE. BE HERE.</span>
        <i className={status === 'ready' ? 'ready-led' : 'idle-led'} />
      </div>
      <div className="camera-screen">
        <video
          ref={attachVideo}
          autoPlay
          playsInline
          muted
          style={{
            transform: mirror ? 'scaleX(-1)' : 'none',
            filter: filters[settings.filter],
          }}
        />
        <canvas className="frame-overlay" ref={overlay} aria-hidden="true" />
        {status !== 'ready' && (
          <div className="camera-permission">
            <Camera size={36} strokeWidth={1} />
            <h2>
              {status === 'requesting'
                ? 'A little permission first…'
                : 'Hello, good memories.'}
            </h2>
            <p>
              {error ||
                'Switch on your camera. The next few moments are yours.'}
            </p>
            <button
              className="cream-button"
              onClick={onStart}
              disabled={status === 'requesting'}
            >
              {status === 'requesting'
                ? 'Waiting for permission…'
                : status === 'error'
                  ? 'Try camera again'
                  : 'Enable camera'}{' '}
              <span>↗</span>
            </button>
            <small>
              <LockKeyhole size={12} /> Only you can see these photos.
            </small>
          </div>
        )}
        {countdown > 0 && (
          <output className="countdown" aria-live="assertive" key={countdown}>
            {countdown}
            <small>MAKE A LITTLE MEMORY</small>
          </output>
        )}
        <div className="viewfinder-meta">
          <span>{status === 'ready' ? '● LIVE' : '○ CAMERA OFF'}</span>
          <span>
            {String(shot).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </span>
        </div>
      </div>
      <div className="camera-bottom">
        <span>SNAPSULE</span>
        <small>little moments, kept forever.</small>
      </div>
    </div>
  );
}
