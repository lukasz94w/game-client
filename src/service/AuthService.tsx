import axios from "axios";

const AUTH_URL = "http://localhost:8093/api/v1/auth/";
const SIGN_IN_URL = 'signIn';
const VERIFY_SIGNED_IN_URL = 'verifySignedIn'

const axiosWithCredentials = axios.create({
    withCredentials: true, // causes to use authorization in the requests (f.e. Bearer token or session cookie if available)
})

const signIn = (username: string, password: string) => {
    return axiosWithCredentials.get(AUTH_URL + SIGN_IN_URL, {
        auth: {
            username: username,
            password: password
        },
    })
};

const verifySignedIn = async () => {
    // try {
    //     const response = await axiosWithCredentials.get(AUTH_URL + VERIFY_SIGNED_IN_URL)
    //     console.log("RESPONSE: " + response.status)
    //     // alert(response.status)
    //     return true;
    // } catch (error: any) {
    //     // alert(error.response.status)
    //     return false;
    // }

    return await axiosWithCredentials.get(AUTH_URL + VERIFY_SIGNED_IN_URL)

    // axiosWithCredentials.get(AUTH_URL + VERIFY_SIGNED_IN_URL)
    //     .then(response => {
    //         alert(response.status)
    //         return true;
    //     })
    //     .catch(error => {
    //         alert(error.response.status)
    //         return false;
    //     })
}

const AuthService = {
    signIn,
    verifySignedIn
};

export default AuthService;