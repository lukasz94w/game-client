import React, {useEffect, useRef, useState} from "react";
import SockJS from "sockjs-client";
import "./Game.css";
import {Link, useNavigate} from "react-router-dom";
import {Path} from "../commons/Path";
import Square from "./Square";
import {
    closeClientSocket,
    createHeartbeatCheckingTimer,
    createHeartbeatSendingTimer,
    resetTimer,
    sendReceivedGameStatusUpdateConfirmation,
    stopTimers
} from "./util/SocketUtil";
import {
    OPPONENT_DISCONNECTED,
    PAIRED_SESSION_DIDNT_RECEIVE_GAME_STATUS_UPDATE,
    SERVER_REJECTION
} from "./util/SessionError";
import {
    CLIENT_GAME_UPDATE_CHOSEN_SQUARE_NUMBER,
    CLIENT_GAME_UPDATE_CHOSEN_SQUARE_VALUE,
    CLIENT_GAME_UPDATE_GAME_CHANGED,
    CLIENT_MESSAGE_PLAYER_MESSAGE
} from "../api/message/Client";
import {
    SERVER_GAME_OPPONENT_RECEIVED_GAME_STATUS_CHANGE_CONFIRMATION,
    SERVER_GAME_UPDATE_GAME_CHANGED,
    SERVER_GAME_UPDATE_GAME_ENDED,
    SERVER_GAME_UPDATE_GAME_STARTED,
    SERVER_MESSAGE_OPPONENT_MESSAGE,
    SERVER_SESSION_STATUS_UPDATE_HEARTBEAT,
    SERVER_SESSION_STATUS_UPDATE_PAIRED_SESSION_DISCONNECTED,
    SERVER_SESSION_STATUS_UPDATE_SESSION_REJECTED
} from "../api/message/Server";
import {FIRST_PLAYER_WON, SECOND_PLAYER_WON, UNRESOLVED} from "./message/GameResult";
import {FIRST_PLAYER_ORDER} from "./message/GameOrder";
import {FIRST_PLAYER_SQUARE_VALUE, SECOND_PLAYER_SQUARE_VALUE} from "./util/GameVariables";
import {GameServerUrl} from "../commons/GameServerUrl";

