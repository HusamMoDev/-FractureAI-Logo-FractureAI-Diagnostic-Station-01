import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY'
  )
}

/**
 * FractureAI session storage
 *
 * remember_me = true  -> localStorage
 * remember_me = false -> sessionStorage
 *
 * This allows the Login "Remember me" checkbox
 * to control whether the Supabase session survives
 * browser restarts.
 */
const authStorage: Storage = {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') {
      return null
    }

    const rememberMe =
      window.localStorage.getItem('fractureai_remember_me') === 'true'

    return rememberMe
      ? window.localStorage.getItem(key)
      : window.sessionStorage.getItem(key)
  },

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') {
      return
    }

    const rememberMe =
      window.localStorage.getItem('fractureai_remember_me') === 'true'

    if (rememberMe) {
      window.localStorage.setItem(key, value)
      window.sessionStorage.removeItem(key)
    } else {
      window.sessionStorage.setItem(key, value)
      window.localStorage.removeItem(key)
    }
  },

  removeItem(key: string): void {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.removeItem(key)
    window.sessionStorage.removeItem(key)
  },
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      storage: authStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
)