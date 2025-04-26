"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from "react"
import { cn } from "../lib/utils"

// Create a context to manage loading state globally
type LoadingContextType = {
  showLoading: (text?: string) => void
  hideLoading: () => void
  isLoading: boolean
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

// Props for the LoadingProvider component
interface LoadingProviderProps {
  children: ReactNode
}

// Props for the LoadingSpinner component
interface LoadingSpinnerProps {
  loading: boolean
  fullScreen?: boolean
  size?: "sm" | "md" | "lg"
  text?: string
  overlay?: boolean
  className?: string
}

// Provider component to wrap your application
export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState<string | undefined>(undefined)

  const showLoading = (text?: string) => {
    setLoadingText(text)
    setIsLoading(true)
  }

  const hideLoading = () => {
    setIsLoading(false)
  }

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, isLoading }}>
      {children}
      {isLoading && (
        <LoadingSpinner 
          loading={true} 
          fullScreen={true} 
          overlay={true} 
          size="lg" 
          text={loadingText} 
        />
      )}
    </LoadingContext.Provider>
  )
}

// Hook to use the loading context
export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider")
  }
  return context
}

// The LoadingSpinner component
export default function LoadingSpinner({
  loading,
  fullScreen = false,
  size = "md",
  text,
  overlay = false,
  className,
}: LoadingSpinnerProps) {
  const [visible, setVisible] = useState(false)

  // Add a small delay before showing the loader to prevent flashing
  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (loading) {
      timeout = setTimeout(() => {
        setVisible(true)
      }, 150)
    } else {
      setVisible(false)
    }

    return () => {
      clearTimeout(timeout)
    }
  }, [loading])

  if (!loading && !visible) return null

  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  }

  const containerClasses = cn(
    "flex flex-col items-center justify-center transition-opacity duration-300",
    visible ? "opacity-100" : "opacity-0",
    fullScreen ? "fixed inset-0 z-50" : "relative",
    overlay && fullScreen ? "bg-[#3F3D56]/70 backdrop-blur-sm" : "",
    className,
  )

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <div className={cn("rounded-full border-t-transparent border-[#4987FF] animate-spin", sizeClasses[size])} />
      {text && <p className="mt-3 text-white/90 text-sm font-medium">{text}</p>}
      <span className="sr-only">Loading</span>
    </div>
  )
}
