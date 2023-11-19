import {useEffect, useRef, useState} from "react";
import SockJS from "sockjs-client";
import "./WebSocketClient.css";
import {useNavigate} from "react-router-dom";

const WebSocketClient = () => {
    const [message, setMessage] = useState('');
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [receivedMessage, setReceivedMessage] = useState('');

    const hasPairedSessionReceivedTheMessage = useRef<boolean>(false);

    const navigateTo = useNavigate();

    const heartbeatFrequencyInMs = 60000;
    const heartbeatCheckingFrequencyInMs = 75000;

    const LOST_CONNECTION_TO_SERVER_MSG = "Lost connection to the server.";
    const OPPONENT_DISCONNECTED_MSG = "Opponent has disconnected.";

    useEffect(() => {
        let heartbeatSendingTimerId: NodeJS.Timer
        let heartbeatCheckingTimerId: NodeJS.Timer;

        const sockJS = new SockJS('http://localhost:8092/websocket');

        sockJS.onopen = () => {
            setSocket(sockJS);
            heartbeatSendingTimerId = createHeartbeatSendingTimer(sockJS);
            heartbeatCheckingTimerId = createHeartbeatCheckingTimer(sockJS);
        };

        sockJS.onmessage = (event: any) => {
            let json = JSON.parse(event.data)

            if (json.serverMessage) {
                sendReceivedConfirmationMessage(sockJS);
                setReceivedMessage(json.serverMessage)
            } else if (json.serverHeartbeat) {
                heartbeatCheckingTimerId = resetTimer(heartbeatCheckingTimerId, sockJS);
            } else if (json.serverPairedSessionDisconnected) {
                closeClientSocket(sockJS, OPPONENT_DISCONNECTED_MSG);
            } else if (json.serverClientReceivedMessageConfirmation) {
                hasPairedSessionReceivedTheMessage.current = true;
            } else {
                console.log("Unknown type of message: " + json)
            }
        };

        sockJS.onerror = () => {
            // For logging purposes to check when it is triggered, for the time being it's not clear for me.
            // At first my idea was it is triggerred when f.e. socket cannot transfer message to server and then
            // to paired session. Then some retry policy or informing the user could be applied, but looks like
            // it's not working like that. So let's just log all triggers to gather more data and learn when
            // this method is triggerred. Maybe this method is triggerred after longer time? F.e. if there is no
            // confirmation after longer period of time like tens of seconds? Anyway for now I resigned from checking
            // using this method if message reached it's paired session. I require confirmation message from
            // paired session instead.
            console.log("onerror triggerred")
        }

        sockJS.onclose = () => {
            // I noticed this is triggerred after tens (like 30) of seconds after losing the network connection.
            // I can image there could be some retry connection policy applied. Currently, I am doing what is seen below.
            stopTimers(heartbeatSendingTimerId, heartbeatCheckingTimerId)
            navigateTo("/");
        }

        return () => {
            if (sockJS) {
                sockJS.close();
            }
        };
    }, [navigateTo]);

    // TODO: send message button shouldn't be clickable until the paired session is found
    const sendMessage = () => {
        if (socket && message.trim() !== "") {
            socket.send(JSON.stringify({
                clientMessage: message
            }));
            setMessage("");
        }
        validateIfMessageReachedPairedSession();
    };

    function sendHeartbeatMessage(socket: WebSocket): void {
        const currentUnixTimestampInSeconds: number = Math.floor(new Date().getTime() / 1000);
        socket.send(JSON.stringify({
            clientHeartbeat: currentUnixTimestampInSeconds
        }));
    }

    function createHeartbeatSendingTimer(sockJS: WebSocket): NodeJS.Timer {
        return setInterval(sendHeartbeatMessage, heartbeatFrequencyInMs, sockJS);
    }

    function createHeartbeatCheckingTimer(sockJS: WebSocket): NodeJS.Timer {
        return setInterval(closeClientSocket, heartbeatCheckingFrequencyInMs, sockJS, LOST_CONNECTION_TO_SERVER_MSG);
    }

    function closeClientSocket(socket: WebSocket, reason: String) {
        console.log(reason);
        socket.close();
    }

    function resetTimer(heartbeatCheckingTimerId: NodeJS.Timer, socket: WebSocket): NodeJS.Timer {
        clearInterval(heartbeatCheckingTimerId)
        return createHeartbeatCheckingTimer(socket);
    }

    function stopTimers(heartbeatSendingTimerId: NodeJS.Timer, heartbeatCheckingTimerId: NodeJS.Timer) {
        clearInterval(heartbeatSendingTimerId);
        clearInterval(heartbeatCheckingTimerId);
    }

    function sendReceivedConfirmationMessage(socket: WebSocket) {
        socket.send(JSON.stringify({
            clientReceivedMessageConfirmation: "successfullyReceived"
        }));
    }

    // after sending a message check each second if confirmation has been sent from paired session,
    // if there is no such sent then after 30 seconds inform about it (what to do with this it's another topic)
    function validateIfMessageReachedPairedSession(): void {
        hasPairedSessionReceivedTheMessage.current = false;
        let isCheckingActive = true;
        const secondIntervalId = setInterval(() => {
            if (hasPairedSessionReceivedTheMessage.current) {
                clearInterval(secondIntervalId);
                clearInterval(finalCheckIntervalId);
            } else {
                if (!isCheckingActive) {
                    setReceivedMessage("Message didn't arrive at your opponent. Try to send it again");
                }
            }
        }, 1000);

        let finalCheckIntervalId = setTimeout(() => {
            isCheckingActive = false;
            clearInterval(secondIntervalId);
            console.log("I haven't got a confirmation in 30 second from the paired session.")
        }, 30000);
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