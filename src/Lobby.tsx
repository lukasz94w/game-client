import React from "react";
import {Link} from "react-router-dom";
import "./Lobby.css";

const Lobby = () => {
    return (
        <div className="main">
            <h1>Click the button to find a partner and start a new game!</h1>
            <Link to="/websocket">
                <button className="btn-connect">Start</button>
            </Link>
        </div>
    );
};

export default Lobby;
