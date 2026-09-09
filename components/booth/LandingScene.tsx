'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, RoundedBox } from '@react-three/drei';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  Component,
  type ReactNode,
} from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
function Text({
  children,
  position,
  fontSize,
  color,
  fontWeight = 600,
}: {
  children: string;
  position: [number, number, number];
  fontSize: number;
  color: string;
  anchorX?: string;
  fontWeight?: number;
  letterSpacing?: number;
}) {
  const asset = useMemo(() => {
    const cv = document.createElement('canvas');
    cv.width = 2048;
    cv.height = 256;
    const ctx = cv.getContext('2d')!;
    ctx.font = `${fontWeight} 150px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(children, 1024, 128);
    const texture = new THREE.CanvasTexture(cv);
    texture.colorSpace = THREE.SRGBColorSpace;
    return { texture, width: (fontSize * 2048) / 150 };
  }, [children, color, fontSize, fontWeight]);
  useEffect(() => () => asset.texture.dispose(), [asset]);
  return (
    <mesh position={position}>
      <planeGeometry args={[asset.width, (fontSize * 256) / 150]} />
      <meshBasicMaterial
        map={asset.texture}
        transparent
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}
function Box({
  position,
  scale,
  color = '#a51b2c',
  metal = 0,
  rough = 0.45,
}: {
  position: [number, number, number];
  scale: [number, number, number];
  color?: string;
  metal?: number;
  rough?: number;
}) {
  return (
    <RoundedBox
      args={scale}
      radius={0.025}
      smoothness={3}
      position={position}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={color} metalness={metal} roughness={rough} />
    </RoundedBox>
  );
}
function Curtain({
  x,
  entering,
  progress,
}: {
  x: number;
  entering: boolean;
  progress: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useEffect(() => {
    if (ref.current)
      gsap.to(ref.current.scale, {
        x: entering ? 0.12 : 0.9 - progress * 0.2,
        duration: entering ? 1.5 : 0.5,
      });
  }, [entering, progress]);
  return (
    <group ref={ref} position={[x, 1.75, 0.4]}>
      {Array.from({ length: 20 }, (_, i) => (
        <mesh
          key={i}
          position={[(i - 9.5) * 0.042, 0, Math.sin(i * 1.9) * 0.035]}
          castShadow
        >
          <cylinderGeometry args={[0.032, 0.036, 2.22, 8]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? '#721020' : '#9b172d'}
            roughness={0.92}
          />
        </mesh>
      ))}
    </group>
  );
}
function Booth({
  entering,
  progress,
  onEnter,
}: {
  entering: boolean;
  progress: number;
  onEnter: () => void;
}) {
  const [hover, setHover] = useState(false);
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!group.current || entering) return;
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      -0.18 + progress * 0.13,
      4,
      delta,
    );
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.008;
  });
  return (
    <group
      ref={group}
      rotation={[0, -0.18, 0]}
      onClick={onEnter}
      onPointerOver={() => {
        setHover(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <Box
        position={[0, 0.12, 0]}
        scale={[2.45, 0.22, 1.48]}
        color="#302929"
        metal={0.7}
      />
      <Box
        position={[0, 1.65, -0.62]}
        scale={[2.35, 3.2, 0.16]}
        color="#811727"
      />
      <Box position={[-1.12, 1.67, 0]} scale={[0.18, 3.13, 1.35]} />
      <Box position={[1.1, 1.67, 0]} scale={[0.18, 3.13, 1.35]} />
      <Box position={[0, 3.25, 0]} scale={[2.48, 0.25, 1.5]} />
      <Box
        position={[0, 3.1, 0.76]}
        scale={[2.42, 0.68, 0.16]}
        color="#b72435"
      />
      <Box
        position={[0, 3.1, 0.865]}
        scale={[2.12, 0.45, 0.06]}
        color="#ffedc5"
      />
      <Text
        position={[0, 3.12, 0.908]}
        fontSize={0.235}
        color="#8c1926"
        anchorX="center"
        fontWeight={900}
      >
        SNAPSULE
      </Text>
      <Text
        position={[0, 2.95, 0.91]}
        fontSize={0.058}
        color="#8c1926"
        letterSpacing={0.06}
      >
        LITTLE MOMENTS, KEPT FOREVER.
      </Text>
      {[-1.1, -0.85, -0.57, -0.28, 0, 0.28, 0.57, 0.85, 1.1].map((x, i) => (
        <group key={i}>
          {[2.81, 3.4].map((y) => (
            <mesh key={y} position={[x, y, 0.87]}>
              <sphereGeometry args={[0.035, 12, 12]} />
              <meshStandardMaterial
                color="#fff0c9"
                emissive="#ffcc72"
                emissiveIntensity={hover ? 5 : 2.2 + progress * 1.4}
              />
            </mesh>
          ))}
        </group>
      ))}
      <Box
        position={[-0.8, 1.48, 0.65]}
        scale={[0.56, 2.6, 0.17]}
        color="#b62536"
      />
      <Box
        position={[-0.79, 2.18, 0.75]}
        scale={[0.41, 0.48, 0.035]}
        color="#e8d7b8"
        metal={0.5}
      />
      <Text position={[-0.79, 2.25, 0.78]} fontSize={0.066} color="#a72131">
        YOUR LITTLE
      </Text>
      <Text position={[-0.79, 2.14, 0.78]} fontSize={0.072} color="#a72131">
        TIME CAPSULE
      </Text>
      <Box
        position={[-0.79, 1.78, 0.75]}
        scale={[0.27, 0.07, 0.04]}
        color="#222222"
        metal={0.8}
      />
      <Box
        position={[-0.79, 0.95, 0.75]}
        scale={[0.4, 0.34, 0.06]}
        color="#b9b4a7"
        metal={0.92}
        rough={0.22}
      />
      <Box
        position={[-0.79, 0.99, 0.79]}
        scale={[0.3, 0.04, 0.03]}
        color="#161618"
      />
      <Text position={[-0.79, 1.13, 0.8]} fontSize={0.049} color="#2e2724">
        COLLECT MEMORIES HERE
      </Text>
      <Box
        position={[-0.43, 1.57, 0.66]}
        scale={[0.035, 2.4, 0.05]}
        color="#d5c8b6"
        metal={0.9}
      />
      <Box
        position={[1.0, 1.57, 0.66]}
        scale={[0.035, 2.4, 0.05]}
        color="#d5c8b6"
        metal={0.9}
      />
      <Box
        position={[0.28, 2.72, 0.63]}
        scale={[1.5, 0.065, 0.065]}
        color="#d5c8b6"
        metal={0.9}
      />
      <Curtain x={-0.05} entering={entering} progress={progress} />
      <Curtain x={0.67} entering={entering} progress={progress} />
      <mesh position={[0.3, 0.7, -0.05]} castShadow>
        <cylinderGeometry args={[0.33, 0.33, 0.13, 40]} />
        <meshStandardMaterial color="#b92434" roughness={0.38} />
      </mesh>
      <mesh position={[0.3, 0.37, -0.05]}>
        <cylinderGeometry args={[0.055, 0.065, 0.62, 16]} />
        <meshStandardMaterial
          color="#bababa"
          metalness={0.95}
          roughness={0.23}
        />
      </mesh>
      <mesh position={[0.3, 0.09, -0.05]}>
        <cylinderGeometry args={[0.26, 0.3, 0.05, 32]} />
        <meshStandardMaterial color="#b8b8b8" metalness={0.9} />
      </mesh>
      <pointLight
        position={[0.3, 2.6, 0.1]}
        intensity={hover ? 4.5 : 2 + progress}
        color="#ffddaa"
        distance={3}
      />
    </group>
  );
}
function CameraMove({
  entering,
  exiting = false,
  progress,
}: {
  entering: boolean;
  exiting?: boolean;
  progress: number;
}) {
  const { camera } = useThree();
  useFrame((_, delta) => {
    if (entering || exiting) return;
    moveLandingCamera(camera, progress, delta);
  });
  useEffect(() => {
    if (entering)
      gsap.to(camera.position, {
        x: 0.4,
        y: 1.8,
        z: 1.15,
        duration: 2.3,
        ease: 'power2.inOut',
        onUpdate: () => camera.lookAt(0.25, 1.7, 0),
      });
    if (exiting) {
      camera.position.set(0.4, 1.8, 1.15);
      gsap.to(camera.position, {
        x: 4.3,
        y: 2.65,
        z: 7.4,
        duration: 0.9,
        ease: 'power2.out',
        onUpdate: () => camera.lookAt(0, 1.6, 0),
      });
    }
  }, [entering, exiting, camera]);
  return null;
}

function moveLandingCamera(
  camera: THREE.Camera,
  progress: number,
  delta: number,
) {
  camera.position.set(
    THREE.MathUtils.damp(camera.position.x, 4.3 - progress * 2.25, 3, delta),
    THREE.MathUtils.damp(camera.position.y, 2.65 - progress * 0.48, 3, delta),
    THREE.MathUtils.damp(camera.position.z, 7.4 - progress * 2, 3, delta),
  );
  camera.lookAt(0, 1.62, 0);
}

function CheckerFloor() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    const size = 64;
    for (let y = 0; y < 4; y += 1) {
      for (let x = 0; x < 4; x += 1) {
        context.fillStyle = (x + y) % 2 === 0 ? '#160b0d' : '#3b2522';
        context.fillRect(x * size, y * size, size, size);
      }
    }
    const map = new THREE.CanvasTexture(canvas);
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(4, 4);
    map.colorSpace = THREE.SRGBColorSpace;
    return map;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.01, 0]}
      receiveShadow
    >
      <planeGeometry args={[16, 16]} />
      <meshStandardMaterial
        map={texture}
        color="#8a625d"
        roughness={0.55}
        metalness={0.12}
      />
    </mesh>
  );
}
class SafeScene extends Component<
  { children: ReactNode; onEnter: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <button className="fallback-entry" onClick={this.props.onEnter}>
        SNAPSULE
        <br />
        <small>Step into the booth →</small>
      </button>
    ) : (
      this.props.children
    );
  }
}
export default function LandingScene({
  entering,
  exiting = false,
  progress,
  onEnter,
}: {
  entering: boolean;
  exiting?: boolean;
  progress: number;
  onEnter: () => void;
}) {
  return (
    <SafeScene onEnter={onEnter}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [4.3, 2.65, 7.4], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ camera }) => camera.lookAt(0, 1.6, 0)}
      >
        <fog attach="fog" args={['#080304', 7, 17]} />
        <ambientLight intensity={0.4} color="#ffd4ae" />
        <hemisphereLight args={['#f2c9a0', '#26080c', 0.65]} />
        <directionalLight
          position={[-3, 7, 5]}
          intensity={2.5}
          color="#ffe5c0"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight
          position={[4, 4, 1]}
          intensity={1.1}
          color="#b52a2f"
        />
        <pointLight
          position={[-3, 2.4, 2]}
          intensity={15}
          distance={6}
          color="#a70e19"
        />
        <pointLight
          position={[3, 1.2, 3]}
          intensity={8}
          distance={5}
          color="#ff6b42"
        />
        <CheckerFloor />
        <Booth entering={entering} progress={progress} onEnter={onEnter} />
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.55}
          scale={9}
          blur={2.5}
          far={5}
        />
        <CameraMove entering={entering} exiting={exiting} progress={progress} />
      </Canvas>
    </SafeScene>
  );
}
