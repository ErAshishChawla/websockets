import { MatchStatus } from "../match/types";

/**
 * A match as it travels over the wire (JSON): dates are ISO strings,
 * not Date objects.
 */
export interface MatchDTO {
  id: number;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  endTime: string;
  status: MatchStatus;
  homeScore: number;
  awayScore: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Envelope pattern (see apps/server/docs/socket-patterns.md):
 * every server → client message carries a `type` discriminator,
 * so clients can route it with a switch or an `ofType()` filter.
 */
export type ServerMessage =
  | { type: "welcome" }
  | { type: "match_created"; data: MatchDTO };

export type ServerMessageType = ServerMessage["type"];
