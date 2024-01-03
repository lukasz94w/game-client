import React, {useEffect, useRef} from 'react';
import {Navigate, Outlet} from 'react-router-dom';
import authService from "../service/AuthService";

const UnauthenticatedRouteGuard = () => {
    const isLoggedIn = useRef<boolean>(false);

    // This could be done in different way for example by checking some variable from session storage
    // (which would be set after successful login). But then someone can set this variable and be
    // allowed to see secured pages. That's why call to backend is performed.
    // const isLoggedIn = authService.verifySignedIn();


    useEffect(() => {
        console.log("I am inside useEffect from UnauthenticatedRouteGuard!")
        checkAuthentication();
        // checkAuthentication().then(r => isLoggedIn.current = true )
    }, []);

    // useEffect(() => {
        const checkAuthentication = async () => {
            try {
                // This could be done in different way for example by checking some variable from session storage
                // (which would be set after successful login). But then someone can set this variable and be
                // allowed to see secured pages. That's why call to backend is performed.
                const isAuthenticated = await authService.verifySignedIn();
                // return true;
                // setIsLoggedIn(isAuthenticated);

                // isLoggedIn.current = isAuthenticated;
                console.log("IS LOGGED IN FROM UNAUTHENTICATED GUARD: ? " + isLoggedIn.current)
            } catch (error) {
                console.error('Error during authentication verification:', error);
                // return false;
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
        isLoggedIn.current ? <Navigate to="/main"/> : <Outlet/>
    )
}

export default UnauthenticatedRouteGuard;