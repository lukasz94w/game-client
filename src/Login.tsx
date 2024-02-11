import {useNavigate} from "react-router-dom";
import "./Login.css";
import {useState} from "react";
import authService from "./api/service/AuthService";
import {Path} from "./commons/Path";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigateTo = useNavigate();

    const handleLogin = () => {
        authService.signIn(username, password)
            .then(() => {
                // after successful login browser automatically cache the cookie so there
                // is no need to catch it from the request and storing it for example in session storage
                navigateTo(Path.LobbyPath);
            })
            .catch(() => {
                alert("Wrong credentials. Please try again.")
            })
    };

    return (
        <div className="main-login"
             onKeyDown={(e) => {
                 if (e.key === 'Enter') {
                     handleLogin()
                 }
             }}>
            <h1>Sign In</h1>
            <label htmlFor="username">Username:</label>
            <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="login"
            />
            <label htmlFor="password">Password:</label>
            <input
                type="text"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
            />
            <button
                className="btn-login"
                onClick={handleLogin}
            >Login
            </button>
        </div>
    );
};


export default Login;