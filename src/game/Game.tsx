import React, {useEffect, useRef, useState} from "react";
import SockJS from "sockjs-client";
import "./Game.css";
import {Link, useNavigate} from "react-router-dom";
import {Path} from "../constants/Path";
import Square from "./Square";
import {closeClientSocket, createHeartbeatCheckingTimer, createHeartbeatSendingTimer, resetTimer, sendMessageReceivedConfirmation, sendReceivedGameStatusUpdateConfirmation, stopTimers} from "./SocketUtil";
import {OPPONENT_DISCONNECTED_MSG, PAIRED_SESSION_DIDNT_RECEIVE_GAME_STATUS_UPDATE, PAIRED_SESSION_DIDNT_RECEIVE_MESSAGE, SERVER_REJECTION_MSG} from "../constants/SessionError";
import {FIRST_PLAYER_ORDER, FIRST_PLAYER_SQUARE_VALUE, RECEIVED_CHECKING_INTERVAL, RECEIVED_CHECKING_TOTAL_TIME, SECOND_PLAYER_SQUARE_VALUE} from "../constants/Game";
import {CLIENT_GAME_UPDATE_CHOSEN_SQUARE_NUMBER, CLIENT_GAME_UPDATE_CHOSEN_SQUARE_VALUE, CLIENT_MESSAGE_NEW_MESSAGE} from "../message/Client";
import {SERVER_GAME_UPDATE_GAME_ENDED, SERVER_GAME_UPDATE_GAME_STARTED, SERVER_GAME_UPDATE_STATUS, SERVER_MESSAGE_CLIENT_RECEIVED_GAME_STATUS_CHANGE_CONFIRMATION, SERVER_MESSAGE_CLIENT_RECEIVED_MESSAGE_CONFIRMATION, SERVER_MESSAGE_NEW_MESSAGE, SERVER_SESSION_STATUS_UPDATE_HEARTBEAT, SERVER_SESSION_STATUS_UPDATE_PAIRED_SESSION_DISCONNECTED, SERVER_SESSION_STATUS_UPDATE_SESSION_REJECTED} from "../message/Server";
import {DRAW, FIRST_PLAYER_WON, SECOND_PLAYER_WON} from "../constants/GameResult";

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
    const [gameStatus, setGameStatus] = useState<string>("Game started. Good luck!")
    const turnStatus = isPlayerTurn ? "Your turn, choose the square" : "Your opponent turn, please wait...";

    const hasPairedSessionReceivedTheMessage = useRef<boolean>();
    const hasPairedSessionReceivedTheGameUpdate = useRef<boolean>()

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

            switch (true) {
                case !!json[SERVER_MESSAGE_NEW_MESSAGE]:
                    sendMessageReceivedConfirmation(sockJS);
                    setReceivedMessage(json[SERVER_MESSAGE_NEW_MESSAGE]);
                    break;
                case !!json[SERVER_GAME_UPDATE_GAME_STARTED]:
                    setIsOpponentFound(true);
                    determineOrder(json[SERVER_GAME_UPDATE_GAME_STARTED]);
                    break;
                case !!json[SERVER_GAME_UPDATE_STATUS]:
                    sendReceivedGameStatusUpdateConfirmation(sockJS);
                    updateGameBoard(json[SERVER_GAME_UPDATE_STATUS]);
                    break;
                case !!json[SERVER_GAME_UPDATE_GAME_ENDED]:
                    handleGameEnd(json[SERVER_GAME_UPDATE_GAME_ENDED]);
                    break;
                case !!json[SERVER_MESSAGE_CLIENT_RECEIVED_MESSAGE_CONFIRMATION]:
                    hasPairedSessionReceivedTheMessage.current = true;
                    break;
                case !!json[SERVER_MESSAGE_CLIENT_RECEIVED_GAME_STATUS_CHANGE_CONFIRMATION]:
                    hasPairedSessionReceivedTheGameUpdate.current = true;
                    break;
                case !!json[SERVER_SESSION_STATUS_UPDATE_HEARTBEAT]:
                    heartbeatCheckingTimerId = resetTimer(heartbeatCheckingTimerId, sockJS);
                    break;
                case !!json[SERVER_SESSION_STATUS_UPDATE_PAIRED_SESSION_DISCONNECTED]:
                    closeClientSocket(sockJS, OPPONENT_DISCONNECTED_MSG);
                    break;
                case !!json[SERVER_SESSION_STATUS_UPDATE_SESSION_REJECTED]:
                    closeClientSocket(sockJS, SERVER_REJECTION_MSG);
                    break;
                default:
                    console.log("Unknown type of message:", json);
                    break;
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

    const handleSendMessage = () => {
        if (socket && message.trim() !== "") {
            socket.send(JSON.stringify({
                [CLIENT_MESSAGE_NEW_MESSAGE]: message
            }));
            setMessage("");
        }
        ensureMessageReachedPairedSession();
    };

    const sendUpdatedGameStatus = (squareNumber: number, squareValue: string) => {
        socket?.send(JSON.stringify({
            [CLIENT_GAME_UPDATE_CHOSEN_SQUARE_NUMBER]: String(squareNumber),
            [CLIENT_GAME_UPDATE_CHOSEN_SQUARE_VALUE]: squareValue
        }));
        ensureGameStatusUpdateReachedPairedSession();
    }

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

    const handleGameEnd = (gameResult: string) => {
        if ((gameResult === FIRST_PLAYER_WON && isFirstPlayer.current) || (gameResult === SECOND_PLAYER_WON && !isFirstPlayer.current)) {
            setGameStatus("Congratulations you won!")
        } else if (gameResult === DRAW) {
            setGameStatus("Draw.")
        } else {
            setGameStatus("You lost :(")
        }
        setIsPlayerTurn(false);
    }

    const ensureMessageReachedPairedSession = () => {
        hasPairedSessionReceivedTheMessage.current = false;
        const secondIntervalId = setInterval(() => {
            if (hasPairedSessionReceivedTheMessage.current) {
                clearInterval(secondIntervalId);
                clearInterval(finalCheckIntervalId);
            }
        }, RECEIVED_CHECKING_INTERVAL);

        let finalCheckIntervalId = setTimeout(() => {
            // situation when message didn't arrive the paired session is not as serious as when there is
            // no game status received, player can still send the message again, game is not finished
            clearInterval(secondIntervalId);
            alert(PAIRED_SESSION_DIDNT_RECEIVE_MESSAGE);
        }, RECEIVED_CHECKING_TOTAL_TIME);
    }

    const ensureGameStatusUpdateReachedPairedSession = () => {
        hasPairedSessionReceivedTheGameUpdate.current = false;
        const secondIntervalId = setInterval(() => {
            if (hasPairedSessionReceivedTheGameUpdate.current) {
                clearInterval(secondIntervalId);
                clearInterval(finalCheckIntervalId);
            }
        }, RECEIVED_CHECKING_INTERVAL);

        let finalCheckIntervalId = setTimeout(() => {
            // When paired session didn't receive the game status change situation is so serious that game needs to be finished,
            // otherwise it would be needed to track the game status and f.e. allow player to set the square again.
            // But then it can choose another one, and we have a conflict in game server, so for now the game is finished
            // and player is redirected to lobby page. Better handling can be implemented in the future if needed.
            clearInterval(secondIntervalId);
            alert(PAIRED_SESSION_DIDNT_RECEIVE_GAME_STATUS_UPDATE);
            navigateTo(Path.LobbyPath);
        }, RECEIVED_CHECKING_TOTAL_TIME);
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
                            <h1>{gameStatus}</h1>
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