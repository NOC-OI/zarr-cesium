# Developer Guide – zarr-cesium

This document explains how to set up a local development environment for:

- The **documentation website** (Docusaurus)
- The **demo application** (Vite)
- Contributing to the **zarr-cesium** library itself

Whether you want to fix bugs, add features, or update the docs, this guide will help you get started quickly.

---

# 1. Repository Structure

```

zarr-cesium/
├── src/ # Main TypeScript source code
├── docs/ # Documentation website (Docusaurus)
├── demo/ # Demo web application (Vite)
├── dist/ # Build output (gitignored)
├── package.json # Library root package
└── tsconfig.json

```

---

# 2. Running the Documentation Website (Docusaurus)

The documentation site lives under `docs/`.

## Start the Docs Website

```bash
cd docs
npm install
npm run start
```

This launches Docusaurus in development mode:

- [http://localhost:3000](http://localhost:3000)

Any changes to Markdown or config files will auto-reload.

## Build the Docs Site

```bash
npm run build
```

Output is generated in `docs/build/`.

## Serve the Production Build

```bash
npm run serve
```

This is helpful for testing before deploying.

---

# 3. Running & Editing the Demo Website (Vite)

The demo uses **Vite** and displays interactive Cesium + Zarr examples.

## Clone the repository

```bash
git clone https://github.com/noc-oi/zarr-cesium.git
cd zarr-cesium/demo
```

## Add Your Cesium Ion Token

Create a `.env` file inside `demo/`:

```env
VITE_CESIUM_TOKEN=your_cesium_access_token_here
```

If you don't have a token, create a free account at [https://cesium.com/ion/](https://cesium.com/ion/).

## Install dependencies

```bash
npm install
```

## Start the development server

```bash
npm run dev
```

The demo will be available at:

- [http://localhost:5173](http://localhost:5173)

## Customize the Demo (Use Your Own Zarr Data)

Edit: [`demo/src/application/data/layers-json.tsx`](https://github.com/NOC-OI/zarr-cesium/blob/dev/demo/src/application/data/layers-json.tsx).

You can change:

- Dataset URLs
- Variable names (`temperature`, `uo`, `vo`, etc.)
- Bounds
- Colormaps
- Providers:
  - dataType "zarr-cesium" uses provider `ZarrLayerProvider`
  - dataType "zarr-cube" uses provider `ZarrCubeProvider`
  - dataType "zarr-cube-velocity" uses provider `ZarrCubeVelocityProvider`

This file is intentionally simple to help you experiment quickly.

---

# 4. Local Development of the Library

To build and develop the core library:

```bash
git clone https://github.com/noc-oi/zarr-cesium.git
cd zarr-cesium
npm install
```

## Build the library

```bash
npm run build
```

Outputs will go to `dist/`.

## Watch for changes

```bash
npm run dev
```

This will compile TypeScript in watch mode.

You can then use the demo app to test changes **live** by running it simultaneously.

---

# 5. Contributing Guidelines

We welcome contributions! Please follow the workflow below.

## 🧩 5.1. Branching Model

Use feature branches:

```
feature/my-new-feature
fix/bug-description
docs/update-provider-docs
```

## 🧪 5.2. Before pushing

Run:

```bash
npm run build
```

and optionally:

```bash
npm run lint
```

(If lint scripts exist.)

## 📥 5.3. Pull Request Guidelines

- Describe clearly **what the PR adds or fixes**
- Link related **issues**
- Update documentation when necessary
- Keep PRs focused instead of large multi-purpose changes

## 📚 5.4. Updating Documentation

Docs live under:

```
docs/docs/
```

Examples:

- Providers → `docs/providers/*.md`
- Getting Started → `docs/intro.md`
- Data preparation → `docs/data.md`

To test docs locally:

```bash
cd docs
npm run start
```

---

# 6. Deployment (Docs Only)

If you have Docusaurus deployment configured:

```bash
cd docs
npm run deploy
```

This depends on your project’s hosting setup (GitHub Pages, Vercel, etc.).

---

# 7. Troubleshooting

### Cesium access token errors

Make sure `.env` is present in the demo directory:

```
VITE_CESIUM_TOKEN=...
```

### Missing dependencies in docs

Run:

```bash
cd docs
npm install
```

### WindLayer errors in demo

Ensure:

```
cesium-wind-layer
```

is installed in the repo root or demo project.
