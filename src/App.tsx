import React from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Login from "./Login";
import Game from "./Game";
import Main from "./Main";
import AuthenticatedRouteGuard from "./guard/AuthenticatedRouteGuard";
import UnauthenticatedRouteGuard from "./guard/UnauthenticatedRouteGuard";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AuthenticatedRouteGuard/>}>
                    <Route element={<Main/>} path="/main"/>
                    <Route element={<Game/>} path="/websocket"/>
                </Route>
                <Route element={<UnauthenticatedRouteGuard/>}>
                    <Route element={<Login/>} path="/login"/>
                    <Route element={<Login/>} path="*"/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;