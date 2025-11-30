import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
})

export async function POST(req: NextRequest) {
  try {
    console.log('=== Payment Intent API Called ===')

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not found in environment variables')
      return NextResponse.json(
        { error: 'Stripe not configured. Please add STRIPE_SECRET_KEY to .env.local' },
        { status: 500 }
      )
    }

    const { amount, metadata } = await req.json()
    console.log('Amount:', amount)
    console.log('Metadata:', metadata)

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: metadata || {},
    })

    console.log('✅ Payment Intent created:', paymentIntent.id)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error: any) {
    console.error('❌ Error creating payment intent:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}

