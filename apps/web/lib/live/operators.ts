import { Observable, filter } from "rxjs";
import type { ServerMessage, ServerMessageType } from "@repo/contracts";

/**
 * Custom pipeable operator: keep only messages of one envelope `type`,
 * and narrow the TypeScript type so `.data` is correctly typed downstream.
 *
 *   messages$.pipe(ofType("match_created"))  // Observable<{ type: "match_created"; data: MatchDTO }>
 */
export function ofType<T extends ServerMessageType>(type: T) {
  return (source: Observable<ServerMessage>) =>
    source.pipe(
      filter(
        (msg): msg is Extract<ServerMessage, { type: T }> => msg.type === type,
      ),
    );
}

/** Exponential backoff: 1s, 2s, 4s, 8s … capped at 30s. */
export function backoffDelay(attempt: number, baseMs = 1000, maxMs = 30_000) {
  return Math.min(baseMs * 2 ** (attempt - 1), maxMs);
}
