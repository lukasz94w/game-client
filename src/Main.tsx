import React from "react";
import {Link} from "react-router-dom";
import "./Main.css";

const Main = () => {
    return (
        <div className="main">
            <h1>Welcome to the Game!</h1>
            <Link to="/websocket">
                <button className="btn-connect">Connect</button>
            </Link>
        </div>
    );
};

export default Main;
