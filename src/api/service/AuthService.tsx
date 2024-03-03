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

const verifySignedIn = () => {
    return axiosBaseInstance.get(AuthUrl.VerifySessionActiveUrl)
}

const AuthService = {
    signIn,
    signOut,
    verifySignedIn
};

export default AuthService;