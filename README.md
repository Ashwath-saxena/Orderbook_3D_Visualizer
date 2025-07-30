# Orderbook Depth 3D Visualizer

Frontend Developer Assignment – GoQuant

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup & Run Instructions](#setup--run-instructions)
- [Architecture & Code Structure](#architecture--code-structure)
- [APIs & Data Sources](#apis--data-sources)
- [Assumptions & Design Decisions](#assumptions--design-decisions)
- [Known Limitations & Future Improvements](#known-limitations--future-improvements)
- [Testing](#testing)
- [How to Use](#how-to-use)
- [Demo Video](#demo-video)
- [Contact](#contact)

---

## Project Overview

A **real-time interactive 3D visualization** of cryptocurrency orderbooks, showcasing market depth by price (X-axis), quantity (Y-axis), and time (Z-axis). This app aggregates live orderbook data from Binance, OKX, and Bybit, identifies pressure zones, and visualizes historic and current market liquidity in an immersive 3D space.

---

## Features

- **3D Orderbook Visualization:** Real-time bids (green) and asks (red) as 3D bars, with rotation, zoom, and pan.
- **Pressure Zone Analysis:** Detect and visually emphasize high-probability support/resistance zones, with pulsating/glowing animations and contextual tooltips.
- **Venue Filtering:** Select/deselect venues with immediate feedback and venue-specific coloring.
- **Order Flow Visualization:** Animated streams reflect inbound/canceled orders.
- **Volume Profile Overlay:** Side-on histogram for cumulative volume at each price.
- **Advanced Controls:** Time range, quantity threshold, price-level search, and visualization mode toggles.
- **Dark/Light Theme:** UI and 3D scene respond to global theme setting.
- **Export Functionality:** Download recent orderbook + statistics as a `.json` report.
- **Responsive Design:** Works on desktop and mobile, with dedicated mobile controls.
- **Performance Optimizations:** Maintains smooth 60fps rendering even with high update rates.
- **Robust Error Handling:** Connection feedback, loading indicators, and reconnection logic.

---

## Tech Stack

- **Frontend:** Next.js 13+, React 18, TypeScript
- **3D Graphics:** Three.js (via react-three-fiber), @react-three/drei, @react-three/postprocessing
- **State Management:** Zustand
- **Styling:** Tailwind CSS
- **Animations:** react-spring, Framer Motion
- **API Integration:** REST & WebSocket via Next.js serverless proxy routes
- **Other:** @use-gesture/react for touch, utility libraries for formatting

---

## Setup & Run Instructions

### Prerequisites

- Node.js v16+  
- npm (or yarn)

### Steps

git clone https://github.com/Ashwath-saxena/Orderbook_3D_Visualizer.git
cd Orderbook_3D_Visualizer
npm install
npm run dev

=> Open [http://localhost:3000](http://localhost:3000) in your browser.

_No environment variables required for this demo; all exchange APIs are accessed via Next.js back-end proxies._

---

## Architecture & Code Structure

src/
├── app/                  # Next.js entry and server API routes
│   ├── api/              # Proxy endpoints for exchanges (REST & WS)
│   └── page.tsx
├── components/
│   ├── 3d/               # Core 3D scene, animations, mesh layers
│   ├── controls/         # Cross-platform control panels
│   ├── mobile/           # Mobile-specific UI overlays & controls
│   ├── ui/               # Shared UI: loading, error, boundaries
├── lib/
│   ├── api/              # Exchange API clients & fetch utilities
│   ├── utils/            # Domain/business logic (pressure zone algos)
│   ├── types/            # All TypeScript data models
├── stores/               # Zustand state
└── styles/               # Tailwind config & custom global styles


- Exchange data is always proxied server-side to avoid CORS and for easy scaling.
- 3D scene is declaratively described with react-three-fiber for best reactivity and composability.
- All user controls and theme settings are stored in Zustands's global store for instant reactivity.

---

## APIs & Data Sources

- **Binance:** [REST + WebSocket] Live orderbook snapshots and updates
- **OKX:** [REST + WS] Orderbook book depth for BTC-USDT and related pairs
- **Bybit:** [REST + WS] Spot orderbook streaming and retrieval

_All API traffic is routed through backend Next.js API endpoints for reliability and security._

---

## Assumptions & Design Decisions

- **Polling:** Real-time updates are polled every 2–3 seconds to balance rate limits and performance; can be configured.
- **Server Proxy:** All API requests run through Next.js API routes to sidestep browser CORS and keep API keys/server secrets (if ever needed) safe.
- **Pressure Zones:** Are based on aggregate volume, frequency, and persistence in the recent orderbook window (~30–50 snapshots).
- **UI/UX:** Prioritized clarity and responsiveness for both desktop and mobile; theme toggling is instantaneous.
- **Export:** Analysis and all displayed data can be exported for off-line research as `.json`.

---

## Known Limitations & Future Improvements

- Machine Learning-based pressure zone forecasting is out of scope for this demo, but the structure supports plug-in models.
- Further venue expansion (Kraken, KuCoin, Deribit) is trivial via the modular backend architecture.
- Custom touch gestures can be improved further for advanced mobile interactions.
- Some edge-case UI error screens could be expanded.

---

## Testing

- Unit and integration tests exist for pressure zone algorithm and control logic.
- Manually tested for connection loss, server/API errors, and rapid venue toggling.
- Cross-browser and mobile device tested (Chrome, Firefox, Safari, Android, iOS).

---

## How to Use

- **Start the application:** Wait for live data “connected” status in the UI.
- **Visualize:** Watch real-time 3D bars update and rotate.
- **Filter:** Choose/deselect venues, time ranges, set quantity threshold, and search price levels.
- **Toggle:** Pressure zone overlays, dark/light theme, animation modes.
- **Export:** Save recent orderbook data and stats for external analysis.
- **Mobile:** Use bottom panel for touch-optimized controls.
- **Interact:** Zoom, pan, and rotate with mouse or touch to explore depth.

---

## Demo Video

[[Insert your Loom, YouTube, or Google Drive link here]](https://drive.google.com/file/d/14IfseyM7oHgmkdGEKcV2MnoUWqqepEQV/view?usp=sharing)

---

## Contact

- **Developer:** Ashwath Saxena
- **Email:** work.ashwathsaxena.as@gmail.com
- **GitHub:** [https://github.com/yourusername/orderbook-depth-3d-visualizer](https://github.com/Ashwath-saxena/Orderbook_3D_Visualizer.git)

---

Thank you for reviewing this assignment! I’m excited about the prospect of joining GoQuant and contributing to innovative financial technology projects.

---
