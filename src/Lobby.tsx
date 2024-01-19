import React from "react";
import {Link} from "react-router-dom";
import "./Lobby.css";
import {Path} from "./commons/Path";

const Lobby = () => {
    return (
        <div className="main">
            <h1>Click button below to start a new game</h1>
            <Link to={Path.GamePath}>
                <button className="btn-connect">Start</button>
            </Link>
        </div>
    );
};

export default Lobby;
