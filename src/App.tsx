import React from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import MainPage from "./MainPage";
import WebSocketClient from "./WebSocketClient";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage/>}/>
                <Route path="/websocket" element={<WebSocketClient/>}/>
            </Routes>
        </BrowserRouter>
    );
};

export default App;