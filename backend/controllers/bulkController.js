import Game from "../models/Game.js";
import Player from "../models/Player.js";
import Staff from "../models/Staff.js";
import Challenge from "../models/Challenge.js";

const syncTeamRosters = async () => {
  const games = await Game.find({});
  const players = await Player.find({});

  for (const game of games) {
    for (const team of game.teams) {
      // Reset team players
      team.players = players
        .filter((p) =>
          p.teamAssignments?.some(
            (a) => a.game === game.name && a.team === team.name
          )
        )
        .map((p) => p.name);
    }
    await game.save();
  }
};

const bulkUpload = async (req, res) => {
  const { GAMES, PLAYERS, STAFF: STAFF_DATA, CHALLENGES } = req.body;

  try {
    await Promise.all([
      Game.deleteMany(),
      Player.deleteMany(),
      Staff.deleteMany(),
      Challenge.deleteMany(),
    ]);

    const gameArray = Object.entries(GAMES).map(([name, teams]) => ({
      name,
      teams: Object.entries(teams).map(([teamName, players]) => ({
        name: teamName,
        players,
      })),
    }));

    const playerArray = Object.entries(PLAYERS).map(([name, data]) => ({
      name,
      points: parseInt(data.POINTS),
      participation: data.PARTICIPATION,
      log: data.LOG,
      teamAssignments: data.TEAM_ASSIGNMENTS || [],
    }));

    const staffArray = Object.entries(STAFF_DATA).map(([name, role]) => ({
      name,
      role,
    }));

    const challengeArray = CHALLENGES.map((name) => ({ name }));

    await Game.insertMany(gameArray);
    await Player.insertMany(playerArray);
    await Staff.insertMany(staffArray);
    await Challenge.insertMany(challengeArray);

    await syncTeamRosters(); // ensure team rosters match player assignments

    res.status(200).json({ message: "Bulk upload complete" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

export default {
  bulkUpload,
};
