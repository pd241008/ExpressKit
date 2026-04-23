"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, MeshTransmissionMaterial, Cylinder, Sphere, Torus, Float, Cloud } from "@react-three/drei";
import * as THREE from "three";

function GlassEngine() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Central Glass Core */}
      <Cylinder args={[1.5, 1.5, 4, 32]} rotation={[Math.PI / 2, 0, 0]}>
        <MeshTransmissionMaterial 
          backside 
          samples={4} 
          thickness={2} 
          roughness={0.1} 
          clearcoat={1} 
          clearcoatRoughness={0.1} 
          transmission={1} 
          ior={1.5} 
          chromaticAberration={0.06} 
          anisotropy={0.1} 
        />
      </Cylinder>

      {/* Internal glowing elements */}
      <Sphere args={[0.8, 32, 32]}>
        <meshStandardMaterial color="#d9482b" emissive="#f28e2c" emissiveIntensity={2} />
      </Sphere>

      {/* Glass tubes branching out */}
      <Cylinder args={[0.4, 0.4, 8, 16]} position={[3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <MeshTransmissionMaterial thickness={1} roughness={0.1} transmission={1} ior={1.5} />
      </Cylinder>
      <Cylinder args={[0.4, 0.4, 8, 16]} position={[-3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <MeshTransmissionMaterial thickness={1} roughness={0.1} transmission={1} ior={1.5} />
      </Cylinder>

      {/* Orbiting metallic rings */}
      <Torus args={[3, 0.1, 16, 100]} rotation={[Math.PI / 2.5, Math.PI / 4, 0]}>
        <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.2} />
      </Torus>
      <Torus args={[4, 0.05, 16, 100]} rotation={[-Math.PI / 3, -Math.PI / 6, 0]}>
        <meshStandardMaterial color="#d9482b" emissive="#d9482b" emissiveIntensity={0.5} metalness={0.8} />
      </Torus>
    </group>
  );
}

export default function ThreeBackground() {
  return (
    <div className="absolute inset-0 w-full h-full -z-20">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <color attach="background" args={["#f0f2f5"]} />
        <ambientLight intensity={1.5} color="#ffffff" />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#f28e2c" />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <GlassEngine />
        </Float>

        {/* Clouds to mimic the smoky background */}
        <Cloud position={[-4, -2, -5]} speed={0.2} opacity={0.5} color="#ffffff" />
        <Cloud position={[4, 2, -8]} speed={0.2} opacity={0.4} color="#e4e4e9" />
        <Cloud position={[0, -4, -4]} speed={0.1} opacity={0.3} color="#ffffff" />

        <Environment preset="studio" />
        <fog attach="fog" args={["#f0f2f5", 5, 20]} />
      </Canvas>
    </div>
  );
}
