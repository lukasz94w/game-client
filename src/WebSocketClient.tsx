import {useEffect, useState} from "react";
import SockJS from "sockjs-client";

const WebSocketClient = () => {
    const [message, setMessage] = useState('');
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [receivedMessage, setReceivedMessage] = useState('');

    useEffect(() => {
        const sockJS = new SockJS('http://localhost:8092/websocket');

        sockJS.onopen = () => {
            console.log("Connected to WebSocket");
            setSocket(sockJS);
        };

        sockJS.onmessage = (event: any) => {
            setReceivedMessage(event.data);
        };

    }, []);

    const sendMessage = () => {
        if (socket && message.trim() !== "") {
            socket.send(JSON.stringify({message}));
            setMessage("");
        }
    };

    return (
        <div>
            <h1>WebSocket Client</h1>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message"
            />
            <button onClick={sendMessage}>Send</button>
            <div>
                <h2>Received Message:</h2>
                <p>{receivedMessage}</p>
            </div>
        </div>
    );
};

export default WebSocketClient;
