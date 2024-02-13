import {Key} from "react";
import './HistoryTable.css';

const HistoryTable = ({data}: { data: any }) => {
    return (
        <table className="my-table">
            <thead>
            <tr>
                <th>First player</th>
                <th>Second player</th>
                <th>Winner</th>
                <th>Game started</th>
                <th>Game ended</th>
                <th>Number of winning movements</th>
            </tr>
            </thead>
            <tbody>
            {data.map(
                (game: {
                    firstPlayerName: string;
                    secondPlayerName: string;
                    winnerPlayerName: string;
                    gameStarted: Date;
                    gameEnded: Date;
                    numberOfWinningMovements: number;
                }, index: Key) => (
                    <tr key={index}>
                        <td>{game.firstPlayerName}</td>
                        <td>{game.secondPlayerName}</td>
                        <td>{game.winnerPlayerName}</td>
                        <td>{new Date(game.gameStarted).toLocaleString()}</td>
                        <td>{new Date(game.gameEnded).toLocaleString()}</td>
                        <td>{game.numberOfWinningMovements}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default HistoryTable;