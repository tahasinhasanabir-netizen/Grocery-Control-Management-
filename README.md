# FreshMart - Grocery Shop Billing System

A fully client-side grocery shop billing web application built with vanilla JavaScript, using IndexedDB for data persistence.

## Features

- **Product Catalog** — 37 default products across 7 categories (Staples, Spices, Vegetables, Dairy, Beverages, Snacks, Personal Care) with category tabs and search
- **Billing Interface** — add/remove items, inline quantity editing, customer name/phone, automatic subtotal/tax (5%)/total
- **Discount System** — percentage or fixed amount discount
- **Payment Methods** — Cash, Card, bKash, Nagad, Rocket
- **Stock Tracking** — per-product stock levels, auto-reduction on sale, color-coded badges (green/yellow/red), filter by stock status
- **Product Management** — add/edit/delete products via modal; delete hides default products (restorable) or permanently removes custom ones
- **Icon Picker** — 28 Font Awesome icons with names displayed, selected on add/edit product
- **Bill History** — view and re-print any past bill, clear all history
- **Print Receipt** — 80mm thermal receipt format via CSS `@media print`
- **Today's Stats** — bill count and total sales displayed in header
- **Keyboard Shortcuts** — `Esc` closes modals, `Ctrl+P` prints invoice
- **Toast Notifications** — success/error/info messages for all actions

## Data Persistence

All data is stored in **IndexedDB** (`FreshMartDB`) with three object stores: `products`, `bills`, and `meta`. A localStorage fallback is used if IndexedDB is unavailable.

On first run, 37 default products are auto-seeded. Existing data is migrated on load to fix any outdated icon references.

## Usage

Open `index.html` in any modern browser — no server required.

1. Browse or search products in the left panel
2. Click a product to add it to the bill
3. Adjust quantities, add customer info, apply discount, select payment method
4. Click **Generate Bill** to save and print a receipt
5. View past bills via **History** button

## Files

```
index.html          — Main page layout and modals
css/style.css       — All styling, responsive breakpoints, print layout
js/db.js            — IndexedDB wrapper, schema, CRUD, seeding, migration
js/script.js        — UI logic, rendering, event handlers, keyboard shortcuts
```

### How `js/script.js` works

The file is organized into these functional sections (570 lines total):

| Section | Lines | Purpose |
|---------|-------|---------|
| **State** | 1-4 | Bill items, current category, stock filter |
| **Init** | 7-20 | On DOM ready: opens DB, renders categories/products/bill, starts clock |
| **Date/Time** | 23-31 | Live clock in header |
| **Categories** | 45-59 | Tab bar rendering and switching |
| **Products** | 62-97 | Product card rendering, search/filter logic |
| **Stock** | 99-113 | Stock status helpers (in/low/out) |
| **Bill** | 115-211 | Add/remove/update items, discount calc, subtotal/tax/total |
| **Toast** | 223-233 | Notification messages |
| **Generate Bill** | 236-278 | Builds bill object, saves to DB, shows invoice |
| **Invoice** | 280-322 | Modal display and print |
| **Restore Bar** | 325-334 | Show hidden product count with restore button |
| **Stock Filter** | 337-346 | Tab-based filtering (All / In Stock / Low / Out) |
| **Stock Alert** | 349-363 | Badge in header showing low/out-of-stock count |
| **Today Stats** | 366-372 | Bill count and total sales for today |
| **History** | 375-419 | Bill history list, view, clear all |
| **Icon Picker** | 465-477 | Populates 28 FA icons with names, selection handler |
| **Product Management** | 480-594 | Modal open/close, save/delete/restore products |
| **Keyboard Shortcuts** | 597-609 | Esc closes modals, Ctrl+P prints |

Key flow: `DOMContentLoaded` → `DB.open()` → on ready, `renderProducts()` reads `DB.products` (in-memory cache) and builds HTML. Click events on product cards call `addToBill(id)` which updates the `billItems` object and calls `updateBill()`. `generateBill()` saves to IndexedDB and shows the invoice modal.

## Design System

The entire UI is styled via `css/style.css` (586 lines). Below is a complete breakdown of the visual design.

### Layout

```
┌─────────────────────────────────────────────────────┐
│  HEADER (sticky)  logo | clock | stats | buttons   │
├──────────────────────────┬──────────────────────────┤
│  PRODUCTS PANEL (left)   │  BILLING PANEL (right)   │
│  ┌─ Category Tabs ──┐   │  Customer Name / Phone    │
│  │ All | Staples | ..│   │  ┌─ Bill Items ────────┐ │
│  └──────────────────┘   │  │ item  qty  price   ✕ │ │
│  ┌─ Search Bar ──────┐  │  │ item  qty  price   ✕ │ │
│  │ 🔍 Search products│  │  └──────────────────────┘ │
│  └──────────────────┘   │  Discount: [%] [value]    │
│  ┌─ Stock Filters ──┐   │  Payment: [Cash ▼]        │
│  │ All | In | Low |Out│ │  Subtotal | Discount | Tax│
│  └──────────────────┘   │  TOTAL                     │
│  ┌─ Products Grid ───┐  │  [Generate Bill] [Clear]   │
│  │ [icon] [icon] [..]│  │                           │
│  │ name   name  name │  │  ┌──────────────────────┐ │
│  │ price  price price│  │  │+ Add Product btn     │ │
│  └──────────────────┘   │  └──────────────────────┘ │
│                         │                           │
├──────────────────────────┴──────────────────────────┤
│  Restore Bar (shown when hidden products exist)      │
└─────────────────────────────────────────────────────┘
```

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary green | `#2d7d46` | Header, price text, hover borders, active tabs, selected icon, buttons |
| Dark green | `#1a5a32` | Header gradient end, headings, total price |
| Hover green | `#f0faf3` | Card/row hover background |
| Background | `#f0f2f5` | Page body |
| Card surface | `#f9fafb` | Product cards, form backgrounds |
| Border | `#e8e8e8` / `#ddd` / `#eee` | Cards, inputs, dividers |
| Text primary | `#333` | Body text |
| Text secondary | `#888` / `#999` | Labels, muted text |
| Danger | `#dc2626` | Delete button, out-of-stock badge |
| Danger bg | `#fee8e8` / `#fee2e2` | Out-of-stock badge/alert |
| Warning | `#d97706` | Low-stock badge |
| Warning bg | `#fef3c7` / `#fef7e0` | Low-stock badge, restore bar |
| Success | `#16a34a` | In-stock badge |

