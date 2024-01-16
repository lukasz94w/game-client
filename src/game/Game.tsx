import React, {useEffect, useRef, useState} from "react";
import SockJS from "sockjs-client";
import "./Game.css";
import {Link, useNavigate} from "react-router-dom";
import {Path} from "../constant/Path";
import Square from "./Square";
import {closeClientSocket, createHeartbeatCheckingTimer, createHeartbeatSendingTimer, resetTimer, sendReceivedConfirmationMessage, stopTimers} from "../util/SocketUtil";
import {calculateWinner} from "../util/GameUtil";
import {OPPONENT_DISCONNECTED_MSG, SERVER_REJECTION_MESSAGE} from "../constant/Message";

const Game = () => {
    const [message, setMessage] = useState('');
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isOpponentFound, setIsOpponentFound] = useState(false);
    const [receivedMessage, setReceivedMessage] = useState('');
    const hasPairedSessionReceivedTheMessage = useRef<boolean>(false);

    const initialBoard = Array(9).fill(null);
    const [squares, setSquares] = useState(initialBoard);
    const [xIsNext, setXIsNext] = useState(true);
    const winner = calculateWinner(squares);
    const status = winner ? `Winner: ${winner}` : `Next player: ${xIsNext ? 'X' : 'O'}`;

    const navigateTo = useNavigate();

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
            } else if (json.serverRejectionMessage) {
                closeClientSocket(sockJS, SERVER_REJECTION_MESSAGE)
            } else if (json.serverOpponentFound) {
                setIsOpponentFound(true);
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
            navigateTo(Path.LobbyPath);
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

    // after sending a message check each second if confirmation has been sent from paired session,
    // if there is no such sent then after 30 seconds inform about it (what to do with this it's another topic)
    const validateIfMessageReachedPairedSession = () => {
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

    const handleClick = (i: number) => {
        if (squares[i] || calculateWinner(squares)) {
            return;
        }

        const newSquares = squares.slice();
        newSquares[i] = xIsNext ? 'X' : 'O';

        setSquares(newSquares);
        setXIsNext(!xIsNext);
    };

    return (
        socket === null ?

            (
                <div className="loading-container">
                    <div className="loading-message">Loading...</div>
                    <div className="spinner"></div>
                </div>
            )

            :

            (
                isOpponentFound ?

                    (
                        <div className="websocket-container">
                            <h1>Game started. Good luck!</h1>
                            <div>
                                <div className="board-row">
                                    <Square value={squares[0]} onClick={() => handleClick(0)}/>
                                    <Square value={squares[1]} onClick={() => handleClick(1)}/>
                                    <Square value={squares[2]} onClick={() => handleClick(2)}/>
                                </div>
                                <div className="board-row">
                                    <Square value={squares[3]} onClick={() => handleClick(3)}/>
                                    <Square value={squares[4]} onClick={() => handleClick(4)}/>
                                    <Square value={squares[5]} onClick={() => handleClick(5)}/>
                                </div>
                                <div className="board-row">
                                    <Square value={squares[6]} onClick={() => handleClick(6)}/>
                                    <Square value={squares[7]} onClick={() => handleClick(7)}/>
                                    <Square value={squares[8]} onClick={() => handleClick(8)}/>
                                </div>
                                <div className="status">{status}</div>
                            </div>

                            <input
                                className="websocket-input"
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter message"/>
                            <button onClick={sendMessage}>Send</button>
                            <div>
                                <h2>Received Message:</h2>
                                <p>{receivedMessage}</p>
                            </div>
                            <Link to={Path.LobbyPath}>
                                <button className="btn-connect">Finish the game</button>
                            </Link>
                        </div>

                    )

                    :

                    (
                        <div className="waiting-container">
                            <div className="waiting-message">Please wait for the opponent to join...</div>
                        </div>
                    )
            )
    );
};

export default Game;