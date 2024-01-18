import React, {useEffect, useState} from 'react';
import {Outlet, useNavigate} from 'react-router-dom';
import authService from "../service/AuthService";
import {Path} from "../constants/Path";
import AuthNavbar from "../navbar/AuthNavbar";

export const AuthenticatedRouteGuard = () => {
    const navigate = useNavigate()
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        authService.verifySignedIn()
            .then(() => {
                setIsAuthenticated(true);
            })
            .catch(() => {
                setIsAuthenticated(false)
                navigate(Path.LoginPath)
            });
    }, [navigate]);

    return (
        isAuthenticated ?
            <div>
                <AuthNavbar/>
                <Outlet/>
            </div>
            :
            <></>
    )
}