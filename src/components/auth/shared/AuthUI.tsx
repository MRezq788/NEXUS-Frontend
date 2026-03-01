import { Check } from "lucide-react"

// Centralized input styling for the whole auth flow
export const INPUT_CLASS =
  "h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-foreground focus:outline-none"

export function PasswordCheck({ passed, label }: { passed: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm transition-colors ${
          passed ? "bg-foreground" : "border border-input bg-background"
        }`}
      >
        {passed && <Check className="h-3 w-3 text-background" />}
      </div>
      <span className={`text-xs transition-colors ${passed ? "text-foreground" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  )
}

export function Divider() {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">Or</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

export function SocialButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 items-center justify-center gap-2 rounded-full border border-input bg-background text-sm font-medium text-foreground transition-colors hover:bg-secondary w-full"
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}