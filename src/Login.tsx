import {useNavigate} from "react-router-dom";
import "./Login.css";
import {useState} from "react";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigateTo = useNavigate();

    const handleLogin = () => {
        // TODO: implement communication to the LoginService
        // if (username && password) {

        const token = 'someGeneratedToken';
        sessionStorage.setItem('token', token);
        navigateTo('/main');
        // }
    };

    return (
        <div className="main">
            <h1>Sign In</h1>
            <form>
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" name="username"/>

                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password"/>

                <button className="btn-connect" onClick={handleLogin}>Login</button>
            </form>
        </div>
    );
};


export default Login;