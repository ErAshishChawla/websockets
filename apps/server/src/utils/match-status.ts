import { MatchStatus } from "@repo/contracts";
import { Match } from "../entity/Match";

export function getMatchStatus(
  startTime: Date,
  endTime: Date,
  now = new Date(),
) {
  if (now < startTime) {
    return MatchStatus.Scheduled;
  }

  if (now >= endTime) {
    return MatchStatus.Finished;
  }

  return MatchStatus.Live;
}
