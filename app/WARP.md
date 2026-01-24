# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

Transfer Agent Protocol (TAP) frontend and landing page - a Next.js site using styled-components for styling.

## Commands

```bash
# Development server
pnpm dev

# Production build (includes sitemap generation)
pnpm build

# Start production server
pnpm start

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Architecture

### Tech Stack
- **Framework**: Next.js (Pages Router)
- **Styling**: styled-components v6 with ThemeProvider
- **Font**: IBM Plex Mono (loaded via next/font)
- **React**: v19

### Project Structure
- `src/pages/` - Next.js pages (`_app.tsx` wraps all pages with theme/layout)
- `src/components/` - Reusable styled components
  - `theme.tsx` - Design tokens (colors, fontSizes, lineHeights, borderRadius)
  - `typography.tsx` - Text components (H1, H2, H3, P, etc.)
  - `layout.tsx` - Main layout wrapper with Navbar and Footer
  - `wrappers.tsx` - Layout containers

### Theming

The theme is defined in `src/components/theme.tsx` and typed in `styled.d.ts`. Available properties:
- `colors`: background, main, input, text, accent, outline
- `fontSizes`: H1, H2, H3, large, medium, baseline, small
- `lineHeights`: H1, H2, H3, P
- `borderRadius`: none, main

**Note:** `fontWeight` only has 'thin', 'normal', and 'bold' - no 'light' property.

## Git Workflow

PR titles should follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) (e.g., `feat(ui): add new component`).
