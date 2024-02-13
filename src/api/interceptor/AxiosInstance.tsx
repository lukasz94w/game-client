import axios from 'axios';
import globalRouter from "../../router/GlobalRouter";
import {Path} from "../../commons/Path";

const axiosInstance = axios.create({
    withCredentials: true, // causes to use authorization in the requests (f.e. Bearer token or session cookie if available)
    timeout: 5000,
});

axiosInstance.interceptors.response.use(
    (response) => {
        // do nothing if the response is successful (contains HTTP 2xx statuses)
        return response;
    },
    (error) => {
        if (error.response.status === 401 && globalRouter.navigate) {
            // I tried to use useNavigate() here but the result was error wasn't propagated down to the method calling...
            // The globalRouter was implemented instead, now the method calling can see the error details.
            // Read more: https://dev.to/davidbuc/how-to-use-router-inside-axios-interceptors-react-and-vue-5ece
            globalRouter.navigate(Path.LoginPath);
        }

        // return a rejected promise to propagate the error to the calling code
        return Promise.reject(error);
    }
);

export default axiosInstance;
