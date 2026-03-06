'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function generateApiKey(formData: FormData) {
    const supabase = await createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        throw new Error('Unauthorized')
    }

    const keyName = formData.get('keyName') as string
    if (!keyName) {
        throw new Error('Key name is required')
    }

    // Generate a secure random API key prepended with "ext_" for extractify tracking
    const rawKey = require('crypto').randomBytes(32).toString('hex')
    const apiKey = `ext_${rawKey}`

    const { error } = await supabase
        .from('api_keys')
        .insert({
            user_id: user.id,
            key_name: keyName,
            key_value: apiKey
        })

    if (error) {
        console.error('Error generating API key:', error)
        throw new Error('Failed to generate API key')
    }

    revalidatePath('/settings/api-keys')
}

export async function deleteApiKey(formData: FormData) {
    const supabase = await createClient()
    const id = formData.get('id') as string

    if (!id) return

    await supabase.from('api_keys').delete().eq('id', id)
    revalidatePath('/settings/api-keys')
}
