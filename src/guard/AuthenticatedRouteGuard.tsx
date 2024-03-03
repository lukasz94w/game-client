import React, {useEffect, useState} from 'react';
import {Outlet, useNavigate} from 'react-router-dom';
import {Path} from "../commons/Path";
import AuthNavbar from "../navbar/AuthNavbar";
import {SAFE_MIRRORED_SESSION_COOKIE_NAME} from "../commons/Authorization";

export const AuthenticatedRouteGuard = () => {
    const navigate = useNavigate()
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        if (document.cookie.includes(SAFE_MIRRORED_SESSION_COOKIE_NAME)) {
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