import axiosBaseInstance from "./AxiosBaseInstance";
import {HistoryUrl} from "../url/http/HistoryUrl";

const findGames = () => {
    return axiosBaseInstance.get(HistoryUrl.FindGamesUrl)
}

const HistoryService = {
    findGames
};

export default HistoryService;