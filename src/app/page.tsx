'use client'

import { TextScene } from '@/components/TextScene'

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-8">
      <div 
        className="w-full max-w-4xl aspect-video rounded-lg overflow-hidden"
        style={{
          boxShadow: '0 0 50px rgba(255, 255, 255, 0.1)'
        }}
      >
        <TextScene 
          text="Hello, Three.js!" 
          color="#FFD700"
        />
      </div>
    </div>
  )
}
