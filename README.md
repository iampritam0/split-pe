# SplitPe

> **Split bills. Not friendships.**

SplitPe is a modern bill-splitting and shared-expense management platform designed to make managing group expenses simple, transparent, and hassle-free.

Whether you're travelling with friends, sharing expenses with roommates, organizing a dinner, or managing everyday group spending, SplitPe helps you track expenses, understand balances, and settle up with ease.

---

## 🚀 Live Website

**Production:**
https://iampritam0.github.io/split-pe/

---

## ✨ Features

### 👥 Group Expense Tracking

Create groups for trips, roommates, friends, family, colleagues, and other shared activities.

### 💰 Easy Bill Splitting

Add expenses and split them among the people involved without manually calculating everyone's share.

### 📊 Clear Balances

See who paid, who owes, and how much each person needs to settle.

### ⚡ Quick Settlements

Simplify outstanding balances and make settling shared expenses easier.

### 🔔 Smart Notifications

Stay informed about new expenses, payment reminders, settlements, and group activity.

### 📱 Responsive Experience

The website is designed to work across:

* Mobile phones
* Tablets
* Laptops
* Desktop monitors
* Ultra-wide screens

### 🔐 Privacy & Legal Pages

The website includes dedicated:

* Privacy Policy
* Terms & Conditions

---

# 🛠️ Tech Stack

| Technology       | Purpose                             |
| ---------------- | ----------------------------------- |
| React            | Frontend UI                         |
| TypeScript       | Type safety                         |
| Vite             | Development & production build tool |
| Tailwind CSS     | Styling                             |
| React Router DOM | Client-side routing                 |
| Lucide React     | Icons                               |
| GitHub Pages     | Static website hosting              |
| GitHub Actions   | CI/CD deployment                    |

---

# 📁 Project Structure

```text
split-pe/
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── public/
│   ├── 404.html
│   └── favicon.svg
│
├── src/
│   │
│   ├── components/
│   │   ├── Footer.tsx
│   │   └── Navbar.tsx
│   │
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── PrivacyPolicy.tsx
│   │   ├── Terms.tsx
│   │   └── DeleteAccount.tsx
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── .env
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

# 📄 Application Routes

The website currently contains the following routes:

| Route                   | Description        |
| ----------------------- | ------------------ |
| `/`                     | SplitPe homepage   |
| `/privacy-policy`       | Privacy Policy     |
| `/terms-and-conditions` | Terms & Conditions |
| `/delete-account`       | Delete Account     |

For GitHub Pages, these are served under:

```text
/split-pe/
```

For example:

```text
https://iampritam0.github.io/split-pe/
```

---

# ⚙️ Getting Started

## Prerequisites

Make sure the following are installed:

* Node.js 20+
* npm 10+
* Git

Check your installed versions:

```bash
node --version
```

```bash
npm --version
```

```bash
git --version
```

---

# 📥 Installation

Clone the repository:

```bash
git clone https://github.com/iampritam0/split-pe.git
```

Move into the project directory:

```bash
cd split-pe
```

Install dependencies:

```bash
npm install
```

---

# 🔐 Environment Variables

Create a `.env` file in the project root:

```env
VITE_APP_NAME=SplitPe
VITE_API_URL=https://api.splitpe.com
```

A sample environment file is provided as:

```text
.env.example
```

### Important

Never commit sensitive credentials or private API keys to the repository.

Only variables prefixed with `VITE_` are exposed to the browser by Vite.

---

# 🧑‍💻 Development

Start the development server:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

---

# 🏗️ Production Build

Create a production build:

```bash
npm run build
```

The generated production files will be placed inside:

```text
dist/
```

To preview the production build locally:

```bash
npm run preview
```

---

# 🧹 Code Quality

Before pushing changes, make sure the application builds successfully:

```bash
npm run build
```

TypeScript can also be checked with:

```bash
npx tsc --noEmit
```

---

# 🌐 GitHub Pages Deployment

SplitPe is configured for deployment to GitHub Pages.

The repository is:

```text
https://github.com/iampritam0/split-pe
```

The production website is:

```text
https://iampritam0.github.io/split-pe/
```

---

## Deployment Architecture

The deployment flow is:

```text
Developer
   │
   ▼
main branch
   │
   ▼
GitHub Actions
   │
   ├── Install dependencies
   │
   ├── Build React application
   │
   └── Generate dist/
   │
   ▼
gh-pages branch
   │
   ▼
GitHub Pages
   │
   ▼
https://iampritam0.github.io/split-pe/
```

---

# 🚀 Automatic Deployment

The project contains:

```text
.github/workflows/deploy.yml
```

The workflow automatically runs whenever changes are pushed to:

```text
main
```

Example:

```bash
git add .
git commit -m "Update SplitPe website"
git push origin main
```

GitHub Actions will then:

1. Checkout the repository.
2. Install Node.js.
3. Install npm dependencies.
4. Build the Vite application.
5. Generate the `dist` directory.
6. Deploy `dist` to the `gh-pages` branch.

---

# ⚙️ GitHub Pages Configuration

Inside the GitHub repository:

```text
Settings
   ↓
