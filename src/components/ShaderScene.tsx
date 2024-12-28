'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'

interface ShaderSceneProps {
  parameters: {
    speed: number
    intensity: number
    color: string
  }
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uIntensity;
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    // 中心からの距離を計算
    vec2 center = vec2(0.5);
    vec2 p = vUv - center;
    float dist = length(p);

    // 波紋パターン
    float t = uTime * uSpeed;
    float wave = sin(dist * 20.0 - t);
    wave = wave * 0.5 + 0.5;

    // 強度と減衰を適用
    wave = wave * uIntensity;
    wave = wave * (1.0 - dist * 2.0);

    // 色を適用
    vec3 color = uColor * wave;
    gl_FragColor = vec4(color, 1.0);
  }
`

export function ShaderScene({ parameters }: ShaderSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.Camera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)
  const frameRef = useRef<number>()
  const startTimeRef = useRef<number>(Date.now())

  // シーンの初期化
  useEffect(() => {
    if (!containerRef.current) return

    // シーンの設定
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // カメラの設定
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1)
    cameraRef.current = camera

    // レンダラーの設定
    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // マテリアルの設定
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: parameters.speed },
        uIntensity: { value: parameters.intensity },
        uColor: { value: new THREE.Color(parameters.color) }
      }
    })
    materialRef.current = material

    // メッシュの設定
    const geometry = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // アニメーションループ
    const animate = () => {
      const elapsedTime = (Date.now() - startTimeRef.current) * 0.001

      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = elapsedTime
      }

      renderer.render(scene, camera)
      frameRef.current = requestAnimationFrame(animate)
    }

    animate()

    // クリーンアップ
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, []) // 初期化は一度だけ

  // パラメータの更新
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uSpeed.value = parameters.speed
      materialRef.current.uniforms.uIntensity.value = parameters.intensity
      materialRef.current.uniforms.uColor.value.set(parameters.color)
    }
  }, [parameters])

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full" 
      style={{ background: '#000000' }} 
    />
  )
} 