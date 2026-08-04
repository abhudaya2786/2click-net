// Legacy Supabase client placeholder - application now uses built-in Firebase & Cloud SQL
export const isSupabaseConfigured = false;

export const supabase: any = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signUp: async () => ({ data: null, error: new Error('Supabase disabled - using built-in Firebase') }),
    signInWithPassword: async () => ({ data: null, error: new Error('Supabase disabled - using built-in Firebase') }),
    signOut: async () => ({ error: null }),
  }
};
