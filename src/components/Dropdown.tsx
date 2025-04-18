// Note: Dropdown component for selecting a game
interface DropdownProps {
    selectedGame: string;
    setSelectedGame: React.Dispatch<React.SetStateAction<string>>;
    games: string[]; /*to be added with real games*/
}
  
export default function Dropdown({ selectedGame, setSelectedGame, games }: DropdownProps) {
  return (
    <select
      className="border p-2 rounded w-40 max-h-48 overflow-y-auto text-black cursor-pointer"
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
  