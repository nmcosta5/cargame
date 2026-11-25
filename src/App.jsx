import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Gauge, Pause, Play, RotateCcw, Volume2, VolumeX, Zap } from 'lucide-react'

const LANES = [-3.65, 0, 3.65]
const BEST_KEY = 'apex-run-r3f-best'

function CarModel({ color = '#c8ff4d', player = false }) {
  const wheels = [-1, 1].flatMap(x => [-1, 1].map(z => [x * 0.88, -0.24, z * 0.94]))
  return (
    <group>
      <mesh castShadow position={[0, 0.38, 0]}>
        <boxGeometry args={[1.72, 0.48, 3.25]} />
        <meshStandardMaterial color={color} metalness={0.72} roughness={0.24} />
      </mesh>
      <mesh castShadow position={[0, 0.72, -0.18]}>
        <boxGeometry args={[1.42, 0.58, 1.62]} />
        <meshPhysicalMaterial color="#18252c" metalness={0.48} roughness={0.12} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0.74, -0.18]}>
        <boxGeometry args={[1.28, 0.38, 1.48]} />
        <meshStandardMaterial color="#4c7680" metalness={0.65} roughness={0.16} transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, 0.18, 1.62]}>
        <boxGeometry args={[1.56, 0.13, 0.08]} />
        <meshStandardMaterial color={player ? '#f4fff0' : '#ff3e35'} emissive={player ? '#c9ff8a' : '#ff170d'} emissiveIntensity={2.2} />
      </mesh>
      {player && <mesh position={[0, 0.19, -1.62]}><boxGeometry args={[1.5, 0.12, 0.08]} /><meshStandardMaterial color="#d9ff7d" emissive="#bfff4b" emissiveIntensity={1.6} /></mesh>}
      {wheels.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]} rotation={[0, 0, Math.PI / 2]}>
          <mesh castShadow><cylinderGeometry args={[0.34, 0.34, 0.22, 18]} /><meshStandardMaterial color="#090d10" roughness={0.88} /></mesh>
          <mesh rotation={[0, 0, 0]} position={[0, 0.116, 0]}><cylinderGeometry args={[0.19, 0.19, 0.018, 16]} /><meshStandardMaterial color="#9ca9ad" metalness={0.9} roughness={0.25} /></mesh>
        </group>
      ))}
      {player && <group position={[0, 0.15, -1.76]}><mesh rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.17, 0.7, 12]} /><meshBasicMaterial color="#a7efff" transparent opacity={0.65} /></mesh></group>}
      <mesh position={[0, 0.19, -1.52]}><boxGeometry args={[1.2, 0.08, 0.12]} /><meshStandardMaterial color="#10171a" metalness={0.7} /></mesh>
    </group>
  )
}

function Roadside() {
  const items = useMemo(() => Array.from({ length: 48 }, (_, i) => ({
    z: -i * 4.2 - 4,
    side: i % 2 ? 1 : -1,
    x: 8.5 + (i % 4) * 1.9,
    scale: 0.75 + (i % 5) * 0.12,
  })), [])
  return <group>
    {items.map((item, i) => <group key={i} position={[item.side * item.x, 0, item.z]} scale={item.scale}>
      <mesh position={[0, 1.25, 0]} castShadow><cylinderGeometry args={[0.12, 0.2, 2.5, 7]} /><meshStandardMaterial color="#4b3b2e" /></mesh>
      <mesh position={[0, 2.75, 0]} castShadow><coneGeometry args={[1.05, 2.7, 7]} /><meshStandardMaterial color={i % 3 ? '#183b32' : '#254b3a'} roughness={0.95} /></mesh>
      <mesh position={[0, 3.55, 0]}><coneGeometry args={[0.72, 1.9, 7]} /><meshStandardMaterial color="#315c43" roughness={0.95} /></mesh>
    </group>)}
  </group>
}

function Road() {
  const dashes = useMemo(() => Array.from({ length: 34 }, (_, i) => -i * 6), [])
  const lights = useMemo(() => Array.from({ length: 26 }, (_, i) => -i * 8 - 2), [])
  return <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, -78]} receiveShadow>
      <planeGeometry args={[260, 220]} /><meshStandardMaterial color="#182b27" roughness={1} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -78]} receiveShadow>
      <planeGeometry args={[12.2, 220]} /><meshStandardMaterial color="#30383d" roughness={0.9} />
    </mesh>
    {[-6.15, 6.15].map(x => <mesh key={x} position={[x, 0.04, -78]}><boxGeometry args={[0.18, 0.08, 220]} /><meshStandardMaterial color="#d7d0b6" /></mesh>)}
    {[-2, 2].map(x => dashes.map((z, i) => <mesh key={x + '-' + i} position={[x, 0.035, z]}><boxGeometry args={[0.075, 0.035, 2.7]} /><meshBasicMaterial color="#d8ded5" /></mesh>))}
    {lights.map((z, i) => [-1, 1].map(side => <group key={i + '-' + side} position={[side * 7.8, 0, z]}>
      <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[0.055, 0.08, 3, 8]} /><meshStandardMaterial color="#647178" metalness={0.7} /></mesh>
      <mesh position={[-side * 0.38, 3, 0]}><boxGeometry args={[0.9, 0.1, 0.18]} /><meshStandardMaterial color="#7d8a8e" metalness={0.7} /></mesh>
    </group>))}
    <Roadside />
  </group>
}

