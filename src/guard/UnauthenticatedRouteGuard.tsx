import React, {useEffect, useState} from 'react';
import {Outlet, useNavigate} from 'react-router-dom';
import {Path} from "../commons/Path";
import {SAFE_MIRRORED_SESSION_COOKIE_NAME} from "../commons/Authorization";

export const UnauthenticatedRouteGuard = () => {
    const navigate = useNavigate()
    const [isAuthenticated, setIsAuthenticated] = useState(true)

    useEffect(() => {
        if (document.cookie.includes(SAFE_MIRRORED_SESSION_COOKIE_NAME)) {
            setIsAuthenticated(true);
            navigate(Path.LobbyPath)
        } else {
            setIsAuthenticated(false)
        }
    }, [navigate]);

    return (
        isAuthenticated ? <></> : <Outlet/>
    )
}