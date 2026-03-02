import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Divider, SocialButton, INPUT_CLASS } from "../shared/AuthUI"
import { GoogleIcon } from "../shared/AuthIcons"
import type { useAuthFlow } from "../hooks/useAuthFlow"

// Extracting the return type of our custom hook so we don't have to manually type every prop
type AuthLogic = ReturnType<typeof useAuthFlow>

export function SignInForm(props: AuthLogic) {
  return (
    <form onSubmit={props.handleEmailSignIn} className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">Welcome Back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
      </div>

      {/* Auth Error Toast/Message */}
      {props.authError && (
        <div className="rounded-md bg-red-500/10 p-3 border border-red-500/20">
          <p className="text-sm font-medium text-red-500">{props.authError}</p>
        </div>
      )}

      <fieldset className="flex flex-col gap-1.5">
        <label htmlFor="si-email" className="text-sm font-medium text-foreground">{"Email*"}</label>
        <input 
          id="si-email" type="email" required placeholder="you@example.com" autoComplete="email" 
          value={props.email} 
          onChange={(e) => {
            props.setEmail(e.target.value)
            if (props.authError) props.setAuthError(null)
          }} 
          className={INPUT_CLASS} 
        />
      </fieldset>

      <fieldset className="flex flex-col gap-1.5">
        <label htmlFor="si-password" className="text-sm font-medium text-foreground">{"Password*"}</label>
        <div className="relative">
          <input 
            id="si-password" type={props.showPassword ? "text" : "password"} required placeholder="Enter your password" autoComplete="current-password" 
            value={props.password} 
            onChange={(e) => {
              props.setPassword(e.target.value)
              if (props.authError) props.setAuthError(null)
            }} 
            className={`${INPUT_CLASS} pr-11`} 
          />
          <button type="button" onClick={() => props.setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={props.showPassword ? "Hide password" : "Show password"}>
            {props.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </fieldset>

      <button type="submit" disabled={props.isEmailLoading} className="flex h-12 items-center justify-center rounded-full bg-foreground text-sm font-semibold uppercase tracking-widest text-background transition-opacity hover:opacity-90 disabled:opacity-60">
        {props.isEmailLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        {"Don't have an account? "}
        <button type="button" onClick={() => { props.setView("signUp"); props.resetFields() }} className="font-medium text-foreground underline underline-offset-2">Sign Up</button>
      </p>

      <Divider />

      <SocialButton onClick={props.handleGoogleAuth} icon={props.isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />} label="Sign In with Google" />
    </form>
  )
}