Pages
```

Configure:

```text
Source: Deploy from a branch
Branch: gh-pages
Folder: / (root)
```

After deployment, GitHub Pages will serve:

```text
https://iampritam0.github.io/split-pe/
```

---

# 📦 Vite Configuration

Because this is a GitHub Pages project site, Vite uses the repository name as its base path.

`vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/split-pe/",
});
```

The trailing `/` is important.

---

# 🔄 Deployment Workflow

For normal development:

```bash
git pull origin main
```

Make your changes.

Then:

```bash
npm run build
```

If the build succeeds:

```bash
git add .
git commit -m "Update website"
git push origin main
```

GitHub Actions will handle deployment automatically.

---

# 🧩 Adding a New Page

Create a new page inside:

```text
src/pages/
```

For example:

```text
src/pages/About.tsx
```

Then register the route in:

```text
src/App.tsx
```

Example:

```tsx
<Route path="/about" element={<About />} />
```

---

# 🎨 Styling

SplitPe uses Tailwind CSS.

Tailwind configuration:

```text
tailwind.config.js
```

Global styles:

```text
src/index.css
```

The design follows a mobile-first approach.

Typical responsive breakpoints include:

```text
sm
md
lg
xl
2xl
```

Example:

```tsx
<div className="flex flex-col md:flex-row">
```

---

# 🧱 Component Architecture

The application follows a component-based architecture.

### Components

Reusable UI components are stored inside:

```text
src/components/
```

Current components include:

```text
Navbar.tsx
Footer.tsx
```

### Pages

Page-level components are stored inside:

```text
src/pages/
```

Current pages:

```text
Home.tsx
PrivacyPolicy.tsx
Terms.tsx
DeleteAccount.tsx
```

---

# 🔗 Navigation

The application uses:

```text
react-router-dom
```

Current routes:

```tsx
<Route path="/" element={<Home />} />
<Route path="/privacy-policy" element={<PrivacyPolicy />} />
<Route path="/terms-and-conditions" element={<Terms />} />
<Route path="/delete-account" element={<DeleteAccount />} />
```

---

# 🛡️ Security Considerations

The frontend should never contain:

* Database passwords
* Private API keys
* Authentication secrets
* Server credentials
* Payment gateway secret keys
* Firebase server keys
* JWT signing secrets

Frontend environment variables are publicly accessible after the application is built.

Sensitive operations should always be handled by a secure backend.

---

# 📱 Responsive Design

SplitPe is designed using a mobile-first responsive strategy.

Supported screen categories include:

### Mobile

```text
320px+
```

### Tablet

```text
768px+
```

### Desktop

```text
1024px+
```

### Large Desktop

```text
1280px+
```

### Ultra-wide

```text
1536px+
```

The layout uses responsive grids, flexible containers, adaptive typography, and responsive navigation.

---

# 🧪 Testing Before Deployment

Before pushing to production, run:

```bash
npm install
```

Then:

```bash
npm run build
```

Then:

```bash
npm run preview
```

Verify:

```text
/
 /privacy-policy
 /terms-and-conditions
```

Also test:

* Navbar navigation
* Mobile menu
* CTA buttons
* Footer links
* Responsive layouts
* Browser refresh
* Legal pages
* External links
* Production build
* GitHub Pages deployment

---

# 🐛 Troubleshooting

## Vite assets return 404

Check:

```text
vite.config.ts
```

For GitHub Pages, make sure:

```ts
base: "/split-pe/",
```

is configured correctly.

Then rebuild:

```bash
rm -rf dist
npm run build
```

---

## GitHub Pages shows an old version

Check:

```text
GitHub → Actions
```

and verify that the latest deployment completed successfully.

You can also perform a hard refresh:

### Chrome / Linux

```text
Ctrl + Shift + R
```

---

## GitHub Actions deployment fails

Check:

```text
GitHub → Actions → Deploy SplitPe to GitHub Pages
```

Open the failed workflow and inspect the step that failed.

Common causes include:

* Dependency installation failure
* TypeScript compilation errors
* Vite build errors
* Incorrect Node.js version
* GitHub Pages configuration
* Repository permissions

---

# 📌 Important GitHub Pages Note

GitHub Pages hosts the frontend as a static website.

It does not provide:

* Backend APIs
* Database hosting
* Authentication servers
* Payment processing
* Secure server-side logic

If SplitPe requires authentication, expenses APIs, user accounts, payment integrations, notifications, or other backend functionality, those services should be hosted separately.

The frontend can communicate with the backend using:

```env
VITE_API_URL=https://api.splitpe.com
```

---

# 🔮 Future Improvements

Potential future additions include:

* User authentication
* Google authentication
* Mobile number authentication
* Expense management API
* Group management
* UPI integration
* Payment settlement
* Push notifications
* Email notifications
* User dashboard
* Expense analytics
* Recurring expenses
* Multiple currencies
* Receipt scanning
* Expense categories
* Dark mode
* PWA support
* Android application
* iOS application
* Admin dashboard

---

# 🤝 Contributing

Contributions and improvements are welcome.

Create a new branch:

```bash
git checkout -b feature/your-feature-name
```

Make your changes and verify the build:

```bash
npm run build
```

Commit:

```bash
git add .
git commit -m "Add your feature"
```

Push:

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

# 📄 License

The licensing terms for SplitPe should be defined by the project owner before distributing the source code publicly.

Until a formal license is added, the source code should not be assumed to be freely reusable, modified, or redistributed.

---

# 📬 Contact

For questions, support, or business inquiries, use the contact channels provided through the SplitPe website.

---

## SplitPe

**Split bills. Not friendships.**

Built to make shared expenses simpler.
