import { useState, useCallback, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Loader2, Check } from "lucide-react"

// --- NEW FIREBASE IMPORTS ---
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  getAdditionalUserInfo
} from "firebase/auth"
import type { User } from "firebase/auth"
import { auth } from "../../config/firbase" 

type AuthView = "signIn" | "signUp" | "completeProfile" | "success"
type AccountType = "business_owner" | "warehouse" | "app_User" | ""

/* ═══════════════════════════════════════════════
   GOOGLE & APPLE SVG ICONS
   ═══════════════════════════════════════════════ */

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}



/* ═══════════════════════════════════════════════
   STAR LOGO SVG
   ═══════════════════════════════════════════════ */

function StarLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-label="Logo">
      <line x1="18" y1="2" x2="18" y2="34" stroke="white" strokeWidth="2" />
      <line x1="2" y1="18" x2="34" y2="18" stroke="white" strokeWidth="2" />
      <line x1="6.27" y1="6.27" x2="29.73" y2="29.73" stroke="white" strokeWidth="2" />
      <line x1="29.73" y1="6.27" x2="6.27" y2="29.73" stroke="white" strokeWidth="2" />
      <circle cx="18" cy="18" r="2.5" fill="white" />
    </svg>
  )
}

/* ═══════════════════════════════════════════════
   SHARED UI PIECES
   ═══════════════════════════════════════════════ */

