const AuthBaseUrl = "http://localhost:8093/api/v1/auth/";

export const AuthUrl = {
    SignInUrl: AuthBaseUrl + "signIn",
    SignOutUrl: AuthBaseUrl + "signOut",
    VerifySessionActiveUrl: AuthBaseUrl + "verifySessionActive"
} as const;
