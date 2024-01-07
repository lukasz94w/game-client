import React from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Login from "./Login";
import Game from "./Game";
import Lobby from "./Lobby";
import {AuthenticatedRouteGuard} from "./guard/AuthenticatedRouteGuard";
import {UnauthenticatedRouteGuard} from "./guard/UnauthenticatedRouteGuard";
import {Path} from "./constant/Path";

const App = () => {
    return (
        <BrowserRouter>
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
        </BrowserRouter>
    );
};

export default App;