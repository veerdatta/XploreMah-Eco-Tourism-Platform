# XploreMah

XploreMah is an eco-tourism experience for discovering thoughtful stays across Maharashtra while supporting local hosts, guides, and communities.

## Local development

Requirements: Node.js 20+ and pnpm 10+.

```bash
pnpm install
pnpm --filter @workspace/xploremah dev
```

The app runs at `http://localhost:5173`.

## Production build

```bash
pnpm --filter @workspace/xploremah build
```

The static output is written to `scripts/src/xploremah/dist/public`.

## Deploy with Vercel

1. Push this repository to a private GitHub repository.
2. In Vercel, choose **New Project** and import the GitHub repository.
3. Keep the repository root as the project root. The checked-in `vercel.json` supplies the install command, build command, output directory, and SPA rewrite.
4. Deploy. No environment variables are required for the current frontend.

## GitHub

```bash
git add -A
git commit -m "Prepare project for GitHub and Vercel"
git push origin main
```
