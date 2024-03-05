import React, {useEffect, useState} from 'react';
import {Outlet, useNavigate} from 'react-router-dom';
import {Path} from "../commons/Path";
import userStorage from "../commons/UserStorage";

export const UnauthenticatedRouteGuard = () => {
    const navigate = useNavigate()
    const [isAuthenticated, setIsAuthenticated] = useState(true)

    useEffect(() => {
        if (userStorage.isUserLoggedIn()) {
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