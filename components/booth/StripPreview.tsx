'use client';
import { useEffect, useRef, useState } from 'react';
import {
  renderStrip,
  geometry,
  stickerURL,
  stickerNames,
  type Settings,
  type Sticker,
} from '@/lib/photobooth';
export default function StripPreview({
  photos,
  settings,
  stickers,
  onStickers,
  selected,
  onSelect,
  date,
}: {
  photos: string[];
  settings: Settings;
  stickers: Sticker[];
  onStickers?: (s: Sticker[]) => void;
  selected?: string;
  onSelect?: (id: string) => void;
  date: Date;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const g = geometry(settings.count, settings.layout);
  useEffect(() => {
    let active = true;
    const off = document.createElement('canvas');
    renderStrip(off, photos, settings, onStickers ? [] : stickers, 0.25, date)
      .then(() => {
        if (active && canvas.current) {
          canvas.current.width = off.width;
          canvas.current.height = off.height;
          canvas.current.getContext('2d')?.drawImage(off, 0, 0);
          setError('');
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [photos, settings, stickers, onStickers, date]);
  return (
    <div
      className="strip-preview"
      ref={container}
      style={{ aspectRatio: `${g.w}/${g.h}` }}
    >
      <canvas
        ref={canvas}
        aria-label={`Live preview: ${settings.count} photos, ${settings.layout} layout`}
      />
      {error && <p role="alert">{error}</p>}
      {onStickers &&
        stickers.map((s) => (
          <button
            key={s.id}
            className={`placed-sticker ${selected === s.id ? 'selected' : ''}`}
            aria-label={`${stickerNames[s.kind]}, drag to move or use arrow keys`}
            style={{
              left: `${s.x * 100}%`,
              top: `${s.y * 100}%`,
              width: `${s.size * 100}%`,
              transform: `translate(-50%,-50%) rotate(${s.rotation}deg)`,
            }}
            onClick={() => onSelect?.(s.id)}
            onPointerDown={(e) => {
              e.preventDefault();
              onSelect?.(s.id);
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (
                !e.currentTarget.hasPointerCapture(e.pointerId) ||
                !container.current
              )
                return;
              const r = container.current.getBoundingClientRect();
              onStickers(
                stickers.map((st) =>
                  st.id === s.id
                    ? {
                        ...st,
                        x: Math.max(
                          s.size / 2,
                          Math.min(
                            1 - s.size / 2,
                            (e.clientX - r.left) / r.width,
                          ),
                        ),
                        y: Math.max(
                          (s.size * g.w) / g.h / 2,
                          Math.min(
                            1 - (s.size * g.w) / g.h / 2,
                            (e.clientY - r.top) / r.height,
                          ),
                        ),
                      }
                    : st,
                ),
              );
            }}
            onPointerUp={(e) =>
              e.currentTarget.releasePointerCapture(e.pointerId)
            }
            onKeyDown={(e) => {
              const keys: Record<string, [number, number]> = {
                ArrowLeft: [-0.01, 0],
                ArrowRight: [0.01, 0],
                ArrowUp: [0, -0.01],
                ArrowDown: [0, 0.01],
              };
              if (keys[e.key]) {
                e.preventDefault();
                const [dx, dy] = keys[e.key];
                onStickers(
                  stickers.map((st) =>
                    st.id === s.id
                      ? {
                          ...st,
                          x: Math.max(
                            s.size / 2,
                            Math.min(1 - s.size / 2, st.x + dx),
                          ),
                          y: Math.max(0.04, Math.min(0.96, st.y + dy)),
                        }
                      : st,
                  ),
                );
              }
              if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                onStickers(stickers.filter((st) => st.id !== s.id));
              }
            }}
          >
            <img src={stickerURL(s.kind)} draggable={false} alt="" />
          </button>
        ))}
    </div>
  );
}
