"""
Virtual Road Lab — FastAPI Backend
Physics engine: stopping distance, TTC, warning distance, safe curve speed
WebSocket: real-time simulation results to React frontend
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import math
import json
import asyncio

app = FastAPI(title="Virtual Road Lab API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Pydantic model ─────────────────────────────────────────────────────────────
class ScenarioInput(BaseModel):
    roadRadius: float        # metres
    roadWidth: float         # metres
    vehicleSpeed: float      # km/h
    trafficDensity: str      # low | medium | high
    weatherMode: str         # clear | rain | fog | night
    oppositeTraffic: bool
    vehicleCount: int
    simulationSpeed: float   # multiplier

# ── Physics constants ──────────────────────────────────────────────────────────
REACTION_TIME_S = 2.5  # seconds (AASHTO standard)

FRICTION_COEFFICIENTS = {
    "clear": 0.70,
    "rain":  0.45,
    "fog":   0.55,
    "night": 0.60,
}

DENSITY_HEADWAY = {
    "low":    1.8,   # vehicles per 100 m
    "medium": 3.5,
    "high":   6.0,
}

SENSOR_PLACEMENT_FACTOR = 1.3  # sensor placed 30 % before required warning distance

# ── Core physics functions ─────────────────────────────────────────────────────

def kmh_to_ms(v_kmh: float) -> float:
    return v_kmh / 3.6

def reaction_distance(v_kmh: float) -> float:
    """Distance covered during driver reaction time (m)."""
    return kmh_to_ms(v_kmh) * REACTION_TIME_S

def braking_distance(v_kmh: float, friction: float) -> float:
    """Kinematic braking distance on flat road (m)."""
    v = kmh_to_ms(v_kmh)
    g = 9.81
    return (v ** 2) / (2 * g * friction)

def stopping_distance(v_kmh: float, friction: float) -> float:
    return reaction_distance(v_kmh) + braking_distance(v_kmh, friction)

def available_sight_distance(radius: float, road_width: float) -> float:
    """
    Stopping-sight distance on a horizontal curve (AASHTO).
    SSD = R * arccos((R - m) / R)  where m = lateral clearance ≈ 0.5 * road_width
    """
    m = road_width * 0.5
    if radius <= m:
        return 1.0  # degenerate
    return radius * math.acos((radius - m) / radius) * 2  # full arc

def safe_curve_speed(radius: float, friction: float) -> float:
    """Maximum safe speed for curve based on lateral friction (km/h)."""
    g = 9.81
    e = 0.06  # superelevation (typical)
    v_ms = math.sqrt((friction + e) * g * radius)
    return round(v_ms * 3.6, 1)

def time_to_collision(v_kmh: float, stop_dist: float) -> float:
    """Simplified TTC: time for vehicle to traverse stopping distance."""
    v = kmh_to_ms(v_kmh)
    if v == 0:
        return 99.9
    return round(stop_dist / v, 2)

def warning_time(stop_dist: float, v_kmh: float) -> float:
    """Time for sensor alert to reach driver + react (s)."""
    v = kmh_to_ms(v_kmh)
    sensor_dist = stop_dist * SENSOR_PLACEMENT_FACTOR
    if v == 0:
        return 99.9
    return round(sensor_dist / v, 2)

def sensor_placement_distance(stop_dist: float) -> float:
    """Recommended sensor distance before curve (m)."""
    return round(stop_dist * SENSOR_PLACEMENT_FACTOR, 1)

def risk_level(stop_dist: float, sight_dist: float, density: str) -> str:
    ratio = sight_dist / max(stop_dist, 0.1)
    density_penalty = {"low": 0, "medium": 0.1, "high": 0.25}[density]
    adjusted = ratio - density_penalty
    if adjusted > 1.2:
        return "Low"
    elif adjusted > 0.85:
        return "Medium"
    else:
        return "High"

def run_physics(s: ScenarioInput) -> dict:
    friction   = FRICTION_COEFFICIENTS.get(s.weatherMode, 0.70)
    rd         = round(reaction_distance(s.vehicleSpeed), 2)
    bd         = round(braking_distance(s.vehicleSpeed, friction), 2)
    sd         = round(stopping_distance(s.vehicleSpeed, friction), 2)
    asd        = round(available_sight_distance(s.roadRadius, s.roadWidth), 2)
    safe_spd   = safe_curve_speed(s.roadRadius, friction)
    ttc        = time_to_collision(s.vehicleSpeed, sd)
    wt         = warning_time(sd, s.vehicleSpeed)
    sensor_d   = sensor_placement_distance(sd)
    rl         = risk_level(sd, asd, s.trafficDensity)
    design_ok  = asd >= sd and s.vehicleSpeed <= safe_spd

    # Opposite traffic correction
    if s.oppositeTraffic:
        effective_width = s.roadWidth / 2
        asd_opp = round(available_sight_distance(s.roadRadius, effective_width), 2)
        design_ok = design_ok and (asd_opp >= sd)
    else:
        asd_opp = None

    return {
        "risk_level":               rl,
        "stopping_distance":        sd,
        "reaction_distance":        rd,
        "braking_distance":         bd,
        "available_sight_distance": asd,
        "available_sight_distance_opp": asd_opp,
        "safe_speed":               safe_spd,
        "time_to_collision":        ttc,
        "warning_time":             wt,
        "sensor_placement_distance":sensor_d,
        "design_ok":                design_ok,
        "friction_coefficient":     friction,
        "inputs": {
            "radius":         s.roadRadius,
            "width":          s.roadWidth,
            "speed":          s.vehicleSpeed,
            "weather":        s.weatherMode,
            "density":        s.trafficDensity,
            "opposite":       s.oppositeTraffic,
            "vehicle_count":  s.vehicleCount,
        }
    }

# ── REST endpoint ──────────────────────────────────────────────────────────────
@app.post("/api/simulate")
async def simulate(scenario: ScenarioInput):
    await asyncio.sleep(0.4)  # simulate a small processing delay
    return run_physics(scenario)

@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}

# ── WebSocket endpoint ─────────────────────────────────────────────────────────
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)
            if msg.get("type") == "run_sim":
                payload = msg["payload"]
                s = ScenarioInput(**payload)
                await asyncio.sleep(0.3)
                result = run_physics(s)
                await websocket.send_text(json.dumps({
                    "type": "sim_result",
                    "payload": result,
                }))
    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_text(json.dumps({"type": "error", "message": str(e)}))

# ── Run with: uvicorn main:app --reload --port 8000 ───────────────────────────
