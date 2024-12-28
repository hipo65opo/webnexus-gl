'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import type { Font } from 'three/examples/jsm/loaders/FontLoader'

interface TextSceneProps {
  text: string
  color: string
}

// チェッカーボードテクスチャーを生成する関数
function createCheckerboardTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const context = canvas.getContext('2d')
  if (!context) return null

  // チェッカーボードのマス目のサイズ
  const tileSize = 64

  // 白い背景
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, size, size)

  // 赤いマス目
  context.fillStyle = '#ff0000'
  for (let y = 0; y < size; y += tileSize) {
    for (let x = 0; x < size; x += tileSize) {
      if ((x / tileSize + y / tileSize) % 2 === 0) {
        context.fillRect(x, y, tileSize, tileSize)
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(8, 8) // テクスチャーの繰り返し回数を増やす

  return texture
}

export function TextScene({ text, color }: TextSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const meshRef = useRef<THREE.Mesh | null>(null)
  const frameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!containerRef.current) return
    
    // コンテナの参照をエフェクト内で保持
    const container = containerRef.current

    const scene = new THREE.Scene()

    // 背景用の平面を作成
    const backgroundGeometry = new THREE.PlaneGeometry(10, 10)
    const checkerTexture = createCheckerboardTexture()
    const backgroundMaterial = new THREE.MeshBasicMaterial({
      map: checkerTexture,
      side: THREE.DoubleSide
    })
    const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial)
    backgroundMesh.position.z = -2 // カメラより後ろに配置
    scene.add(backgroundMesh)

    // カメラの設定
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.z = 5
    cameraRef.current = camera

    // レンダラーの設定
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false // 背景を不透明に
    })
    renderer.setClearColor(0x000000, 1)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // フォントのロードとテキストの作成
    const fontLoader = new FontLoader()
    fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font: Font) => {
      const textGeometry = new TextGeometry(text, {
        font,
        size: 0.5,
        height: 0.2,
        curveSegments: 32,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.04,
        bevelOffset: 0,
        bevelSegments: 8
      })

      // テキストを中央に配置
      textGeometry.center()

      // ゴールドのマテリアル
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color('#FFD700'),    // ゴールドの基本色
        specular: new THREE.Color('#FFFFE0'), // 光の反射色
        shininess: 100,                       // 光沢
        flatShading: false,
        reflectivity: 1,
        emissive: new THREE.Color('#FFA500'), // 発光色（オレンジ）を追加
        emissiveIntensity: 0.2                // 発光の強度
      })

      const mesh = new THREE.Mesh(textGeometry, material)
      meshRef.current = mesh
      scene.add(mesh)

      // ライトの調整
      const mainLight = new THREE.DirectionalLight(0xffffff, 2.0)
      mainLight.position.set(1, 1, 1)
      scene.add(mainLight)

      const backLight = new THREE.DirectionalLight(0xffffff, 1.0)
      backLight.position.set(-1, -1, -1)
      scene.add(backLight)

      const ambientLight = new THREE.AmbientLight(0x404040, 0.8)
      scene.add(ambientLight)

      // スポットライトを追加（ゴールドの輝きを強調）
      const spotLight = new THREE.SpotLight(0xffffff, 1.5)
      spotLight.position.set(0, 5, 5)
      spotLight.angle = Math.PI / 4
      spotLight.penumbra = 0.1
      scene.add(spotLight)
    })

    // アニメーションループ
    let time = 0
    const animate = () => {
      time += 0.01

      if (meshRef.current) {
        meshRef.current.rotation.y = time
        meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.1
        meshRef.current.position.y = Math.sin(time) * 0.1
      }

      // 背景のアニメーション（オプション）
      if (backgroundMesh) {
        backgroundMesh.rotation.z = time * 0.1
      }

      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }

    animate()

    // リサイズハンドラー
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return
      
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      
      cameraRef.current.aspect = width / height
      cameraRef.current.updateProjectionMatrix()
      
      rendererRef.current.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (meshRef.current) {
        meshRef.current.geometry.dispose()
        if (Array.isArray(meshRef.current.material)) {
          meshRef.current.material.forEach(m => m.dispose())
        } else {
          meshRef.current.material.dispose()
        }
      }
      renderer.dispose()
      // containerRefの代わりにcontainerを使用
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [text, color]) // 依存配列はそのまま

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full"
    />
  )
} 