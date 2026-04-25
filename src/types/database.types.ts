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
          points_per_award: number;
          max_points: number;
        };
        Insert: {
          id?: string;
          name: string;
          points_per_award?: number;
          max_points?: number;
        };
        Update: {
          id?: string;
          name?: string;
          points_per_award?: number;
          max_points?: number;
        };
        Relationships: [];
      };
      games: {
        Row: {
          id: string;
          name: string;
          points_per_award: number;
          max_points: number;
        };
        Insert: {
          id?: string;
          name: string;
          points_per_award?: number;
          max_points?: number;
        };
        Update: {
          id?: string;
          name?: string;
          points_per_award?: number;
          max_points?: number;
        };
        Relationships: [];
      };
      check_in_events: {
        Row: {
          id: string;
          user_id: string;
          event_type: "check_in" | "check_out";
          performed_by: string | null;
          occurred_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: "check_in" | "check_out";
          performed_by?: string | null;
          occurred_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: "check_in" | "check_out";
          performed_by?: string | null;
          occurred_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "check_in_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "check_in_events_performed_by_fkey";
            columns: ["performed_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      player_activity: {
        Row: {
          id: string;
          player_id: string;
          game_id: string | null;
          challenge_id: string | null;
          points_awarded: number;
          awarded_by: string | null;
          awarded_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          game_id?: string | null;
          challenge_id?: string | null;
          points_awarded: number;
          awarded_by?: string | null;
          awarded_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          game_id?: string | null;
          challenge_id?: string | null;
          points_awarded?: number;
          awarded_by?: string | null;
          awarded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "player_activity_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_activity_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_activity_challenge_id_fkey";
            columns: ["challenge_id"];
            isOneToOne: false;
            referencedRelation: "challenges";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          fname: string | null;
          id: string;
          lname: string | null;
          profile_completed: boolean;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          fname?: string | null;
          id: string;
          lname?: string | null;
          profile_completed?: boolean;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          fname?: string | null;
          id?: string;
          lname?: string | null;
          profile_completed?: boolean;
          username?: string | null;
        };
        Relationships: [];
      };
      players: {
        Row: {
          id: string;
          log: string[] | null;
          participation: string[] | null;
          points: number | null;
          raffle_placing: number | null;
          raffle_winner: boolean | null;
          user_id: string;
        };
        Insert: {
          id?: string;
          log?: string[] | null;
          participation?: string[] | null;
          points?: number | null;
          raffle_placing?: number | null;
          raffle_winner?: boolean | null;
          user_id: string;
        };
        Update: {
          id?: string;
          log?: string[];
          participation?: string[];
          points?: number | null;
          raffle_placing?: number | null;
          raffle_winner?: boolean | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "players_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      registrations: {
        Row: {
          id: string;
          user_id: string;
          first_name: string;
          last_name: string;
          email: string;
          admission_type: string;
          school: string | null;
          heard_from: string | null;
          created_at: string;
          checked_in: boolean;
          checked_in_at: string | null;
          checked_in_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name: string;
          last_name: string;
          email: string;
          admission_type: string;
          school?: string | null;
          heard_from?: string | null;
          created_at?: string;
          checked_in?: boolean;
          checked_in_at?: string | null;
          checked_in_by?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          admission_type?: string;
          school?: string | null;
          heard_from?: string | null;
          created_at?: string;
          checked_in?: boolean;
          checked_in_at?: string | null;
          checked_in_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "registrations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      staff_assignments: {
        Row: {
          id: string;
          user_id: string;
          game_id: string | null;
          challenge_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id?: string | null;
          challenge_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          game_id?: string | null;
          challenge_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "staff_assignments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "staff_assignments_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "staff_assignments_challenge_id_fkey";
            columns: ["challenge_id"];
            isOneToOne: false;
            referencedRelation: "challenges";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
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
          }
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
          }
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
      award_points: {
        Args: {
          p_player_id: string;
          p_game_id: string | null;
          p_challenge_id: string | null;
          p_amount: number;
          p_log_entry: string;
        };
        Returns: string;
      };
      check_in_user: {
        Args: {
          p_user_id: string;
        };
        Returns: undefined;
      };
      check_out_user: {
        Args: {
          p_user_id: string;
        };
        Returns: undefined;
      };
      has_app_role: {
        Args: {
          allowed_roles: string[];
        };
        Returns: boolean;
      };
      reset_all_check_ins: {
        Args: Record<string, never>;
        Returns: number;
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

export type TableRow<T extends TableName> =
  Database["public"]["Tables"][T]["Row"];
export type TableInsert<T extends TableName> =
  Database["public"]["Tables"][T]["Insert"];
export type TableUpdate<T extends TableName> =
  Database["public"]["Tables"][T]["Update"];
