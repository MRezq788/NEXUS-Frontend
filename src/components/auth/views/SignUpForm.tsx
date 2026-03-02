import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Divider, SocialButton, PasswordCheck, INPUT_CLASS } from "../shared/AuthUI"
import { GoogleIcon } from "../shared/AuthIcons"
import type { useAuthFlow, AccountType } from "../hooks/useAuthFlow"

type AuthLogic = ReturnType<typeof useAuthFlow>

export function SignUpForm(props: AuthLogic) {
  return (
    <form onSubmit={props.handleEmailSignUp} className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-foreground text-balance italic">Join Nexus</h1>
        <p className="mt-1 text-sm text-muted-foreground font-medium opacity-70">Create your account and start today</p>
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <label htmlFor="su-name" className="text-sm font-medium text-foreground">{"Name*"}</label>
        <input id="su-name" type="text" required placeholder="Courtney Henry" autoComplete="name" value={props.fullName} onChange={(e) => props.setFullName(e.target.value)} className={INPUT_CLASS} />
      </fieldset>

      {/* Email with Elegant Error State */}
      <fieldset className="flex flex-col gap-1.5">
        <label htmlFor="su-email" className={`text-sm font-medium transition-colors ${props.emailError ? "text-red-500" : "text-foreground"}`}>
          {"Email*"}
        </label>
        <input 
          id="su-email" type="email" required placeholder="courtneyhenry11@gmail.com" autoComplete="email" 
          value={props.email} 
          onChange={(e) => {
            props.setEmail(e.target.value)
            if (props.emailError) props.setEmailError(null)
          }} 
          className={`${INPUT_CLASS} transition-all duration-200 ${
            props.emailError ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-500/5" : ""
          }`} 
        />
        {props.emailError && (
          <p className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
            {props.emailError}
          </p>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-1.5">
        <label htmlFor="su-password" className="text-sm font-medium text-foreground">{"Password*"}</label>
        <div className="relative">
          <input 
            id="su-password" type={props.showPassword ? "text" : "password"} required placeholder="Create a secure password" autoComplete="new-password" 
            value={props.password} 
            onChange={(e) => props.setPassword(e.target.value)} 
            className={`${INPUT_CLASS} pr-11`} 
          />
          <button type="button" onClick={() => props.setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={props.showPassword ? "Hide password" : "Show password"}>
            {props.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="mt-1 flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">Your password needs to include:</p>
          <PasswordCheck passed={props.hasNumber} label="Must contain one number" />
          <PasswordCheck passed={props.hasMinLength} label="Min 8 characters" />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-1.5">
        <label htmlFor="su-account-type" className="text-sm font-medium text-foreground">{"Account Type*"}</label>
        <select id="su-account-type" required value={props.accountType} onChange={(e) => props.setAccountType(e.target.value as AccountType)} className={`${INPUT_CLASS} appearance-none`}>
          <option value="" disabled>Select your account type</option>
          <option value="business_owner">Business Owner</option>
          <option value="warehouse">Warehouse</option>
        </select>
      </fieldset>

      <label className="flex items-center gap-2.5 cursor-pointer">
        <input type="checkbox" checked={props.agreedToTerms} onChange={() => props.setAgreedToTerms((p) => !p)} className="h-4 w-4 rounded border-input accent-foreground" />
        <span className="text-sm text-muted-foreground">
          {"I agree to the "}
          <span className="font-medium text-foreground underline underline-offset-2">{"Term & Privacy"}</span>
        </span>
      </label>

      <button type="submit" disabled={props.isEmailLoading || !props.agreedToTerms || !props.hasNumber || !props.hasMinLength} className="flex h-12 items-center justify-center rounded-full bg-foreground text-sm font-semibold uppercase tracking-widest text-background transition-opacity hover:opacity-90 disabled:opacity-60">
        {props.isEmailLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign Me Up!"}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        {"Already have an account? "}
        <button type="button" onClick={() => { props.setView("signIn"); props.resetFields() }} className="font-medium text-foreground underline underline-offset-2">Log in</button>
      </p>

      <Divider />

      <SocialButton onClick={props.handleGoogleAuth} icon={props.isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />} label="Sign Up with Google" />
    </form>
  )
}