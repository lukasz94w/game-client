import {useEffect, useState} from "react";
import SockJS from "sockjs-client";

const WebSocketClient = () => {
    const [message, setMessage] = useState('');
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [receivedMessage, setReceivedMessage] = useState('');

    useEffect(() => {
        let heartbeatIntervalId: NodeJS.Timer
        let heartbeatCheckingId: NodeJS.Timer;

        const sockJS = new SockJS('http://localhost:8092/websocket');

        sockJS.onopen = () => {
            console.log("Connected to WebSocket");
            setSocket(sockJS);

            heartbeatIntervalId = setInterval(() => {
                sockJS.send(JSON.stringify({
                    message: "heartbeat_iss"
                }));
            }, 30000);

            heartbeatCheckingId = setInterval(() => {
                // show message lost connection to server and navigate to main window
                sockJS.close();
            }, 35000);
        };

        sockJS.onmessage = (event: any) => {
            if (event.data === "heartbeat_ack") {
                console.log("Received confirmation, clearing the timer...")
                clearInterval(heartbeatCheckingId);
            } else if (event.data === "paired_session_is_lost") {
                // show message paired session lost the connection
                sockJS.close(); // and then because onclose is called automatic navigation to main window is executed?
            } else {
                setReceivedMessage(event.data);
            }
        };

        sockJS.onerror = () => {
            sockJS.close(); // I can image it can occur where for example paired session lost the connection
        }

        sockJS.onclose = () => {
            console.log("Onclose is called, I am going back to the main window...")
            clearInterval(heartbeatIntervalId);
            clearInterval(heartbeatCheckingId);
            // TODO: go back to main window
        }

        return () => {
            if (sockJS) {
                sockJS.close();
            }
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
