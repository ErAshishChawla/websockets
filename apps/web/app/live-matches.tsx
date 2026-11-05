"use client";

import { useEffect, useMemo, useState } from "react";
import type { MatchDTO } from "@repo/contracts";
import {
  createLiveConnection,
  type ConnectionStatus,
} from "../lib/live/socket";
import { createMatches$, loadMatches$ } from "../lib/live/matches";
import { ofType } from "../lib/live/operators";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/ws";
const MATCHES_API = "/api/matches"; // proxied to the server by next.config.js

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  connecting: "Connecting…",
  open: "Live",
  reconnecting: "Reconnecting…",
};

export function LiveMatches() {
  // One connection per mounted component; `share()` inside lets several
  // streams below reuse the same socket.
  const connection = useMemo(() => createLiveConnection(WS_URL), []);

  const [matches, setMatches] = useState<MatchDTO[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const subs = [
      connection.status$.subscribe(setStatus),
      createMatches$(loadMatches$(MATCHES_API), connection.messages$).subscribe(
        setMatches,
      ),
      // Screen-reader announcement for each new match (WCAG 4.1.3 Status Messages).
      connection.messages$
        .pipe(ofType("match_created"))
        .subscribe(({ data }) =>
          setAnnouncement(`New match: ${data.homeTeam} vs ${data.awayTeam}`),
        ),
    ];
    // Cleanup = unsubscribe. Last unsubscribe closes the WebSocket (no leaks).
    return () => subs.forEach((s) => s.unsubscribe());
  }, [connection]);

  return (
    <section aria-labelledby="live-matches-heading">
      <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 id="live-matches-heading">Live matches</h1>
        <span role="status" data-status={status}>
          {STATUS_LABEL[status]}
        </span>
      </header>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {matches.length === 0 ? (
        <p>
          No matches yet. Create one with POST /matches and it appears here
          instantly.
        </p>
      ) : (
        <ul>
          {matches.map((m) => (
            <li key={m.id}>
              <strong>
                {m.homeTeam} {m.homeScore} – {m.awayScore} {m.awayTeam}
              </strong>{" "}
              <span>
                {m.sport} · {m.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
