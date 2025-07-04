import { createClient, User, Session } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'coaching-assessment'
    }
  }
});

// Note: Assessment operations now use direct HTTP calls in assessment-flow.tsx
// This file only handles authentication operations

export class AuthService {
  static async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw new Error(`Failed to get session: ${error.message}`);
    }
    return data.session;
  }

  static async signInWithEmail(email: string, name?: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: {
          full_name: name || null,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(`Failed to sign in: ${error.message}`);
    }
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(`Failed to sign out: ${error.message}`);
    }
  }

  static async createUserProfile(user: User) {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || null,
      }, {
        onConflict: 'id'
      });

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }
  }

  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}