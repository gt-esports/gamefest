export interface GameCardProps {
  image: string;
  name: string;
  discordLink: string;
  link: string;
}

export interface RecruitmentCardProps {
  image: string;
  name: string;
  discordLink: string;
  recruitmentInfo: string;
  contactEmail: string;
  contactDiscord: string;
  tryoutDate: string;
}

export interface ProfileCardProps {
  image: string;
  name: string;
  position: string;
}

export interface TeamAssignment {
  game: string;
  team: string;
}

export interface Player {
  name: string;
  teamAssignments?: TeamAssignment[];
}

export interface Team {
  name: string;
  players: string[];
}

export interface GameData {
  name: string;
  teams: Team[];
}

export interface Participant {
  id: string;
  name: string;
  isWinner: boolean | undefined;
}

export interface Match {
  id: string;
  name: string;
  nextMatchId: string | null;
  tournamentRoundText: string;
  startTime: string;
  state: "DONE" | "SCHEDULED";
  participants: Participant[];
  onClick?: () => void;
}
