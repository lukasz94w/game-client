import HistoryTable from "./HistoryTable";
import './History.css';
import historyService from "../api/service/HistoryService";
import {useEffect, useState} from "react";

const History = () => {
    const [games, setGames] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        historyService.findGames()
            .then(response => {
                    setGames(response.data);
                    setDataLoaded(true);
                }
            ).catch(error => {
            console.error("Error fetching games:", error);
            setDataLoaded(true);
        });
    }, []);

    return (
        <div className="container">
            {dataLoaded && (
                <div>
                    <h1 className="games-history">Games history</h1>
                    {games.length > 0 ? (
                        <HistoryTable data={games}/>
                    ) : (
                        <p className="no-games">No played games yet</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default History;
