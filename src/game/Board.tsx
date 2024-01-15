import {useState} from "react";
import './Board.css'
import Square from "./Square";

const initialBoard = Array(9).fill(null);

const calculateWinner = (squares: number[]) => {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }

    return null;
};

const Board = () => {
    const [squares, setSquares] = useState(initialBoard);
    const [xIsNext, setXIsNext] = useState(true);

    const handleClick = (i: number) => {
        if (squares[i] || calculateWinner(squares)) {
            return;
        }

        const newSquares = squares.slice();
        newSquares[i] = xIsNext ? 'X' : 'O';

        setSquares(newSquares);
        setXIsNext(!xIsNext);
    };

    const renderSquare = (i: number) => (
        <Square value={squares[i]} onClick={() => handleClick(i)} />
    );

    const winner = calculateWinner(squares);
    const status = winner ? `Winner: ${winner}` : `Next player: ${xIsNext ? 'X' : 'O'}`;

    return (
        <div>
            <div className="status">{status}</div>
            <div className="board-row">
                {renderSquare(0)}
                {renderSquare(1)}
                {renderSquare(2)}
            </div>
            <div className="board-row">
                {renderSquare(3)}
                {renderSquare(4)}
                {renderSquare(5)}
            </div>
            <div className="board-row">
                {renderSquare(6)}
                {renderSquare(7)}
                {renderSquare(8)}
            </div>
        </div>
    );
};

export default Board;