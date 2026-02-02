export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      challenges: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      games: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      players: {
        Row: {
          id: string;
          log: string[] | null;
          name: string;
          participation: string[] | null;
          points: number | null;
          raffle_placing: number | null;
          raffle_winner: boolean | null;
        };
        Insert: {
          id?: string;
          log?: string[] | null;
          name: string;
          participation?: string[] | null;
          points?: number | null;
          raffle_placing?: number | null;
          raffle_winner?: boolean | null;
        };
        Update: {
          id?: string;
          log?: string[] | null;
          name?: string;
          participation?: string[] | null;
          points?: number | null;
          raffle_placing?: number | null;
          raffle_winner?: boolean | null;
        };
        Relationships: [];
      };
      staff: {
        Row: {
          assignment: string | null;
          id: string;
          name: string;
        };
        Insert: {
          assignment?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          assignment?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          role: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          role: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      team_assignments: {
        Row: {
          id: string;
          player_id: string;
          team_id: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          team_id: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          team_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_assignments_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_assignments_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      teams: {
        Row: {
          game_id: string;
          id: string;
          name: string;
        };
        Insert: {
          game_id: string;
          id?: string;
          name: string;
        };
        Update: {
          game_id?: string;
          id?: string;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "teams_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
        ];
      };
      winners: {
        Row: {
          game: string;
          id: string;
          match_id: string;
          winner_name: string;
        };
        Insert: {
          game: string;
          id?: string;
          match_id: string;
          winner_name: string;
        };
        Update: {
          game?: string;
          id?: string;
          match_id?: string;
          winner_name?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      assign_app_role: {
        Args: {
          target_role: string;
          target_user_id: string;
        };
        Returns: undefined;
      };
      has_app_role: {
        Args: {
          allowed_roles: string[];
        };
        Returns: boolean;
      };
      revoke_app_role: {
        Args: {
          target_role: string;
          target_user_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type TableName = keyof Database["public"]["Tables"];

export type TableRow<T extends TableName> = Database["public"]["Tables"][T]["Row"];
export type TableInsert<T extends TableName> = Database["public"]["Tables"][T]["Insert"];
export type TableUpdate<T extends TableName> = Database["public"]["Tables"][T]["Update"];
