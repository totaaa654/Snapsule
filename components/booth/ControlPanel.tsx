'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Camera, Check, Sun } from 'lucide-react';
import { useState } from 'react';
import {
  themes,
  frames,
  layouts,
  lights,
  filters,
  geometry,
  type Settings,
  type Count,
} from '@/lib/photobooth';

export function Choice({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <Select value={value} onValueChange={(v) => v !== null && onChange(v)}>
        <SelectTrigger className="machine-select" aria-label={label}>
          <SelectValue>
            {options.find((o) => o.value === value)?.label ?? value}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="machine-options">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </label>
  );
}

export function FilterPicker({
  value,
  onChange,
  compact = false,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className={`filter-picker ${compact ? 'compact' : ''}`}>
      <span className="field-title">
        {compact ? 'LIVE FILTER PREVIEW' : 'PHOTO FILTER'}
      </span>
      <RadioGroup
        value={value}
        onValueChange={(next) => onChange(String(next))}
        className="filter-options"
        disabled={disabled}
      >
        {Object.entries(filters).map(([name, cssFilter]) => (
          <label
            className={`filter-choice ${value === name ? 'active' : ''}`}
            key={name}
          >
            <RadioGroupItem value={name} />
            <span className="filter-swatch">
              <i style={{ filter: cssFilter }} />
            </span>
            <small>{name}</small>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}

type Props = {
  step: number;
  setStep: (step: number) => void;
  onReady: () => void;
  settings: Settings;
  onChange: (s: Settings) => void;
  locked: boolean;
  light: number;
  setLight: (v: number) => void;
  intensity: number;
  setIntensity: (v: number) => void;
  flash: boolean;
  setFlash: (v: boolean) => void;
  testLight: () => void;
  timer: number;
  setTimer: (v: number) => void;
  mirror: boolean;
  setMirror: (v: boolean) => void;
};

const stepNames = ['Strip', 'Style', 'Frame', 'Camera'];
const frameCollections = ['Essentials', 'Playful', 'Storybook'];
const framesPerCollection = 9;

export default function ControlPanel(p: Props) {
  const s = p.settings;
  const [frameCollection, setFrameCollection] = useState(
    Math.floor(s.frame / framesPerCollection),
  );
  const update = (v: Partial<Settings>) => p.onChange({ ...s, ...v });
  return (
    <aside className="control-panel physical-panel setup-panel">
      <div className="panel-heading">
        <i className="screw" />
        <span>MAKE IT YOURS</span>
        <i className="screw" />
      </div>
      <ol className="setup-progress" aria-label="Photobooth setup progress">
        {stepNames.map((name, index) => (
          <li
            key={name}
            className={
              index === p.step ? 'current' : index < p.step ? 'complete' : ''
            }
          >
            <button
              onClick={() => index <= p.step && p.setStep(index)}
              aria-current={index === p.step ? 'step' : undefined}
            >
              <span>{index < p.step ? <Check size={13} /> : index + 1}</span>
              <small>{name}</small>
            </button>
          </li>
        ))}
      </ol>

      <div className="setup-step" key={p.step}>
        {p.step === 0 && (
          <>
            <div className="step-intro">
              <span>STEP 1 OF 4</span>
              <h2>Choose your strip.</h2>
              <p>Start with how many moments you want to keep.</p>
            </div>
            <div className="control-section">
              <span className="field-title">NUMBER OF PHOTOS</span>
              <RadioGroup
                value={String(s.count)}
                onValueChange={(v) => {
                  const count = Number(v) as Count;
                  update({ count, layout: layouts[count][0].id });
                }}
                className="count-options"
                disabled={p.locked}
              >
                {[2, 3, 4, 6].map((n) => (
                  <label
                    className={`count-choice ${s.count === n ? 'active' : ''}`}
                    key={n}
                  >
                    <RadioGroupItem value={String(n)} />
                    <strong>{n}</strong>
                    <small>photos</small>
                  </label>
                ))}
              </RadioGroup>
              {p.locked && (
                <p className="help">
                  Photo count is fixed after shooting begins.
                </p>
              )}
            </div>
            <div className="control-section">
              <span className="field-title">LAYOUT</span>
              <RadioGroup
                value={s.layout}
                onValueChange={(v) => update({ layout: String(v) })}
                className="layout-options"
              >
                {layouts[s.count].map((l) => {
                  const g = geometry(s.count, l.id);
                  return (
                    <label
                      key={l.id}
                      className={`layout-choice ${s.layout === l.id ? 'active' : ''}`}
                    >
                      <RadioGroupItem value={l.id} />
                      <span
                        className="layout-mini"
                        style={{ aspectRatio: `${g.w}/${g.h}` }}
                      >
                        {g.rects.map((r, i) => (
                          <i
                            key={i}
                            style={{
                              left: `${(r.x / g.w) * 100}%`,
                              top: `${(r.y / g.h) * 100}%`,
                              width: `${(r.w / g.w) * 100}%`,
                              height: `${(r.h / g.h) * 100}%`,
                            }}
                          />
                        ))}
                      </span>
                      <small>{l.name}</small>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>
          </>
        )}

        {p.step === 1 && (
          <>
            <div className="step-intro">
              <span>STEP 2 OF 4</span>
              <h2>Set the mood.</h2>
              <p>Pick the paper first, then add the small personal details.</p>
            </div>
            <div className="control-section">
              <Choice
                label="Paper style"
                value={String(s.theme)}
                onChange={(v) => {
                  const t = themes[Number(v)];
                  update({
                    theme: Number(v),
                    background: t[1],
                    border: t[2],
                    text: t[3],
                    accent: t[4],
                  });
                }}
                options={themes.map((t, i) => ({
                  value: String(i),
                  label: t[0],
                }))}
              />
              <div className="color-fields">
                {(['background', 'border', 'text', 'accent'] as const).map(
                  (k) => (
                    <label key={k}>
                      <input
                        type="color"
                        aria-label={`${k} color`}
                        value={s[k]}
                        onChange={(e) => update({ [k]: e.target.value })}
                      />
                      <span>
                        {k === 'background'
                          ? 'Paper'
                          : k[0].toUpperCase() + k.slice(1)}
                      </span>
                    </label>
                  ),
                )}
              </div>
              <label className="field">
                <span>A little note</span>
                <input
                  type="text"
                  maxLength={48}
                  value={s.caption}
                  onChange={(e) => update({ caption: e.target.value })}
                  placeholder="Write your little memory…"
                />
              </label>
              <Toggle
                label="Date stamp"
                checked={s.date}
                onChange={(v) => update({ date: v })}
              />
              <Toggle
                label="SNAPSULE signature"
                checked={s.branding}
                onChange={(v) => update({ branding: v })}
              />
            </div>
          </>
        )}

        {p.step === 2 && (
          <>
            <div className="step-intro">
              <span>STEP 3 OF 4</span>
              <h2>Finish the edges.</h2>
              <p>
                Every frame uses the same photo window, so what you see is what
                prints.
              </p>
            </div>
            <div className="control-section frame-section">
              <div className="frame-collections" aria-label="Frame collections">
                {frameCollections.map((collection, index) => (
                  <button
                    type="button"
                    key={collection}
                    className={frameCollection === index ? 'active' : ''}
                    aria-pressed={frameCollection === index}
                    onClick={() => setFrameCollection(index)}
                  >
                    {collection}
                  </button>
                ))}
              </div>
              <RadioGroup
                className="frame-options"
                value={String(s.frame)}
                onValueChange={(v) => update({ frame: Number(v) })}
              >
                {frames
                  .slice(
                    frameCollection * framesPerCollection,
                    (frameCollection + 1) * framesPerCollection,
                  )
                  .map((f, offset) => {
                    const i = frameCollection * framesPerCollection + offset;
                    return (
                      <label
                        key={f}
                        className={`frame-choice ${s.frame === i ? 'active' : ''}`}
                      >
                        <RadioGroupItem value={String(i)} />
                        <span className={`frame-sample frame-${i}`}>
                          <span aria-hidden="true">&#10035;</span>
                        </span>
                        <small>{f}</small>
                      </label>
                    );
                  })}
              </RadioGroup>
            </div>
          </>
        )}

        {p.step === 3 && (
          <>
            <div className="step-intro">
              <span>STEP 4 OF 4</span>
              <h2>Get camera-ready.</h2>
              <p>
                Set your countdown and screen light. Camera permission comes
                next.
              </p>
            </div>
            <div className="control-section camera-settings-grid">
              <Choice
                label="Countdown"
                value={String(p.timer)}
                onChange={(v) => p.setTimer(Number(v))}
                options={[3, 5, 10].map((n) => ({
                  value: String(n),
                  label: `${n} seconds`,
                }))}
              />
              <FilterPicker
                value={s.filter}
                onChange={(filter) => update({ filter })}
              />
              <Toggle
                label="Mirror preview & photos"
                checked={p.mirror}
                onChange={p.setMirror}
              />
              <Toggle
                label="Screen light & flash"
                checked={p.flash}
                onChange={p.setFlash}
              />
              <div className="light-setting">
                <span className="field-title">LIGHT COLOR</span>
                <RadioGroup
                  value={String(p.light)}
                  onValueChange={(v) => p.setLight(Number(v))}
                  className="light-options compact"
                >
                  {lights.map(([n, c], i) => (
                    <label
                      key={n}
                      className={`light-choice ${p.light === i ? 'active' : ''}`}
                      title={n}
                    >
                      <RadioGroupItem value={String(i)} />
                      <span style={{ background: c }} />
                      <small>{n}</small>
                    </label>
                  ))}
                </RadioGroup>
              </div>
              <div className="field">
                <span>
                  Light intensity <b>{p.intensity}%</b>
                </span>
                <Slider
                  value={[p.intensity]}
                  onValueChange={(v) =>
                    p.setIntensity(Array.isArray(v) ? v[0] : v)
                  }
                  min={10}
                  max={100}
                  aria-label="Light intensity"
                />
              </div>
              <button
                className="metal-button full"
                disabled={!p.flash}
                onClick={p.testLight}
              >
                <Sun size={17} /> Preview screen light
              </button>
            </div>
          </>
        )}
      </div>

      <div className="setup-actions">
        <button
          className="text-button"
          disabled={p.step === 0}
          onClick={() => p.setStep(Math.max(0, p.step - 1))}
        >
          <ArrowLeft size={15} /> Back
        </button>
        {p.step < 3 ? (
          <button className="red-button" onClick={() => p.setStep(p.step + 1)}>
            Continue <ArrowRight size={16} />
          </button>
        ) : (
          <button className="red-button" onClick={p.onReady}>
            {p.locked ? <Check size={17} /> : <Camera size={17} />}{' '}
            {p.locked ? 'Back to review' : 'Open camera'}
          </button>
        )}
      </div>
      <div className="panel-bottom">SNAPSULE / MEMORY MAKER № 001</div>
    </aside>
  );
}
