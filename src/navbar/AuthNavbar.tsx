import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import './AuthNavbar.css';
import authService from '../api/service/AuthService';
import {Path} from '../commons/Path';
import userStorage from "../commons/UserStorage";

const AuthNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const userName = userStorage.getUserName();

    const RESULTS = "Results"
    const LOBBY = "Lobby"
    const [toggleButtonName, setToggleButtonName] = useState<string>(RESULTS)

    useEffect(() => {
        if (location.pathname === Path.LobbyPath) {
            setToggleButtonName(RESULTS);
        } else {
            setToggleButtonName(LOBBY);
        }
    }, [location]);

    const handleButtonToggle = () => {
        if (location.pathname === Path.LobbyPath) {
            navigate(Path.HistoryPath)
        } else {
            navigate(Path.LobbyPath);
        }
    };

    const handleLogout = () => {
        authService
            .signOut()
            .then(() => {
                navigate(Path.LoginPath);
            })
            .catch((error) => {
                alert(
                    'Unexpected error occurred with HTTP status: ' +
                    error.response.status
                );
            });
    };

    return (
        <nav className="logout-navbar">
            <div className="logo">Welcome {userName}</div>
            <div className="nav-links"></div>
            <div className="buttons-container">
                <div className="toggle-btn" onClick={handleButtonToggle}>
                    {toggleButtonName}
                </div>
                <div className="logout-btn" onClick={handleLogout}>
                    Logout
                </div>
            </div>
        </nav>
    );
};

export default AuthNavbar;
