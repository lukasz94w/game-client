import {AuthUrl} from "../url/http/AuthUrl";
import axiosBaseInstance from "./AxiosBaseInstance";

const signIn = (username: string, password: string) => {
    return axiosBaseInstance.get(AuthUrl.SignInUrl, {
        auth: {
            username: username,
            password: password
        },
    })
};

const signOut = () => {
    return axiosBaseInstance.get(AuthUrl.SignOutUrl)
}

const refreshSession = () => {
    return axiosBaseInstance.get(AuthUrl.RefreshSessionUrl)
}

const AuthService = {
    signIn,
    signOut,
    refreshSession
};

export default AuthService;