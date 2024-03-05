import React, {useEffect, useState} from 'react';
import {Outlet, useNavigate} from 'react-router-dom';
import {Path} from "../commons/Path";
import AuthNavbar from "../navbar/AuthNavbar";
import userStorage from "../commons/UserStorage";

export const AuthenticatedRouteGuard = () => {
    const navigate = useNavigate()
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        if (userStorage.isUserLoggedIn()) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false)
            navigate(Path.LoginPath)
        }
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