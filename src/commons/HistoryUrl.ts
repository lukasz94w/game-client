const HistBaseUrl = "http://localhost:8094/api/v1/history/";

export const HistoryUrl = {
    FindGamesUrl: HistBaseUrl + "findGamesForUser"
} as const;
