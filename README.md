<img width="1280" height="800" alt="Linkedin-Feature" src="https://github.com/user-attachments/assets/015de388-76c5-492f-92b1-36fbecc370e6" />

# Foxtocks Dashboard

A clean, modern stock portfolio dashboard UI built with **HTML, CSS, and vanilla JavaScript**.  
Foxtocks focuses on a polished layout, smooth interactions, and lightweight SVG-based chart rendering—ideal for portfolio tracking, watchlists, market snapshots, and analytics-style dashboards.

---

## Overview

Foxtocks is a front-end dashboard template that includes:

- **Sidebar navigation** with a compact brand identity and quick menu access
- **My Stocks** horizontal carousel with mini sparklines
- **Balance** summary card with top stock highlight
- **Market** chart with exchange tabs and time-range switching
- **Snapshot** panel with day range and 52-week range indicators
- **Portfolio Analytics** chart with hover tooltip + guide line
- **Watchlist** list with quick-glance price changes
- **Mobile-friendly off-canvas sidebar** with overlay support

This project is designed as a **UI showcase** and can be easily connected to real market APIs later.

---

## Tech Stack

- **HTML5**
- **CSS3 (custom properties / responsive layout)**
- **Vanilla JavaScript**
- **Inline SVG charts** (no external chart libraries)
- **Google Fonts (Plus Jakarta Sans)**

---

## Features

- **SVG Sparklines** per stock card (seeded series for consistent visuals)
- **Interactive Market Chart**
  - Market tabs (NASDAQ, SSE, Euronext, BSE)
  - Range switching (1D, 5D, 1M, 6M, 1Y)
- **Analytics Chart**
  - Hover tooltip with formatted time
  - Vertical hover line + active dot indicator
  - Range switching (1D → Max)
- **Responsive Design**
  - Collapsing grids across breakpoints
  - Off-canvas sidebar on mobile
  - Scroll-friendly stock carousel

---

## Project Structure

```bash
foxtocks-dashboard/
├─ index.html
├─ css/
│  └─ style.css
├─ js/
│  └─ custom.js
└─ images/
   ├─ fox.png
   ├─ blub.png
   ├─ arrow-right.png
   ├─ arrow-right-2.png
   ├─ arrow-down.png
   └─ (company logos...)
