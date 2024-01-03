import React, {useEffect} from 'react';
import {Outlet, useNavigate} from 'react-router-dom';
import authService from "../service/AuthService";

export const UnauthenticatedRouteGuard2 = () => {
    // let isAuthenticated = false
    const navigate = useNavigate()

    useEffect(() => {
        authService.verifySignedIn().then(response => {
            console.log("I am inside verifySignedIn() in UnauthenticatedRouteGuard2!")
            console.log("Caught already authenticated user! HTTP status: " + response.status)
            console.log("Redirecting to main page...")
            navigate('/main')
        }).catch(error => {
            console.log("do nothing...")
        });

        // isAuthenticated.catch(error => {
        //     navigate('/login')
        // })

        // if (!isAuthenticated) {
        // }
    }, [navigate]);

    return (
        <Outlet/>
    )
}