const Game = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    const [chatContent, setChatContent] = useState<string[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const chatContentRef = useRef<HTMLDivElement>(null);

    const [squares, setSquares] = useState(Array(9).fill(null));
    const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>();
    const [isOpponentFound, setIsOpponentFound] = useState(false);
    const isFirstPlayer = useRef<boolean>();
    const playerSquareValue = useRef<string>('');
    const opponentSquareValue = useRef<string>('')
    const lastMarkedSquareNumber = useRef<number>(-1)
    const turnStatus = isPlayerTurn ? "Your turn, choose the square" : "Your opponent turn, please wait...";
    const hasOpponentReceivedTheGameUpdate = useRef<boolean>()
    const CONFIRMATION_RECEIVED_CHECKING_INTERVAL = 1000;
    const CONFIRMATION_RECEIVED_CHECKING_TOTAL = 30000;
    const showOpponentDisconnectedAlert = useRef(true);

    const navigateTo = useNavigate();

    useEffect(() => {
        let heartbeatSendingTimerId: NodeJS.Timer
        let heartbeatCheckingTimerId: NodeJS.Timer;

        const sockJS = new SockJS(GameServerUrl.WebSocketUrl);

        sockJS.onopen = () => {
            setSocket(sockJS);
            heartbeatSendingTimerId = createHeartbeatSendingTimer(sockJS);
            heartbeatCheckingTimerId = createHeartbeatCheckingTimer(sockJS);
        };

        sockJS.onmessage = (event: any) => {
            let json = JSON.parse(event.data)

            switch (true) {
                case !!json[SERVER_MESSAGE_OPPONENT_MESSAGE]:
                    updateChatContent(`Opponent: ${json[SERVER_MESSAGE_OPPONENT_MESSAGE]}`);
                    break;
                case !!json[SERVER_GAME_UPDATE_GAME_STARTED]:
                    setIsOpponentFound(true);
                    determineOrder(json[SERVER_GAME_UPDATE_GAME_STARTED]);
                    break;
                case !!json[SERVER_GAME_UPDATE_GAME_CHANGED]:
                    let opponentChosenSquareNumber = json[SERVER_GAME_UPDATE_GAME_CHANGED]
                    sendReceivedGameStatusUpdateConfirmation(sockJS, opponentSquareValue.current, opponentChosenSquareNumber);
                    updateGameBoard(opponentChosenSquareNumber);
                    break;
                case !!json[SERVER_GAME_OPPONENT_RECEIVED_GAME_STATUS_CHANGE_CONFIRMATION]:
                    hasOpponentReceivedTheGameUpdate.current = true;
                    break;
                case !!json[SERVER_GAME_UPDATE_GAME_ENDED]:
                    handleGameEnd(json[SERVER_GAME_UPDATE_GAME_ENDED]);
                    break;
                case !!json[SERVER_SESSION_STATUS_UPDATE_HEARTBEAT]:
                    heartbeatCheckingTimerId = resetTimer(heartbeatCheckingTimerId, sockJS);
                    break;
                case !!json[SERVER_SESSION_STATUS_UPDATE_PAIRED_SESSION_DISCONNECTED]:
                    closeClientSocket(sockJS, OPPONENT_DISCONNECTED);
                    if (showOpponentDisconnectedAlert.current) {
                        alert(OPPONENT_DISCONNECTED)
                    }
                    break;
                case !!json[SERVER_SESSION_STATUS_UPDATE_SESSION_REJECTED]:
                    closeClientSocket(sockJS, SERVER_REJECTION);
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
            stopTimers(heartbeatSendingTimerId, heartbeatCheckingTimerId)
            if (sockJS) {
                sockJS.close();
            }
        };
    }, [navigateTo]);

    const handleSendChat = () => {
        if (socket && currentMessage.trim() !== "") {
            socket.send(JSON.stringify({
                [CLIENT_MESSAGE_PLAYER_MESSAGE]: currentMessage
            }));
            setCurrentMessage("");
            updateChatContent(`You: ${currentMessage}`);
        }

        // In opposition to sending update game status there is no checking whether the message reached the opponent
        // it's not as critical thing as the game status. If such feature would have to be implemented then for each sent
        // message separate timer has to be created in which there will be checking whether message reached the opponent.
        // In case of failure show then: 1. show the player which message didn't reach the second player, 2. apply retry policy.
    };

    const sendUpdatedGameStatus = (squareNumber: number, squareValue: string) => {
        socket?.send(JSON.stringify({
            [CLIENT_GAME_UPDATE_GAME_CHANGED]: "",
            [CLIENT_GAME_UPDATE_CHOSEN_SQUARE_NUMBER]: String(squareNumber),
            [CLIENT_GAME_UPDATE_CHOSEN_SQUARE_VALUE]: squareValue
        }));
        ensureGameStatusUpdateReachedOpponent();
    }

    const handleSquareClick = (squareNumber: number) => {
        if (!isPlayerTurn || squares[squareNumber]) {
            return;
        }

        lastMarkedSquareNumber.current = squareNumber;

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
        showOpponentDisconnectedAlert.current = false;
        if ((gameResult === FIRST_PLAYER_WON && isFirstPlayer.current) || (gameResult === SECOND_PLAYER_WON && !isFirstPlayer.current)) {
            alert("Congratulations you won! You will be redirected to lobby");
        } else if (gameResult === UNRESOLVED) {
            alert("Draw. You will be redirected to lobby");
        } else {
            alert("You lost :(. You will be redirected to lobby");
        }
        navigateTo(Path.LobbyPath);
    }

    const ensureGameStatusUpdateReachedOpponent = () => {
        hasOpponentReceivedTheGameUpdate.current = false;
        const secondIntervalId = setInterval(() => {
            if (hasOpponentReceivedTheGameUpdate.current) {
                clearInterval(secondIntervalId);
                clearInterval(finalCheckIntervalId);
                lastMarkedSquareNumber.current = -1;
            }
        }, CONFIRMATION_RECEIVED_CHECKING_INTERVAL);

        let finalCheckIntervalId = setTimeout(() => {
            // When paired session didn't receive the game status change it restores previous
            // board state allowing the player to choose square again. It's safe because
            // the game status is not saved in the server side (it is done only after
            // confirmation of receiving the information from the opponent).
            // Possible improvements: apply retry policy in case of failures.

            setSquares((prevSquares) => {
                const newSquares = [...prevSquares];
                newSquares[lastMarkedSquareNumber.current] = null;
                return newSquares;
            });

            setIsPlayerTurn(true)

            clearInterval(secondIntervalId);
            alert(PAIRED_SESSION_DIDNT_RECEIVE_GAME_STATUS_UPDATE);
        }, CONFIRMATION_RECEIVED_CHECKING_TOTAL);
    }

    const updateChatContent = (message: string) => {
        setChatContent((prevContent) => [...prevContent, message]);
        scrollToTheLatestMessage()
    };

    const scrollToTheLatestMessage = () => {
        setTimeout(() => {
            if (chatContentRef.current) {
                chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
            }
        }, 10); // small timeout is needed to make the scroll function work properly
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

                            <Link to={Path.LobbyPath}>
                                <button className="finish-game-button">Leave the game</button>
                            </Link>

                            <div className="chat-panel">
                                <div className="chat-content" ref={chatContentRef}>
                                    <div className="chat-title">Chat:</div>
                                    {chatContent.map((message, index) => (
                                        <p key={index}>{message}</p>
                                    ))}
                                </div>
                                <div className="chat-input">
                                    <input
                                        type="text"
                                        value={currentMessage}
                                        onChange={(e) => setCurrentMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSendChat();
                                            }
                                        }}
                                        placeholder="Type your message"
                                    />
                                    <button onClick={handleSendChat}>Send</button>
                                </div>
                            </div>
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