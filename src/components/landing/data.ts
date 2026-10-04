// Content for the landing page, kept apart from the markup so copy changes
// don't touch the components.

export type IconName =
  | "bell" | "users" | "receipt" | "down" | "up" | "plus" | "swap" | "userplus"
  | "home" | "doc" | "user" | "food" | "shield" | "check" | "chev" | "plane"
  | "cart" | "film" | "car" | "zap" | "coffee" | "x" | "play" | "android"
  | "chart" | "camera" | "globe" | "lock" | "search" | "apple";

// In-page sections, used by the header menu and the footer.
export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Upcoming", href: "#upcoming", badge: "NEW" },
  { label: "FAQ", href: "#faq" },
] as const;

// What floats out of the phone: gold ₹ coins and the expense categories you
// actually add in SplitPe, drawn like the app's own coloured icon tiles.
export const CATEGORIES: Record<string, { icon: IconName; fg: string; bg: string }> = {
  food: { icon: "food", fg: "#ea8a0b", bg: "#ffe9c7" },
  travel: { icon: "plane", fg: "#2563eb", bg: "#d6e4ff" },
  rent: { icon: "home", fg: "#6d28d9", bg: "#e6ddff" },
  grocery: { icon: "cart", fg: "#16a34a", bg: "#cdf5df" },
  movie: { icon: "film", fg: "#e11d48", bg: "#ffd9e0" },
  cab: { icon: "car", fg: "#0d9488", bg: "#c9f4ee" },
  bills: { icon: "zap", fg: "#ca8a04", bg: "#fdf0b5" },
  chai: { icon: "coffee", fg: "#9a5b13", bg: "#f6e3cf" },
  group: { icon: "users", fg: "#2563eb", bg: "#d6e4ff" },
  settle: { icon: "swap", fg: "#16a34a", bg: "#cdf5df" },
  expense: { icon: "receipt", fg: "#6d28d9", bg: "#e6ddff" },
};

// "Hisaab" = rupee coins, "Dosti" = shared-moment chips
export const TOKEN_SETS: Record<"hisaab" | "dosti", string[]> = {
  hisaab: ["coin", "food", "travel", "coin", "rent", "expense", "coin", "grocery", "settle"],
  dosti: ["group", "movie", "coin", "cab", "chai", "settle", "bills", "coin", "food"],
};

export const NOTIFS: [string, string][] = [
  ['Rahul added "Chai"', "You owe ₹80 · Office chai"],
  ["Neha settled up", "Received ₹1,200 via UPI ✓"],
  ["Goa Trip", 'Aman added "Scooty rent" · ₹1,600'],
  ["Reminder", "Flat 302 rent split is due tomorrow"],
];

export const TOASTS: Record<"t1" | "t2", [string, string, string][]> = {
  t1: [
    ["settle", "Aman paid you ₹500", "Settled via UPI · just now"],
    ["food", "Pizza night", "₹1,240 · split 4 ways"],
    ["group", "All settled with Neha", "No dues left · दोस्ती intact"],
  ],
  t2: [
    ["travel", "Goa Trip", "₹18,400 · split 4 ways"],
    ["rent", "Flat 302 · Rent", "₹9,000 each · auto-split"],
    ["chai", "Office chai", "You owe ₹80"],
  ],
};

export const FEATURES: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "users",
    title: "Groups for everything",
    text: "Goa trip, Flat 302, office lunch gang — make as many groups as you like and add friends straight from your contacts.",
  },
  {
    icon: "receipt",
    title: "Split it your way",
    text: "Split equally or set custom amounts for who-had-what. Whoever paid, SplitPe works out who owes whom — no calculator needed.",
  },
  {
    icon: "swap",
    title: "Settle up over UPI",
    text: "Tap Settle Up and pay in Google Pay, PhonePe, Paytm or any UPI app you already use. Balances update for everyone.",
  },
  {
    icon: "camera",
    title: "Receipt photos",
    text: "Attach the bill to the expense so nobody has to ask “kitna tha?” again. Proof stays with the हिसाब.",
  },
  {
    icon: "chart",
    title: "Charts & search",
    text: "See where the money went with simple charts, and find any old expense in seconds with search.",
  },
  {
    icon: "globe",
    title: "Multi-currency trips",
    text: "Bangkok, Dubai or Bali — add expenses in any currency and SplitPe converts them for a clean settle-up.",
  },
];

export const STEPS: { title: string; text: string; chip: string; icon: IconName }[] = [
  {
    title: "Make a group",
    text: "Create a group for the trip, the flat or the dinner and invite your friends — they get a notification instantly.",
    chip: "Goa Trip · 4 friends",
    icon: "users",
  },
  {
    title: "Add expenses",
    text: "Whoever pays adds it in a few taps. Pick how to split it and SplitPe keeps a running balance for everyone.",
    chip: "Dinner · ₹4,800 · split 4 ways",
    icon: "receipt",
  },
  {
    title: "Settle up",
    text: "One tap opens your UPI app with the exact amount. Once paid, the balance clears — हिसाब done, दोस्ती intact.",
    chip: "Aman paid you ₹500",
    icon: "swap",
  },
];

export const USE_CASES: { cat: string; title: string; text: string }[] = [
  { cat: "travel", title: "Trips", text: "Hotels, cabs, scooty rent" },
  { cat: "rent", title: "Flatmates", text: "Rent, Wi-Fi, maid, groceries" },
  { cat: "chai", title: "Office chai", text: "Daily ₹20 adds up" },
  { cat: "food", title: "Dinners", text: "Pizza night, birthdays" },
  { cat: "movie", title: "Movies & events", text: "Tickets, popcorn, parking" },
  { cat: "grocery", title: "Groceries", text: "Monthly ration run" },
  { cat: "cab", title: "Cab shares", text: "Airport rides, late nights" },
  { cat: "bills", title: "Bills", text: "Electricity, OTT, recharge" },
];

// `icon` (a sprite symbol) is shown instead of `emoji` when set.
export const UPCOMING: { tag: string; emoji: string; icon?: IconName; title: string; text: string }[] = [
  { tag: "AI", emoji: "📸", title: "Scan & Split", text: "Snap a restaurant bill — items, tax and tip are read automatically. Just tap who had what." },
  { tag: "Voice", emoji: "🎙️", title: "Bol ke add karo", text: "Say “Chai 240, teen log” in Hindi or English and the expense is added and split instantly." },
  { tag: "Reminders", emoji: "💬", title: "WhatsApp nudges", text: "Send a friendly, auto-written reminder with a one-tap UPI link. No more awkward texts." },
  { tag: "Automation", emoji: "🔁", title: "Recurring splits", text: "Rent, Wi-Fi, maid, OTT — set it once and it is added for the whole flat every month." },
  { tag: "Planning", emoji: "🎯", title: "Trip budgets", text: "Set a budget for the Goa trip, watch spend per head live and get alerts before you overshoot." },
  { tag: "Payments", emoji: "📲", title: "Auto-detect UPI spends", text: "With your permission, spot UPI payments you made and turn them into expenses in one tap." },
  { tag: "Language", emoji: "🗣️", title: "हिंदी & regional", text: "Use SplitPe fully in हिंदी, मराठी, தமிழ், বাংলা and more — हिसाब in your own language." },
  { tag: "Platform", emoji: "", icon: "apple", title: "SplitPe for iOS", text: "Same हिसाब, same दोस्ती — the iPhone app, synced with your Android groups and friends." },
];
