const HistBaseUrl = "http://localhost:8081/api/v1/history/";

export const HistoryUrl = {
    FindGamesUrl: HistBaseUrl + "findGamesForUser"
} as const;
