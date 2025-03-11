// Note: Dropdown component for selecting a game
interface DropdownProps {
    selectedGame: string;
    setSelectedGame: React.Dispatch<React.SetStateAction<string>>;
    games: string[];
}
  
  export default function Dropdown({ selectedGame, setSelectedGame, games }: DropdownProps) {
    return (
      <select 
        className="border p-2 rounded"
        value={selectedGame} 
        onChange={(e) => setSelectedGame(e.target.value)}
      >
        {games.map((game) => (
          <option key={game} value={game}>
            {game}
          </option>
        ))}
      </select>
    );
}
  
  