import React from 'react'
import { StarLogo } from '../auth/shared/AuthIcons'

type Props = {
  className?: string
}

export default function Logo({ className = "text-foreground" }: Props) {
  return (
    <div className={`relative z-30 p-10 flex items-center gap-4 select-none ${className}`}>
        <div className="animate-pulse-slow">
          <StarLogo />
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-2xl font-black tracking-[-0.05em] uppercase italic leading-none">Nexus</span>
        </div>
      </div>
  )
}