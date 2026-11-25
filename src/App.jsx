import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Stars, useGLTF } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider, useRapier, useBeforePhysicsStep } from '@react-three/rapier'
import { Suspense } from 'react'
import * as THREE from 'three'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Gauge, Pause, Play, RotateCcw, Volume2, VolumeX, Zap } from 'lucide-react'

const LANES = [-3.65, 0, 3.65]
const BEST_KEY = 'apex-run-r3f-best'
const CAR_MODEL_URL = 'https://models.vinish.dev/realistic-cars/sport-sedan.glb'

function DetailedPlayerCar({ steer = 0, speed = 0, vehicleRef }) {
  const { scene } = useGLTF(CAR_MODEL_URL)
  const model = useMemo(() => scene.clone(true), [scene])
  const wheelNames = ['Wheel_FL', 'Wheel_FR', 'Wheel_RL', 'Wheel_RR']
  const wheels = useMemo(() => wheelNames.map(name => model.getObjectByName(name)), [model])
  const wheelSpin = useRef(0)
  useFrame((_, delta) => {
    wheelSpin.current += speed * 63.3 * delta / 0.345
    const controller = vehicleRef?.current
    wheels.forEach((wheel, index) => {
      if (!wheel) return
      wheel.rotation.order = 'YXZ'
      if (controller) {
        const connection = controller.wheelChassisConnectionPointCs(index)
        const suspension = controller.wheelSuspensionLength(index) ?? 0.25
        const rotation = controller.wheelRotation(index) ?? wheelSpin.current
        const steeringAngle = controller.wheelSteering(index) ?? 0
        if (connection) {
          wheel.position.x = connection.x / 0.76
          wheel.position.y = (connection.y - suspension - 0.13) / 0.76
          wheel.position.z = connection.z / 0.76
        }
        const baseSteer = wheel.userData.baseSteer ?? wheel.rotation.y
        wheel.userData.baseSteer = baseSteer
        wheel.rotation.set(index % 2 ? -rotation : rotation, baseSteer + steeringAngle, 0)
      } else {
        const baseSteer = wheel.userData.baseSteer ?? wheel.rotation.y
        wheel.userData.baseSteer = baseSteer
        wheel.rotation.set(index % 2 ? -wheelSpin.current : wheelSpin.current, baseSteer + (index < 2 ? steer * 0.34 : 0), 0)
      }
    })
  })
  return <group scale={0.76}><primitive object={model} /></group>
}
function CarModel({ color = '#c8ff4d', player = false, steer = 0 }) {
  const wheelRefs = useRef([])
  useFrame((_, delta) => {
    wheelRefs.current.forEach((wheel, index) => {
      if (!wheel) return
      wheel.rotation.x -= delta * (player ? 8 : 5)
      if (index < 2) wheel.rotation.y = THREE.MathUtils.damp(wheel.rotation.y, steer * 0.28, 9, delta)
    })
  })
  const wheels = [[-0.91, 0.34, -1.02], [0.91, 0.34, -1.02], [-0.91, 0.34, 1.02], [0.91, 0.34, 1.02]]
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.43, 0]}><boxGeometry args={[1.82, 0.48, 3.72]} /><meshStandardMaterial color={color} metalness={0.62} roughness={0.27} /></mesh>
      <mesh castShadow position={[0, 0.68, -1.13]} scale={[0.98, 0.38, 0.72]}><boxGeometry args={[1.72, 1, 1]} /><meshStandardMaterial color={color} metalness={0.58} roughness={0.25} /></mesh>
      <mesh castShadow position={[0, 0.67, 1.27]} scale={[0.94, 0.34, 0.48]}><boxGeometry args={[1.72, 1, 1]} /><meshStandardMaterial color={color} metalness={0.58} roughness={0.25} /></mesh>
      <mesh castShadow position={[0, 0.94, -0.02]}><boxGeometry args={[1.48, 0.72, 1.92]} /><meshPhysicalMaterial color="#15252d" metalness={0.42} roughness={0.13} clearcoat={1} /></mesh>
      <mesh position={[0, 1.0, -0.12]}><boxGeometry args={[1.37, 0.54, 1.72]} /><meshPhysicalMaterial color="#71929a" metalness={0.35} roughness={0.12} transparent opacity={0.34} clearcoat={1} /></mesh>
      <mesh position={[0, 1.29, -0.02]}><boxGeometry args={[1.45, 0.055, 1.82]} /><meshStandardMaterial color="#10191d" metalness={0.55} roughness={0.3} /></mesh>
      <mesh position={[0, 0.34, -1.89]}><boxGeometry args={[1.25, 0.2, 0.12]} /><meshStandardMaterial color="#11191c" metalness={0.7} roughness={0.3} /></mesh>
      <mesh position={[0, 0.43, -1.96]}><boxGeometry args={[0.72, 0.12, 0.025]} /><meshStandardMaterial color="#59676b" metalness={0.85} roughness={0.2} /></mesh>
      {[-0.62, 0.62].map(x => <mesh key={x} position={[x, 0.58, -1.88]}><boxGeometry args={[0.38, 0.13, 0.06]} /><meshStandardMaterial color="#f7fff0" emissive={player ? "#eaffd0" : "#fff0bf"} emissiveIntensity={player ? 2.8 : 0.8} /></mesh>)}
      {[-0.65, 0.65].map(x => <mesh key={x} position={[x, 0.53, 1.88]}><boxGeometry args={[0.36, 0.14, 0.06]} /><meshStandardMaterial color="#ff3328" emissive="#ff170d" emissiveIntensity={1.8} /></mesh>)}
      {[-1, 1].map(side => <group key={side} position={[side * 0.91, 0.86, -0.53]}><mesh position={[side * 0.13, 0, 0]}><boxGeometry args={[0.3, 0.13, 0.24]} /><meshStandardMaterial color={color} metalness={0.6} /></mesh><mesh position={[side * 0.14, 0.02, -0.02]}><boxGeometry args={[0.025, 0.075, 0.17]} /><meshStandardMaterial color="#a9c2c5" metalness={0.8} /></mesh></group>)}
      {wheels.map(([x, y, z], i) => <group key={i} position={[x, y, z]}>
        <mesh position={[0, 0.02, 0]}><torusGeometry args={[0.36, 0.075, 8, 20]} /><meshStandardMaterial color="#111719" roughness={0.95} /></mesh>
        <group ref={node => { wheelRefs.current[i] = node }} rotation={[0, 0, Math.PI / 2]}>
          <mesh castShadow><cylinderGeometry args={[0.31, 0.31, 0.24, 24]} /><meshStandardMaterial color="#090d10" roughness={0.9} /></mesh>
          <mesh position={[0, 0.126, 0]}><cylinderGeometry args={[0.19, 0.19, 0.018, 20]} /><meshStandardMaterial color="#aeb9ba" metalness={0.95} roughness={0.2} /></mesh>
          <mesh position={[0, 0.139, 0]}><cylinderGeometry args={[0.075, 0.075, 0.02, 12]} /><meshStandardMaterial color="#343f43" metalness={0.85} /></mesh>
        </group>
      </group>)}
      {player && <mesh position={[0, 0.18, 2.02]}><boxGeometry args={[1.2, 0.08, 0.08]} /><meshStandardMaterial color="#c8ff4d" emissive="#c8ff4d" emissiveIntensity={1.5} /></mesh>}
    </group>
  )
}
function Roadside() {
  const items = useMemo(() => Array.from({ length: 360 }, (_, i) => ({
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

function Road({ motion }) {
  const dashes = useMemo(() => Array.from({ length: 252 }, (_, i) => -i * 6), [])
  const lights = useMemo(() => Array.from({ length: 189 }, (_, i) => -i * 8 - 2), [])
  const world = useRef()
  const offset = useRef(0)
  useFrame((_, delta) => {
    if (!world.current) return
    offset.current = (offset.current + (motion.current || 0) * delta) % 504
    world.current.position.z = offset.current
  })
  return <group ref={world}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, -980]} receiveShadow>
      <planeGeometry args={[260, 2000]} /><meshStandardMaterial color="#182b27" roughness={1} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -980]} receiveShadow>
      <planeGeometry args={[12.2, 2000]} /><meshStandardMaterial color="#30383d" roughness={0.9} />
    </mesh>
    {[-6.15, 6.15].map(x => <mesh key={x} position={[x, 0.04, -78]}><boxGeometry args={[0.18, 0.08, 2000]} /><meshStandardMaterial color="#e6e0ca" /></mesh>)}
    {[-6.65, 6.65].map(x => <mesh key={'shoulder'+x} position={[x, -0.005, -78]}><boxGeometry args={[0.78, 0.025, 2000]} /><meshStandardMaterial color="#777d78" roughness={1} /></mesh>)}
    {[-7.25, 7.25].map(x => <group key={'rail'+x}>
      <mesh position={[x, 0.82, -78]}><boxGeometry args={[0.12, 0.16, 2000]} /><meshStandardMaterial color="#9aa4a4" metalness={0.78} roughness={0.32} /></mesh>
      {Array.from({length:320},(_,i)=><mesh key={i} position={[x,0.42,-i*6.3-4]}><boxGeometry args={[0.16,0.82,0.16]} /><meshStandardMaterial color="#687579" metalness={0.65} /></mesh>)}
      <mesh position={[x, 0.93, -78]}><boxGeometry args={[0.19, 0.055, 2000]} /><meshStandardMaterial color="#d3d9d6" metalness={0.85} roughness={0.25} /></mesh>
    </group>)}
    {[-2, 2].map(x => dashes.map((z, i) => <mesh key={x + '-' + i} position={[x, 0.035, z]}><boxGeometry args={[0.075, 0.035, 2.7]} /><meshBasicMaterial color="#d8ded5" /></mesh>))}
    {lights.map((z, i) => [-1, 1].map(side => <group key={i + '-' + side} position={[side * 7.8, 0, z]}>
      <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[0.055, 0.08, 3, 8]} /><meshStandardMaterial color="#647178" metalness={0.7} /></mesh>
      <mesh position={[-side * 0.38, 3, 0]}><boxGeometry args={[0.9, 0.1, 0.18]} /><meshStandardMaterial color="#7d8a8e" metalness={0.7} /></mesh>
    </group>))}
    <Roadside />
  </group>
}

