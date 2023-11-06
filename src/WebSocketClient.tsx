import {useEffect, useState} from "react";
import SockJS from "sockjs-client";
import "./WebSocketClient.css";
import {useNavigate} from "react-router-dom";

const WebSocketClient = () => {
    const [message, setMessage] = useState('');
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [receivedMessage, setReceivedMessage] = useState('');

    const LOST_CONNECTION_TO_SERVER_MSG = "Lost connection to the server.";
    const OPPONENT_DISCONNECTED_MSG = "Opponent has disconnected.";

    const navigate = useNavigate();

    useEffect(() => {
        let heartbeatSendingTimerId: NodeJS.Timer
        let heartbeatCheckingTimerId: NodeJS.Timer;

        const sockJS = new SockJS('http://localhost:8092/websocket');

        sockJS.onopen = () => {
            setSocket(sockJS);
            heartbeatSendingTimerId = setInterval(sendHeartbeatMessage, 30000, sockJS);
            heartbeatCheckingTimerId = setInterval(closeClientSocket, 35000, sockJS, LOST_CONNECTION_TO_SERVER_MSG);
        };

        sockJS.onmessage = (event: any) => {
            let json = JSON.parse(event.data)

            if (json.serverMessage) {
                setReceivedMessage(json.serverMessage)
            } else if (json.serverHeartbeat) {
                const newHeartbeatCheckingTimerId = resetTimer(heartbeatCheckingTimerId, sockJS);
                heartbeatCheckingTimerId = newHeartbeatCheckingTimerId;
            } else if (json.serverPairedSessionDisconnected) {
                closeClientSocket(sockJS, OPPONENT_DISCONNECTED_MSG);
            }
        };

        sockJS.onerror = () => {
            sockJS.close(); // I can image it can occur where for example paired session lost the connection
        }

        sockJS.onclose = () => {
            stopTimers(heartbeatSendingTimerId, heartbeatCheckingTimerId)
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

    function sendHeartbeatMessage(socket: WebSocket): void {
        const currentUnixTimestampInSeconds: number = Math.floor(new Date().getTime() / 1000);
        socket.send(JSON.stringify({
            clientHeartbeat: currentUnixTimestampInSeconds
        }));
    }

    function resetTimer(heartbeatChecking: NodeJS.Timer, socket: WebSocket): NodeJS.Timer {
        clearInterval(heartbeatChecking)
        return setInterval(closeClientSocket, 35000, socket, LOST_CONNECTION_TO_SERVER_MSG);
    }

    function closeClientSocket(socket: WebSocket, reason: String) {
        console.log(reason);
        socket.close();
    }

    function stopTimers(heartbeatSendingTimerId: NodeJS.Timer, heartbeatCheckingTimerId: NodeJS.Timer) {
        clearInterval(heartbeatSendingTimerId);
        clearInterval(heartbeatCheckingTimerId);
    }

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