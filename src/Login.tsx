import {useNavigate} from "react-router-dom";
import "./Login.css";
import {useEffect, useState} from "react";
import axios from "axios";
import authService from "./service/AuthService";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigateTo = useNavigate();

    const axiosInstance = axios.create({
        withCredentials: true, // cause session cookie is added to the request
    })
    const handleLogin = () => {
        // event.preventDefault();

        // authService.signIn(username, password)

        authService.signIn('user1', 'user1pass')
            .then(() => {
                navigateTo('/main');
            })
            .catch(error => {
                alert(error.response.status)
            })


        // return axiosInstance.get('http://localhost:8093/api/v1/auth/verify', {}).then((response) => {
        //     console.log("Test verify HTTP status: " + response.status)
        // });
    };

    useEffect(() => {
        const timeout = 0;

        // setTimeout(() => {
        //     axiosInstance.get('http://localhost:8093/api/v1/auth/sign-in', {
        //         // Axios looks for the `auth` option, and, if it is set, formats a
        //         // basic auth header for you automatically.
        //         auth: {
        //             username: 'user1',
        //             password: 'user1pass'
        //         },
        //     }).then(response => {
        //         console.log("sign-in body response: " + response.data)
        //     })
        // }, timeout)
        //
        // setTimeout(() => {
        //     const response1 = axiosInstance.get('http://localhost:8093/api/v1/auth/verify', {}).then(response => {
        //         console.log("verify body response after login: ", response.data)
        //         console.log("verify status after login: " + response.status)
        //     });
        // }, timeout + 15000);
        //
        // setTimeout(() => {
        //     const response1 = axiosInstance.get('http://localhost:8093/api/v1/auth/logout', {}).then(response => {
        //         console.log("logout body response: ", response.data)
        //         console.log("logout status: " + response.status)
        //     });
        // }, timeout + 30000);
        //
        // setTimeout(() => {
        //     const response1 = axiosInstance.get('http://localhost:8093/api/v1/auth/verify', {}).then(response => {
        //     }).catch(error => {
        //         console.log("verify body response after logout: ", error.response.data)
        //         console.log("verify status after logout: " + error.response.status)
        //     });
        // }, timeout + 45000);


        // setTimeout(() => {
        //     console.log("checking session after 5 seconds...")
        //     const response1 = axiosInstance.get('http://localhost:8093/api/v1/auth/verify', {}).then(response => {
        //         console.log(response.status)
        //     });
        // }, 5000);

        // setTimeout(() => {
        //     console.log("checking session after 25 seconds...")
        //     const response1 = axiosInstance.get('http://localhost:8093/api/v1/auth/verify', {}).then(response => {
        //         console.log(response.status)
        //     }).catch(err => {
        //         alert(err.response.status + " you will be manually logged out")
        //         console.log(err.response.status);
        //     });
        // }, 25000);

        // setTimeout(() => {
        //     console.log("checking session after 90000 seconds...")
        //     const response1 = axiosInstance.get('http://localhost:8093/api/v1/auth/verify', {}).then(response => {
        //         console.log(response.status)
        //     }).catch(err => {
        //         alert(err.response.status + " you will be manually logged out")
        //         console.log(err.response.status);
        //     });
        // }, 90000);

    }, []);

    // const handleLogin = async () => {
    //     try {
    //         const credentials = btoa(`${username}:${password}`);
    //         const response = await fetch('http://localhost:8093/auth/sign-in', {
    //             method: 'GET',
    //             headers: {
    //                 'Authorization': `Basic ${credentials}`,
    //             },
    //         });
    //
    //         console.log("I am here!")
    //
    //         if (response.ok) {
    //             // Assuming the server returns a session cookie in the response headers
    //             const sessionCookie = response.headers.get('Set-Cookie');
    //             if (sessionCookie) {
    //                 // Save the session cookie in sessionStorage
    //                 sessionStorage.setItem('sessionCookie', sessionCookie);
    //                 console.log("I am here")
    //                 navigateTo('/main');
    //             } else {
    //                 console.error('Session cookie not found in the response headers');
    //             }
    //         } else {
    //             console.error('Login failed. Please check your credentials.');
    //         }
    //     } catch (error) {
    //         console.error('An error occurred during login:', error);
    //     }
    // };

    return (
        <div className="main">
            <h1>Sign In</h1>
            <label htmlFor="username">Username:</label>
            <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <label htmlFor="password">Password:</label>
            <input
                type="text"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button
                className="btn-connect"
                onClick={handleLogin}>
                Login
            </button>
        </div>
    );
};


export default Login;