"use client"

import { useState, useEffect } from "react"
import {
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard, Lock } from "lucide-react"

interface PaymentFormProps {
  amount: number
  onSuccess: () => void
  onError: (error: string) => void
}

export function PaymentForm({ amount, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    if (!stripe) {
      return
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    )

    if (!clientSecret) {
      return
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setMessage("Payment succeeded!")
          onSuccess()
          break
        case "processing":
          setMessage("Your payment is processing.")
          break
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.")
          break
        default:
          setMessage("Something went wrong.")
          break
      }
    })
  }, [stripe, onSuccess])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setMessage("")

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}?payment=success`,
      },
      redirect: "if_required",
    })

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "An error occurred")
        onError(error.message || "Payment failed")
      } else {
        setMessage("An unexpected error occurred.")
        onError("An unexpected error occurred")
      }
    } else {
      setMessage("Payment successful!")
      onSuccess()
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-xl border-2 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-3xl font-bold text-primary">${amount.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span className="text-xs">Secure Payment</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-lg border-2 border-border bg-background">
          <PaymentElement 
            options={{
              layout: "tabs",
            }}
          />
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes("success") 
            ? "bg-green-50 text-green-800 border border-green-200" 
            : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      <Button 
        type="submit" 
        disabled={isLoading || !stripe || !elements}
        className="w-full h-14 text-lg font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-5 w-5" />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span>🔒 SSL Encrypted</span>
        <span>•</span>
        <span>Powered by Stripe</span>
      </div>
    </form>
  )
}

