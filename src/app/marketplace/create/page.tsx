"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Upload, X, Calendar, Clock, Info, Check } from "lucide-react"
import { format, set } from "date-fns"
import { DayPicker } from "react-day-picker"
import * as LabelPrimitive from "@radix-ui/react-label"
import * as SelectPrimitive from "@radix-ui/react-select"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import * as ToastPrimitive from "@radix-ui/react-toast"
import { cva } from "class-variance-authority"
import { cn } from "../../../../lib/utils"
import useUserStore from "../../../../lib/userStore"
import { Category } from "../../../../lib/types/Category"




// Toast components
const ToastProvider = ToastPrimitive.Provider
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className,
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitive.Viewport.displayName

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border border-gray-200 p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full bg-white",
        className,
      )}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitive.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className,
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitive.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-0 transition-opacity hover:text-gray-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitive.Close>
))
ToastClose.displayName = ToastPrimitive.Close.displayName

const ToastTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("text-sm font-semibold", className)} {...props} />,
)
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("text-sm opacity-90", className)} {...props} />,
)
ToastDescription.displayName = "ToastDescription"

// Button component
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-[#3F3D56] text-white hover:bg-[#2d2b40]",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost" | "link"
    size?: "default" | "sm" | "lg"
  }
>(({ className, variant, size, ...props }, ref) => {
  return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = "Button"

// Input component
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F3D56] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

// Label component
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className,
    )}
    {...props}
  />
))
Label.displayName = "Label"

// Textarea component
const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F3D56] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = "Textarea"

// Select components
const Select = SelectPrimitive.Root
const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F3D56] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 opacity-50"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectValue = SelectPrimitive.Value
const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white text-gray-900 shadow-md animate-in fade-in-80",
        position === "popper" && "translate-y-1",
        className,
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M5 12l5 5 9-9" />
        </svg>
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

// Popover components
const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-white p-4 text-gray-900 shadow-md outline-none animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

// Form field wrapper component
const FormField = ({
  label,
  htmlFor,
  error,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  error?: string
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} className="text-base font-medium text-gray-900">
        {label}
      </Label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}


