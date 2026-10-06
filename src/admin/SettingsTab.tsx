import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Bell, Construction, Gauge, Loader2, Megaphone, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { db } from "./firebase";
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

  useEffect(() => {
    Promise.all([getDoc(doc(db, "appConfig", "settings")), getDoc(doc(db, "appConfig", "version"))])
      .then(([s, v]) => {
        setSettings(mergeSettings(s.exists() ? s.data() : undefined));
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
    if (version.minVersion && !/^\d+\.\d+\.\d+$/.test(version.minVersion.trim())) {
      setStatus({ ok: false, text: "Minimum version must look like 1.0.0" });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      await setDoc(doc(db, "appConfig", "settings"), settings);
      await setDoc(doc(db, "appConfig", "version"), {
        minVersion: version.minVersion.trim(),
        message: version.message.trim(),
        updateUrl: version.updateUrl.trim(),
      });
      setStatus({ ok: true, text: "Saved. Users get the new settings the next time they open the app." });
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
