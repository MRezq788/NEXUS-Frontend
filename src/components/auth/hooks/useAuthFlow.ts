import { useState, useCallback } from "react"
import type { FormEvent } from "react"
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  getAdditionalUserInfo
} from "firebase/auth"
import type { User } from "firebase/auth"
import { auth } from "../../../config/firbase" // Note: adjust spelling if you renamed 'firbase.ts' to 'firebase.ts'

export type AuthView = "signIn" | "signUp" | "completeProfile" | "success"
export type AccountType = "business_owner" | "warehouse" | "app_user" | ""

export function useAuthFlow() {
  // Navigation & View State
  const [view, setView] = useState<AuthView>("signUp")
  const [showPassword, setShowPassword] = useState(false)

  // Form Fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [accountType, setAccountType] = useState<AccountType>("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Loading States
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  
  // Error States
  const [emailError, setEmailError] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  // Computed Validation
  const hasNumber = /\d/.test(password)
  const hasMinLength = password.length >= 8

  function resetFields() {
    setEmail("")
    setPassword("")
    setFullName("")
    setAccountType("")
    setAgreedToTerms(false)
    setShowPassword(false)
    setEmailError(null)
    setAuthError(null)
  }

  // Helper to sync user to backend
  const syncUserWithBackend = async (user: User, name: string, role: string) => {
    const token = await user.getIdToken()
    
    // Adjust URL based on your env
    const response = await fetch('http://localhost:3000/api/users/sync', { 
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
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to sync user with backend')
    }
  }

  // Handlers
  const handleEmailSignIn = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    setIsEmailLoading(true)
    setAuthError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      setView("success")
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setAuthError("Invalid email or password. Please try again.")
      } else {
        console.error("Sign in error:", err)
      }
    } finally {
      setIsEmailLoading(false)
    }
  }, [email, password])

  const handleEmailSignUp = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    setIsEmailLoading(true)
    setEmailError(null)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await syncUserWithBackend(userCredential.user, fullName, accountType)
      setView("success") 
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setEmailError("This email is already in use. Please try signing in.")
      } else {
        console.error("Sign up error:", err)
      }
    } finally {
      setIsEmailLoading(false)
    }
  }, [email, password, fullName, accountType])

  const handleGoogleAuth = useCallback(async () => {
    setIsGoogleLoading(true)
    setAuthError(null)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const isNewUser = getAdditionalUserInfo(result)?.isNewUser

      if (isNewUser) {
        setFullName(result.user.displayName || "")
        setView("completeProfile")
      } else {
        setView("success")
      }
    } catch (err) {
      console.error("Google auth error:", err)
    } finally {
      setIsGoogleLoading(false)
    }
  }, [])

  const handleCompleteProfile = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    setIsEmailLoading(true)
    try {
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error("No authenticated user found")

      await syncUserWithBackend(currentUser, fullName, accountType)
      setView("success")
    } catch (err) {
      console.error("Complete profile error:", err)
    } finally {
      setIsEmailLoading(false)
    }
  }, [fullName, accountType])

  return {
    view, setView,
    showPassword, setShowPassword,
    email, setEmail,
    password, setPassword,
    fullName, setFullName,
    accountType, setAccountType,
    agreedToTerms, setAgreedToTerms,
    isEmailLoading, isGoogleLoading,
    emailError, setEmailError,
    authError, setAuthError,
    hasNumber, hasMinLength,
    resetFields,
    handleEmailSignIn, handleEmailSignUp, handleGoogleAuth, handleCompleteProfile
  }
}