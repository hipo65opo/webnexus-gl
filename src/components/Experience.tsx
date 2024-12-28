'use client'

import { ShaderScene } from './ShaderScene'

interface ExperienceProps {
  parameters: {
    speed: number
    intensity: number
    color: string
  }
}

export function Experience({ parameters }: ExperienceProps) {
  return (
    <div className="w-full h-full aspect-video bg-black rounded-lg overflow-hidden">
      <ShaderScene parameters={parameters} />
    </div>
  )
} 