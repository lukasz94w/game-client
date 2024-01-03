import React, {useEffect, useRef} from 'react';
import {Outlet} from 'react-router-dom';
import authService from "../service/AuthService";

const AuthenticatedRouteGuard = () => {
    // const [isLoggedIn, setIsLoggedIn] = useState(false);

    const isLoggedIn = useRef<boolean>(false);

    useEffect(() => {
        console.log("I am inside useEffect from AuthenticatedRouteGuard!")
        checkAuthentication().then(response => {
            // isLoggedIn.current = true
        })
    }, []);

    // useEffect(() => {
    //     let isLoggedIn;
    //     try {
    //         // This could be done in different way for example by checking some variable from session storage
    //         // (which would be set after successful login). But then someone can set this variable and be
    //         // allowed to see secured pages. That's why call to backend is performed.
    //         isLoggedIn = authService.verifySignedIn();
    //     } catch (error) {
    //         isLoggedIn = false;
    //     }
    // }, []);

    // useEffect(() => {
    const checkAuthentication = async () => {
        try {
            // This could be done in different way for example by checking some variable from session storage
            // (which would be set after successful login). But then someone can set this variable and be
            // allowed to see secured pages. That's why call to backend is performed.
            const isAuthenticated = await authService.verifySignedIn();

            // isLoggedIn.current = isAuthenticated;
            console.log("IS LOGGED IN FROM AUTHENTICATED GUARD: ? " + isLoggedIn.current)

            // setIsLoggedIn(isAuthenticated);
        } catch (error) {
            console.error('Error during authentication verification:', error);
            // setIsLoggedIn(false);
        }
    };

    // checkAuthentication();
    // }, []);

    // if (isLoggedIn === null) {
    //     // Loading state or any other indication that authentication verification is in progress
    //     return <div>Loading...</div>;
    // }

    return (
        isLoggedIn.current ? <Outlet/> : <Outlet/>

    // isLoggedIn.current ? <Outlet/> : <Navigate to="/login"/>
    )
}

export default AuthenticatedRouteGuard;