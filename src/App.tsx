import React from "react";
import {Route, Routes, useNavigate} from "react-router-dom";
import Login from "./Login";
import Game from "./game/Game";
import Lobby from "./Lobby";
import {AuthenticatedRouteGuard} from "./guard/AuthenticatedRouteGuard";
import {UnauthenticatedRouteGuard} from "./guard/UnauthenticatedRouteGuard";
import {Path} from "./constants/Path";
import globalRouter from "./router/GlobalRouter";

const App = () => {
    globalRouter.navigate = useNavigate();

    return (
        <Routes>
            <Route element={<AuthenticatedRouteGuard/>}>
                <Route element={<Lobby/>} path={Path.LobbyPath}/>
                <Route element={<Game/>} path={Path.GamePath}/>
            </Route>
            <Route element={<UnauthenticatedRouteGuard/>}>
                <Route element={<Login/>} path={Path.LoginPath}/>
                {/* There could be also some 404 being shown instead of LoginPage. If user is logged in then it will be redirected to MainPage. */}
                <Route element={<Login/>} path={Path.NotDefinedPath}/>
            </Route>
        </Routes>
    );
};

export default App;