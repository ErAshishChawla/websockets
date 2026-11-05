import { describe, expect, it } from "vitest";
import { TestScheduler } from "rxjs/testing";
import {
  MatchStatus,
  type MatchDTO,
  type ServerMessage,
} from "@repo/contracts";
import {
  MAX_MATCHES,
  createMatches$,
  reduceMatches,
  type MatchEvent,
} from "./matches";
import { backoffDelay, ofType } from "./operators";

const match = (id: number, createdAt: string): MatchDTO => ({
  id,
  sport: "football",
  homeTeam: `Home ${id}`,
  awayTeam: `Away ${id}`,
  startTime: createdAt,
  endTime: createdAt,
  status: MatchStatus.Live,
  homeScore: 0,
  awayScore: 0,
  createdAt,
  updatedAt: createdAt,
});

const m1 = match(1, "2026-01-01T10:00:00Z");
const m2 = match(2, "2026-01-01T11:00:00Z");
const m3 = match(3, "2026-01-01T12:00:00Z");

/*
 * Marble syntax: each character is one frame of virtual time.
 *   -  nothing happens     a  a value is emitted     |  complete
 * TestScheduler runs it all synchronously, so time-based streams test instantly.
 */
const scheduler = () =>
  new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

describe("ofType", () => {
  it("keeps only messages of the requested type", () => {
    scheduler().run(({ cold, expectObservable }) => {
      const messages$ = cold<ServerMessage>("w-c-w|", {
        w: { type: "welcome" },
        c: { type: "match_created", data: m1 },
      });
      expectObservable(messages$.pipe(ofType("match_created"))).toBe("--c--|", {
        c: { type: "match_created", data: m1 },
      });
    });
  });
});

describe("createMatches$", () => {
  it("merges the HTTP snapshot with live events, newest first", () => {
    scheduler().run(({ cold, expectObservable }) => {
      const initial$ = cold<MatchEvent>("--l|", {
        l: { kind: "loaded", matches: [m2, m1] },
      });
      const messages$ = cold<ServerMessage>("w---c|", {
        w: { type: "welcome" },
        c: { type: "match_created", data: m3 },
      });
      expectObservable(createMatches$(initial$, messages$)).toBe("--a-b|", {
        a: [m2, m1],
        b: [m3, m2, m1],
      });
    });
  });

  it("does not duplicate a match that arrives live AND in the snapshot", () => {
    scheduler().run(({ cold, expectObservable }) => {
      const initial$ = cold<MatchEvent>("---l|", {
        l: { kind: "loaded", matches: [m2, m1] },
      });
      const messages$ = cold<ServerMessage>("-c--|", {
        c: { type: "match_created", data: m2 },
      });
      expectObservable(createMatches$(initial$, messages$)).toBe("-a-b|", {
        a: [m2],
        b: [m2, m1],
      });
    });
  });
});

describe("reduceMatches", () => {
  it(`caps the list at ${MAX_MATCHES}`, () => {
    const many = Array.from({ length: 60 }, (_, i) =>
      match(i, new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString()),
    );
    const list = reduceMatches([], { kind: "loaded", matches: many });
    expect(list).toHaveLength(MAX_MATCHES);
    expect(list[0]!.id).toBe(59); // newest first
  });
});

describe("backoffDelay", () => {
  it("doubles each attempt and caps at 30s", () => {
    expect([1, 2, 3, 4, 5, 6, 7].map((n) => backoffDelay(n))).toEqual([
      1000, 2000, 4000, 8000, 16000, 30000, 30000,
    ]);
  });
});
