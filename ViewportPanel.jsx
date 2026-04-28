import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Text } from '@react-three/drei'
import * as THREE from 'three'

// ── Road geometry ─────────────────────────────────────────────────────────────
function CurvedRoad({ radius, width }) {
  const segments = 80
  const angle = Math.PI * 1.4 // ~252° arc

  const roadGeometry = useMemo(() => {
    const points = []
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * angle - angle / 2
      points.push(new THREE.Vector3(Math.cos(t) * radius, 0, Math.sin(t) * radius))
    }
    const curve = new THREE.CatmullRomCurve3(points)
    return new THREE.TubeGeometry(curve, segments, width / 2, 8, false)
  }, [radius, width])

  const lineGeometry = useMemo(() => {
    const points = []
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * angle - angle / 2
      points.push(new THREE.Vector3(Math.cos(t) * radius, 0.02, Math.sin(t) * radius))
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [radius])

  return (
    <group>
      {/* Road surface */}
      <mesh geometry={roadGeometry} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>
      {/* Centre dashed line */}
      <line geometry={lineGeometry}>
        <lineBasicMaterial color="#f5c518" linewidth={2} />
      </line>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[radius * 3, radius * 3]} />
        <meshStandardMaterial color="#2d5a1b" roughness={1} />
      </mesh>
    </group>
  )
}

// ── Animated vehicle ──────────────────────────────────────────────────────────
function Vehicle({ radius, speed, offset = 0, color = '#c4e636', opposite = false, index = 0 }) {
  const ref = useRef()
  const angle = useRef(offset)
  const totalAngle = Math.PI * 1.4
  const dir = opposite ? -1 : 1

  useFrame((_, delta) => {
    if (!ref.current) return
    const angularSpeed = (speed / 3.6) / radius  // m/s → rad/s
    angle.current += dir * angularSpeed * delta
    const t = (angle.current % totalAngle) - totalAngle / 2
    const lane = opposite ? radius + 0.8 : radius - 0.8
    ref.current.position.set(Math.cos(t) * lane, 0.3, Math.sin(t) * lane)
    // Face tangent
    const tangent = new THREE.Vector3(-Math.sin(t) * dir, 0, Math.cos(t) * dir)
    ref.current.lookAt(ref.current.position.clone().add(tangent))
  })

  return (
    <group ref={ref}>
      {/* Body */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1.8, 0.5, 0.9]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0.1, 0.6, 0]}>
        <boxGeometry args={[0.9, 0.35, 0.8]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.5} />
      </mesh>
      {/* Headlights */}
      <pointLight position={[0.9, 0.3, 0]} intensity={0.4} color="#fffde7" distance={6} />
    </group>
  )
}

// ── Sensor beacon ─────────────────────────────────────────────────────────────
function SensorBeacon({ radius, angle }) {
  const meshRef = useRef()
  useFrame(({ clock }) => {
    if (meshRef.current) meshRef.current.material.opacity = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 3)
  })
  const x = Math.cos(angle) * (radius + 0.2)
  const z = Math.sin(angle) * (radius + 0.2)
  return (
    <group position={[x, 0, z]}>
      <mesh ref={meshRef} position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff2222" emissiveIntensity={1} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
        <meshStandardMaterial color="#888" />
      </mesh>
    </group>
  )
}

// ── Weather overlay ───────────────────────────────────────────────────────────
function WeatherFx({ mode }) {
  const count = 300
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 40
      arr[i * 3 + 1] = Math.random() * 20
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40
    }
    return arr
  }, [])

  const ref = useRef()
  useFrame((_, delta) => {
    if (!ref.current) return
    const pos = ref.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= delta * (mode === 'rain' ? 18 : 3)
      if (pos[i * 3 + 1] < 0) pos[i * 3 + 1] = 20
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  if (mode !== 'rain' && mode !== 'fog') return null
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={mode === 'rain' ? '#aaddff' : '#cccccc'} size={mode === 'rain' ? 0.08 : 0.3} transparent opacity={0.6} />
    </points>
  )
}

// ── Main viewport ─────────────────────────────────────────────────────────────
function ViewportPanel({ scenario }) {
  const { roadRadius, roadWidth, vehicleSpeed, vehicleCount, weatherMode, oppositeTraffic, simulationSpeed } = scenario

  const vehicleColors = ['#c4e636', '#36c4e6', '#e636c4', '#e6a836', '#36e6a8']
  const mainCount = Math.max(1, Math.min(Math.ceil(vehicleCount * 0.7), 8))
  const oppCount  = oppositeTraffic ? Math.max(1, Math.min(Math.ceil(vehicleCount * 0.3), 4)) : 0

  const bgColor = weatherMode === 'night' ? '#050510' : weatherMode === 'fog' ? '#9aa0a6' : '#1a2a3a'
  const fogNear = weatherMode === 'fog' ? 10 : weatherMode === 'night' ? 30 : 80
  const fogFar  = weatherMode === 'fog' ? 30 : weatherMode === 'night' ? 60 : 150

  // Sensor placed ~30° before curve start
  const sensorAngle = -Math.PI * 1.4 / 2 - 0.3

  return (
    <section className="panel">
      <h2 className="panel-title">3D View</h2>
      <div className="viewport-3d" style={{ height: '360px' }}>
        <Canvas
          camera={{ position: [0, roadRadius * 0.8, roadRadius * 1.1], fov: 55 }}
          style={{ background: bgColor }}
          shadows
        >
          <fog attach="fog" args={[bgColor, fogNear, fogFar]} />

          <ambientLight intensity={weatherMode === 'night' ? 0.08 : 0.5} />
          <directionalLight
            position={[50, 80, 30]}
            intensity={weatherMode === 'night' ? 0.05 : 0.9}
            castShadow
          />
          {weatherMode === 'night' && (
            <>
              <pointLight position={[0, 10, 0]} intensity={1.5} color="#fffde7" distance={roadRadius * 2} />
              <pointLight position={[roadRadius, 8, 0]} intensity={1.2} color="#fffde7" distance={roadRadius * 1.5} />
            </>
          )}

          <CurvedRoad radius={roadRadius} width={roadWidth} />

          {Array.from({ length: mainCount }, (_, i) => (
            <Vehicle
              key={`main-${i}`}
              radius={roadRadius}
              speed={vehicleSpeed * simulationSpeed}
              offset={(i / mainCount) * Math.PI * 1.2}
              color={vehicleColors[i % vehicleColors.length]}
            />
          ))}
          {Array.from({ length: oppCount }, (_, i) => (
            <Vehicle
              key={`opp-${i}`}
              radius={roadRadius}
              speed={vehicleSpeed * simulationSpeed * 0.85}
              offset={(i / Math.max(oppCount, 1)) * Math.PI * 1.0}
              color="#f97373"
              opposite
              index={i}
            />
          ))}

          <SensorBeacon radius={roadRadius} angle={sensorAngle} />

          <WeatherFx mode={weatherMode} />

          <OrbitControls
            target={[0, 0, 0]}
            minDistance={roadRadius * 0.3}
            maxDistance={roadRadius * 2.5}
            maxPolarAngle={Math.PI / 2.1}
          />
        </Canvas>
      </div>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '6px 0 0', textAlign: 'center' }}>
        🟡 Main traffic &nbsp;|&nbsp; 🔴 Opposite traffic &nbsp;|&nbsp; 🔴 Sensor beacon &nbsp;|&nbsp; Drag to orbit
      </p>
    </section>
  )
}

export default ViewportPanel