function DetailedTrafficCar({ car }) {
  const { scene } = useGLTF(CAR_MODEL_URL)
  const model = useMemo(() => scene.clone(true), [scene])
  const body = useRef()
  const wheelNames = ['Wheel_FL', 'Wheel_FR', 'Wheel_RL', 'Wheel_RR']
  const wheels = useMemo(() => wheelNames.map(name => model.getObjectByName(name)), [model])
  const spin = useRef(0)
  useFrame((_, delta) => {
    body.current?.setNextKinematicTranslation({ x: LANES[car.lane], y: -0.13, z: car.z })
    spin.current += delta * (car.speed * 34)
    wheels.forEach((wheel, index) => {
      if (!wheel) return
      wheel.rotation.order = 'YXZ'
      wheel.rotation.x = index % 2 ? -spin.current : spin.current
    })
  }, -2)
  return <RigidBody ref={body} type="kinematicPosition" colliders={false} position={[LANES[car.lane], -0.13, car.z]}>
    <CuboidCollider position={[0, 0.72, 0]} args={[0.9, 0.28, 1.86]} friction={0.85} restitution={0.08} />
    <group position={[0, 0.13, 0]} scale={0.76}><primitive object={model} /></group>
  </RigidBody>
}
function TrafficCar({ car }) {
  const body = useRef()
  useFrame(() => {
    body.current?.setNextKinematicTranslation({ x: LANES[car.lane], y: -0.13, z: car.z })
  }, -2)
  return <RigidBody ref={body} type="kinematicPosition" colliders={false} position={[LANES[car.lane], -0.13, car.z]}>
    <CuboidCollider position={[0, 0.72, 0]} args={[0.9, 0.28, 1.86]} friction={0.85} restitution={0.08} />
    <group position={[0, 0.13, 0]} rotation={[0, Math.PI, 0]} scale={0.82}><CarModel color={car.color} /></group>
  </RigidBody>
}

