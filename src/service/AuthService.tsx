import axios from "axios";
import {AuthUrl} from "../constant/AuthUrl";

const axiosWithCredentials = axios.create({
    withCredentials: true, // causes to use authorization in the requests (f.e. Bearer token or session cookie if available)
})

const signIn = (username: string, password: string) => {
    return axiosWithCredentials.get(AuthUrl.SignInUrl, {
        auth: {
            username: username,
            password: password
        },
    })
};

const signOut = () => {
    return axiosWithCredentials.get(AuthUrl.SignOutUrl)
}

const verifySignedIn = () => {
    return axiosWithCredentials.get(AuthUrl.VerifySignedInUrl)
}

const AuthService = {
    signIn,
    signOut,
    verifySignedIn
};

export default AuthService;