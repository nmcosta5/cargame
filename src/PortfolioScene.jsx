import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import { CarModel, Road } from './Game.jsx'

const LANES = [-3.65, 0, 3.65]

// Camera keyframes blended by page scroll: hero side angle → chase cam → high overhead.
const SHOTS = [
  { pos: [-6.2, 2.4, 9.5], look: [0.6, 0.9, 1.5] },
  { pos: [0, 5.2, 11.5], look: [0, 0.3, -8] },
  { pos: [5.5, 3.2, 8], look: [-0.5, 0.6, 0] },
  { pos: [0, 15, 12], look: [0, 0, -6] },
]

function Cruise({ scroll }) {
  const motion = useRef(26)
  const player = useRef()
  const cars = useRef([])
  const traffic = useRef([
    { lane: 0, z: -40, speed: 0.55, color: '#e8eef0' },
    { lane: 2, z: -95, speed: 0.4, color: '#2b6cff' },
    { lane: 0, z: -150, speed: 0.6, color: '#ff6a3d' },
  ])
  const look = useRef(new THREE.Vector3())
  const tmpPos = useRef(new THREE.Vector3())
  const tmpLook = useRef(new THREE.Vector3())

  useFrame(({ camera, clock }, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = clock.elapsedTime
    if (player.current) {
      player.current.position.x = Math.sin(t * 0.35) * 1.2
      player.current.rotation.y = -Math.cos(t * 0.35) * 0.05
      player.current.position.y = Math.sin(t * 9) * 0.012
    }
    traffic.current.forEach((car, i) => {
      car.z += motion.current * car.speed * dt
      if (car.z > 16) car.z = -170 - Math.random() * 40
      const g = cars.current[i]
      if (g) { g.position.x = LANES[car.lane]; g.position.z = car.z }
    })

    const p = THREE.MathUtils.clamp(scroll.current, 0, 1) * (SHOTS.length - 1)
    const i = Math.min(Math.floor(p), SHOTS.length - 2)
    const f = THREE.MathUtils.smoothstep(p - i, 0, 1)
    const a = SHOTS[i], b = SHOTS[i + 1]
    tmpPos.current.set(...a.pos).lerp(new THREE.Vector3(...b.pos), f)
    tmpLook.current.set(...a.look).lerp(new THREE.Vector3(...b.look), f)
    tmpPos.current.x += Math.sin(t * 0.2) * 0.4
    camera.position.lerp(tmpPos.current, 1 - Math.exp(-3 * dt))
    look.current.lerp(tmpLook.current, 1 - Math.exp(-3 * dt))
    camera.lookAt(look.current)
  })

  return <>
    <color attach="background" args={['#0b1418']} />
    <fog attach="fog" args={['#0b1418', 22, 120]} />
    <ambientLight intensity={0.55} />
    <hemisphereLight args={['#bcd6ff', '#1a2a24', 0.9]} />
    <directionalLight position={[-12, 18, 10]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
    <spotLight position={[0, 10, 3]} intensity={3} angle={0.5} penumbra={0.9} distance={30} color="#e9ffd0" />
    <Stars radius={110} depth={50} count={1200} factor={3} saturation={0} fade speed={0.4} />
    <Road motion={motion} />
    {traffic.current.map((car, i) => <group key={i} ref={n => { cars.current[i] = n }} scale={0.82}><CarModel color={car.color} /></group>)}
    <group ref={player} position={[0, 0, 3.4]}><CarModel player /></group>
  </>
}

export default function PortfolioScene({ scroll }) {
  return <div className="bg-scene" aria-hidden="true">
    <Canvas shadows dpr={[1, 1.5]} camera={{ position: SHOTS[0].pos, fov: 50 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
      <Cruise scroll={scroll} />
    </Canvas>
  </div>
}
