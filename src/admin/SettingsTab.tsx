import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Bell, Construction, Gauge, LifeBuoy, Loader2, Megaphone, Plus, Smartphone, ToggleRight, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { db } from "./firebase";
import { logAdminAction } from "./adminLog";
import { DEFAULT_SETTINGS, mergeSettings } from "./remoteConfig";
import type { RemoteSettings, VersionGate } from "./remoteConfig";

const Section = ({ icon: Icon, title, hint, children }: { icon: LucideIcon; title: string; hint: string; children: ReactNode }) => (
  <section className="mb-5 rounded-2xl bg-white p-5 shadow-soft">
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-splitpe-50 text-splitpe-600"><Icon size={18} /></div>
      <div>
        <h3 className="font-heading text-lg font-bold text-ink">{title}</h3>
        <p className="text-sm text-ink-soft">{hint}</p>
      </div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">{children}</div>
  </section>
);

const Toggle = ({ label, checked, onChange, danger }: { label: string; checked: boolean; onChange: (v: boolean) => void; danger?: boolean }) => (
  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2">
    <span className="font-medium text-ink">{label}</span>
    <span className={`relative h-6 w-11 rounded-full transition ${checked ? (danger ? "bg-red-500" : "bg-splitpe-600") : "bg-slate-300"}`}>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-5" : "left-0.5"}`} />
    </span>
  </label>
);

const Field = ({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) => (
  <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
    <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
    {children}
  </label>
);

const inputClass = "w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-splitpe-600";

const NumberInput = ({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min: number; max: number }) => (
  <input type="number" className={inputClass} min={min} max={max} value={value}
    onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))} />
);

/**
 * Edits appConfig/settings (the app's remote config — services/remoteConfig.js
 * in the SplitPe repo) and appConfig/version (the force-update gate). Apps
 * pick changes up the next time they're opened; no new build needed.
 */
