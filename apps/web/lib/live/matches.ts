import { Observable, catchError, map, merge, of, scan } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import type { MatchDTO, ServerMessage } from "@repo/contracts";
import { ofType } from "./operators";

export const MAX_MATCHES = 50;

/** Events that change the match list. */
export type MatchEvent =
  | { kind: "loaded"; matches: MatchDTO[] }
  | { kind: "created"; match: MatchDTO };

/**
 * Pure reducer used by `scan()`: (current list, event) → next list.
 * Newest first, no duplicates (a live event can arrive before or after the
 * initial fetch), capped at MAX_MATCHES.
 */
export function reduceMatches(list: MatchDTO[], event: MatchEvent): MatchDTO[] {
  const incoming = event.kind === "loaded" ? event.matches : [event.match];
  const byId = new Map<number, MatchDTO>();
  for (const m of [...incoming, ...list]) {
    if (!byId.has(m.id)) byId.set(m.id, m);
  }
  return [...byId.values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, MAX_MATCHES);
}

/** Initial snapshot over HTTP. Errors become an empty list, not a crash. */
export function loadMatches$(apiUrl: string): Observable<MatchEvent> {
  return fromFetch<{ data: MatchDTO[] }>(apiUrl, {
    selector: (res) => res.json(),
  }).pipe(
    map(({ data }): MatchEvent => ({ kind: "loaded", matches: data })),
    catchError(() => of<MatchEvent>({ kind: "loaded", matches: [] })),
  );
}

/**
 * The full live list = initial HTTP snapshot MERGED with live WebSocket
 * events, folded into one array with `scan`.
 *
 *   initial$ ──loaded──────────────────────►
 *   live$    ─────────created──created─────►
 *            merge → scan(reduceMatches)
 *   matches$ [] ─[..50]──[new,..]──[new,..]►
 */
export function createMatches$(
  initial$: Observable<MatchEvent>,
  messages$: Observable<ServerMessage>,
): Observable<MatchDTO[]> {
  const created$ = messages$.pipe(
    ofType("match_created"),
    map((msg): MatchEvent => ({ kind: "created", match: msg.data })),
  );

  return merge(initial$, created$).pipe(scan(reduceMatches, [] as MatchDTO[]));
}
