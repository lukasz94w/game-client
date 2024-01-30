import React from "react";
import {Link} from "react-router-dom";
import "./Lobby.css";
import {Path} from "./commons/Path";

const Lobby = () => {
    return (
        <div className="main-lobby">
            <h1>Welcome in lobby</h1>
            <h2>Click button below to start a new game</h2>
            <Link to={Path.GamePath} className={"link"}>
                <button className="btn-start">New game</button>
            </Link>
        </div>
    );
};

export default Lobby;
