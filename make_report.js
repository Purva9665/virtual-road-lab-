const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, Footer, PageBreak
} = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function hdrCell(text, shade) {
  return new TableCell({
    borders, margins: cellMargins,
    width: { size: 9360 / 3, type: WidthType.DXA },
    shading: { fill: shade || "2D3748", type: ShadingType.CLEAR },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 20, font: "Arial" })]
    })]
  });
}

function dataCell(text, shade) {
  return new TableCell({
    borders, margins: cellMargins,
    width: { size: 9360 / 3, type: WidthType.DXA },
    shading: { fill: shade || "FFFFFF", type: ShadingType.CLEAR },
    children: [new Paragraph({ children: [new TextRun({ text: String(text), size: 20, font: "Arial" })] })]
  });
}

function sectionHeading(text, lvl) {
  return new Paragraph({
    heading: lvl || HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 120 },
    children: [new TextRun({ text, bold: true, font: "Arial", size: lvl === HeadingLevel.HEADING_2 ? 26 : 32, color: "1A365D" })]
  });
}

function body(text) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, size: 22, font: "Arial" })]
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text, size: 22, font: "Arial" })]
  });
}

function spacer() {
  return new Paragraph({ spacing: { after: 80 }, children: [new TextRun("")] });
}

// ── Tech stack table ──────────────────────────────────────────────────────────
function techTable(rows, colWidths) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: rows.map((r, i) => new TableRow({
      children: r.map((cell, ci) => new TableCell({
        borders,
        margins: cellMargins,
        width: { size: colWidths[ci], type: WidthType.DXA },
        shading: { fill: i === 0 ? "2D3748" : (i % 2 === 0 ? "F7FAFC" : "FFFFFF"), type: ShadingType.CLEAR },
        children: [new Paragraph({
          children: [new TextRun({
            text: String(cell),
            bold: i === 0,
            color: i === 0 ? "FFFFFF" : "1A1A1A",
            size: 20, font: "Arial"
          })]
        })]
      }))
    }))
  });
}

