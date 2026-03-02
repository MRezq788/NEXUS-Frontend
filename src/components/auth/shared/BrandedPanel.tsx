import Logo from "../../layout/Logo"
import { StarLogo } from "./AuthIcons"
import { useState, useRef } from "react"

export function BrandedPanel() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePos({ x, y })
  }

  // Parallax for shapes (more aggressive than background)
  const shapeX = (mousePos.x - 50) * 0.2
  const shapeY = (mousePos.y - 50) * 0.2
  const bgX = (mousePos.x - 50) * 0.05
  const bgY = (mousePos.y - 50) * 0.05

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="group relative hidden lg:flex lg:flex-col lg:justify-between overflow-hidden rounded-3xl m-3 bg-[#020617] text-slate-50 transition-colors duration-500 border border-white/5"
    >
      {/* Dynamic Spotlight Glow */}
      <div 
        className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle 500px at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.08), transparent)`
        }}
      />

      {/* Background image & Slow Zoom */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-80 animate-slow-zoom transition-transform duration-500 ease-out"
        style={{ 
          backgroundImage: "url('/images/space-bg-premium.png')",
          transform: `scale(1.1) translate(${bgX}px, ${bgY}px)`
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#020617]/95 via-transparent to-[#020617]/40" />
      
      {/* Creative Shapes Layer (Antigravity Style) */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {/* Connection Grid / Dots */}
        <div className="absolute inset-0 opacity-[0.05]" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
            transform: `translate(${shapeX * 0.2}px, ${shapeY * 0.2}px)`
          }} 
        />

        {/* Floating Glass Shard 1 */}
        <div 
          className="absolute top-[10%] left-[15%] h-64 w-64 bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 animate-float-varied"
          style={{ 
            transform: `translate(${shapeX * 1.2}px, ${shapeY * 1.2}px) rotate(15deg)`,
            clipPath: 'polygon(20% 0%, 100% 40%, 70% 100%, 0% 80%)'
          }}
        />
        
        {/* Floating Glass Shard 2 */}
        <div 
          className="absolute bottom-[15%] right-[10%] h-80 w-80 bg-white/[0.03] backdrop-blur-2xl rounded-[4rem] border border-white/5 animate-reverse-spin-slow"
          style={{ 
            transform: `translate(${shapeX * -0.8}px, ${shapeY * -0.8}px) rotate(-10deg)`,
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 70%'
          }}
        />

        {/* Orbital Rings */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full border border-white/5 opacity-50"
          style={{ transform: `translate(${-50 + shapeX * 0.5}%, ${-50 + shapeY * 0.5}%) scale(1.1)` }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full border border-white/[0.02]"
          style={{ transform: `translate(${-50 + shapeX * 0.3}%, ${-50 + shapeY * 0.3}%) scale(1)` }}
        />

        {/* Small Drifting Particles */}
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.3 + 0.1,
              animationDelay: i * 0.5 + 's',
              transform: `translate(${shapeX * (Math.random() * 2 - 1)}px, ${shapeY * (Math.random() * 2 - 1)}px)`
            }}
          />
        ))}
      </div>

      {/* Texture Layer */}
      <div className="absolute inset-0 z-0 bg-grain pointer-events-none" />

      {/* Logo Area */}
      <Logo className="text-slate-50" />

      {/* Center content is now empty/minimalist to show off gravity animation */}
      <div className="relative z-30 flex flex-1 flex-col items-center justify-center pointer-events-none">
        {/* Subtle Brand Mark or Gradient Glow */}
        <div className="h-[200px] w-[200px] bg-white/5 rounded-full blur-[100px] animate-pulse-slow" />
      </div>

      {/* Refined Footer */}
      <div className="relative z-30 p-10 flex justify-between items-center opacity-40 select-none">
       
        <div className="flex gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-background animate-pulse" />
          <div className="h-1.5 w-1.5 rounded-full bg-background/50" />
          <div className="h-1.5 w-1.5 rounded-full bg-background/20" />
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <span className="text-[9px] uppercase tracking-[0.4em] font-mono font-bold">Secure Access</span>
        </div>
      </div>
    </div>
  )
}
