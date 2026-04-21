export type Contact = {
    id: string
    role: string
    email: string
    prefs: Record<string, boolean>
}

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = {
    id: string
    name: string
    active: boolean
    stats: Record<string, number>
    tags: string[]
    contacts: Contact[]
    metadata: {
        createdAt: string
        nested: {
            deep: {
                note: string
            }
        }
    }
}