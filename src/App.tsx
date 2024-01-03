import React from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Login from "./Login";
import Game from "./Game";
import Main from "./Main";
import {AuthenticatedRouteGuard2} from "./guard/AuthenticatedRouteGuard2";
import {UnauthenticatedRouteGuard2} from "./guard/UnauthenticatedRouteGuard2";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AuthenticatedRouteGuard2/>}>
                    <Route element={<Main/>} path="/main"/>
                    <Route element={<Game/>} path="/websocket"/>
                </Route>
                <Route element={<UnauthenticatedRouteGuard2/>}>
                    <Route element={<Login/>} path="/login"/>
                    <Route element={<Login/>} path="*"/> {/* there could be also some 404 being shown */}
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;