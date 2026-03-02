import { Check, Moon, Sun } from "lucide-react"
import { useTheme } from "../../../contexts/ThemeContext"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background/50 backdrop-blur-sm text-foreground transition-all hover:bg-secondary focus:outline-none active:scale-90"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  )
}

// Centralized input styling for the whole auth flow
export const INPUT_CLASS =
  "h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-300 focus:border-foreground focus:ring-4 focus:ring-foreground/5 focus:outline-none hover:bg-secondary/30 dark:bg-foreground/5"

export function PasswordCheck({ passed, label }: { passed: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
          passed ? "bg-foreground scale-110" : "border border-input bg-background"
        }`}
      >
        {passed && <Check className="h-2.5 w-2.5 text-background" />}
      </div>
      <span className={`text-xs transition-colors duration-300 ${passed ? "text-foreground font-medium" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  )
}

export function Divider() {
  return (
    <div className="flex items-center gap-4 py-2">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Or</span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
    </div>
  )
}

export function SocialButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-12 items-center justify-center gap-3 rounded-xl border border-input bg-background text-sm font-semibold text-foreground transition-all duration-300 hover:border-foreground hover:bg-foreground hover:text-background w-full shadow-sm hover:shadow-md active:scale-[0.98]"
    >
      <div className="group-hover:brightness-0 group-hover:invert transition-all duration-300">
        {icon}
      </div>
      <span>{label}</span>
    </button>
  )
}