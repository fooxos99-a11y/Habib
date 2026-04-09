import { createClient } from '@supabase/supabase-js';

let browserSupabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
	if (browserSupabaseClient) {
		return browserSupabaseClient;
	}

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseKey) {
		throw new Error('Supabase browser environment variables are not set');
	}

	browserSupabaseClient = createClient(supabaseUrl, supabaseKey);
	return browserSupabaseClient;
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
	get(_target, property) {
		const client = getSupabaseClient() as Record<PropertyKey, unknown>;
		const value = client[property];
		return typeof value === 'function' ? value.bind(client) : value;
	},
});
