import { Check } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { usersApi } from "../../../api"

interface SuccessViewProps {
  isNewUser: boolean;
}

export function SuccessView({ isNewUser }: SuccessViewProps) {
  const navigate = useNavigate()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isCheckingRole, setIsCheckingRole] = useState(true)

  useEffect(() => {
    // Fetch user role to determine redirect destination
    const fetchUserRole = async () => {
      try {
        const response = await usersApi.getUserProfile()
        if (response.success && response.data?.role) {
          setUserRole(response.data.role)
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
      } finally {
        setIsCheckingRole(false)
      }
    }

    fetchUserRole()
  }, [])

  const handleContinue = () => {
    // Redirect cashiers to POS, everyone else to dashboard
    if (userRole === 'cashier') {
      navigate("/pos")
    } else {
      navigate("/dashboard")
    }
  }

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
        onClick={handleContinue}
        disabled={isCheckingRole}
        className="flex h-12 w-full items-center justify-center rounded-full bg-foreground text-sm font-semibold uppercase tracking-widest text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isCheckingRole ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
            Loading...
          </div>
        ) : (
          userRole === 'cashier' ? 'Go to POS' : 'Go to Dashboard'
        )}
      </button>
    </div>
  )
}