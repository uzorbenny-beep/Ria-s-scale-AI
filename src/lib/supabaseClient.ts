import { createClient } from "@supabase/supabase-js";

// Fetch environment variables safely
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Lazy initialization of Supabase client to prevent exceptions if credentials are missing
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Sends a passwordless OTP / Magic Link to the specified user email.
 * If in production with Supabase keys configured, this calls the live Supabase setup.
 * Otherwise, it performs an authentic-looking mock OTP flow for the demo site.
 */
export async function sendMagicLink(email: string, options: { redirectTo?: string } = {}) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: options.redirectTo || window.location.origin,
      },
    });
    if (error) throw error;
    return { data, isMock: false };
  } else {
    // Simulated delivery for Sandbox environment
    console.log(`[Supabase Mock Auth] Sending passwordless OTP to email: ${email}`);
    return { data: { message: "Mock OTP Sent" }, isMock: true };
  }
}

/**
 * Verifies a passwordless OTP token.
 * If Supabase is configured, this performs the official verification step in Supabase.
 * If mock, it validates checking the token is '12345'.
 */
export async function verifyOTPToken(email: string, token: string) {
  if (isSupabaseConfigured && supabase) {
    const { data: { session }, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    if (error) throw error;
    return { session, isMock: false };
  } else {
    // Mock validator
    if (token === "12345" || token === "54321") {
      const mockSession = {
        user: {
          id: "usr_mock_12345",
          email: email,
          user_metadata: {
            full_name: email.split("@")[0].toUpperCase(),
            company: "Enterprise Consulting Team",
          },
        },
        access_token: "mock_jwt_access_token_signature_for_agency_growth_ai_system_sandbox",
      };
      return { session: mockSession, isMock: true };
    } else {
      throw new Error("Invalid verification code. Please enter '12345' (the fallback test code).");
    }
  }
}

/**
 * Logs out the active user session.
 */
export async function logoutUser() {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}
