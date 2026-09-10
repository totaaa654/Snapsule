'use client';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { flushSync } from 'react-dom';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Download,
  LockKeyhole,
  Printer,
  RotateCcw,
  Trash2,
  X,
  Move,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import ControlPanel, { Choice, FilterPicker } from './ControlPanel';
import CameraPreview from './CameraPreview';
import StripPreview from './StripPreview';
import { useCamera } from './useCamera';
import {
  defaultSettings,
  frames,
  geometry,
  layouts,
  lights,
  filters,
  renderStrip,
  clearPhotoCache,
  stickerURL,
  stickerNames,
  type Settings,
  type Sticker,
} from '@/lib/photobooth';
type Stage =
  | 'setup'
  | 'ready'
  | 'capturing'
  | 'review'
  | 'decorate'
  | 'printing'
  | 'done';
export default function BoothInterior({
  onExit,
  sound,
}: {
  sound: boolean;
  onExit: () => void;
}) {
  const [settings, setSettings] = useState<Settings>({ ...defaultSettings }),
    [stage, setStage] = useState<Stage>('setup'),
    [setupStep, setSetupStep] = useState(0),
    [photos, setPhotos] = useState<string[]>([]),
    [stickers, setStickers] = useState<Sticker[]>([]),
    [selected, setSelected] = useState(''),
    [light, setLight] = useState(1),
    [intensity, setIntensity] = useState(80),
    [flash, setFlash] = useState(true),
    [test, setTest] = useState(false),
    [flashing, setFlashing] = useState(false),
    [timer, setTimer] = useState(3),
    [mirror, setMirror] = useState(true),
    [countdown, setCountdown] = useState(0),
    [shot, setShot] = useState(1),
    [error, setError] = useState(''),
    [printImage, setPrintImage] = useState(''),
    [printReady, setPrintReady] = useState(false),
    [format, setFormat] = useState('png'),
    [sessionDate, setSessionDate] = useState(() => new Date());
  const cam = useCamera(),
    run = useRef(0),
    busy = useRef(false),
    mounted = useRef(true),
    audio = useRef<AudioContext | null>(null),
    finalCanvas = useRef<HTMLCanvasElement | null>(null),
    printTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    lightTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    dragY = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      run.current++;
      clearTimeout(printTimer.current);
      clearTimeout(lightTimer.current);
      void audio.current?.close();
      clearPhotoCache();
    };
  }, []);
  const beep = useCallback(
    (frequency = 640, duration = 0.08) => {
      if (!sound) return;
      try {
        audio.current ??= new AudioContext();
        void audio.current.resume();
        const osc = audio.current.createOscillator(),
          gain = audio.current.createGain();
        osc.type = 'sine';
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.035, audio.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          audio.current.currentTime + duration,
        );
        osc.connect(gain);
        gain.connect(audio.current.destination);
        osc.start();
        osc.stop(audio.current.currentTime + duration);
      } catch {
        /* Audio is optional; capture continues when blocked. */
      }
    },
    [sound],
  );
  const testLight = () => {
    setTest(true);
    clearTimeout(lightTimer.current);
    lightTimer.current = setTimeout(() => setTest(false), 2500);
  };
  const pause = async (ms: number, token: number) => {
    await new Promise((resolve) => setTimeout(resolve, ms));
    if (!mounted.current || token !== run.current) throw new Error('cancelled');
  };
  async function capture(retake?: number) {
    if (busy.current || cam.status !== 'ready') return;
    busy.current = true;
    const token = ++run.current;
    setError('');
    setTest(false);
    setStage('capturing');
    beep();
    let next = [...photos];
    try {
      const indexes =
        retake !== undefined
          ? [retake]
          : Array.from({ length: settings.count }, (_, i) => i).filter(
              (i) => !next[i],
            );
      for (const i of indexes) {
        setShot(i + 1);
        for (let n = timer; n > 0; n--) {
          setCountdown(n);
          beep(n === 1 ? 900 : 600);
          await pause(1000, token);
        }
        setCountdown(0);
        if (flash) {
          setFlashing(true);
          await pause(220, token);
        }
        const v = cam.video.current;
        if (!v || !v.videoWidth || v.readyState < 2)
          throw new Error(
            'The camera isn’t sending a picture. Reconnect it and try again.',
          );
        const canvas = document.createElement('canvas');
        canvas.width = v.videoWidth;
        canvas.height = v.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx)
          throw new Error('We couldn’t capture that moment. Please try again.');
        if (mirror) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.filter = filters[settings.filter];
        ctx.drawImage(v, 0, 0);
        next[i] = canvas.toDataURL('image/jpeg', 0.95);
        setPhotos([...next]);
        beep(180, 0.13);
        setFlashing(false);
        await pause(650, token);
      }
      setStage('review');
    } catch (e) {
      if (mounted.current && token === run.current) {
        setError(
          e instanceof Error
            ? e.message
            : 'We couldn’t capture that photo. Please try again.',
        );
        setStage(
          next.filter(Boolean).length === settings.count ? 'review' : 'ready',
        );
      }
    } finally {
      if (mounted.current && token === run.current) {
        setCountdown(0);
        setFlashing(false);
        busy.current = false;
      }
    }
  }
  function cancel() {
    run.current++;
    busy.current = false;
    setCountdown(0);
    setFlashing(false);
    setStage(
      photos.filter(Boolean).length === settings.count ? 'review' : 'ready',
    );
  }
  function reset() {
    cancel();
    setPhotos([]);
    setStickers([]);
    setSelected('');
    setPrintImage('');
    setPrintReady(false);
    finalCanvas.current = null;
    setError('');
    setSessionDate(new Date());
    setSetupStep(0);
    clearPhotoCache();
    setStage('setup');
    void cam.start(cam.device);
  }
  function openCamera() {
    setError('');
    if (photos.filter(Boolean).length === settings.count) {
      setStage('review');
      return;
    }
    setStage('ready');
    void cam.start(cam.device);
  }
  function leave() {
    run.current++;
    cam.stop();
    onExit();
  }
  async function print() {
    if (busy.current) return;
    busy.current = true;
    setError('');
    try {
      const cv = await renderStrip(
        document.createElement('canvas'),
        photos,
        settings,
        stickers,
        1,
        sessionDate,
      );
      if (!mounted.current) return;
      finalCanvas.current = cv;
      setPrintImage(cv.toDataURL('image/png'));
      setPrintReady(false);
      setStage('printing');
      beep(90, 1.2);
      printTimer.current = setTimeout(() => {
        if (mounted.current) {
          setPrintReady(true);
          beep(750, 0.1);
        }
      }, 4200);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Your print couldn’t be prepared. Try again.',
      );
    } finally {
      busy.current = false;
    }
  }
  function takePrint() {
    if (!printReady) return;
    beep(180, 0.12);
    setStage('done');
  }
  function download() {
    setError('');
    try {
      const canvas = finalCanvas.current;
      if (!canvas) throw new Error('Your print is not ready yet.');
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError(
              'The download could not be created. Try PNG or a different browser.',
            );
            return;
          }
          const url = URL.createObjectURL(blob),
            a = document.createElement('a');
          a.href = url;
          a.download = `SNAPSULE-${sessionDate.toISOString().slice(0, 10)}.${format === 'png' ? 'png' : 'jpg'}`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 30000);
        },
        format === 'png' ? 'image/png' : 'image/jpeg',
        0.96,
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'We couldn’t save the print. Please try again.',
      );
    }
  }
  function addSticker(kind: number) {
    const id = crypto.randomUUID();
    setStickers((prev) => [
      ...prev,
      { id, kind, x: 0.5, y: 0.88, size: 0.23, rotation: kind % 2 ? 8 : -8 },
    ]);
    setSelected(id);
    beep();
  }
  const selectedSticker = stickers.find((s) => s.id === selected),
    updateSticker = (patch: Partial<Sticker>) =>
      setStickers((prev) =>
        prev.map((s) => (s.id === selected ? { ...s, ...patch } : s)),
      );
  const g = geometry(settings.count, settings.layout),
    showLight = flash && (test || flashing),
    photoCount = photos.filter(Boolean).length;
  useEffect(() => {
    type Registry = {
      registerTool: (
        tool: unknown,
        options: { signal: AbortSignal },
      ) => void | Promise<void>;
    };
    const context = (document as Document & { modelContext?: Registry })
      .modelContext;
    if (!context?.registerTool) return;
    const life = new AbortController();
    try {
      Promise.resolve(
        context.registerTool(
          {
            name: 'configure_snapsule_strip',
            description:
              'Configure paper color and the caption of the current local photostrip. Does not capture or transmit photos.',
            inputSchema: {
              type: 'object',
              properties: {
                caption: { type: 'string', maxLength: 48 },
                background: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' },
              },
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false },
            execute: (input: unknown) => {
              if (!input || typeof input !== 'object' || Array.isArray(input))
                throw new Error('Expected a configuration object');
              const v = input as Record<string, unknown>;
              if (
                Object.keys(v).some(
                  (k) => !['caption', 'background'].includes(k),
                ) ||
                (v.caption !== undefined &&
                  (typeof v.caption !== 'string' || v.caption.length > 48)) ||
                (v.background !== undefined &&
                  (typeof v.background !== 'string' ||
                    !/^#[0-9a-fA-F]{6}$/.test(v.background)))
              )
                throw new Error(
                  'Use a caption of at most 48 characters and a six-digit hex color',
                );
              flushSync(() => setSettings((s) => ({ ...s, ...v })));
              return { configured: true };
            },
          },
          { signal: life.signal },
        ),
      ).catch(() => {});
    } catch {
      /* Experimental browser API is optional. */
    }
    return () => life.abort();
  }, []);
  return (
    <section
      className={`interior interior-${stage}`}
      style={
        {
          '--light-color': lights[light][1],
          '--light-opacity': intensity / 100,
        } as CSSProperties
      }
    >
      <div
        className={`screen-light ${showLight ? 'on' : ''}`}
        aria-hidden="true"
      />
      <div className="interior-top">
        <button className="back-link" onClick={leave}>
          <ArrowLeft size={16} /> Step outside
        </button>
        <div className="session-steps">
          <span
            className={
              stage === 'setup' || stage === 'ready' || stage === 'capturing'
                ? 'current'
                : ''
            }
          >
            01 <b>Make a moment</b>
          </span>
          <i />
          <span
            className={
              stage === 'review' || stage === 'decorate' ? 'current' : ''
            }
          >
            02 <b>Make it yours</b>
          </span>
          <i />
          <span
            className={
              stage === 'printing' || stage === 'done' ? 'current' : ''
            }
          >
            03 <b>Keep it forever</b>
          </span>
        </div>
        <span className="booth-status">
          <i /> BOOTH OCCUPIED
        </span>
      </div>
      {error && (
        <div className="error-message" role="alert">
          {error}
          <button aria-label="Dismiss error" onClick={() => setError('')}>
            <X size={16} />
          </button>
        </div>
      )}
      {stage === 'printing' || stage === 'done' ? (
        <div className="print-experience">
          <span className="eyebrow">A LITTLE PIECE OF RIGHT NOW</span>
          <h1>
            {stage === 'done'
              ? 'Keep it forever.'
              : printReady
                ? 'Your memories are ready.'
                : 'Printing your memories…'}
          </h1>
          <p>
            {stage === 'done'
              ? 'For the fridge. The journal. The years from now.'
              : printReady
                ? 'Pull your strip out, or tap it to take it.'
                : 'Good things take a little moment.'}
          </p>
          <div className={`printer ${stage === 'done' ? 'taken' : ''}`}>
            <div className="print-slot">
              <i className={printReady ? 'ready' : ''} />
              <span>SNAPSULE · MEMORY DELIVERY</span>
            </div>
            <div className="paper-outlet">
              <button
                className={`printed-paper ${printReady ? 'ready' : ''}`}
                aria-label="Take your printed photostrip"
                disabled={!printReady}
                onClick={takePrint}
                onPointerDown={(e) => {
                  dragY.current = e.clientY;
                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerUp={(e) => {
                  if (e.clientY - dragY.current > 15) takePrint();
                  if (e.currentTarget.hasPointerCapture(e.pointerId))
                    e.currentTarget.releasePointerCapture(e.pointerId);
                }}
              >
                <img src={printImage} alt="Your finished SNAPSULE photostrip" />
              </button>
            </div>
          </div>
          {stage === 'done' && (
            <div className="download-panel">
              <Choice
                label="File format"
                value={format}
                onChange={setFormat}
                options={[
                  { value: 'png', label: 'PNG · best quality' },
                  { value: 'jpg', label: 'JPG · smaller file' },
                ]}
              />
              <button className="red-button" onClick={download}>
                <Download size={18} /> Save photo
              </button>
              <div className="download-secondary">
                <button className="text-button" onClick={reset}>
                  <RotateCcw size={14} /> Take another
                </button>
                <button className="text-button" onClick={leave}>
                  Exit booth <ArrowRight size={14} />
                </button>
              </div>
              <small>
                {g.w} × {g.h} pixels · All yours.
              </small>
            </div>
          )}
        </div>
      ) : (
        <div className="booth-workspace">
          <div className="camera-column">
            <div className="interior-heading">
              <span className="eyebrow">YOUR LITTLE TIME CAPSULE</span>
              <h1>
                {stage === 'setup'
                  ? 'Build your keepsake.'
                  : stage === 'decorate'
                    ? 'Add a little you.'
                    : stage === 'review'
                      ? 'Worth keeping.'
                      : 'Make yourself a memory.'}
              </h1>
            </div>
            {stage === 'setup' ? (
              <div className="design-stage">
                <div className="design-strip-wrap">
                  <StripPreview
                    photos={photos}
                    settings={settings}
                    stickers={stickers}
                    date={sessionDate}
                  />
                </div>
                <div className="design-caption">
                  <span>{String(settings.count).padStart(2, '0')} MOMENTS</span>
                  <strong>
                    {settings.caption || 'Your little time capsule'}
                  </strong>
                  <small>Changes appear here as you make them.</small>
                </div>
              </div>
            ) : stage === 'decorate' ? (
              <div className="decoration-desk">
                <StripPreview
                  photos={photos}
                  settings={settings}
                  stickers={stickers}
                  onStickers={setStickers}
                  selected={selected}
                  onSelect={setSelected}
                  date={sessionDate}
                />
                <span className="desk-note">
                  a little moment,
                  <br />
                  <em>all dressed up.</em>
                </span>
              </div>
            ) : stage === 'review' ? (
              <div className="review-stage">
                <span className="ticket-kicker">YOUR CONTACT SHEET</span>
                <p>
                  Retake any photo below, or keep going when they feel right.
                </p>
              </div>
            ) : (
              <CameraPreview
                attachVideo={cam.attach}
                status={cam.status}
                error={cam.error}
                onStart={() => cam.start(cam.device)}
                settings={settings}
                mirror={mirror}
                countdown={countdown}
                shot={shot}
                count={settings.count}
                showLight={showLight}
              />
            )}
            {(stage === 'ready' || stage === 'capturing') && (
              <div className="capture-console physical-panel">
                <div className="lcd">
                  <span>
                    {stage === 'capturing'
                      ? 'HOLD THAT SMILE'
                      : cam.status === 'ready'
                        ? 'READY WHEN YOU ARE'
                        : 'CAMERA STANDBY'}
                  </span>
                  <strong>
                    {String(photoCount).padStart(2, '0')}
                    <small> / {String(settings.count).padStart(2, '0')}</small>
                  </strong>
                </div>
                {stage === 'capturing' ? (
                  <button
                    className="shutter-button stop"
                    onClick={cancel}
                    aria-label="Cancel capture"
                  >
                    <span>■</span>
                  </button>
                ) : (
                  <button
                    className="shutter-button"
                    disabled={cam.status !== 'ready'}
                    onClick={() => capture()}
                    aria-label="Start photo session"
                  >
                    <Camera size={29} />
                  </button>
                )}
                <div className="capture-note">
                  <strong>
                    {stage === 'capturing'
                      ? 'A moment, please.'
                      : 'Press for a little forever.'}
                  </strong>
                  <span>
                    {stage === 'capturing'
                      ? 'Tap to stop the countdown'
                      : `${timer}-second countdown · ${settings.count} photos`}
                  </span>
                </div>
              </div>
            )}
            {photos.length > 0 && stage !== 'decorate' && stage !== 'setup' && (
              <div className="photo-review">
                {Array.from({ length: settings.count }, (_, i) => (
                  <div
                    className={`review-photo ${shot === i + 1 && stage === 'capturing' ? 'active' : ''}`}
                    key={i}
                  >
                    {photos[i] ? (
                      <img src={photos[i]} alt={`Captured photo ${i + 1}`} />
                    ) : (
                      <span>{String(i + 1).padStart(2, '0')}</span>
                    )}
                    {photos[i] && (
                      <button
                        disabled={
                          stage === 'capturing' || cam.status !== 'ready'
                        }
                        onClick={() => capture(i)}
                      >
                        <RotateCcw size={12} /> Retake {i + 1}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className="privacy">
              <LockKeyhole size={13} /> Your photos stay on your device. Nothing
              is uploaded.
            </p>
          </div>
          {stage === 'setup' ? (
            <ControlPanel
              step={setupStep}
              setStep={setSetupStep}
              onReady={openCamera}
              settings={settings}
              onChange={setSettings}
              locked={photoCount > 0}
              light={light}
              setLight={setLight}
              intensity={intensity}
              setIntensity={setIntensity}
              flash={flash}
              setFlash={setFlash}
              testLight={testLight}
              timer={timer}
              setTimer={setTimer}
              mirror={mirror}
              setMirror={setMirror}
            />
          ) : stage === 'decorate' ? (
            <aside className="physical-panel sticker-panel">
              <div className="panel-heading">
                <i className="screw" />
                <span>THE LITTLE EXTRAS</span>
                <i className="screw" />
              </div>
              <h2>Stick a little happiness.</h2>
              <p className="help">
                Tap to add. Drag to place. Make it your own.
              </p>
              <div className="sticker-drawer">
                {stickerNames.map((name, i) => (
                  <button
                    key={name}
                    aria-label={`Add ${name} sticker`}
                    onClick={() => addSticker(i)}
                  >
                    <img src={stickerURL(i)} alt={name} />
                  </button>
                ))}
              </div>
              {selectedSticker ? (
                <div className="sticker-edit">
                  <strong>{stickerNames[selectedSticker.kind]}</strong>
                  <label className="field">
                    <span>Size</span>
                    <Slider
                      value={[selectedSticker.size * 100]}
                      onValueChange={(v) =>
                        updateSticker({
                          size: (Array.isArray(v) ? v[0] : v) / 100,
                        })
                      }
                      min={8}
                      max={40}
                      aria-label="Sticker size"
                    />
                  </label>
                  <label className="field">
                    <span>
                      Rotation <b>{selectedSticker.rotation}°</b>
                    </span>
                    <Slider
                      value={[selectedSticker.rotation]}
                      onValueChange={(v) =>
                        updateSticker({ rotation: Array.isArray(v) ? v[0] : v })
                      }
                      min={-180}
                      max={180}
                      aria-label="Sticker rotation"
                    />
                  </label>
                  <button
                    className="text-button"
                    onClick={() => {
                      setStickers((p) => p.filter((s) => s.id !== selected));
                      setSelected('');
                    }}
                  >
                    <Trash2 size={14} /> Remove sticker
                  </button>
                  <p className="help">
                    <Move size={12} /> Arrow keys move a selected sticker.
                  </p>
                </div>
              ) : (
                <p className="help sticker-hint">
                  Select a sticker on your strip to resize or rotate it.
                </p>
              )}
              <button className="red-button full" onClick={print}>
                <Printer size={18} /> Print my memories
              </button>
              <button
                className="text-button full"
                onClick={() => setStage('review')}
              >
                <ArrowLeft size={14} /> Back to photos
              </button>
            </aside>
          ) : (
            <aside
              className={`session-ticket physical-panel ${
                stage === 'ready' || stage === 'capturing'
                  ? 'camera-session-ticket'
                  : ''
              }`}
            >
              <div className="panel-heading">
                <i className="screw" />
                <span>
                  {stage === 'review' ? 'YOUR SESSION' : 'READY TO GO'}
                </span>
                <i className="screw" />
              </div>
              <div className="ticket-body">
                {stage === 'review' ? (
                  <>
                    <span className="ticket-kicker">
                      ALL {settings.count} MOMENTS CAPTURED
                    </span>
                    <h2>Keep these?</h2>
                    <div className="review-strip-mini">
                      <StripPreview
                        photos={photos}
                        settings={settings}
                        stickers={stickers}
                        date={sessionDate}
                      />
                    </div>
                    <button
                      className="red-button full"
                      onClick={() => setStage('decorate')}
                    >
                      Decorate my strip <ArrowRight size={16} />
                    </button>
                    <button
                      className="text-button full"
                      onClick={() => {
                        setSetupStep(1);
                        setStage('setup');
                      }}
                    >
                      Change the style
                    </button>
                  </>
                ) : (
                  <>
                    <span className="ticket-kicker">YOUR SESSION</span>
                    <h2>
                      {settings.count} photos. {timer} seconds each.
                    </h2>
                    <dl>
                      <div>
                        <dt>Layout</dt>
                        <dd>
                          {
                            layouts[settings.count].find(
                              (l) => l.id === settings.layout,
                            )?.name
                          }
                        </dd>
                      </div>
                      <div>
                        <dt>Frame</dt>
                        <dd>{frames[settings.frame]}</dd>
                      </div>
                      <div>
                        <dt>Light</dt>
                        <dd>{flash ? lights[light][0] : 'Off'}</dd>
                      </div>
                      <div>
                        <dt>Filter</dt>
                        <dd>{settings.filter}</dd>
                      </div>
                    </dl>
                    {cam.devices.length > 1 && (
                      <Choice
                        label="Camera"
                        value={cam.device}
                        onChange={cam.start}
                        options={cam.devices.map((device, index) => ({
                          value: device.deviceId,
                          label: device.label || `Camera ${index + 1}`,
                        }))}
                      />
                    )}
                    <FilterPicker
                      compact
                      value={settings.filter}
                      onChange={(filter) =>
                        setSettings((current) => ({ ...current, filter }))
                      }
                      disabled={stage === 'capturing'}
                    />
                    <p>
                      Enable the camera, settle in, then press the red shutter
                      button.
                    </p>
                    <button
                      className="text-button full"
                      onClick={() => {
                        cam.stop();
                        setSetupStep(0);
                        setStage('setup');
                      }}
                    >
                      <ArrowLeft size={14} /> Change setup
                    </button>
                  </>
                )}
              </div>
            </aside>
          )}
        </div>
      )}
      <footer className="booth-footer">
        <span>NO RUSH. THIS MOMENT IS YOURS.</span>
        <span>
          SNAPSULE <b>♥</b> LITTLE MOMENTS, KEPT FOREVER.
        </span>
      </footer>
    </section>
  );
}
