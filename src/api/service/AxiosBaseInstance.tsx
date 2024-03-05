import axios from 'axios';
import globalRouter from "../../router/GlobalRouter";
import {Path} from "../../commons/Path";

const axiosBaseInstance = axios.create({
    baseURL: process.env.REACT_APP_API_GATEWAY_URL,
    withCredentials: true, // causes to use authorization in the requests (f.e. Bearer token or session cookie if available)
    timeout: 5000,
});

axiosBaseInstance.interceptors.response.use(
    (response) => {
        // do nothing if the response is successful (contains HTTP 2xx statuses)
        return response;
    },
    (error) => {
        if (error.response.status === 401 && globalRouter.navigate) {
            globalRouter.navigate(Path.LoginPath);
        }

        // return a rejected promise to propagate the error to the calling code
        return Promise.reject(error);
    }
);

export default axiosBaseInstance;
