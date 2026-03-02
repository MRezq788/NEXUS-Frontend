import { Loader2 } from "lucide-react"
import { INPUT_CLASS } from "../shared/AuthUI"
import type { useAuthFlow, AccountType } from "../hooks/useAuthFlow"

type AuthLogic = ReturnType<typeof useAuthFlow>

export function CompleteProfile(props: AuthLogic) {
  return (
    <form onSubmit={props.handleCompleteProfile} className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">Complete Your Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">We just need one more detail.</p>
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <label htmlFor="cp-name" className="text-sm font-medium text-foreground">{"Full Name*"}</label>
        <input id="cp-name" type="text" required placeholder="Your full name" autoComplete="name" value={props.fullName} onChange={(e) => props.setFullName(e.target.value)} className={INPUT_CLASS} />
      </fieldset>

      <fieldset className="flex flex-col gap-1.5">
        <label htmlFor="cp-account-type" className="text-sm font-medium text-foreground">{"Account Type*"}</label>
        <select id="cp-account-type" required value={props.accountType} onChange={(e) => props.setAccountType(e.target.value as AccountType)} className={`${INPUT_CLASS} appearance-none`}>
          <option value="" disabled>Select your account type</option>
          <option value="business_owner">Business Owner</option>
          <option value="warehouse">Warehouse</option>
        </select>
      </fieldset>

      <button type="submit" disabled={props.isEmailLoading} className="flex h-12 items-center justify-center rounded-full bg-foreground text-sm font-semibold uppercase tracking-widest text-background transition-opacity hover:opacity-90 disabled:opacity-60">
        {props.isEmailLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Complete Setup"}
      </button>
    </form>
  )
}