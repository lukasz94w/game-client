import React, {useEffect, useState} from 'react';
import {Outlet, useNavigate} from 'react-router-dom';
import authService from "../service/AuthService";
import {Path} from "../constant/Path";
import LogoutNavbar from "../navbar/LogoutNavbar";

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
                <LogoutNavbar/>
                <Outlet/>
            </div>
            :
            <></>
    )
}