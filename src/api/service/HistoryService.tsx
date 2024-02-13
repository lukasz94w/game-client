import axiosInstance from "../interceptor/AxiosInstance";
import {HistoryUrl} from "../../commons/HistoryUrl";

const findGames = () => {
    return axiosInstance.get(HistoryUrl.FindGamesUrl)
}

const HistoryService = {
    findGames
};

export default HistoryService;