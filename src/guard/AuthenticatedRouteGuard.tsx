import React from 'react';
import {Outlet, Navigate} from 'react-router-dom';

const AuthenticatedRouteGuard = () => {
    const isLoggedIn = !!sessionStorage.getItem('token');
    return (
        isLoggedIn? <Outlet/> : <Navigate to="/login"/>
    )
}

export default AuthenticatedRouteGuard;