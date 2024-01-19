import React from 'react';
import {useNavigate} from 'react-router-dom';
import './AuthNavbar.css';
import authService from '../api/service/AuthService';
import {Path} from '../commons/Path';

const AuthNavbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.signOut()
            .then(() => {
                // After successful logout browser gets a response in which
                // cookie max-age is set to 0. It causes the browser to remove
                // the stored cookie. So there is no need (even possible?)
                // to do it manually.
                navigate(Path.LoginPath);
            })
            .catch(error => {
                alert("Unexpected error occurred with HTTP status: " + error.response.status)
            })
    };

    return (
        <nav className="logout-navbar">
            <div className="logo">TicTacToe</div>
            <div className="nav-links">
            </div>
            {/* place for the high-score button which takes to high-score service/page */}
            <div className="logout-btn" onClick={handleLogout}>
                Logout
            </div>
        </nav>
    );
};

export default AuthNavbar;