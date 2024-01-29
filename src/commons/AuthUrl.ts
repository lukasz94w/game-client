const AuthUrlPrefix = "auth/";

export const AuthUrl = {
    SignInUrl: AuthUrlPrefix + "signIn",
    SignOutUrl: AuthUrlPrefix + "signOut",
    VerifySessionActiveUrl: AuthUrlPrefix + "verifySessionActive"
} as const;
