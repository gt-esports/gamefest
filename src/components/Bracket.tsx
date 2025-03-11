import { Bracket, IRoundProps } from 'react-brackets';

function Brac({ game }: { game: string }) {
  const rounds: IRoundProps[] = [
    {
      title: 'Round 1',
      seeds: [
        { id: 1, date: new Date().toDateString(), teams: [{ name: 'Team A' }, { name: 'Team B' }] },
        { id: 2, date: new Date().toDateString(), teams: [{ name: 'Team C' }, { name: 'Team D' }] },
        { id: 3, date: new Date().toDateString(), teams: [{ name: 'Team E' }, { name: 'Team F' }] },
        { id: 4, date: new Date().toDateString(), teams: [{ name: 'Team G' }, { name: 'Team H' }] },
        { id: 5, date: new Date().toDateString(), teams: [{ name: 'Team I' }, { name: 'Team J' }] },
        { id: 6, date: new Date().toDateString(), teams: [{ name: 'Team K' }, { name: 'Team L' }] },
        { id: 7, date: new Date().toDateString(), teams: [{ name: 'Team M' }, { name: 'Team N' }] },
        { id: 8, date: new Date().toDateString(), teams: [{ name: 'Team O' }, { name: 'Team P' }] },
      ],
    },
    {
      title: 'Round 2',
      seeds: [
        { id: 9, date: new Date().toDateString(), teams: [{ name: 'Winner 1' }, { name: 'Winner 2' }] },
        { id: 10, date: new Date().toDateString(), teams: [{ name: 'Winner 3' }, { name: 'Winner 4' }] },
        { id: 11, date: new Date().toDateString(), teams: [{ name: 'Winner 5' }, { name: 'Winner 6' }] },
        { id: 12, date: new Date().toDateString(), teams: [{ name: 'Winner 7' }, { name: 'Winner 8' }] },
      ],
    },
    {
      title: 'Round 3',
      seeds: [
        { id: 13, date: new Date().toDateString(), teams: [{ name: 'Winner 9' }, { name: 'Winner 10' }] },
        { id: 14, date: new Date().toDateString(), teams: [{ name: 'Winner 11' }, { name: 'Winner 12' }] },
      ],
    },
    {
      title: 'Winner',
      seeds: [
        { id: 15, date: new Date().toDateString(), teams: [{ name: 'Winner 13' }, { name: 'Winner 14' }] },
      ],
    },
  ];

  return (
    <div className="flex justify-center items-center min-h-screen w-full">
      <div 
        style={{
          width: 'min(90%, 1400px)',
          height: 'auto',
          backgroundColor: 'rgba(60, 60, 78, 0.6)',
          padding: '40px',
          borderRadius: '15px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div className="p-4 rounded text-white w-full flex flex-col justify-center items-center">
          <div className="text-lg mb-4">Bracket for {game}</div>
          <div className="w-full flex justify-center">
            <div className="w-full flex justify-center">
              <Bracket rounds={rounds} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Brac;
