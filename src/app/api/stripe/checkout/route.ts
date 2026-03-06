import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

// In a real environment, you would use process.env.STRIPE_SECRET_KEY
// We initialize it conditionally so the build doesn't crash during local dev without it.
const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' as any })
    : null;

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!stripe) {
            // Mock response for local development if no Stripe key is provided
            return NextResponse.redirect(new URL('/settings/billing?error=Stripe_Secret_Key_Missing', req.url))
        }

        const formData = await req.formData()
        const priceId = formData.get('priceId') as string

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            billing_address_collection: 'auto',
            line_items: [
                {
                    price: priceId, // In real life, use a real Stripe Price ID
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/settings/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/settings/billing?canceled=true`,
            metadata: {
                userId: user.id // Attach Supabase user ID so you can update DB via Webhooks later
            }
        })

        if (!session.url) {
            throw new Error('Failed to create stripe checkout session')
        }

        return NextResponse.redirect(session.url, 303)
    } catch (err: any) {
        console.error('Stripe Checkout Error:', err)
        return NextResponse.redirect(new URL(`/settings/billing?error=${encodeURIComponent(err.message)}`, req.url))
    }
}
