// Mirror of DEFAULTS in the SplitPe app (src/services/remoteConfig.js) —
// keep the two in sync. The app falls back to these for any field the
// appConfig/settings doc doesn't set, so the form starts from them too.
export type RemoteSettings = {
  maintenance: { enabled: boolean; message: string };
  ads: { enabled: boolean; listEvery: number };
  limits: { dailyFreeExpenses: number; personalGroupsPerUnlock: number };
  dailyReminder: { enabled: boolean; hour: number; minute: number; title: string; body: string };
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
};

/** Per-section merge of a stored doc over the defaults, same as the app does. */
export const mergeSettings = (remote: Partial<Record<keyof RemoteSettings, Record<string, unknown>>> | undefined): RemoteSettings => {
  const out = structuredClone(DEFAULT_SETTINGS);
  for (const section of Object.keys(DEFAULT_SETTINGS) as (keyof RemoteSettings)[]) {
    const incoming = remote?.[section] || {};
    const target = out[section] as Record<string, unknown>;
    for (const key of Object.keys(target)) {
      if (incoming[key] !== undefined && typeof incoming[key] === typeof target[key]) target[key] = incoming[key];
    }
  }
  return out;
};

// appConfig/version — the force-update gate (app's useForceUpdate).
export type VersionGate = { minVersion: string; message: string; updateUrl: string };
