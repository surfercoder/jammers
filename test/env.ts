// Default public env so the Supabase helpers (and anything reading these at
// import time) have stable values during tests. Real network calls are mocked.
process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||= "test-publishable-key";
process.env.NEXT_PUBLIC_SITE_URL ||= "https://test.jammers.app";
