import { supabase } from "./client";

type OAuthProvider = "google" | "apple" | "azure";

type SignInOptions = {
  redirectTo?: string;
};

export async function signInWithOAuth(provider: OAuthProvider, opts?: SignInOptions) {
  return supabase.auth.signInWithOAuth({
    provider,
    options: opts?.redirectTo ? { redirectTo: opts.redirectTo } : undefined,
  });
}
