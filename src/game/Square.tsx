interface SquareProps {
    value: string | null;
    onClick: () => void; // Assuming it's a simple click handler without event details
}

const Square: React.FC<SquareProps> = ({ value, onClick }) => (
    <button className="square" onClick={onClick}>
        {value}
    </button>
);

export default Square