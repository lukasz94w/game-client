import {useEffect, useState} from "react";
import SockJS from "sockjs-client";
import "./WebSocketClient.css";
import {useNavigate} from "react-router-dom";


const WebSocketClient = () => {
    const [message, setMessage] = useState('');
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [receivedMessage, setReceivedMessage] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        let heartbeatIntervalId: NodeJS.Timer
        let heartbeatCheckingId: NodeJS.Timer;

        const sockJS = new SockJS('http://localhost:8092/websocket');

        sockJS.onopen = () => {
            console.log("Connected to WebSocket");
            setSocket(sockJS);

            heartbeatIntervalId = setInterval(() => {
                const currentUnixTimestampInSeconds: number = Math.floor(new Date().getTime() / 1000);
                sockJS.send(JSON.stringify({
                    clientHeartbeat: currentUnixTimestampInSeconds
                }));
            }, 30000);

            heartbeatCheckingId = setInterval(() => {
                // check some flag here and if so close?
                // show message lost connection to server and navigate to main window
                sockJS.close();
            }, 35000);
        };

        sockJS.onmessage = (event: any) => {
            let json = JSON.parse(event.data)

            if (json.serverMessage) {
                setReceivedMessage(json.serverMessage)
            } else if (json.serverHeartbeat) {
                console.log("Received confirmation, clearing the timer...")
                clearInterval(heartbeatCheckingId);
            } else if (json.serverPairedSessionDisconnected) {
                setReceivedMessage("Your opponent has disconnected...")
                sockJS.close();
            }
        };

        sockJS.onerror = () => {
            sockJS.close(); // I can image it can occur where for example paired session lost the connection
        }

        sockJS.onclose = () => {
            // show message paired session lost the connection
            console.log("Onclose is called, I am going back to the main window...")
            clearInterval(heartbeatIntervalId);
            clearInterval(heartbeatCheckingId);
            navigate("/");
        }

        return () => {
            if (sockJS) {
                sockJS.close();
            }
        };
    }, [navigate]);

    const sendMessage = () => {
        if (socket && message.trim() !== "") {
            socket.send(JSON.stringify({
                clientMessage: message
            }));
            setMessage("");
        }
    };

    return (
        <div className="websocket-container">
            <h1>WebSocket Client</h1>
            <input
                className="websocket-input"
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