export default function CreateListing() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startPrice, setStartPrice] = useState("")
  const [buyNowPrice, setBuyNowPrice] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState<string>();
  const [endDate, setEndDate] = useState<Date>()
  const [endTime, setEndTime] = useState<string>("12:00")
  const [images, setImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState({ title: "", description: "", type: "success" })
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { user, isAuthenticated, hasHydrated } = useUserStore();

    useEffect(() => {
    if (!hasHydrated) return

    if (!isAuthenticated) {
      router.push("/login/client")
    }
  }, [hasHydrated, isAuthenticated, user])

  // Clear errors when fields are updated
  useEffect(() => {
    const newErrors = { ...errors }
    if (name) delete newErrors.name
    if (description) delete newErrors.description
    if (startPrice) delete newErrors.startPrice
    if (buyNowPrice) delete newErrors.buyNowPrice
    if (categoryId) delete newErrors.category
    if (endDate) delete newErrors.endDate
    if (images.length >= 4) delete newErrors.images
    setErrors(newErrors)
    fetchCategories()
  }, [user, name, description, startPrice, buyNowPrice, categoryId, endDate, images])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      const previewUrls = filesArray.map((file) => URL.createObjectURL(file))
  
      setImages((prev) => [...prev, ...filesArray])
      setPreviews((prev) => [...prev, ...previewUrls])
    }
  }
  
  

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = "Listing name is required"
    if (!description.trim()) newErrors.description = "Description is required"
    if (!startPrice) newErrors.startPrice = "Starting price is required"
    if (!buyNowPrice) newErrors.buyNowPrice = "Buy now price is required"
    if (!categoryId) newErrors.category = "Category is required"
    if (!endDate) newErrors.endDate = "End date is required"
    if (images.length < 1) newErrors.images = "Please upload at least 4 images"

    if (Number(startPrice) <= 0) newErrors.startPrice = "Starting price must be greater than 0"
    if (Number(buyNowPrice) <= 0) newErrors.buyNowPrice = "Buy now price must be greater than 0"
    if (Number(buyNowPrice) <= Number(startPrice)) {
      newErrors.buyNowPrice = "Buy now price must be greater than starting price"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/category`)
      if (!res.ok) {
        const errorMessage = await res.text()
        throw new Error(errorMessage || "Failed to register")
      }

      setCategories(await res.json())
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    if (!validateForm()) {
      setToastMessage({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        type: "error",
      })
      setShowToast(true)
      return
    }
  
    setIsSubmitting(true)
  
    try {
      const [hours, minutes] = endTime.split(":").map(Number)
      const combinedEndDateTime = endDate ? set(endDate, { hours, minutes }) : undefined
  
      const listingData = {
        name: name,
        description: description,
        buy_now_price: parseFloat(buyNowPrice).toString(),
        start_price: parseFloat(startPrice).toString(),
        expiration_date: combinedEndDateTime?.toISOString(),
        seller_id: user?.id.toString(),
        category_id: categoryId,
      }
  
      const formData = new FormData()
      formData.append('listing', JSON.stringify(listingData))
  
      images.forEach((file) => {
        formData.append('images', file)
      })
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/listing/`, {
        method: 'POST',
        body: formData,
      })
  
      if (!response.ok) {
        throw new Error('Failed to create listing')
      }
  
      setToastMessage({
        title: "Success!",
        description: "Your listing has been created successfully",
        type: "success",
      })
      setShowToast(true)
  
      setTimeout(() => {
        router.push("/marketplace")
      }, 2000)
    } catch (error) {
      console.error("Error creating listing:", error)
      setToastMessage({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        type: "error",
      })
      setShowToast(true)
    } finally {
      setIsSubmitting(false)
    }
  }
  

  return (
    <div className="min-h-screen bg-gray-50 py-8 text-black">
      <ToastProvider>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <Link
                href="/marketplace"
                className="inline-flex items-center text-[#3F3D56] hover:text-[#2d2b40] transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Marketplace
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Create New Listing</h1>
                <div className="bg-[#3F3D56]/10 text-[#3F3D56] text-sm font-medium px-3 py-1 rounded-full">Auction</div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                    <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                    <span className="text-sm text-gray-500">Step 1 of 3</span>
                  </div>

                  {/* Listing Name */}
                  <FormField label="Listing Name" htmlFor="name" error={errors.name}>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter a descriptive title for your listing"
                      className={errors.name ? "border-red-300" : ""}
                    />
                  </FormField>

                  {/* Description */}
                  <FormField label="Description" htmlFor="description" error={errors.description}>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={cn("min-h-[120px]", errors.description ? "border-red-300" : "")}
                      placeholder="Provide a detailed description of your item including condition, features, and any other relevant information"
                    />
                  </FormField>

                  {/* Category */}
                  <FormField label="Category" htmlFor="category" error={errors.category}>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger id="category" className={errors.category ? "border-red-300" : ""}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                {/* Pricing Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Pricing & Duration</h2>
                    <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                    <span className="text-sm text-gray-500">Step 2 of 3</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Starting Price */}
                    <FormField label="Starting Price ($)" htmlFor="startPrice" error={errors.startPrice}>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          id="startPrice"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={startPrice}
                          onChange={(e) => setStartPrice(e.target.value)}
                          className={cn("pl-8", errors.startPrice ? "border-red-300" : "")}
                          placeholder="0.00"
                        />
                      </div>
                    </FormField>

                    {/* Buy Now Price */}
                    <FormField label="Buy Now Price ($)" htmlFor="buyNowPrice" error={errors.buyNowPrice}>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          id="buyNowPrice"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={buyNowPrice}
                          onChange={(e) => setBuyNowPrice(e.target.value)}
                          className={cn("pl-8", errors.buyNowPrice ? "border-red-300" : "")}
                          placeholder="0.00"
                        />
                      </div>
                    </FormField>
                  </div>

                  {/* End Date & Time */}
                  <FormField label="Auction End Date & Time" htmlFor="endDate" error={errors.endDate}>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !endDate && "text-gray-400",
                                errors.endDate && "border-red-300",
                              )}
                              id="endDate"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {endDate ? format(endDate, "PPP") : "Select end date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <DayPicker
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                              initialFocus
                              disabled={(date) => date < new Date()}
                              className="border-none"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="relative w-full sm:w-40">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <Input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </FormField>

                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
                    <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Auction Duration</p>
                      <p className="text-sm text-blue-600 mt-1">
                        Your auction will start immediately after creation and end at the specified date and time. We
                        recommend setting the duration between 3-7 days for optimal bidding activity.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Images Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Images</h2>
                    <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                    <span className="text-sm text-gray-500">Step 3 of 3</span>
                  </div>

                  <FormField label="Listing Images" error={errors.images}>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {previews.map((image, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm group"
                          >
                            <Image
                              src={image || "/placeholder.svg"}
                              alt={`Listing image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                              >
                                <X className="h-4 w-4 text-gray-700" />
                                <span className="sr-only">Remove image</span>
                              </button>
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                              Image {index + 1}
                            </div>
                          </div>
                        ))}

                        {images.length < 8 && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 hover:border-[#3F3D56] hover:bg-gray-100 transition-colors"
                          >
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm font-medium text-gray-600">Upload Image</span>
                            <span className="text-xs text-gray-500 mt-1 text-center">
                              {images.length === 0 ? "Add at least 4 images" : "Add more images"}
                            </span>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </button>
                        )}
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                        <Info className="h-4 w-4" />
                        <span>Upload at least 4 high-quality images. First image will be the cover.</span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <div
                            key={index}
                            className={cn(
                              "w-6 h-1 rounded-full",
                              index < images.length ? "bg-[#3F3D56]" : "bg-gray-200",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </FormField>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {images.length >= 4 && name && description && startPrice && buyNowPrice && categoryId && endDate ? (
                        <>
                          <Check className="h-5 w-5 text-green-500" />
                          <span>All required fields completed</span>
                        </>
                      ) : (
                        <>
                          <Info className="h-5 w-5 text-amber-500" />
                          <span>Please complete all required fields</span>
                        </>
                      )}
                    </div>
                    <Button type="submit" className="w-full sm:w-auto px-8" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Creating...
                        </>
                      ) : (
                        "Create Listing"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {showToast && (
          <Toast
            className={cn(toastMessage.type === "error" ? "border-red-100 bg-red-50" : "border-green-100 bg-green-50")}
          >
            <div className="flex">
              {toastMessage.type === "error" ? (
                <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center mr-3">
                  <X className="h-4 w-4 text-red-600" />
                </div>
              ) : (
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
              )}
              <div>
                <ToastTitle className={toastMessage.type === "error" ? "text-red-800" : "text-green-800"}>
                  {toastMessage.title}
                </ToastTitle>
                <ToastDescription className={toastMessage.type === "error" ? "text-red-700" : "text-green-700"}>
                  {toastMessage.description}
                </ToastDescription>
              </div>
            </div>
            <ToastClose />
          </Toast>
        )}

        <ToastViewport />
      </ToastProvider>
    </div>
  )
}