function TrafficCar({ car }) {
  const group = useRef()
  useFrame(() => {
    if (group.current) {
      group.current.position.x = LANES[car.lane]
      group.current.position.z = car.z
    }
  })
  return <group ref={group} scale={0.82}><CarModel color={car.color} /></group>
}

function GameWorld({ active, controls, onStats, onCrash, boost, setBoost }) {
  const player = useRef()
  const traffic = useRef([])
  const { camera } = useThree()
  const elapsed = useRef(0)
  const report = useRef(0)
  const distance = useRef(0)
  const points = useRef(0)
  const speed = useRef(0)
  const nitro = useRef(100)
  const playerX = useRef(0)
  const laneTraffic = useMemo(() => Array.from({ length: 11 }, (_, i) => ({
    id: i, lane: (i * 7 + 1) % 3, z: -18 - i * 15.5,
    color: ['#d95042', '#e1e5e2', '#3986a8', '#d4a13f', '#7864a7', '#202a31'][i % 6],
    speed: 0.78 + (i % 4) * 0.075, near: false,
  })), [])
  if (traffic.current.length === 0) traffic.current = laneTraffic
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.04)
    if (!active) return
    elapsed.current += dt
    const input = controls.current
    const accelerating = input.gas || input.up
    const braking = input.brake || input.down
    const usingNitro = (input.nitro || boost) && nitro.current > 0
    const target = accelerating ? 1 : braking ? 0.18 : 0.68
    speed.current = THREE.MathUtils.damp(speed.current, target, accelerating ? 1.8 : 1.05, dt)
    if (usingNitro) {
      nitro.current = Math.max(0, nitro.current - 32 * dt)
      speed.current = Math.min(1.42, speed.current + dt * 0.75)
    } else nitro.current = Math.min(100, nitro.current + 10 * dt)
    const steer = (input.right ? 1 : 0) - (input.left ? 1 : 0)
    playerX.current = THREE.MathUtils.clamp(playerX.current + steer * dt * (5.5 + speed.current * 2.5), -4.6, 4.6)
    if (player.current) {
      player.current.position.x = THREE.MathUtils.damp(player.current.position.x, playerX.current, 10, dt)
      player.current.rotation.z = THREE.MathUtils.damp(player.current.rotation.z, -steer * 0.13, 8, dt)
      player.current.position.y = 0.04 + Math.sin(elapsed.current * 12) * 0.018
    }
    const flow = (13 + speed.current * 25) * dt
    distance.current += speed.current * dt * 0.052
    points.current += speed.current * dt * (usingNitro ? 42 : 25)
    traffic.current.forEach(car => {
      car.z += flow * car.speed
      if (car.z > 13) {
        car.z = -145 - Math.random() * 65
        car.lane = Math.floor(Math.random() * 3)
        car.near = false
      }
      const dx = Math.abs(LANES[car.lane] - playerX.current)
      const dz = Math.abs(car.z - 3.4)
      if (dx < 1.55 && dz < 2.35) onCrash()
      if (dx < 2.45 && dx > 1.55 && dz < 1.4 && !car.near) {
        car.near = true
        points.current += 220
      }
    })
    camera.position.x = THREE.MathUtils.damp(camera.position.x, playerX.current * 0.25, 2.5, dt)
    camera.position.y = 5.4 + (usingNitro ? 0.18 : 0)
    camera.position.z = 10.8
    camera.lookAt(playerX.current * 0.12, 0.2, -8.5)
    report.current += dt
    if (report.current > 0.09) {
      report.current = 0
      onStats({ speed: Math.round(speed.current * 228), distance: distance.current, score: Math.floor(points.current), nitro: nitro.current, gear: Math.max(1, Math.min(6, Math.ceil(speed.current * 4.2))), boosting: usingNitro })
    }
  })
  return <>
    <color attach="background" args={['#91a7a5']} />
    <fog attach="fog" args={['#91a7a5', 35, 155]} />
    <ambientLight intensity={1.15} />
    <hemisphereLight args={['#dceeff', '#263b32', 1.5]} />
    <directionalLight position={[-12, 18, 10]} intensity={3.2} castShadow shadow-mapSize={[2048, 2048]} />
    <spotLight position={[0, 12, 1]} intensity={2.5} angle={0.45} penumbra={0.8} distance={35} color="#e9ffd0" />
    <Stars radius={100} depth={45} count={700} factor={2} saturation={0} fade speed={0.15} />
    <Road />
    {traffic.current.map(car => <TrafficCar key={car.id} car={car} />)}
    <group ref={player} position={[0, 0, 3.4]}><CarModel player /></group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.095, 0]}><planeGeometry args={[12, 220]} /><meshBasicMaterial color="#000" transparent opacity={0.001} /></mesh>
    {boost && <pointLight position={[0, 1, 4]} color="#aaff58" intensity={3} distance={8} />}
  </>
}