function PasswordCheck({ passed, label }: { passed: boolean; label: string }) {
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

function Divider() {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">Or</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

function SocialButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 items-center justify-center gap-2 rounded-full border border-input bg-background text-sm font-medium text-foreground transition-colors hover:bg-secondary"
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

/* ═══════════════════════════════════════════════
   LEFT BRANDED PANEL
   ═══════════════════════════════════════════════ */

function BrandedPanel() {
  return (
    <div className="relative hidden lg:flex lg:flex-col lg:justify-between overflow-hidden rounded-2xl m-3 bg-foreground text-background">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{ backgroundImage: "url('/images/space-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-foreground/30" />

      {/* Logo */}
      <div className="relative z-10 p-8">
        <StarLogo />
      </div>

      {/* Center text */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-12">
        <h2 className="text-center font-mono text-lg tracking-wide leading-relaxed text-background md:text-xl text-balance">
          {"Discover the Future of Finance from Mars 🌍 to Your Wallet"}
        </h2>
      </div>

      {/* Bottom brand logos */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-6 px-8 pb-8">
        <span className="text-xs tracking-wider opacity-50 font-sans">Booking.com</span>
        <span className="text-xs tracking-wider opacity-50 font-sans">Spotify</span>
        <span className="text-sm tracking-wider opacity-50 font-sans font-semibold">Google</span>
        <span className="text-xs tracking-wider opacity-50 font-sans">Discord</span>
        <span className="text-xs tracking-wider opacity-50 font-sans">airbnb</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   MAIN AUTH GATEWAY
   ═══════════════════════════════════════════════ */

export function AuthGateway() {
  const navigate = useNavigate()
  const [view, setView] = useState<AuthView>("signUp")
  const [showPassword, setShowPassword] = useState(false)

  // Shared fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [accountType, setAccountType] = useState<AccountType>("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Loading
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Password validation
  const hasNumber = /\d/.test(password)
  const hasMinLength = password.length >= 8

  function resetFields() {
    setEmail("")
    setPassword("")
    setFullName("")
    setAccountType("")
    setAgreedToTerms(false)
    setShowPassword(false)
  }

  // Helper to sync user to backend
  const syncUserWithBackend = async (user: User, name: string, role: string) => {
    // 1. Get the JWT token from Firebase Client SDK
    const token = await user.getIdToken();
    
    // 2. Call your strict backend architecture
    const response = await fetch('http://localhost:3000/api/users/sync', { // Adjust URL based on your env
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: name,
        email: user.email,
        role: role
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to sync user with backend');
    }
  };


  // --- Firebase placeholder handlers ---
  const handleEmailSignIn = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    setIsEmailLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate("/dashboard")
    } catch (err) {
      console.error("Sign in error:", err)
      // Add toast or error state here for the user
    } finally {
      setIsEmailLoading(false)
    }
  }, [email, password, navigate])

  const handleEmailSignUp = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    setIsEmailLoading(true)
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // 2. Sync to Backend (creates Firestore document)
      await syncUserWithBackend(userCredential.user, fullName, accountType)
      
      // 3. Navigate to dashboard
      navigate("/dashboard")
    } catch (err) {
      console.error("Sign up error:", err)
    } finally {
      setIsEmailLoading(false)
    }
  }, [email, password, fullName, accountType, navigate])

  const handleGoogleAuth = useCallback(async () => {
    setIsGoogleLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      
      // Check if this is their first time logging in
      const isNewUser = getAdditionalUserInfo(result)?.isNewUser

      if (isNewUser) {
        // We can't sync to the backend yet because we don't know their role (accountType)
        setFullName(result.user.displayName || "")
        setView("completeProfile")
      } else {
        // Returning user, just go to dashboard
        navigate("/dashboard")
      }
    } catch (err) {
      console.error("Google auth error:", err)
    } finally {
      setIsGoogleLoading(false)
    }
  }, [navigate])

  const handleCompleteProfile = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    setIsEmailLoading(true)
    try {
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error("No authenticated user found")

      // Sync the new Google user to the backend now that we have their role
      await syncUserWithBackend(currentUser, fullName, accountType)
      
      navigate("/dashboard")
    } catch (err) {
      console.error("Complete profile error:", err)
    } finally {
      setIsEmailLoading(false)
    }
  }, [fullName, accountType, navigate]
)

  // ═══════════════════════════════════════════════
  // INPUT CLASSNAMES
  // ═══════════════════════════════════════════════

  const inputClass =
    "h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-foreground focus:outline-none"

  // ═══════════════════════════════════════════════
  // SIGN IN VIEW
  // ═══════════════════════════════════════════════

  function renderSignIn() {
    return (
      <form onSubmit={handleEmailSignIn} className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">Welcome Back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <fieldset className="flex flex-col gap-1.5">
          <label htmlFor="si-email" className="text-sm font-medium text-foreground">{"Email*"}</label>
          <input id="si-email" type="email" required placeholder="you@example.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </fieldset>

        <fieldset className="flex flex-col gap-1.5">
          <label htmlFor="si-password" className="text-sm font-medium text-foreground">{"Password*"}</label>
          <div className="relative">
            <input id="si-password" type={showPassword ? "text" : "password"} required placeholder="Enter your password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pr-11`} />
            <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </fieldset>

        <button type="submit" disabled={isEmailLoading} className="flex h-12 items-center justify-center rounded-full bg-foreground text-sm font-semibold uppercase tracking-widest text-background transition-opacity hover:opacity-90 disabled:opacity-60">
          {isEmailLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          {"Don't have an account? "}
          <button type="button" onClick={() => { setView("signUp"); resetFields() }} className="font-medium text-foreground underline underline-offset-2">Sign Up</button>
        </p>

        <Divider />

        <SocialButton onClick={handleGoogleAuth} icon={isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />} label="Sign In with Google" />
      </form>
    )
  }

  // ═══════════════════════════════════════════════
  // SIGN UP VIEW
  // ═══════════════════════════════════════════════

  function renderSignUp() {
    return (
      <form onSubmit={handleEmailSignUp} className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">Join Now for Success</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create your account and start today</p>
        </div>

        {/* Name */}
        <fieldset className="flex flex-col gap-1.5">
          <label htmlFor="su-name" className="text-sm font-medium text-foreground">{"Name*"}</label>
          <input id="su-name" type="text" required placeholder="Courtney Henry" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
        </fieldset>

        {/* Email */}
        <fieldset className="flex flex-col gap-1.5">
          <label htmlFor="su-email" className="text-sm font-medium text-foreground">{"Email*"}</label>
          <input id="su-email" type="email" required placeholder="courtneyhenry11@gmail.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </fieldset>

        {/* Password */}
        <fieldset className="flex flex-col gap-1.5">
          <label htmlFor="su-password" className="text-sm font-medium text-foreground">{"Password*"}</label>
          <div className="relative">
            <input id="su-password" type={showPassword ? "text" : "password"} required placeholder="Create a secure password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputClass} pr-11`} />
            <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-1 flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">Your password needs to include:</p>
            <PasswordCheck passed={hasNumber} label="Must contain one number" />
            <PasswordCheck passed={hasMinLength} label="Min 8 characters" />
          </div>
        </fieldset>

        {/* Account Type */}
        <fieldset className="flex flex-col gap-1.5">
          <label htmlFor="su-account-type" className="text-sm font-medium text-foreground">{"Account Type*"}</label>
          <select id="su-account-type" required value={accountType} onChange={(e) => setAccountType(e.target.value as AccountType)} className={`${inputClass} appearance-none`}>
            <option value="" disabled>Select your account type</option>
            <option value="business_owner">Business Owner</option>
            <option value="warehouse">Warehouse</option>
            <option value="app_user">App User</option>
          </select>
        </fieldset>

        {/* Terms */}
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={agreedToTerms} onChange={() => setAgreedToTerms((p) => !p)} className="h-4 w-4 rounded border-input accent-foreground" />
          <span className="text-sm text-muted-foreground">
            {"I agree to the "}
            <span className="font-medium text-foreground underline underline-offset-2">{"Term & Privacy"}</span>
          </span>
        </label>

        {/* Submit */}
        <button type="submit" disabled={isEmailLoading || !agreedToTerms || !hasNumber || !hasMinLength} className="flex h-12 items-center justify-center rounded-full bg-foreground text-sm font-semibold uppercase tracking-widest text-background transition-opacity hover:opacity-90 disabled:opacity-60">
          {isEmailLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign Me Up!"}
        </button>

        {/* Switch */}
        <p className="text-center text-sm text-muted-foreground">
          {"Already have an account? "}
          <button type="button" onClick={() => { setView("signIn"); resetFields() }} className="font-medium text-foreground underline underline-offset-2">Log in</button>
        </p>

        <Divider />

        {/* Social */}
        <SocialButton onClick={handleGoogleAuth} icon={isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />} label="Sign Up with Google" />
      </form>
    )
  }

  // ═══════════════════════════════════════════════
  // COMPLETE PROFILE VIEW
  // ═══════════════════════════════════════════════

  function renderCompleteProfile() {
    return (
      <form onSubmit={handleCompleteProfile} className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">Complete Your Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">We just need one more detail.</p>
        </div>

        <fieldset className="flex flex-col gap-1.5">
          <label htmlFor="cp-name" className="text-sm font-medium text-foreground">{"Full Name*"}</label>
          <input id="cp-name" type="text" required placeholder="Your full name" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
        </fieldset>

        <fieldset className="flex flex-col gap-1.5">
          <label htmlFor="cp-account-type" className="text-sm font-medium text-foreground">{"Account Type*"}</label>
          <select id="cp-account-type" required value={accountType} onChange={(e) => setAccountType(e.target.value as AccountType)} className={`${inputClass} appearance-none`}>
            <option value="" disabled>Select your account type</option>
            <option value="business_owner">Business Owner</option>
            <option value="warehouse">Warehouse</option>
            <option value="app_user">App User</option>
          </select>
        </fieldset>

        <button type="submit" disabled={isEmailLoading} className="flex h-12 items-center justify-center rounded-full bg-foreground text-sm font-semibold uppercase tracking-widest text-background transition-opacity hover:opacity-90 disabled:opacity-60">
          {isEmailLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Complete Setup"}
        </button>
      </form>
    )
  }

  // ═══════════════════════════════════════════════
  // MAIN LAYOUT
  // ═══════════════════════════════════════════════

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-3">
      <div className="grid w-full max-w-[1060px] grid-cols-1 overflow-hidden rounded-2xl border border-border shadow-xl lg:grid-cols-2 lg:min-h-[660px]">
        {/* Left branded panel */}
        <BrandedPanel />

        {/* Right form panel */}
        <div className="flex flex-col justify-center overflow-y-auto px-8 py-10 sm:px-12 lg:px-14">
          {view === "signIn" && renderSignIn()}
          {view === "signUp" && renderSignUp()}
          {view === "completeProfile" && renderCompleteProfile()}
        </div>
      </div>
    </main>
  )
}
