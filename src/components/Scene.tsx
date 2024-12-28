'use client'

import dynamic from 'next/dynamic'

// R3Fコンポーネントを動的インポート
const Experience = dynamic(
  () => import('./Experience').then((mod) => mod.Experience),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-black" />
  }
)

interface SceneProps {
  parameters: {
    speed: number
    intensity: number
    color: string
  }
}

export default function Scene({ parameters }: SceneProps) {
  return <Experience parameters={parameters} />
} 