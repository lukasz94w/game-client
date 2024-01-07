const AuthUrlPrefix = "http://localhost:8093/api/v1/auth/";

export const AuthUrl = {
    SignInUrl: AuthUrlPrefix + "signIn",
    SignOutUrl: AuthUrlPrefix + "signOut",
    VerifySignedInUrl: AuthUrlPrefix + "verifySignedIn"
} as const;
