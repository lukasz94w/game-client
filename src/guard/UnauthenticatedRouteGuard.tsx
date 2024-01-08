import React, {useEffect, useState} from 'react';
import {Outlet, useNavigate} from 'react-router-dom';
import authService from "../service/AuthService";
import {Path} from "../constant/Path";

export const UnauthenticatedRouteGuard = () => {
    const navigate = useNavigate()
    const [isAuthenticated, setIsAuthenticated] = useState(true)

    useEffect(() => {
        authService.verifySignedIn()
            .then(() => {
                setIsAuthenticated(true)
                navigate(Path.LobbyPath)
            })
            .catch(() => {
                setIsAuthenticated(false)
            });
    }, [navigate]);

    return (
        isAuthenticated ? <></> : <Outlet/>
    )
}