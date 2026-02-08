# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the `app/` workspace. See also the root `CLAUDE.md` for project-wide conventions.

## Overview

Next.js frontend (Pages Router) using styled-components v6, React 19, and wagmi/viem for wallet interactions. Workspace name: `tap-app`.

## Styled-Components Style Guide

### File Organization
- **Pure styled-component files** use **lowercase** filenames grouped by concern: `buttons.tsx`, `forms.tsx`, `typography.tsx`, `wrappers.tsx`.
- **Component files with React logic/hooks** use **PascalCase**: `Navbar.tsx`, `Layout.tsx`.
- One file per concern — don't mix buttons and form inputs in the same file.
- Inline styled components inside PascalCase component files are acceptable when the component is only used there (e.g., `NavActions` inside `Navbar.tsx`).

### Naming & Exports
- Use `const Name = styled.element` syntax.
- Pure styled-component files use **named exports** grouped at the bottom of the file.
- Avoid `default export` for files that only export styled components.

### Theme Tokens
- Always use theme tokens via `${({ theme }) => theme.colors.main}` — never hard-code values that exist in the theme (colors, font sizes, line heights, border radii).
- **Status colors**: use `theme.colors.success`, `error`, `pending` for borders and `successBg`, `errorBg`, `pendingBg` for backgrounds.
- If you need a new color, add it to `theme.tsx` and `styled.d.ts` first — don't inline hex values.
- `fontWeight` only supports `thin`, `normal`, and `bold` — no `light`.

### CSS Conventions
- **Indentation**: tabs (consistent with project Prettier config).
- **Transitions**: `cubic-bezier(0.211, 0.69, 0.313, 1)` for standard UI interactions, `cubic-bezier(0.68, -0.55, 0.27, 1.55)` for spring/bounce effects.
- **Transient props**: use `$` prefix (e.g., `$variant`) per styled-components v6 convention to avoid passing props to the DOM.
- **Media breakpoints**: `768px` (tablet), `512px` (mobile), `475px` (small mobile).
- **`flex-flow` shorthand**: prefer `flex-flow: row nowrap` over separate `flex-direction` + `flex-wrap`.

### Where New Components Go
- Buttons → `buttons.tsx`
- Form inputs, labels, field layouts → `forms.tsx`
- Typography (headings, paragraphs) → `typography.tsx`
- Layout containers, wrappers, panels → `wrappers.tsx`
- Global styles → `globalstyle.tsx`
- Theme definition → `theme.tsx`
- Sample/seed data → `src/samples/`
- Runtime configuration → `src/config/`

## Coding Conventions

### TypeScript / TSX
- Tab indentation, double quotes for strings.
- Named exports for styled-component files; `default export` for page/component files with logic.
- Use `type` keyword for type-only exports (`export type { ... }`).
- Keep page components in `src/pages/`, reusable UI in `src/components/`, config in `src/config/`, sample data in `src/samples/`.
- Avoid creating `features/` directories for styled components or config — those belong in `components/` and `config/` respectively.

### Solidity
- SPDX license header on every file.
- NatSpec comments with `@inheritdoc` for interface implementations.
- `snake_case` for struct fields (OCF convention), `camelCase` for function names.
- Custom errors (e.g., `error InvalidWallet(address)`) over `require` strings where possible.
- Events for all state-changing operations.
- See root `CLAUDE.md` for full Solidity and project conventions.
