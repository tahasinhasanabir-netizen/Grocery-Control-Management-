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

## Tech Stack

- Vanilla JavaScript (ES6)
- IndexedDB (with localStorage fallback)
- Font Awesome 6.5 (free icons)
- No frameworks, no build tools, no server
