export const supabase = {
    auth: {
        getUser: async () => ({ data: { user: null } }),
        onAuthStateChange: () => ({
            data: { subscription: { unsubscribe: () => { } } }
        }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithOAuth: async () => ({ data: null, error: null }),
        signOut: async () => ({ error: null }),
    },
    from: (table: string) => ({
        select: () => ({
            eq: () => ({
                single: async () => ({ data: null, error: null }),
                order: () => ({ limit: () => ({ data: [], error: null }) })
            })
        }),
        insert: async () => ({ error: null }),
        update: () => ({
            eq: async () => ({ error: null })
        }),
        delete: () => ({
            eq: async () => ({ error: null })
        })
    })
} as any;
