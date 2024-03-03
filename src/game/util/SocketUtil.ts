import {LOST_CONNECTION_TO_SERVER} from "./SessionError";
import {DATA, MESSAGE_TYPE} from "../../api/json/common/JsonKey";
import {HEARTBEAT, PLAYER_RECEIVED_GAME_UPDATE_CONFIRMATION} from "../../api/json/outgoing/ClientMessageTypeValue";

const HEARTBEAT_FREQUENCY = 60000;
const HEARTBEAT_CHECKING_FREQUENCY = 75000;

const sendHeartbeatMessage = (socket: WebSocket): void => {
    const currentUnixTimestampInSeconds: number = Math.floor(new Date().getTime() / 1000);
    socket.send(JSON.stringify({
        [MESSAGE_TYPE]: HEARTBEAT,
        [DATA]: currentUnixTimestampInSeconds
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
        [MESSAGE_TYPE]: PLAYER_RECEIVED_GAME_UPDATE_CONFIRMATION,
        [DATA]: opponentSquareValue + opponentChosenSquareNumber
    }));
};