### Header (sticky, lines 14-78)

- Green gradient: `linear-gradient(135deg, #2d7d46, #1a5a32)`
- White text, 10px vertical padding, `z-index: 100`
- Left: shop logo icon + title
- Center: date/time display (hidden on mobile)
- Right: stats pill (bills count + sales total), History & Add Product buttons
- Stats pill: `#ffd966` gold icon, white background with 10% opacity overlay

### Product Cards (lines 227-263)

- Auto-fill grid: `grid-template-columns: repeat(auto-fill, minmax(85px, 1fr))`, 7px gap
- Card: `#f9fafb` background, `#e8e8e8` border, 10px radius, centered flex column
- Hover: green border, `#f0faf3` background, lifts `translateY(-2px)`, soft shadow
- Active: returns to flat (`translateY(0)`)
- Icon: 20px, primary green
- Name: 10px bold, `#333`
- Price: 11px bold, primary green `#2d7d46`
- **Out-of-stock**: 45% opacity, grayscale filter, dashed border, not-allowed cursor, no hover effect

### Stock Badges (lines 189-200)

- Small pill badge absolutely positioned at top-left of each product card
- Includes an 8px colored dot + text label
- Colors:
  - In Stock: green dot `#16a34a` on green-tinted bg
  - Low Stock: yellow dot `#d97706` on yellow-tinted bg
  - Out of Stock: red dot `#b91c1c` on red-tinted bg

### Category Tabs (lines 138-178)

- Horizontal scrollable row of button tabs
- Active tab: primary green text + bottom border underline
- Hover: light green background tint
- Each tab shows a Font Awesome icon + category name

### Stock Filter Tabs (lines 180-188)

- Three small filter buttons: All | In Stock | Low | Out
- Active state: primary green background, white text
- Inactive: light gray background, dark text

### Billing Panel (lines 265-399)

- White background, 12px radius, shadow
- **Customer row**: name + phone inputs (80px height green accent strip on left)
- **Bill items list**: each row has item name, price, inline number input for qty, line total, remove button
- **Discount row**: type dropdown (% or fixed) + value input
- **Payment**: dropdown with 5 methods
- **Summary**: subtotal, discount (shown only when applied), tax line, total (large, bold)
- **Action buttons**: Generate Bill (primary green) + Clear (outline)
- **Add Product button**: at the bottom, opens the product modal

### Modals (lines 473-517)

- Overlay: `rgba(0,0,0,.45)`, centered flex, `z-index: 999`
- Content card: white, 480px max-width, 90% width, 14px radius, shadow, fadeIn animation (0.25s)
- Header: icon + title on left, close button (×) on right, bottom border
- Body: form groups with labels, inputs, select dropdowns
- Footer: action buttons aligned right, top border

### Icon Picker (lines 445-464)

- Flex-wrap grid inside the product modal
- Each option: 48px wide, icon (14px) + name label (8px, truncated with ellipsis)
- Hover: green border/text
- Selected: green background, white icon/text

### Product Card Actions (lines 466-479)

- Edit (pencil) and Delete (×) buttons, absolutely positioned top-right
- Hidden by default (`opacity: 0`), appear on card hover (`opacity: 1`)
- Tiny buttons: 18x18px, 9px font, rounded

### Invoice (lines 533-547)

- `'Courier New', monospace` font for receipt style
- Centered header: shop name, address, phone
- Info row: bill number, date, customer, payment
- Table: item | qty | price | total with bottom borders
- Totals: right-aligned, grand total in larger bold text
- Footer: thank you message

### Toast Notifications (lines 402-412 in CSS)

- Fixed bottom-right position, `z-index: 9999`
- Colored left border + icon:
  - Success: green
  - Error: red  
  - Info: blue
- Auto-dismiss after 2.5s with slide-out animation

### Print Styles (lines 549-558)

```css
@media print {
  body * { visibility: hidden; }
  .modal-content * { visibility: visible; }
  .modal-footer, .modal-close, .modal-header { display: none !important; }
  .invoice { max-width: 80mm; margin: 0 auto; }
}
```

- Hides everything except the invoice content
- 80mm width for thermal receipt printers
- No background colors, no shadows, no interactive elements

### Responsive (lines 566-578)

- **900px breakpoint**: grid changes from 2-column to single-column; products panel max-height 300px; smaller header text
- **600px breakpoint**: header wraps to multi-line; bill toolbar buttons wrap

## Tech Stack

- Vanilla JavaScript (ES6)
- IndexedDB (with localStorage fallback)
- Font Awesome 6.5 (free icons)
- No frameworks, no build tools, no server
