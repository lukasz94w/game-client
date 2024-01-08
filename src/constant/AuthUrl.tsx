const AuthUrlPrefix = "auth/";

export const AuthUrl = {
    SignInUrl: AuthUrlPrefix + "signIn",
    SignOutUrl: AuthUrlPrefix + "signOut",
    VerifySignedInUrl: AuthUrlPrefix + "verifySignedIn"
} as const;