function GameWorld({ active, controls, onStats, onCrash, boost, setBoost, resetKey }) {
  const player = useRef()
  const playerBody = useRef()
  const vehicle = useRef(null)
  const traffic = useRef([])
  const { camera } = useThree()
  const { world, rapier } = useRapier()
  const elapsed = useRef(0)
  const report = useRef(0)
  const distance = useRef(0)
  const points = useRef(0)
  const speed = useRef(0)
  const nitro = useRef(100)
  const playerX = useRef(0)
  const playerZ = useRef(3.4)
  const lateralVelocity = useRef(0)
  const roadMotion = useRef(0)
  const steering = useRef(0)
  const laneTraffic = useMemo(() => Array.from({ length: 13 }, (_, i) => ({
    id: i, lane: (i * 7 + 1) % 3, z: 3.4 - 22 - i * 15.5,
    color: ['#b83f36', '#dce3e2', '#28799a', '#c28c32', '#675b91', '#202a31', '#587b63'][i % 7],
    speed: 0.72 + (i % 5) * 0.085, size: i % 4 === 0 ? 0.94 : 0.82, near: false,
  })), [])
  if (traffic.current.length === 0) traffic.current = laneTraffic
  useEffect(() => {
    if (!playerBody.current) return
    const controller = world.createVehicleController(playerBody.current)
    controller.indexUpAxis = 1
    controller.setIndexForwardAxis = 2
    const wheelPoints = [
      { x: -0.72, y: 0.72, z: 1.12 },
      { x: 0.72, y: 0.72, z: 1.12 },
      { x: -0.72, y: 0.72, z: -1.12 },
      { x: 0.72, y: 0.72, z: -1.12 },
    ]
    wheelPoints.forEach((point, index) => {
      controller.addWheel(point, { x: 0, y: -1, z: 0 }, { x: -1, y: 0, z: 0 }, 0.25, 0.34)
      controller.setWheelSuspensionStiffness(index, 32)
      controller.setWheelSuspensionCompression(index, 4.4)
      controller.setWheelSuspensionRelaxation(index, 2.3)
      controller.setWheelMaxSuspensionTravel(index, 0.28)
      controller.setWheelMaxSuspensionForce(index, 14000)
      controller.setWheelFrictionSlip(index, 4.8)
      controller.setWheelSideFrictionStiffness(index, 1.35)
    })
    vehicle.current = controller
    playerBody.current.setRotation({ x: 0, y: 1, z: 0, w: 0 }, true)
    return () => {
      world.removeVehicleController(controller)
      vehicle.current = null
    }
  }, [world])
  useBeforePhysicsStep(() => {
    if (vehicle.current && active) vehicle.current.updateVehicle(1 / 60, rapier.QueryFilterFlags.EXCLUDE_DYNAMIC)
  })
  useEffect(() => {
    if (!playerBody.current) return
    playerBody.current.setTranslation({ x: 0, y: -0.13, z: 3.4 }, true)
    playerBody.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
    playerBody.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
    playerBody.current.setRotation({ x: 0, y: 1, z: 0, w: 0 }, true)
    playerX.current = 0
    playerZ.current = 3.4
    lateralVelocity.current = 0
    distance.current = 0
    points.current = 0
    speed.current = 0
    nitro.current = 100
    laneTraffic.forEach((car, index) => {
      car.lane = (index * 7 + 1) % 3
      car.z = 3.4 - 22 - index * 15.5
      car.near = false
    })
  }, [resetKey, laneTraffic])
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.04)
    if (!active) { roadMotion.current = 0; return }
    elapsed.current += dt
    const input = controls.current
    const accelerating = input.gas || input.up
    const braking = input.brake || input.down
    const usingNitro = (input.nitro || boost) && nitro.current > 0
    if (usingNitro) nitro.current = Math.max(0, nitro.current - 32 * dt)
    else nitro.current = Math.min(100, nitro.current + 10 * dt)
    const steer = (input.right ? 1 : 0) - (input.left ? 1 : 0)
    steering.current = THREE.MathUtils.damp(steering.current, steer, 8, dt)
    const chassis = playerBody.current
    if (chassis && vehicle.current) {
      const velocity = chassis.linvel()
      const forwardSpeed = Math.abs(vehicle.current.currentVehicleSpeed())
      speed.current = THREE.MathUtils.clamp(forwardSpeed / 63.3, 0, 1.42)
      const speedLimit = usingNitro ? 76 : 63.3
      const powerFalloff = THREE.MathUtils.clamp(1 - Math.pow(forwardSpeed / speedLimit, 2) * 0.72, 0.35, 1)
      const engineForce = accelerating ? (usingNitro ? 6200 : 4600) * powerFalloff : 0
      const steerAngle = -steering.current * (0.43 - Math.min(speed.current, 1) * 0.16)
      vehicle.current.setWheelSteering(0, steerAngle)
      vehicle.current.setWheelSteering(1, steerAngle)
      vehicle.current.setWheelEngineForce(0, 0)
      vehicle.current.setWheelEngineForce(1, 0)
      vehicle.current.setWheelEngineForce(2, engineForce)
      vehicle.current.setWheelEngineForce(3, engineForce)
      for (let i = 0; i < 4; i++) vehicle.current.setWheelBrake(i, braking ? 1650 : 0)
      chassis.addForce({ x: 0, y: 0, z: -0.42 * velocity.z * Math.abs(velocity.z) - 12 * velocity.z }, true)
      playerX.current = chassis.translation().x
      playerZ.current = chassis.translation().z
      if (Math.abs(playerX.current) > 5.35) onCrash()
      if (playerZ.current < -500) {
        const wrapped = chassis.translation()
        chassis.setTranslation({ x: wrapped.x, y: wrapped.y, z: wrapped.z + 504 }, true)
        playerZ.current += 504
        traffic.current.forEach(car => { car.z += 504 })
      }
      lateralVelocity.current = velocity.x
    }
    if (player.current) {
      player.current.rotation.z = THREE.MathUtils.damp(player.current.rotation.z, -steering.current * 0.075, 5, dt)
      player.current.position.y = 0.13 + Math.sin(elapsed.current * (8 + speed.current * 8)) * 0.006
    }
    const flow = speed.current * 63.3 * dt
    roadMotion.current = flow / Math.max(dt, 0.0001)
    distance.current += flow / 1000
    points.current += flow * (usingNitro ? 1.5 : 1.0)
    traffic.current.forEach(car => {
      car.z += flow * car.speed
      if (car.z > playerZ.current + 13) {
        car.z = playerZ.current - 145 - Math.random() * 65
        car.lane = Math.floor(Math.random() * 3)
        car.near = false
      }
      const dx = Math.abs(LANES[car.lane] - playerX.current)
      const dz = Math.abs(car.z - playerZ.current)
      if (dx < 1.55 && dz < 2.35) onCrash()
      if (dx < 2.45 && dx > 1.55 && dz < 1.4 && !car.near) {
        car.near = true
        points.current += 220
      }
    })
    camera.position.x = THREE.MathUtils.damp(camera.position.x, playerX.current * 0.38, 2.2, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 5.15 + speed.current * 0.55 + (usingNitro ? 0.22 : 0), 2, dt)
    camera.position.z = playerZ.current + 10.8 + speed.current * 0.65
    camera.rotation.z = THREE.MathUtils.damp(camera.rotation.z, -steering.current * 0.025, 2.5, dt)
    camera.fov = THREE.MathUtils.damp(camera.fov, 55 + speed.current * 13 + (usingNitro ? 5 : 0), 2.5, dt)
    camera.updateProjectionMatrix()
    camera.lookAt(playerX.current * 0.16, 0.28, playerZ.current - 8.5)
    report.current += dt
    if (report.current > 0.09) {
      report.current = 0
      onStats({ speed: Math.round(speed.current * 228), distance: distance.current, score: Math.floor(points.current), nitro: nitro.current, gear: Math.max(1, Math.min(6, Math.ceil(speed.current * 4.2))), boosting: usingNitro })
    }
  }, -2)
  return <>
    <color attach="background" args={['#91a7a5']} />
    <fog attach="fog" args={['#91a7a5', 35, 155]} />
    <ambientLight intensity={1.15} />
    <hemisphereLight args={['#dceeff', '#263b32', 1.5]} />
    <directionalLight position={[-12, 18, 10]} intensity={3.2} castShadow shadow-mapSize={[2048, 2048]} />
    <spotLight position={[0, 12, 1]} intensity={2.5} angle={0.45} penumbra={0.8} distance={35} color="#e9ffd0" />
    <Stars radius={100} depth={45} count={700} factor={2} saturation={0} fade speed={0.15} />
    <RigidBody type="fixed" colliders={false}><CuboidCollider position={[0, -0.16, 0]} args={[130, 0.16, 100000]} friction={1.1} /><CuboidCollider position={[-7.25, 0.82, 0]} args={[0.08, 0.12, 100000]} friction={0.85} restitution={0.12} /><CuboidCollider position={[7.25, 0.82, 0]} args={[0.08, 0.12, 100000]} friction={0.85} restitution={0.12} /></RigidBody>
    <Road motion={roadMotion} />
    {traffic.current.map(car => car.id % 6 === 0 ? <DetailedTrafficCar key={car.id} car={car} /> : <TrafficCar key={car.id} car={car} />)}
    <RigidBody ref={playerBody} colliders={false} position={[0, -0.13, 3.4]} rotation={[0, Math.PI, 0]} mass={1150} linearDamping={0.22} angularDamping={1.4} enabledRotations={[false, true, false]} canSleep={false} onCollisionEnter={() => onCrash()}>
      <CuboidCollider position={[0, 0.72, 0]} args={[0.9, 0.28, 1.86]} friction={1.05} restitution={0.02} />
      <group ref={player} position={[0, 0.13, 0]}><Suspense fallback={<CarModel player steer={steering.current} />}><DetailedPlayerCar steer={steering.current} speed={speed.current} vehicleRef={vehicle} /></Suspense></group>
    </RigidBody>
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
  const [resetKey, setResetKey] = useState(0)
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
    setBoost(false); setResetKey(key => key + 1); setScreen('playing'); beep(520, 0.16)
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
      <Suspense fallback={null}><Physics gravity={[0, -9.81, 0]} timeStep={1 / 60} interpolate maxCcdSubsteps={4} updatePriority={-1} paused={!started}><GameWorld active={started} controls={controls} onStats={setStats} onCrash={crash} boost={boost} setBoost={setBoost} resetKey={resetKey} /></Physics></Suspense>
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
      <div className="mobile-drive"><button className="nitro-button" onPointerDown={bindControl('nitro', true)} onPointerUp={bindControl('nitro', false)} onPointerLeave={bindControl('nitro', false)} onPointerCancel={bindControl('nitro', false)}><Zap size={17} /> BOOST</button><button className="brake-button" onPointerDown={bindControl('brake', true)} onPointerUp={bindControl('brake', false)} onPointerLeave={bindControl('brake', false)} onPointerCancel={bindControl('brake', false)}><ArrowDown size={18} /> BRAKE</button><button className="gas-button" onPointerDown={bindControl('gas', true)} onPointerUp={bindControl('gas', false)} onPointerLeave={bindControl('gas', false)} onPointerCancel={bindControl('gas', false)}><ArrowUp size={23} /></button></div>
    </div>}
    <div className="version-mark">SPORT SEDAN BY VINISH.DEV <span>•</span> CC BY 4.0</div>
  </main>
}