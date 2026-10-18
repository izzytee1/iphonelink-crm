const FONT_MIN = -3;
const FONT_MAX = 5;
const FONT_STEP = 0.5;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatFontOffset(value) {
  const number = Number(value || 0);
  if (number === 0) return 'Default';
  return `${number > 0 ? '+' : ''}${number.toFixed(1)}px`;
}

export default function DisplaySettings({ settings, setSettings, autoScale, effectiveScale, onClose }) {
  const manualPercent = Math.round(Number(settings.scale || 1) * 100);
  const actualPercent = Math.round(Number(effectiveScale || 1) * 100);
  const fontOffset = Number(settings.fontOffset || 0);

  function changeFont(direction) {
    setSettings((current) => ({
      ...current,
      fontOffset: clamp(Number(current.fontOffset || 0) + (direction * FONT_STEP), FONT_MIN, FONT_MAX),
    }));
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-900/25 p-5" onPointerDown={(event) => event.target === event.currentTarget && onClose()}>
      <section id="crmDisplaySettings" className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl" role="dialog" aria-modal="true" aria-label="Display settings">
        <header className="flex items-center border-b border-slate-200 px-5 py-4"><strong className="text-sm font-semibold">Display & layout</strong><button type="button" onClick={onClose} className="ml-auto text-slate-400">×</button></header>
        <div className="grid gap-5 p-5">
          <label className="grid gap-2 text-xs text-slate-500">
            <span className="flex items-center justify-between"><span>UI scale</span><strong className="font-medium text-slate-700">{actualPercent}%</strong></span>
            <input id="crmScreenScale" type="range" min="70" max="130" step="1" value={manualPercent} onChange={(event) => setSettings((current) => ({ ...current, scale: Number(event.target.value) / 100 }))} className="crm-settings-range" />
            <small className="[font-size:calc(10px+var(--crm-font-offset))] text-slate-400">Auto fit {Math.round(Number(autoScale || 1) * 100)}% · manual {manualPercent}%</small>
          </label>

          <label className="text-xs text-slate-500">Row size
            <select id="crmCellDensity" className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-xs" value={settings.density || 'comfortable'} onChange={(event) => setSettings((current) => ({ ...current, density: event.target.value }))}>
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable</option>
              <option value="roomy">Roomy</option>
            </select>
          </label>

          <div className="grid gap-2 text-xs text-slate-500">
            <span>Font size</span>
            <div className="crm-font-stepper" role="group" aria-label="CRM font size">
              <button type="button" onClick={() => changeFont(-1)} disabled={fontOffset <= FONT_MIN} aria-label="Decrease all CRM fonts by 0.5 pixels">−</button>
              <output>{formatFontOffset(fontOffset)}</output>
              <button type="button" onClick={() => changeFont(1)} disabled={fontOffset >= FONT_MAX} aria-label="Increase all CRM fonts by 0.5 pixels">+</button>
            </div>
          </div>

          <label className="grid gap-2 text-xs text-slate-500">
            <span>Accent color</span>
            <span className="crm-accent-picker">
              <input id="crmAccentColor" type="color" value={settings.accent || '#4669A8'} onChange={(event) => setSettings((current) => ({ ...current, accent: event.target.value }))} aria-label="Choose CRM accent color" />
              <span>{String(settings.accent || '#4669A8').toUpperCase()}</span>
            </span>
          </label>
        </div>
      </section>
    </div>
  );
}
