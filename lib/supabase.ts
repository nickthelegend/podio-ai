export const supabase = {
    auth: {
        getUser: async () => ({ data: { user: null } }),
    },
    from: (table: string) => ({
        select: () => ({
            eq: () => ({
                single: async () => ({ data: null, error: null })
            })
        }),
        insert: async () => ({ error: null }),
        update: () => ({
            eq: async () => ({ error: null })
        })
    })
} as any;
