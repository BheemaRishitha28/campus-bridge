# CampusBridge — Design System & UI/UX Specification

## 1. Design Language & Brand Identity
CampusBridge follows an enterprise academic SaaS aesthetic: clean typography, generous spacing, refined cards, subtle transitions, and high visual hierarchy.

### Color Tokens
- **Navy Primary**: `#14213D` (Sidebar branding, certificate borders, header typography)
- **Cobalt Blue**: `#2563EB` (Primary CTAs, focus indicators, interactive links)
- **Teal / Emerald**: `#0F9D8A` / `#10B981` (100% Cleared status, verified seals, success feedback)
- **Light Background**: `#F5F7FB`
- **Light Border**: `#E2E8F0`
- **Dark Background**: `#0B1220`
- **Dark Surface**: `#111C30`
- **Dark Border**: `#1E293B`

## 2. Complete Dual Theme System (Section 6)
- The theme toggle updates all pages, modals, forms, tables, dropdowns, charts, notifications, and sidebar components.
- State is persisted in `localStorage('campusbridge_theme')` and reflected on `document.documentElement.classList`.
- Eliminates theme flashes on page load.
- Uses accessible color contrast ratios (> 4.5:1) compliant with WCAG 2.1 AA.

## 3. Typography & Iconography
- **Font**: Inter, system sans-serif fallback.
- **Icons**: Lucide React.
- **Hierarchy**:
  - Hero Headline: 48px – 60px Bold
  - Page Titles: 24px – 28px ExtraBold
  - Card Titles: 16px – 18px Bold
  - Body Text: 12px – 14px Regular
  - Data Labels & Badges: 10px – 11px Bold Uppercase with tracking

## 4. Responsive Breakpoints
- **Mobile (< 768px)**: Collapsible sidebar drawer with backdrop, scrollable data tables, responsive KPI cards (2-column grid).
- **Tablet (768px – 1024px)**: 2-column dashboard layout, full table headers.
- **Desktop (> 1024px)**: Fixed 256px sidebar, 3-column analytics and operational grid, full analytical preview.
