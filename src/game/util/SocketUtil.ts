import {LOST_CONNECTION_TO_SERVER} from "./SessionError";
import {
    CLIENT_GAME_RECEIVED_GAME_STATUS_UPDATE_CONFIRMATION,
    CLIENT_GAME_UPDATE_CHOSEN_SQUARE_NUMBER,
    CLIENT_GAME_UPDATE_CHOSEN_SQUARE_VALUE,
    CLIENT_SESSION_STATUS_UPDATE_HEARTBEAT
} from "../../api/message/Client";

const HEARTBEAT_FREQUENCY = 60000;
const HEARTBEAT_CHECKING_FREQUENCY = 75000;

const sendHeartbeatMessage = (socket: WebSocket): void => {
    const currentUnixTimestampInSeconds: number = Math.floor(new Date().getTime() / 1000);
    socket.send(JSON.stringify({
        [CLIENT_SESSION_STATUS_UPDATE_HEARTBEAT]: currentUnixTimestampInSeconds
    }));
};

export const createHeartbeatSendingTimer = (sockJS: WebSocket): NodeJS.Timer => {
    return setInterval(sendHeartbeatMessage, HEARTBEAT_FREQUENCY, sockJS);
};

export const createHeartbeatCheckingTimer = (sockJS: WebSocket): NodeJS.Timer => {
    return setInterval(closeClientSocket, HEARTBEAT_CHECKING_FREQUENCY, sockJS, LOST_CONNECTION_TO_SERVER);
};

export const closeClientSocket = (socket: WebSocket, reason: string): void => {
    console.log(reason);
    socket.close();
};

export const resetTimer = (heartbeatCheckingTimerId: NodeJS.Timer, socket: WebSocket): NodeJS.Timer => {
    clearInterval(heartbeatCheckingTimerId);
    return createHeartbeatCheckingTimer(socket);
};

export const stopTimers = (heartbeatSendingTimerId: NodeJS.Timer, heartbeatCheckingTimerId: NodeJS.Timer): void => {
    clearInterval(heartbeatSendingTimerId);
    clearInterval(heartbeatCheckingTimerId);
};
export const sendReceivedGameStatusUpdateConfirmation = (socket: WebSocket, opponentSquareValue: string, opponentChosenSquareNumber: any): void => {
    socket.send(JSON.stringify({
        [CLIENT_GAME_RECEIVED_GAME_STATUS_UPDATE_CONFIRMATION]: "",
        [CLIENT_GAME_UPDATE_CHOSEN_SQUARE_VALUE]: opponentSquareValue,
        [CLIENT_GAME_UPDATE_CHOSEN_SQUARE_NUMBER]: opponentChosenSquareNumber
    }));
};