import { StarLogo } from '../auth/shared/AuthIcons'

type Props = {
  className?: string;
  showText?: boolean;
  isCollapsed?: boolean;
}

export default function Logo({ className = "text-foreground", showText = true, isCollapsed = false }: Props) {
  return (
    <div className={`relative z-30 ${isCollapsed ? "p-4 justify-center gap-0" : "p-10 gap-4"} flex items-center transition-all duration-500 select-none ${className}`}>
        <div className="animate-pulse-slow">
          <StarLogo />
        </div>
        <div className={`flex flex-col transition-all duration-300 overflow-hidden ${showText ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>
          <span className="font-mono text-2xl font-black tracking-[-0.05em] uppercase italic leading-none">Nexus</span>
        </div>
      </div>
  )
}