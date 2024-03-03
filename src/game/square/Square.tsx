import './Square.css'

interface SquareProps {
    value: string | null;
    onClick: () => void;
}

const Square: React.FC<SquareProps> = ({value, onClick}) => (
    <button className="square" onClick={onClick}>
        {value}
    </button>
);

export default Square