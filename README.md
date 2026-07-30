# BagGuard Advisor

**Smart Crypto Position Advisor** — Next.js 15 MVP, ready for Vercel.

> **Important:** Full source lives in your local folder. Run a force-push once so GitHub has every file (this remote was seeded partially via API).

## Local project path

```
C:\Users\Lenovo\Downloads\BagGuard-Advisor-MVP-work\bagguard-advisor
```

## Push full code to this repo

```powershell
cd "C:\Users\Lenovo\Downloads\BagGuard-Advisor-MVP-work\bagguard-advisor"
git remote set-url origin https://github.com/lkus-app/bagguard-advisor.git
git push -u origin main --force
```

Login GitHub if prompted. After push, Import on [vercel.com/new](https://vercel.com/new).

## Vercel settings

| Setting | Value |
|---------|--------|
| Framework | Next.js |
| Root Directory | *(leave empty)* |
| Build | `npm run build` |
| Install | `npm install` |

Optional env (from `.env.example`):
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_BIRDEYE_API_KEY`

## Why the old Vercel error happened

```
package.json: Unexpected token 'i', "import typ"... is not valid JSON
```

`package.json` must be pure JSON. The string `import type` is TypeScript (from `next.config.ts`).  
This project now uses:
- valid `package.json` (JSON only)
- `next.config.mjs` (not mistaken for package.json)

Also fixed for deploy:
- Dropped heavy `@solana/wallet-adapter-wallets` (Wallet Standard)
- Avoided `wagmi/connectors` barrel (broken `@x402/*` on build)
- `npm run build` verified locally

## Dev

```bash
npm install
npm run dev
```

Open http://localhost:3000 → **Try Demo**.

## Disclaimer

Not financial advice. DYOR.