const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
    }]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "1A365D" },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "2B6CB0" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: "2C5282" },
        paragraph: { spacing: { before: 180, after: 60 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Virtual Road Lab — Project Report  |  Page ", size: 18, color: "888888", font: "Arial" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "888888", font: "Arial" }),
          ]
        })]
      })
    },
    children: [

      // ── Cover ──────────────────────────────────────────────────────────────
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { before: 1200, after: 240 },
        children: [new TextRun({ text: "VIRTUAL ROAD LAB", size: 56, bold: true, font: "Arial", color: "1A365D" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { after: 120 },
        children: [new TextRun({ text: "Accident Prevention Scenario Designer", size: 32, font: "Arial", color: "4A5568" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { after: 80 },
        children: [new TextRun({ text: "Full-Stack Simulation Platform — Technical Report", size: 24, font: "Arial", color: "718096", italics: true })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { after: 1200 },
        children: [new TextRun({ text: "April 2025", size: 22, font: "Arial", color: "9CA3AF" })]
      }),

      // ── 1. Executive Summary ───────────────────────────────────────────────
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "1. Executive Summary", bold: true, size: 32, font: "Arial" })] }),
      body("Virtual Road Lab is a browser-based interactive simulation platform for designing and evaluating road accident-prevention scenarios. Users adjust road geometry parameters (curve radius, lane width), traffic density, weather conditions, and vehicle speed. The system immediately returns physics-based safety metrics: stopping distance, sight distance, time-to-collision (TTC), warning time, safe curve speed, and an overall design safety verdict."),
      body("The platform is built on three integrated layers: a React 18 + Three.js frontend providing a real-time 3D visualisation; a FastAPI Python backend that executes the road-safety physics model; and a WebSocket channel enabling live result streaming. This architecture allows the lab to serve both as a demonstration tool and as a practical sensor-placement decision aid — answering questions such as where to install IR or ultrasonic sensors and how far before a curve a warning system should trigger."),
      spacer(),

      // ── 2. Objectives ─────────────────────────────────────────────────────
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "2. Project Objectives", bold: true, size: 32, font: "Arial" })] }),
      bullet("Allow users to enter road design values (radius, width, banking) and vehicle parameters (speed, count, traffic density)."),
      bullet("Simulate a curved-road scenario with animated vehicles moving at user-selected speeds in real time inside the browser."),
      bullet("Place virtual sensors at configurable positions before the curve and measure whether an approaching vehicle is detected early enough."),
      bullet("Compute and display time-to-collision, alert (warning) time, safe curve speed, stopping distance, sight distance, and a design-acceptability verdict."),
      bullet("Enable the lab to inform real hardware deployment — deciding where to install IR, ultrasonic, or radar sensors and how far before the bend the warning should trigger."),
      bullet("Support preset scenarios (Clear Day, Night Curve, Heavy Rain) for rapid demonstration."),
      spacer(),

      // ── 3. System Architecture ────────────────────────────────────────────
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "3. System Architecture", bold: true, size: 32, font: "Arial" })] }),
      body("The platform follows a three-tier architecture. All tiers communicate asynchronously, with the WebSocket path preferred for low-latency updates and REST as fallback."),
      spacer(),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "3.1 Frontend (React 18 + Three.js)", bold: true, size: 26, font: "Arial" })] }),
      body("The React application is bundled by Vite for fast hot-module replacement during development. Component layout follows a three-column dashboard: a 270 px control panel on the left, a full-height 3D viewport in the centre, and a 250 px results panel on the right."),
      body("The 3D viewport is implemented using React Three Fiber (R3F) — a React renderer for Three.js. It renders a CatmullRom-curve road geometry of configurable radius and width, animated vehicle meshes assigned to main and opposite lanes, a pulsing sensor beacon at the computed pre-curve detection point, and weather particle systems (rain and fog) driven by per-frame position updates."),
      spacer(),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "3.2 Backend (FastAPI + Python physics)", bold: true, size: 26, font: "Arial" })] }),
      body("The backend exposes two endpoints: POST /api/simulate (REST) and ws://host/ws (WebSocket). Both accept identical scenario payloads and return identical result objects. The WebSocket path allows the frontend to stream requests and receive results without HTTP round-trip overhead."),
      body("The physics engine implements AASHTO-standard road-safety formulae in pure Python — no heavy simulation library is required for the core calculations, keeping the backend lightweight and deployable on any Python 3.10+ environment."),
      spacer(),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "3.3 Communication Layer", bold: true, size: 26, font: "Arial" })] }),
      body("On startup the React app attempts a WebSocket connection to ws://127.0.0.1:8000/ws. If the connection succeeds, simulation requests are sent over the socket and results arrive as JSON messages with type: 'sim_result'. If the backend is unavailable, the app falls back transparently to REST POST /api/simulate. A status indicator in the header shows the current connection mode (WS Live vs REST Mode)."),
      spacer(),

      // ── 4. Tech Stack ─────────────────────────────────────────────────────
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "4. Technology Stack", bold: true, size: 32, font: "Arial" })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "4.1 Frontend", bold: true, size: 26, font: "Arial" })] }),
      spacer(),
      techTable([
        ["Library", "Version", "Role"],
        ["React", "18.2", "UI framework — component lifecycle and state"],
        ["Vite", "5.0", "Dev server with HMR; production bundler"],
        ["@react-three/fiber", "8.15", "React renderer for Three.js scene graph"],
        ["@react-three/drei", "9.92", "Helper components: OrbitControls, Text, Environment"],
        ["Three.js", "0.160", "3D engine: geometry, materials, animation loop"],
        ["Chart.js + react-chartjs-2", "4.4 / 5.2", "Distance analysis line chart in results panel"],
        ["Framer Motion", "10.16", "Panel entrance animations and transitions"],
        ["socket.io-client", "4.6", "WebSocket management with auto-reconnect fallback"],
      ], [3120, 1560, 4680]),
      spacer(),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "4.2 Backend", bold: true, size: 26, font: "Arial" })] }),
      spacer(),
      techTable([
        ["Library", "Version", "Role"],
        ["FastAPI", "0.111", "REST + WebSocket server framework"],
        ["Uvicorn", "0.29", "ASGI server (uvicorn main:app --reload --port 8000)"],
        ["Pydantic", "2.7", "Request/response schema validation"],
        ["websockets", "12.0", "Low-level WebSocket transport for FastAPI"],
        ["Python (stdlib)", "3.10+", "math module: all physics calculations"],
      ], [3120, 1560, 4680]),
      spacer(),

      // ── 5. Physics Model ──────────────────────────────────────────────────
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "5. Physics & Safety Model", bold: true, size: 32, font: "Arial" })] }),
      body("All calculations follow AASHTO Green Book (A Policy on Geometric Design of Highways and Streets) stopping-sight distance methodology."),
      spacer(),

      techTable([
        ["Metric", "Formula", "Notes"],
        ["Reaction distance (m)", "v (m/s) x 2.5 s", "AASHTO reaction time = 2.5 s"],
        ["Braking distance (m)", "v^2 / (2g x f)", "f = friction coeff by weather"],
        ["Stopping distance (m)", "Reaction + Braking", "Total required stopping sight distance"],
        ["Sight distance (m)", "R x arccos((R-m)/R) x 2", "Horizontal curve SSD; m = 0.5 x road width"],
        ["Safe curve speed (km/h)", "sqrt((f+e) x g x R) x 3.6", "e = 0.06 superelevation (AASHTO typical)"],
        ["Time to collision (s)", "Stopping dist / v (m/s)", "Simplified worst-case TTC"],
        ["Warning time (s)", "(Stopping x 1.3) / v", "Sensor placed 30% before required stop dist"],
        ["Sensor distance (m)", "Stopping dist x 1.3", "Recommended hardware placement point"],
        ["Design OK", "Sight >= Stop AND Speed <= Safe", "Boolean pass/fail verdict"],
      ], [2600, 3760, 3000]),
      spacer(),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "5.1 Friction Coefficients by Weather", bold: true, size: 26, font: "Arial" })] }),
      spacer(),
      techTable([
        ["Condition", "Friction Coefficient (f)"],
        ["Clear", "0.70"],
        ["Night", "0.60"],
        ["Fog", "0.55"],
        ["Rain", "0.45"],
      ], [4680, 4680]),
      spacer(),

      // ── 6. Key Bug Fixes ──────────────────────────────────────────────────
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "6. Bugs Fixed During Development", bold: true, size: 32, font: "Arial" })] }),
      spacer(),
      techTable([
        ["Bug", "Root Cause", "Fix Applied"],
        ["UnityEmbed defined inside App", "Function component defined inside another component — reinitialised on every render, broke React hook rules", "Moved UnityEmbed out of App; replaced entirely with Three.js viewport"],
        ["react-unity-webgl dependency", "Unity WebGL build files not served correctly; loader path mismatch caused blank viewport", "Replaced Unity with React Three Fiber — no binary assets required"],
        ["npm run dev failing", "package.json scripts entry was 'node src/main.js' (CommonJS Node) instead of 'vite' (dev server)", "Rewrote package.json with correct Vite scripts and all required dependencies"],
        ["Hardcoded API URL", "fetch('http://127.0.0.1:8000/...') blocked by CORS in some environments", "Added Vite proxy config so /api and /ws route through localhost; removed absolute URL"],
        ["Missing WebSocket fallback", "App crashed if backend WS not available", "WebSocket try/catch with transparent REST fallback"],
        ["styles.css .safety-metrics-card inside @media block", "CSS class accidentally nested inside media query — invisible on desktop", "Moved class definition to global scope"],
        ["No Chart.js visualisation", "ScenarioSummary displayed text-only results", "Added react-chartjs-2 Line chart comparing stopping vs sight distances"],
      ], [2600, 3380, 3380]),
      spacer(),

      // ── 7. How to Run ─────────────────────────────────────────────────────
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "7. Setup & Running Instructions", bold: true, size: 32, font: "Arial" })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "7.1 Prerequisites", bold: true, size: 26, font: "Arial" })] }),
      bullet("Node.js 18+ and npm (https://nodejs.org)"),
      bullet("Python 3.10+ and pip"),
      bullet("A modern browser (Chrome, Firefox, Edge) with WebGL support"),
      spacer(),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "7.2 Quickstart (Recommended)", bold: true, size: 26, font: "Arial" })] }),
      body("From the project root folder, run the one-click startup script:"),
      new Paragraph({
        spacing: { after: 120 }, shading: { fill: "1E293B", type: ShadingType.CLEAR },
        children: [new TextRun({ text: "    bash start.sh", font: "Courier New", size: 20, color: "C4E636" })]
      }),
      body("This installs all dependencies if needed, starts FastAPI on port 8000, starts Vite on port 5173, and opens a summary in the terminal."),
      body("Then open your browser to: http://localhost:5173"),
      spacer(),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "7.3 Manual Steps", bold: true, size: 26, font: "Arial" })] }),
      body("Terminal 1 — Backend:"),
      new Paragraph({ spacing: { after: 60 }, shading: { fill: "1E293B", type: ShadingType.CLEAR },
        children: [new TextRun({ text: "    cd backend", font: "Courier New", size: 20, color: "C4E636" })] }),
      new Paragraph({ spacing: { after: 60 }, shading: { fill: "1E293B", type: ShadingType.CLEAR },
        children: [new TextRun({ text: "    pip install -r requirements.txt", font: "Courier New", size: 20, color: "C4E636" })] }),
      new Paragraph({ spacing: { after: 120 }, shading: { fill: "1E293B", type: ShadingType.CLEAR },
        children: [new TextRun({ text: "    uvicorn main:app --reload --port 8000", font: "Courier New", size: 20, color: "C4E636" })] }),
      body("Terminal 2 — Frontend:"),
      new Paragraph({ spacing: { after: 60 }, shading: { fill: "1E293B", type: ShadingType.CLEAR },
        children: [new TextRun({ text: "    cd frontend", font: "Courier New", size: 20, color: "C4E636" })] }),
      new Paragraph({ spacing: { after: 60 }, shading: { fill: "1E293B", type: ShadingType.CLEAR },
        children: [new TextRun({ text: "    npm install", font: "Courier New", size: 20, color: "C4E636" })] }),
      new Paragraph({ spacing: { after: 120 }, shading: { fill: "1E293B", type: ShadingType.CLEAR },
        children: [new TextRun({ text: "    npm run dev", font: "Courier New", size: 20, color: "C4E636" })] }),
      spacer(),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "7.4 Troubleshooting", bold: true, size: 26, font: "Arial" })] }),
      spacer(),
      techTable([
        ["Error / Symptom", "Solution"],
        ["Cannot find module 'vite'", "Run npm install inside the frontend/ folder"],
        ["npm run dev runs but shows blank page", "Check browser console; ensure backend is running for /api calls"],
        ["Port 5173 already in use", "Edit vite.config.js: change port to 5174"],
        ["Backend 'module not found' for fastapi", "Run: pip install -r requirements.txt --break-system-packages"],
        ["3D view is black / no objects", "Your browser may lack WebGL. Try Chrome and enable hardware acceleration"],
        ["'WS Live' never appears in header", "Backend WebSocket endpoint may be unreachable; REST fallback still works"],
      ], [4680, 4680]),
      spacer(),

      // ── 8. Sensor Placement ───────────────────────────────────────────────
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "8. Sensor Placement Guidance", bold: true, size: 32, font: "Arial" })] }),
      body("One of the primary practical outputs of the lab is the sensor_placement_distance value returned after every simulation. This is the recommended distance before the curve start at which a real-world IR, ultrasonic, radar, or camera sensor should be mounted to provide sufficient warning time."),
      body("The formula places the sensor at 1.3 times the computed stopping distance (30% safety margin). The backend also returns warning_time, which tells engineers how many seconds the driver receives between the sensor triggering and the point at which a stop would be required."),
      body("Example: at 60 km/h on a clear day with a 120 m radius curve, the stopping distance is approximately 62 m, so the sensor should be placed at least 80 m before the curve entry. The driver receives approximately 4.7 seconds of warning — sufficient for a lane-change or speed reduction manoeuvre."),
      spacer(),

      // ── 9. Future Work ────────────────────────────────────────────────────
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "9. Future Enhancements", bold: true, size: 32, font: "Arial" })] }),
      bullet("Add road banking/superelevation slider and update sight-distance formula accordingly."),
      bullet("Integrate SUMO (Simulation of Urban MObility) via TraCI Python API for realistic multi-vehicle traffic flow on curved roads."),
      bullet("Add a sensor configuration panel where users place multiple sensors (IR, ultrasonic, camera) interactively on the 3D road."),
      bullet("Export simulation results as a PDF report (jsPDF or server-side WeasyPrint)."),
      bullet("Add vehicle classification (truck, motorcycle, bus) with different braking coefficients."),
      bullet("Implement historical scenario replay — save runs to a local SQLite database and compare outcomes."),
      bullet("Mobile-responsive layout with touch-gesture support for orbit controls."),
      spacer(),

      // ── 10. Conclusion ────────────────────────────────────────────────────
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "10. Conclusion", bold: true, size: 32, font: "Arial" })] }),
      body("Virtual Road Lab successfully demonstrates an end-to-end simulation pipeline for road accident prevention research. The integration of AASHTO stopping-sight distance physics, real-time 3D visualisation, and a WebSocket-connected backend provides both an engaging demonstrator and a practical tool for sensor placement decisions."),
      body("All critical bugs from the original codebase have been resolved: the Unity dependency has been replaced with a browser-native Three.js scene, the package.json has been corrected for Vite, the CSS scoping issue affecting safety metrics on desktop has been fixed, and both WebSocket and REST communication paths are fully operational."),
      body("The project is ready for demonstration and submission."),
      spacer(),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/home/claude/virtualroadlab/VirtualRoadLab_Report.docx', buf);
  console.log('Report written successfully.');
}).catch(e => { console.error(e); process.exit(1); });
