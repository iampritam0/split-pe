// Mirror of DEFAULTS in the SplitPe app (src/services/remoteConfig.js) —
// keep the two in sync. The app falls back to these for any field the
// appConfig/settings doc doesn't set, so the form starts from them too.
export type RemoteSettings = {
  maintenance: { enabled: boolean; message: string };
  ads: { enabled: boolean; listEvery: number };
  limits: { dailyFreeExpenses: number; personalGroupsPerUnlock: number };
  dailyReminder: { enabled: boolean; hour: number; minute: number; title: string; body: string };
  features: { upiPay: boolean; foreignCurrency: boolean; contactsImport: boolean; insights: boolean };
  support: { email: string; tickets: boolean; faqs: { q: string; a: string }[] };
};

export const DEFAULT_SETTINGS: RemoteSettings = {
  maintenance: {
    enabled: false,
    message: "SplitPe is getting a quick upgrade. We'll be back in a few minutes.",
  },
  ads: { enabled: true, listEvery: 5 },
  limits: { dailyFreeExpenses: 5, personalGroupsPerUnlock: 2 },
  dailyReminder: {
    enabled: true,
    hour: 21,
    minute: 0,
    title: "Add today's expenses 📝",
    body: "Took a ride, had chai or paid a bill? Log it in 10 seconds.",
  },
  features: { upiPay: true, foreignCurrency: true, contactsImport: true, insights: true },
  support: {
    email: "support@splitpe.xyz",
    tickets: true,
    faqs: [
      { q: "How do I split an expense unequally?", a: "When adding an expense, choose Exact, Percentage or Shares in the split method screen to divide it however you like." },
      { q: "How do I settle up with a friend?", a: "Open a friend or group, tap Settle Up, choose an amount and payment method, then confirm the payment." },
      { q: "Can I edit or delete an expense?", a: "Yes — open the expense details and use the edit icon or the delete option at the bottom of the screen." },
    ],
  },
};

/** Per-section merge of a stored doc over the defaults, same as the app does. */
export const mergeSettings = (remote: Partial<Record<keyof RemoteSettings, Record<string, unknown>>> | undefined): RemoteSettings => {
  const out = structuredClone(DEFAULT_SETTINGS);
  for (const section of Object.keys(DEFAULT_SETTINGS) as (keyof RemoteSettings)[]) {
    const incoming = remote?.[section] || {};
    const target = out[section] as Record<string, unknown>;
    for (const key of Object.keys(target)) {
      if (incoming[key] !== undefined && typeof incoming[key] === typeof target[key] && Array.isArray(incoming[key]) === Array.isArray(target[key])) {
        target[key] = incoming[key];
      }
    }
  }
  // Same rule as the app: only complete FAQ entries, else the built-in ones.
  const faqs = out.support.faqs.filter((f) => f && typeof f.q === "string" && typeof f.a === "string" && f.q.trim() && f.a.trim());
  out.support.faqs = faqs.length ? faqs : structuredClone(DEFAULT_SETTINGS.support.faqs);
  return out;
};

// appConfig/version — the force-update gate (app's useForceUpdate).
export type VersionGate = { minVersion: string; message: string; updateUrl: string };
