'use client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
import { Camera, Sun, Scan, PanelsTopLeft } from 'lucide-react';
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
type Props = {
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
  devices: MediaDeviceInfo[];
  device: string;
  changeDevice: (v: string) => void;
};
export default function ControlPanel(p: Props) {
  const s = p.settings;
  const update = (v: Partial<Settings>) => p.onChange({ ...s, ...v });
  return (
    <aside className="control-panel physical-panel">
      <div className="panel-heading">
        <i className="screw" />
        <span>MAKE IT YOURS</span>
        <i className="screw" />
      </div>
      <Tabs defaultValue="strip">
        <TabsList className="control-tabs">
          <TabsTrigger value="strip">
            <PanelsTopLeft />
            Strip
          </TabsTrigger>
          <TabsTrigger value="frame">
            <Scan />
            Frame
          </TabsTrigger>
          <TabsTrigger value="light">
            <Sun />
            Light
          </TabsTrigger>
          <TabsTrigger value="camera">
            <Camera />
            Camera
          </TabsTrigger>
        </TabsList>
        <TabsContent value="strip">
          <div className="control-section">
            <span className="field-title">01 / HOW MANY MOMENTS?</span>
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
              <p className="help">Photo count is set for this session.</p>
            )}
          </div>
          <div className="control-section">
            <span className="field-title">02 / PICK A LAYOUT</span>
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
          <div className="control-section">
            <span className="field-title">03 / SET THE MOOD</span>
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
        </TabsContent>
        <TabsContent value="frame">
          <div className="control-section">
            <span className="field-title">
              A LITTLE SOMETHING AROUND THE EDGES
            </span>
            <p className="help">
              Your frame appears on the camera and your final print.
            </p>
            <RadioGroup
              className="frame-options"
              value={String(s.frame)}
              onValueChange={(v) => update({ frame: Number(v) })}
            >
              {frames.map((f, i) => (
                <label
                  key={f}
                  className={`frame-choice ${s.frame === i ? 'active' : ''}`}
                >
                  <RadioGroupItem value={String(i)} />
                  <span className={`frame-sample frame-${i}`}>
                    <span>✳</span>
                  </span>
                  <small>{f}</small>
                </label>
              ))}
            </RadioGroup>
          </div>
        </TabsContent>
        <TabsContent value="light">
          <div className="control-section">
            <span className="field-title">YOUR OWN LITTLE STUDIO</span>
            <p className="help">
              Let your screen light up your face. A brighter screen gives a
              stronger effect.
            </p>
            <Toggle
              label="Screen light & flash"
              checked={p.flash}
              onChange={p.setFlash}
            />
            <RadioGroup
              value={String(p.light)}
              onValueChange={(v) => p.setLight(Number(v))}
              className="light-options"
            >
              {lights.map(([n, c], i) => (
                <label
                  key={n}
                  className={`light-choice ${p.light === i ? 'active' : ''}`}
                >
                  <RadioGroupItem value={String(i)} />
                  <span style={{ background: c }} />
                  <small>{n}</small>
                </label>
              ))}
            </RadioGroup>
            <label className="field">
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
            </label>
            <button
              className="metal-button full"
              disabled={!p.flash}
              onClick={p.testLight}
            >
              <Sun size={17} /> Test light
            </button>
          </div>
        </TabsContent>
        <TabsContent value="camera">
          <div className="control-section">
            <span className="field-title">READY FOR YOUR CLOSE-UP</span>
            <Choice
              label="Camera"
              value={p.device}
              onChange={p.changeDevice}
              options={
                p.devices.length
                  ? p.devices.map((d, i) => ({
                      value: d.deviceId,
                      label: d.label || `Camera ${i + 1}`,
                    }))
                  : [{ value: '', label: 'Default camera' }]
              }
            />
            <Toggle
              label="Mirror preview & photos"
              checked={p.mirror}
              onChange={p.setMirror}
            />
            <Choice
              label="Countdown"
              value={String(p.timer)}
              onChange={(v) => p.setTimer(Number(v))}
              options={[3, 5, 10].map((n) => ({
                value: String(n),
                label: `${n} seconds`,
              }))}
            />
            <Choice
              label="Photo filter"
              value={s.filter}
              onChange={(v) => update({ filter: v })}
              options={Object.keys(filters).map((f) => ({
                value: f,
                label: f,
              }))}
            />
            <p className="help">
              Sit close, gather your people, and look at the lens. We’ll count
              you in.
            </p>
          </div>
        </TabsContent>
      </Tabs>
      <div className="panel-bottom">SNAPSULE / MEMORY MAKER № 001</div>
    </aside>
  );
}
