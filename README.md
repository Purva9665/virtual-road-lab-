# Virtual Road Lab — Setup & Run Guide

## Quickstart (after extraction)

```bash
bash start.sh
# Open http://localhost:5173
```

## Manual step-by-step

### Terminal 1 — Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Terminal 2 — Frontend
```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173

## Troubleshooting `npm run dev` errors

| Error | Fix |
|---|---|
| `Cannot find module 'vite'` | Run `npm install` first |
| `ENOENT: no such file or directory` | Check you are inside `frontend/` folder |
| Port 5173 in use | Change port in `vite.config.js`: `port: 5174` |
| `ERR_CONNECTION_REFUSED` (backend) | Make sure uvicorn is running on port 8000 |
| `react-unity-webgl` error | Fixed — replaced with Three.js (no Unity dependency) |

## Project structure

```
virtualroadlab/
├── frontend/
│   ├── src/
│   │   ├── App.jsx              ← main app, WebSocket + REST logic
│   │   ├── main.jsx             ← React entry point
│   │   ├── styles.css           ← dark theme
│   │   └── components/
│   │       ├── Header.jsx       ← title bar + Run button
│   │       ├── ControlPanel.jsx ← all scenario sliders/selects
│   │       ├── ViewportPanel.jsx← 3D scene (Three.js / R3F)
│   │       ├── ScenarioSummary.jsx ← results + Chart.js graph
│   │       ├── SliderControl.jsx
│   │       ├── SelectControl.jsx
│   │       └── ToggleControl.jsx
│   ├── vite.config.js
│   ├── index.html
│   └── package.json
├── backend/
│   ├── main.py                  ← FastAPI + physics engine
│   └── requirements.txt
├── start.sh                     ← one-click launcher
└── README.md
```
