import React, {useEffect, useRef, useState} from "react";
import SockJS from "sockjs-client";
import "./Game.css";
import {Link, useNavigate} from "react-router-dom";
import {Path} from "../constant/Path";
import Square from "./Square";
import {closeClientSocket, createHeartbeatCheckingTimer, createHeartbeatSendingTimer, resetTimer, sendReceivedConfirmationMessage, stopTimers} from "../util/SocketUtil";
import {OPPONENT_DISCONNECTED_MSG, SERVER_REJECTION_MSG} from "../constant/SessionStatus";
import {FIRST_PLAYER_ORDER, FIRST_PLAYER_SQUARE_VALUE, MESSAGE_RECEIVED_CHECKING_INTERVAL, MESSAGE_RECEIVED_CHECKING_TOTAL_TIME, SECOND_PLAYER_SQUARE_VALUE} from "../constant/GameVariables";
import {CLIENT_GAME_UPDATE_CHOSEN_SQUARE_NUMBER, CLIENT_GAME_UPDATE_CHOSEN_SQUARE_VALUE, CLIENT_MESSAGE_NEW_MESSAGE} from "../message/Client";

const Game = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [message, setMessage] = useState('');
    const [receivedMessage, setReceivedMessage] = useState('');

    const [squares, setSquares] = useState(Array(9).fill(null));
    const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>();
    const [isOpponentFound, setIsOpponentFound] = useState(false);
    const isFirstPlayer = useRef<boolean>();
    const playerSquareValue = useRef<string>('');
    const opponentSquareValue = useRef<string>('')
    const turnStatus = isPlayerTurn ? "Your turn, choose the square" : "Your opponent turn, please wait...";

    const hasPairedSessionReceivedTheMessage = useRef<boolean>(false);

    const navigateTo = useNavigate();

    useEffect(() => {
        let heartbeatSendingTimerId: NodeJS.Timer
        let heartbeatCheckingTimerId: NodeJS.Timer;

        const sockJS = new SockJS('http://localhost:8092/websocket'); // TODO: move to env variables

        sockJS.onopen = () => {
            setSocket(sockJS);
            heartbeatSendingTimerId = createHeartbeatSendingTimer(sockJS);
            heartbeatCheckingTimerId = createHeartbeatCheckingTimer(sockJS);
        };

        sockJS.onmessage = (event: any) => {
            let json = JSON.parse(event.data)

            if (json.serverMessageNewMessage) {
                sendReceivedConfirmationMessage(sockJS);
                setReceivedMessage(json.serverMessageNewMessage)
            } else if (json.serverGameUpdateStatus) {
                updateGameBoard(json.serverGameUpdateStatus);
                sendReceivedConfirmationMessage(sockJS)
            } else if (json.serverGameUpdateGameEnded) {
                alert("Game winner: " + json.serverGameUpdateGameEnded)
                setIsPlayerTurn(false)
            } else if (json.serverSessionStatusUpdateHeartbeat) {
                heartbeatCheckingTimerId = resetTimer(heartbeatCheckingTimerId, sockJS);
            } else if (json.serverSessionStatusUpdatePairedSessionDisconnected) {
                closeClientSocket(sockJS, OPPONENT_DISCONNECTED_MSG);
            } else if (json.serverMessageClientReceivedMessageConfirmation) {
                hasPairedSessionReceivedTheMessage.current = true;
            } else if (json.serverSessionStatusUpdateSessionRejected) {
                closeClientSocket(sockJS, SERVER_REJECTION_MSG)
            } else if (json.serverGameUpdateGameStarted) {
                setIsOpponentFound(true)
                determineOrder(json.serverGameUpdateGameStarted);
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
    },[navigateTo]);

    const handleSendMessage = () => {
        if (socket && message.trim() !== "") {
            socket.send(JSON.stringify({
                [CLIENT_MESSAGE_NEW_MESSAGE]: message
            }));
            setMessage("");
        }
        ensureMessageReachedPairedSession();
    };

    const handleSquareClick = (squareNumber: number) => {
        if (!isPlayerTurn || squares[squareNumber]) {
            return;
        }

        const newSquares = squares.slice();
        newSquares[squareNumber] = playerSquareValue.current;
        setSquares(newSquares);

        setIsPlayerTurn(false);
        sendUpdatedGameStatus(squareNumber, playerSquareValue.current)
    };

    const sendUpdatedGameStatus = (squareNumber: number, squareValue: string) => {
        socket?.send(JSON.stringify({
            [CLIENT_GAME_UPDATE_CHOSEN_SQUARE_NUMBER]: String(squareNumber),
            [CLIENT_GAME_UPDATE_CHOSEN_SQUARE_VALUE]: squareValue
        }));
        ensureMessageReachedPairedSession();
    }

    const determineOrder = (orderMsg: string) => {
        if (orderMsg === FIRST_PLAYER_ORDER) {
            isFirstPlayer.current = true;
            playerSquareValue.current = FIRST_PLAYER_SQUARE_VALUE
            opponentSquareValue.current = SECOND_PLAYER_SQUARE_VALUE
            setIsPlayerTurn(true)
        } else {
            isFirstPlayer.current = false;
            playerSquareValue.current = SECOND_PLAYER_SQUARE_VALUE
            opponentSquareValue.current = FIRST_PLAYER_SQUARE_VALUE
            setIsPlayerTurn(false)
        }
    }

    const updateGameBoard = (squareNumber: number) => {
        setSquares((prevSquares) => {
            const newSquares = [...prevSquares];
            newSquares[squareNumber] = opponentSquareValue.current;
            return newSquares;
        });

        setIsPlayerTurn(true);
    }

    // after sending a message check each second if confirmation has been sent from paired session,
    // if there is no such sent then after 30 seconds inform about it
    const ensureMessageReachedPairedSession = () => {
        hasPairedSessionReceivedTheMessage.current = false;
        const secondIntervalId = setInterval(() => {
            if (hasPairedSessionReceivedTheMessage.current) {
                clearInterval(secondIntervalId);
                clearInterval(finalCheckIntervalId);
            }
        }, MESSAGE_RECEIVED_CHECKING_INTERVAL);

        let finalCheckIntervalId = setTimeout(() => {
            clearInterval(secondIntervalId);
            alert("I haven't got a confirmation in 30 seconds from the paired session. Do the action (sending message/crossing out the square) again.")
            // TODO: here should be this square unmarked to let the player mark it again!
        }, MESSAGE_RECEIVED_CHECKING_TOTAL_TIME);
    }

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
                            <div className={`board-container ${isPlayerTurn ? 'player-turn' : ''}`}>
                                <div className="board-row">
                                    <Square value={squares[0]} onClick={() => handleSquareClick(0)}/>
                                    <Square value={squares[1]} onClick={() => handleSquareClick(1)}/>
                                    <Square value={squares[2]} onClick={() => handleSquareClick(2)}/>
                                </div>
                                <div className="board-row">
                                    <Square value={squares[3]} onClick={() => handleSquareClick(3)}/>
                                    <Square value={squares[4]} onClick={() => handleSquareClick(4)}/>
                                    <Square value={squares[5]} onClick={() => handleSquareClick(5)}/>
                                </div>
                                <div className="board-row">
                                    <Square value={squares[6]} onClick={() => handleSquareClick(6)}/>
                                    <Square value={squares[7]} onClick={() => handleSquareClick(7)}/>
                                    <Square value={squares[8]} onClick={() => handleSquareClick(8)}/>
                                </div>
                            </div>
                            <div className="status">{turnStatus}</div>

                            <input
                                className="websocket-input"
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter message"/>
                            <button onClick={handleSendMessage}>Send</button>
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