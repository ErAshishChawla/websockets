import {
  BehaviorSubject,
  Observable,
  defer,
  repeat,
  retry,
  share,
  tap,
  timer,
} from "rxjs";
import { webSocket } from "rxjs/webSocket";
import type { ServerMessage } from "@repo/contracts";
import { backoffDelay } from "./operators";

export type ConnectionStatus = "connecting" | "open" | "reconnecting";

export interface LiveConnection {
  /** Every message from the server, parsed from JSON. Hot + shared. */
  messages$: Observable<ServerMessage>;
  /** Current connection state, for the UI. Always has a value. */
  status$: Observable<ConnectionStatus>;
}

/**
 * One WebSocket connection, exposed as RxJS streams.
 *
 * - `webSocket()` turns the socket into an Observable (JSON parse built in).
 * - `retry`  reconnects when the socket ERRORS (server down, network drop).
 * - `repeat` reconnects when the socket CLOSES cleanly (server restart).
 *   Both wait with exponential backoff so we don't hammer the server.
 * - `share()` means N subscribers share ONE connection; the socket opens on
 *   the first subscriber and closes when the last one unsubscribes.
 */
export function createLiveConnection(url: string): LiveConnection {
  const status$ = new BehaviorSubject<ConnectionStatus>("connecting");
  let attempt = 0;

  const reconnect = () => {
    attempt += 1;
    status$.next("reconnecting");
    return timer(backoffDelay(attempt));
  };

  const messages$ = defer(() =>
    webSocket<ServerMessage>({
      url,
      openObserver: {
        next: () => {
          attempt = 0;
          status$.next("open");
        },
      },
    }),
  ).pipe(
    retry({ delay: reconnect }),
    repeat({ delay: reconnect }),
    tap({ unsubscribe: () => status$.next("connecting") }),
    share(),
  );

  return { messages$, status$: status$.asObservable() };
}
