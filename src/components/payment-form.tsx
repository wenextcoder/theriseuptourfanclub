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

  const handleSubmit = async (e?: React.MouseEvent | React.FormEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    console.log('=== Payment Submit Started ===')
    console.log('Stripe loaded:', !!stripe)
    console.log('Elements loaded:', !!elements)

    if (!stripe || !elements) {
      console.error('Stripe or Elements not loaded')
      setMessage("Payment system not ready. Please refresh the page and try again.")
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      console.log('Confirming payment...')
      
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required", // Never redirect
      })

      console.log('Payment result:', { error, paymentIntent })

      if (error) {
        // Payment failed - show error and stay on page for retry
        console.error('Payment error:', error)
        if (error.type === "card_error" || error.type === "validation_error") {
          setMessage(error.message || "Payment declined. Please check your card details and try again.")
        } else {
          setMessage(`Payment failed: ${error.message || 'Unknown error'}`)
        }
        onError(error.message || "Payment failed")
        setIsLoading(false)
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded
        console.log('✅ Payment successful!', paymentIntent.id)
        setMessage("Payment successful! Processing your application...")
        setTimeout(() => {
          onSuccess()
        }, 1000)
      } else if (paymentIntent) {
        // Unexpected status
        console.log('Unexpected payment status:', paymentIntent.status)
        setMessage(`Payment status: ${paymentIntent.status}. Please contact support if needed.`)
        setIsLoading(false)
      } else {
        // No error and no paymentIntent
        console.error('No error and no paymentIntent returned')
        setMessage("Unable to process payment. Please try again.")
        setIsLoading(false)
      }
    } catch (err: any) {
      console.error('Payment exception:', err)
      setMessage(`Error: ${err.message || 'An unexpected error occurred'}`)
      onError(err.message || "An unexpected error occurred")
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
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
        <div className={`p-4 rounded-lg animate-in fade-in-50 slide-in-from-top-2 ${
          message.includes("success") || message.includes("successful")
            ? "bg-green-50 text-green-800 border-2 border-green-200" 
            : "bg-red-50 text-red-800 border-2 border-red-200"
        }`}>
          <div className="flex items-start gap-3">
            {message.includes("success") || message.includes("successful") ? (
              <svg className="h-5 w-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            ) : (
              <svg className="h-5 w-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
            )}
            <div className="flex-1">
              <p className="text-sm font-semibold">{message}</p>
              {!message.includes("success") && !message.includes("successful") && (
                <p className="text-xs mt-1 opacity-80">You can update your payment details and try again below.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <Button 
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit(e as any);
        }}
        disabled={isLoading || !stripe || !elements}
        className="w-full h-14 text-lg font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing Payment...
          </>
        ) : message && (message.includes("declined") || message.includes("failed")) ? (
          <>
            <Lock className="mr-2 h-5 w-5" />
            Retry Payment - ${amount.toFixed(2)}
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
    </div>
  )
}