export default function SettingsTab() {
  const [settings, setSettings] = useState<RemoteSettings | null>(null);
  const [version, setVersion] = useState<VersionGate>({ minVersion: "", message: "", updateUrl: "" });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  // Maintenance state as last saved — turning it on/off gets its own log entry.
  const savedMaintenance = useRef<boolean | null>(null);

  useEffect(() => {
    Promise.all([getDoc(doc(db, "appConfig", "settings")), getDoc(doc(db, "appConfig", "version"))])
      .then(([s, v]) => {
        const merged = mergeSettings(s.exists() ? s.data() : undefined);
        setSettings(merged);
        savedMaintenance.current = merged.maintenance.enabled;
        if (v.exists()) setVersion({ minVersion: "", message: "", updateUrl: "", ...(v.data() as Partial<VersionGate>) });
      })
      .catch((err) => {
        setSettings(structuredClone(DEFAULT_SETTINGS));
        setStatus({ ok: false, text: `Could not load current settings: ${err.message}` });
      });
  }, []);

  if (!settings) return <p className="text-ink-soft">Loading settings…</p>;

  const set = <S extends keyof RemoteSettings>(section: S, patch: Partial<RemoteSettings[S]>) =>
    setSettings((prev) => (prev ? { ...prev, [section]: { ...prev[section], ...patch } } : prev));

  const save = async () => {
    if (settings.maintenance.enabled && !window.confirm("Maintenance mode is ON — every user except admins will be locked out of the app the next time they open it. Save anyway?")) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.support.email.trim())) {
      setStatus({ ok: false, text: "Support email doesn't look right" });
      return;
    }
    if (version.minVersion && !/^\d+\.\d+\.\d+$/.test(version.minVersion.trim())) {
      setStatus({ ok: false, text: "Minimum version must look like 1.0.0" });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      // Half-written FAQs are dropped rather than shown blank in the app.
      const faqs = settings.support.faqs.filter((f) => f.q.trim() && f.a.trim()).map((f) => ({ q: f.q.trim(), a: f.a.trim() }));
      await setDoc(doc(db, "appConfig", "settings"), { ...settings, support: { ...settings.support, email: settings.support.email.trim(), faqs: faqs.length ? faqs : DEFAULT_SETTINGS.support.faqs } });
      await setDoc(doc(db, "appConfig", "version"), {
        minVersion: version.minVersion.trim(),
        message: version.message.trim(),
        updateUrl: version.updateUrl.trim(),
      });
      setStatus({ ok: true, text: "Saved. Users get the new settings the next time they open the app." });
      if (savedMaintenance.current !== settings.maintenance.enabled) {
        logAdminAction("maintenance", `Maintenance mode turned ${settings.maintenance.enabled ? "ON" : "OFF"}`, settings.maintenance.message);
        savedMaintenance.current = settings.maintenance.enabled;
      }
      const pad = (n: number) => String(n).padStart(2, "0");
      logAdminAction(
        "settings",
        "Saved app settings",
        [
          `Ads ${settings.ads.enabled ? `on (every ${settings.ads.listEvery})` : "off"}`,
          `${settings.limits.dailyFreeExpenses} free expenses/day`,
          `${settings.limits.personalGroupsPerUnlock} groups/ad`,
          `Reminder ${settings.dailyReminder.enabled ? `${pad(settings.dailyReminder.hour)}:${pad(settings.dailyReminder.minute)}` : "off"}`,
          `Off: ${Object.entries(settings.features).filter(([, on]) => !on).map(([k]) => k).join(", ") || "nothing"}`,
          `${settings.support.faqs.length} FAQs`,
          `Min version ${version.minVersion.trim() || "off"}`,
        ].join(" · ")
      );
    } catch (err) {
      setStatus({ ok: false, text: `Save failed: ${(err as Error).message}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-24">
      <h2 className="mb-1 font-heading text-2xl font-bold text-ink">App Settings</h2>
      <p className="mb-6 text-sm text-ink-soft">Changes reach users the next time they open the app — no new build needed.</p>

      <Section icon={Construction} title="Maintenance mode" hint="Locks everyone except admins out of the app with a maintenance screen.">
        <Toggle label="Maintenance mode" danger checked={settings.maintenance.enabled} onChange={(v) => set("maintenance", { enabled: v })} />
        <Field label="Message shown to users" wide>
          <textarea className={inputClass} rows={2} value={settings.maintenance.message} onChange={(e) => set("maintenance", { message: e.target.value })} />
        </Field>
      </Section>

      <Section icon={Megaphone} title="Ads" hint="Banner and rewarded ads across the app.">
        <Toggle label="Show ads" checked={settings.ads.enabled} onChange={(v) => set("ads", { enabled: v })} />
        <Field label="Banner after every N list items">
          <NumberInput value={settings.ads.listEvery} min={2} max={50} onChange={(v) => set("ads", { listEvery: v })} />
        </Field>
      </Section>

      <Section icon={Gauge} title="Free limits" hint="How much users get before a rewarded ad unlocks more.">
        <Field label="Free expenses per day">
          <NumberInput value={settings.limits.dailyFreeExpenses} min={1} max={1000} onChange={(v) => set("limits", { dailyFreeExpenses: v })} />
        </Field>
        <Field label="Personal groups per ad">
          <NumberInput value={settings.limits.personalGroupsPerUnlock} min={1} max={100} onChange={(v) => set("limits", { personalGroupsPerUnlock: v })} />
        </Field>
      </Section>

      <Section icon={Bell} title="Daily reminder" hint="Local notification for users who haven't opened the app that day.">
        <Toggle label="Send daily reminder" checked={settings.dailyReminder.enabled} onChange={(v) => set("dailyReminder", { enabled: v })} />
        <Field label="Time (24h, user's local time)">
          <div className="flex items-center gap-2">
            <NumberInput value={settings.dailyReminder.hour} min={0} max={23} onChange={(v) => set("dailyReminder", { hour: v })} />
            <span className="text-ink-soft">:</span>
            <NumberInput value={settings.dailyReminder.minute} min={0} max={59} onChange={(v) => set("dailyReminder", { minute: v })} />
          </div>
        </Field>
        <Field label="Title">
          <input className={inputClass} maxLength={60} value={settings.dailyReminder.title} onChange={(e) => set("dailyReminder", { title: e.target.value })} />
        </Field>
        <Field label="Message" wide>
          <input className={inputClass} maxLength={150} value={settings.dailyReminder.body} onChange={(e) => set("dailyReminder", { body: e.target.value })} />
        </Field>
      </Section>

      <Section icon={ToggleRight} title="Features" hint="Turn parts of the app off without a new build — off hides the button; nothing saved changes. Works on app 1.1.0 and later.">
        {([
          ["upiPay", "Pay via UPI", "UPI app hand-off when settling up"],
          ["foreignCurrency", "Other currencies", "Currency picker when adding an expense"],
          ["contactsImport", "Import from Contacts", "On the Add Friend screen"],
          ["insights", "Insights (charts)", "Profile → Insights and the group chart icon"],
        ] as const).map(([key, label, hint]) => (
          <label key={key} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
            <span>
              <span className="block font-medium text-ink">{label}</span>
              <span className="block text-xs text-ink-soft">{hint}</span>
            </span>
            <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${settings.features[key] ? "bg-splitpe-600" : "bg-slate-300"}`}>
              <input type="checkbox" className="sr-only" checked={settings.features[key]} onChange={(e) => set("features", { [key]: e.target.checked })} />
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${settings.features[key] ? "left-5" : "left-0.5"}`} />
            </span>
          </label>
        ))}
      </Section>

      <Section icon={LifeBuoy} title="Help & Support" hint="What the app's Help & Support screen shows. Works on app 1.1.0 and later.">
        <Field label="Support email">
          <input className={inputClass} type="email" value={settings.support.email} onChange={(e) => set("support", { email: e.target.value })} />
        </Field>
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
          <span className="font-medium text-ink">“Message support” in the app</span>
          <span className={`relative h-6 w-11 rounded-full transition ${settings.support.tickets ? "bg-splitpe-600" : "bg-slate-300"}`}>
            <input type="checkbox" className="sr-only" checked={settings.support.tickets} onChange={(e) => set("support", { tickets: e.target.checked })} />
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${settings.support.tickets ? "left-5" : "left-0.5"}`} />
          </span>
        </label>
        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-medium text-ink">FAQs</p>
          <div className="space-y-2">
            {settings.support.faqs.map((f, i) => (
              <div key={i} className="flex gap-2 rounded-xl border border-slate-200 p-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <input className={inputClass} placeholder="Question" maxLength={120} value={f.q}
                    onChange={(e) => set("support", { faqs: settings.support.faqs.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)) })} />
                  <textarea className={inputClass} rows={2} placeholder="Answer" maxLength={600} value={f.a}
                    onChange={(e) => set("support", { faqs: settings.support.faqs.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)) })} />
                </div>
                <button type="button" onClick={() => set("support", { faqs: settings.support.faqs.filter((_, j) => j !== i) })} disabled={settings.support.faqs.length <= 1}
                  className="self-start rounded-lg p-2 text-ink-soft hover:bg-red-50 hover:text-red-600 disabled:opacity-30" aria-label="Remove FAQ"><Trash2 size={16} /></button>
              </div>
            ))}
            {settings.support.faqs.length < 20 && (
              <button type="button" onClick={() => set("support", { faqs: [...settings.support.faqs, { q: "", a: "" }] })}
                className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-medium text-ink-soft hover:border-splitpe-600 hover:text-splitpe-700">
                <Plus size={16} /> Add FAQ
              </button>
            )}
          </div>
        </div>
      </Section>

      <Section icon={Smartphone} title="Force update" hint="Installs below this version are blocked with an Update Required screen. Leave empty to turn off.">
        <Field label="Minimum version (e.g. 1.0.1)">
          <input className={inputClass} placeholder="empty = off" value={version.minVersion} onChange={(e) => setVersion({ ...version, minVersion: e.target.value })} />
        </Field>
        <Field label="Update link (optional)">
          <input className={inputClass} placeholder="Play Store page by default" value={version.updateUrl} onChange={(e) => setVersion({ ...version, updateUrl: e.target.value })} />
        </Field>
        <Field label="Message (optional)" wide>
          <input className={inputClass} value={version.message} onChange={(e) => setVersion({ ...version, message: e.target.value })} />
        </Field>
      </Section>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <p className={`text-sm ${status ? (status.ok ? "text-emerald-700" : "text-red-600") : "text-ink-soft"}`}>
            {status?.text || "Review your changes, then save."}
          </p>
          <button onClick={save} disabled={saving} className="flex shrink-0 items-center gap-2 rounded-xl bg-splitpe-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50">
            {saving && <Loader2 size={16} className="animate-spin" />} Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
