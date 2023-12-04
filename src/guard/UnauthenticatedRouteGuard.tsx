import React from 'react';
import {Outlet, Navigate} from 'react-router-dom';

const UnauthenticatedRouteGuard = () => {
    const isLoggedIn = !!sessionStorage.getItem('token');
    return (
        isLoggedIn ? <Navigate to="/main"/> : <Outlet/>
    )
}

export default UnauthenticatedRouteGuard;