function Stat({ label, children, align = 'left' }) {
  return <div className={`stat-block ${align}`}><span className="stat-label">{label}</span><div className="stat-value">{children}</div></div>
}

export default function App() {
  const [screen, setScreen] = useState('menu')
  const [stats, setStats] = useState({ speed: 0, distance: 0, score: 0, nitro: 100, gear: 1 })
  const [best, setBest] = useState(() => Number(localStorage.getItem(BEST_KEY) || 0))
  const [sound, setSound] = useState(true)
  const [boost, setBoost] = useState(false)
  const controls = useRef({ left: false, right: false, gas: false, brake: false, up: false, down: false, nitro: false })
  const audio = useRef(null)
  const started = screen === 'playing'

  const beep = useCallback((frequency = 440, duration = 0.12) => {
    if (!sound) return
    try {
      audio.current ||= new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audio.current.createOscillator()
      const gain = audio.current.createGain()
      oscillator.frequency.value = frequency
      oscillator.type = 'triangle'
      gain.gain.setValueAtTime(0.045, audio.current.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, audio.current.currentTime + duration)
      oscillator.connect(gain); gain.connect(audio.current.destination)
      oscillator.start(); oscillator.stop(audio.current.currentTime + duration)
    } catch {}
  }, [sound])

  const begin = useCallback(() => {
    controls.current = { left: false, right: false, gas: false, brake: false, up: false, down: false, nitro: false }
    setStats({ speed: 0, distance: 0, score: 0, nitro: 100, gear: 1 })
    setBoost(false); setScreen('playing'); beep(520, 0.16)
  }, [beep])

  const crash = useCallback(() => {
    setScreen(current => {
      if (current !== 'playing') return current
      const nextBest = Math.max(best, stats.score)
      if (nextBest > best) { localStorage.setItem(BEST_KEY, String(nextBest)); setBest(nextBest) }
      beep(115, 0.3)
      return 'over'
    })
  }, [best, beep, stats.score])

  useEffect(() => {
    const map = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ' ': 'nitro' }
    const down = e => {
      if (map[e.key]) { e.preventDefault(); controls.current[map[e.key]] = true }
      if ((e.key === 'p' || e.key === 'Escape') && screen === 'playing') setScreen('paused')
      else if ((e.key === 'p' || e.key === 'Escape') && screen === 'paused') setScreen('playing')
      if (e.key === 'Enter' && screen !== 'playing') begin()
    }
    const up = e => { if (map[e.key]) { controls.current[map[e.key]] = false } }
    window.addEventListener('keydown', down); window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [screen, begin])

  useEffect(() => {
    if (screen !== 'playing') controls.current = { left: false, right: false, gas: false, brake: false, up: false, down: false, nitro: false }
  }, [screen])

  const bindControl = (key, value) => e => { e.preventDefault(); controls.current[key] = value }
  const togglePause = () => setScreen(s => s === 'playing' ? 'paused' : s === 'paused' ? 'playing' : s)
  const toggleSound = () => { setSound(v => !v); if (!sound) beep(600, 0.08) }

  return <main className="app-shell">
    <div className="scene"><Canvas shadows dpr={[1, 1.65]} camera={{ position: [0, 5.4, 10.8], fov: 57 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
      <GameWorld active={started} controls={controls} onStats={setStats} onCrash={crash} boost={boost} setBoost={setBoost} />
    </Canvas></div>
    <div className="vignette" />
    <header className="topbar">
      <div className="brand"><div className="brand-mark">A</div><div><b>APEX RUN</b><small>HIGHWAY SERIES / 03</small></div></div>
      <div className="top-right"><span className="mode-tag"><i /> 3D ARCADE</span><span className="best-tag">BEST <b>{String(best).padStart(6, '0')}</b></span>
        <button className="icon-button" onClick={toggleSound} aria-label="Toggle sound">{sound ? <Volume2 size={17} /> : <VolumeX size={17} />}</button>
        {screen === 'playing' && <button className="icon-button" onClick={togglePause} aria-label="Pause"><Pause size={17} /></button>}
      </div>
    </header>

    <section className={`game-hud ${started ? 'visible' : ''}`}>
      <Stat label="VELOCITY"><span>{String(stats.speed).padStart(3, '0')}</span><em>KM/H</em></Stat>
      <div className="hud-center"><span className="hud-score-label">RUN SCORE</span><strong>{String(stats.score).padStart(6, '0')}</strong><span className="gear-label">GEAR <b>{stats.gear}</b></span></div>
      <div className="hud-right"><Stat label="DISTANCE" align="right"><span>{stats.distance.toFixed(2)}</span><em>KM</em></Stat><div className="nitro-meter"><div className="nitro-head"><Zap size={12} /> NITRO <b>{Math.round(stats.nitro)}%</b></div><div className="nitro-track"><i style={{ width: `${stats.nitro}%` }} /></div></div></div>
    </section>

    {screen === 'menu' && <section className="screen-layer"><div className="intro-panel">
      <div className="eyebrow"><span /> THE NEXT LEVEL OF THE OPEN ROAD</div>
      <h1>CHASE<br /><i>THE</i> <strong>HORIZON.</strong></h1>
      <p>A full-throttle 3D highway run. Weave through traffic, master every lane and unleash your boost. The road doesn't wait.</p>
      <div className="panel-actions"><button className="primary-cta" onClick={begin}>START YOUR ENGINE <span>↗</span></button><div className="control-hint">WASD / ARROWS <span>·</span> SPACE TO BOOST</div></div>
      <div className="intro-foot"><div><b>{String(best).padStart(6, '0')}</b><small>PERSONAL BEST</small></div><div><b>3D</b><small>REAL-TIME WORLD</small></div><div><b>∞</b><small>ENDLESS ROAD</small></div></div>
    </div></section>}

    {screen === 'paused' && <section className="screen-layer"><div className="dialog-panel"><span className="eyebrow">PIT LANE / 01</span><h2>TAKE A<br /><i>BREATHER.</i></h2><p>Your car is waiting. The road is still yours.</p><div className="panel-actions"><button className="primary-cta" onClick={togglePause}> <Play size={15} fill="currentColor" /> RESUME RACE</button><button className="ghost-cta" onClick={begin}><RotateCcw size={15} /> RESTART</button></div></div></section>}

    {screen === 'over' && <section className="screen-layer"><div className="dialog-panel result-panel"><span className="eyebrow">RUN COMPLETE / RESULTS</span><h2>THAT WAS<br /><i>A RUN.</i></h2><div className="result-grid"><div><b>{String(stats.score).padStart(6, '0')}</b><small>SCORE</small></div><div><b>{stats.distance.toFixed(2)} <small>KM</small></b><small>DISTANCE</small></div><div><b>{String(best).padStart(6, '0')}</b><small>BEST</small></div></div><button className="primary-cta" onClick={begin}>RACE AGAIN <span>↗</span></button></div></section>}

    <div className={`bottom-bar ${started ? 'active' : ''}`}>
      <div className="desktop-controls"><span><kbd>←</kbd><kbd>→</kbd> STEER</span><span><kbd>↑</kbd> ACCELERATE</span><span><kbd>↓</kbd> BRAKE</span><span><kbd>SPACE</kbd> NITRO</span><span><kbd>P</kbd> PAUSE</span></div>
      <div className="bottom-caption">STAY SHARP <i>—</i> OWN EVERY MILE</div>
    </div>

    {started && <div className="mobile-controls">
      <div className="mobile-steer"><button onPointerDown={bindControl('left', true)} onPointerUp={bindControl('left', false)} onPointerLeave={bindControl('left', false)} onPointerCancel={bindControl('left', false)}><ArrowLeft /></button><button onPointerDown={bindControl('right', true)} onPointerUp={bindControl('right', false)} onPointerLeave={bindControl('right', false)} onPointerCancel={bindControl('right', false)}><ArrowRight /></button></div>
      <div className="mobile-drive"><button className="nitro-button" onPointerDown={bindControl('nitro', true)} onPointerUp={bindControl('nitro', false)} onPointerLeave={bindControl('nitro', false)} onPointerCancel={bindControl('nitro', false)}><Zap size={17} /> BOOST</button><button className="gas-button" onPointerDown={bindControl('gas', true)} onPointerUp={bindControl('gas', false)} onPointerLeave={bindControl('gas', false)} onPointerCancel={bindControl('gas', false)}><ArrowUp size={23} /></button></div>
    </div>}
    <div className="version-mark">APEX ENGINE <span>•</span> R3F / WEBGL</div>
  </main>
}