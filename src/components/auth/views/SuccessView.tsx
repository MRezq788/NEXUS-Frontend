import { Check } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface SuccessViewProps {
  isNewUser: boolean;
}

export function SuccessView({ isNewUser }: SuccessViewProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center py-4 animate-in fade-in zoom-in duration-300">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-500">
        <Check className="h-10 w-10" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {isNewUser ? "Account Created!" : "Welcome Back!"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isNewUser 
            ? "Your B2B profile has been synced successfully." 
            : "You have successfully signed into your account."}
        </p>
      </div>
      <button 
        onClick={() => navigate("/dashboard")}
        className="flex h-12 w-full items-center justify-center rounded-full bg-foreground text-sm font-semibold uppercase tracking-widest text-background transition-opacity hover:opacity-90"
      >
        Go to Dashboard
      </button>
    </div>
  )
}