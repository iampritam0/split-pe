import type { UserRow } from "./users";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const seenWithin = (p: UserRow, now: number, ms: number) => !!p.lastSeen && now - p.lastSeen < ms;

export type AudienceKey =
  | "all" | "active1d" | "active2d" | "active7d"
  | "inactive2d" | "inactive7d" | "inactive30d" | "new7d";

/**
 * Who a notification can go to. "Active" means the app was used in that
 * window (lastSeen — Auth token refresh / sign-in / lastActiveAt); blocked
 * accounts are always left out. Mirrored server-side for scheduled sends
 * (SplitPe repo: AUDIENCE_TESTS) — keep the two in sync.
 */
export const AUDIENCES: { key: AudienceKey; label: string; hint: string; group: "Everyone" | "Active" | "Not active" | "Other"; test: (p: UserRow, now: number) => boolean }[] = [
  { key: "all", group: "Everyone", label: "All users", hint: "Everyone who isn't blocked", test: () => true },
  { key: "active1d", group: "Active", label: "Active today", hint: "Used the app in the last 24 hours", test: (p, now) => seenWithin(p, now, DAY_MS) },
  { key: "active2d", group: "Active", label: "Active last 2 days", hint: "Used the app in the last 48 hours", test: (p, now) => seenWithin(p, now, 2 * DAY_MS) },
  { key: "active7d", group: "Active", label: "Active last 7 days", hint: "Used the app this week", test: (p, now) => seenWithin(p, now, 7 * DAY_MS) },
  { key: "inactive2d", group: "Not active", label: "Not active 2+ days", hint: "Haven't opened the app in 2 days", test: (p, now) => !seenWithin(p, now, 2 * DAY_MS) },
  { key: "inactive7d", group: "Not active", label: "Not active 7+ days", hint: "Haven't opened the app in a week", test: (p, now) => !seenWithin(p, now, 7 * DAY_MS) },
  { key: "inactive30d", group: "Not active", label: "Not active 30+ days", hint: "Gone quiet for a month", test: (p, now) => !seenWithin(p, now, 30 * DAY_MS) },
  { key: "new7d", group: "Other", label: "New this week", hint: "Signed up in the last 7 days", test: (p, now) => !!p.createdAt && now - p.createdAt < 7 * DAY_MS },
];

export type Template = { id: string; category: string; title: string; body: string; audience: AudienceKey };

/** Ready-made messages — each suggests the audience it was written for. */
export const TEMPLATES: Template[] = [
  // Win-back
  { id: "miss-you", category: "Win back", audience: "inactive7d", title: "We miss you! 👋", body: "Your friends are still splitting bills on SplitPe. Open the app to see if anyone owes you money." },
  { id: "pending-check", category: "Win back", audience: "inactive2d", title: "Any pending balances? 🤔", body: "It has been 2 days! Open SplitPe and check your pending balances — settle up in seconds." },
  { id: "come-back-30", category: "Win back", audience: "inactive30d", title: "It's been a while 💙", body: "SplitPe has new features waiting for you. Split your next trip, dinner or rent the easy way." },

  // Reminders
  { id: "add-expenses", category: "Reminder", audience: "active2d", title: "Add today's expenses ✍️", body: "Spent on food, cab or groceries with friends? Add it now so nobody forgets later." },
  { id: "settle-weekend", category: "Reminder", audience: "active7d", title: "Weekend settle-up time 💸", body: "Clear your dues before the weekend. Open SplitPe and settle up with one tap." },
  { id: "month-end", category: "Reminder", audience: "all", title: "Month-end settle-up 📅", body: "Rent, bills, trips — settle all your shared expenses before the month ends." },

  // Onboarding
  { id: "welcome", category: "Onboarding", audience: "new7d", title: "Welcome to SplitPe 🎉", body: "Create your first group, add friends and split bills without the awkward maths." },
  { id: "first-group", category: "Onboarding", audience: "new7d", title: "Create your first group 👥", body: "Trip, flat or office lunch — make a group and SplitPe keeps track of who owes whom." },
  { id: "invite", category: "Onboarding", audience: "active7d", title: "Invite your friends 🤝", body: "Splitting is better together. Invite your friends to SplitPe and settle up instantly." },

  // Updates
  { id: "update", category: "App update", audience: "all", title: "New update available 🚀", body: "We've made SplitPe faster and fixed bugs. Update the app from the Play Store to get the latest." },
  { id: "new-feature", category: "App update", audience: "all", title: "Something new in SplitPe ✨", body: "We just shipped a new feature to make splitting even easier. Open the app to try it out!" },

  // Festive
  { id: "diwali", category: "Festival", audience: "all", title: "Happy Diwali 🪔", body: "Team SplitPe wishes you and your family a bright and joyful Diwali. Celebrate together, split easily!" },
  { id: "holi", category: "Festival", audience: "all", title: "Happy Holi 🎨", body: "Let the colours fly, not the bills! Enjoy Holi with friends — SplitPe will handle the bills." },
  { id: "new-year", category: "Festival", audience: "all", title: "Happy New Year 🎆", body: "New year, zero pending dues! Start fresh by settling up with your friends on SplitPe." },
];
