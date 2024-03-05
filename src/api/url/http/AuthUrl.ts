const AuthBaseUrl = "/api/v1/auth/"

export const AuthUrl = {
    SignInUrl: AuthBaseUrl + "signIn",
    SignOutUrl: AuthBaseUrl + "signOut",
    RefreshSessionUrl: AuthBaseUrl + "refreshSession"
} as const;
