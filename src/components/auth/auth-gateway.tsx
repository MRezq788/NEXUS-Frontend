import { BrandedPanel } from "./shared/BrandedPanel";
import { SignInForm } from "./views/SignInForm";
import { SignUpForm } from "./views/SignUpForm";
import { CompleteProfile } from "./views/CompleteProfile";
import { SuccessView } from "./views/SuccessView";
import { useAuthFlow } from "./hooks/useAuthFlow";
import { ThemeToggle } from "./shared/AuthUI";

export function AuthGateway() {
  // 1. Pull all the complex logic and state from our custom hook
  const authLogic = useAuthFlow();

  // 2. Render the layout and dynamically swap the right-side panel
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-3 transition-colors duration-500">
      
      {/* Floating Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="grid w-full max-w-[1060px] grid-cols-1 overflow-hidden rounded-3xl border border-border bg-card shadow-[0_32px_128px_-32px_rgba(0,0,0,0.25)] lg:grid-cols-2 lg:min-h-[660px]">
        
        {/* Left Side: Static Branded UI */}
        <BrandedPanel />

        {/* Right Side: Dynamic Form Panel */}
        <div className="flex flex-col justify-center overflow-y-auto px-8 py-10 sm:px-12 lg:px-14 bg-background transition-colors duration-500">
          {authLogic.view === "signIn" && <SignInForm {...authLogic} />}
          {authLogic.view === "signUp" && <SignUpForm {...authLogic} />}
          {authLogic.view === "completeProfile" && <CompleteProfile {...authLogic} />}
          {authLogic.view === "success" && <SuccessView isNewUser={authLogic.fullName.length > 0} />}
        </div>
        
      </div>
    </main>
  );
}