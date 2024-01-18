import {LOST_CONNECTION_TO_SERVER_MSG} from "../constant/SessionStatus";
import {CLIENT_MESSAGE_RECEIVED_MESSAGE_CONFIRMATION, CLIENT_SESSION_STATUS_UPDATE_HEARTBEAT} from "../message/Client";

const heartbeatFrequencyInMs = 60000;
const heartbeatCheckingFrequencyInMs = 75000;

const sendHeartbeatMessage = (socket: WebSocket): void => {
    const currentUnixTimestampInSeconds: number = Math.floor(new Date().getTime() / 1000);
    socket.send(JSON.stringify({
        [CLIENT_SESSION_STATUS_UPDATE_HEARTBEAT]: currentUnixTimestampInSeconds
    }));
};

export const createHeartbeatSendingTimer = (sockJS: WebSocket): NodeJS.Timer => {
    return setInterval(sendHeartbeatMessage, heartbeatFrequencyInMs, sockJS);
};

export const createHeartbeatCheckingTimer = (sockJS: WebSocket): NodeJS.Timer => {
    return setInterval(closeClientSocket, heartbeatCheckingFrequencyInMs, sockJS, LOST_CONNECTION_TO_SERVER_MSG);
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

export const sendReceivedConfirmationMessage = (socket: WebSocket): void => {
    socket.send(JSON.stringify({
        [CLIENT_MESSAGE_RECEIVED_MESSAGE_CONFIRMATION]: "successfullyReceived"
    }));
};