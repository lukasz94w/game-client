import {AuthUrl} from "../constant/AuthUrl";
import axiosInstance from "./AxiosInstance";

const signIn = (username: string, password: string) => {
    return axiosInstance.get(AuthUrl.SignInUrl, {
        auth: {
            username: username,
            password: password
        },
    })
};

const signOut = () => {
    return axiosInstance.get(AuthUrl.SignOutUrl)
}

const verifySignedIn = () => {
    return axiosInstance.get(AuthUrl.VerifySignedInUrl)
}

const AuthService = {
    signIn,
    signOut,
    verifySignedIn
};

export default AuthService;