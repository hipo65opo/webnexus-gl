'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

interface ShaderMaterialProps {
  parameters: {
    speed: number;
    intensity: number;
    color: string;
  }
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uIntensity;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float t = uTime * uSpeed;
    float intensity = uIntensity;
    
    float color = sin(p.x * 10.0 + t) * sin(p.y * 10.0 + t) * intensity;
    gl_FragColor = vec4(uColor * color, 1.0);
  }
`

export function ShaderMaterial({ parameters }: ShaderMaterialProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uSpeed.value = parameters.speed
      materialRef.current.uniforms.uIntensity.value = parameters.intensity
      materialRef.current.uniforms.uColor.value = new THREE.Color(parameters.color)
    }
  }, [parameters])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uSpeed: { value: parameters.speed },
          uIntensity: { value: parameters.intensity },
          uColor: { value: new THREE.Color(parameters.color) }
        }}
      />
    </mesh>
  )
} 