# TripSplitt

A minimalist offline-first PWA for splitting trip expenses with friends.

## Features

- **Track expenses** - Add individual or grouped expenses with optional itemization
- **Split costs** - Automatically calculate who owes what
- **Share trips** - Generate QR codes to share trips with friends
- **Offline first** - Works without internet using IndexedDB storage
- **Privacy focused** - No server, all data stays on your device

## Tech Stack

- React 19 + TypeScript
- Vite + Tailwind CSS 4
- Radix UI + shadcn/ui
- Brotli compression for URL sharing
- PWA with service worker

## Getting Started

```bash
pnpm install
pnpm dev
```

Build for production:

```bash
pnpm build
```

## Usage

1. Create a trip and add people
2. Add expenses (individual or grouped with multiple items)
3. View settlements to see who should pay whom
4. Click the share button to generate a QR code for sharing
