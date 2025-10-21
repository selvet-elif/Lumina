## Deploying Lumina to Vercel

This guide explains how to deploy the Next.js frontend to Vercel and wire it to your deployed Soroban contract on Stellar Testnet.

### Prerequisites
- Node.js 18+
- Vercel account and Vercel CLI (`npm i -g vercel`)
- A deployed contract ID on Stellar Testnet

### 1) Local build sanity check
```bash
npm install
npm run build
```

### 2) Ensure correct config
- `next.config.js` should not use deprecated `experimental.appDir`.
- Optional: `vercel.json` present with:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

### 3) Update Contract ID
Edit `app/services/contractService.ts` and set `CONTRACT_ID` to your deployed contract id.

### 4) Deploy with Vercel CLI
```bash
vercel        # first-time setup, answer prompts (create new project)
vercel --prod # production deployment
```

Vercel outputs a Production URL like `https://<project>.vercel.app`.

### 5) Troubleshooting
- 404/Not Found: Ensure build succeeded locally (`npm run build`).
- "No Output Directory named public": Set Output Directory to `.next` in Vercel settings or use `vercel.json` above.
- Type errors: run `npx tsc --noEmit` locally and fix.

### 6) Optional: Custom Domain
In Vercel project → Settings → Domains, add your domain and follow DNS instructions.


