import React, {useEffect} from 'react';
import {Outlet, useNavigate} from 'react-router-dom';
import authService from "../service/AuthService";

export const AuthenticatedRouteGuard2 = () => {
    // let isAuthenticated = false
    const navigate = useNavigate()

    useEffect(() => {
        authService.verifySignedIn().catch(error => {
            console.log("I am inside verifySignedIn() in AuthenticatedRouteGuard2!")
            console.log("Caught unauthenticated user! HTTP status: " + error.response.status)
            console.log("Redirecting to login page...")
            navigate('/login')
        });

        // isAuthenticated.catch(error => {
        //     navigate('/login')
        // })

        // if (!isAuthenticated) {
        // }
    }, [navigate]);

    // TODO there could be some loading screen showed when page is loading...

    return (
        <Outlet/>
    )
}