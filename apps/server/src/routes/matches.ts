import {
  CreateMatchSchema,
  ListMatchesQuerySchema,
  MATCH_MAX_LIMIT,
} from "@repo/contracts";
import { Router } from "express";
import { AppDataSource } from "../db";
import { Match } from "../entity/Match";
import { getMatchStatus } from "../utils/match-status";

export const matchRouter = Router();

matchRouter.get("/", async (req, res) => {
  const parsed = await ListMatchesQuerySchema.safeParseAsync(req.query);

  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid query.", details: parsed.error });
  }

  const limit = Math.min(parsed.data.limit ?? 50, MATCH_MAX_LIMIT);

  try {
    const matchRepository = AppDataSource.getRepository(Match);

    const matches = await matchRepository.find({
      order: {
        createdAt: "DESC",
      },
      take: limit,
    });

    return res.status(200).json({ data: matches });
  } catch (error) {
    return res.status(500).json({ error: "Failed to list matches." });
  }
});

matchRouter.post("/", async (req, res) => {
  const parsed = await CreateMatchSchema.safeParseAsync(req.body);

  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid payload.", details: parsed.error });
  }

  try {
    const { startTime, endTime, homeScore, awayScore } = parsed.data;
    const matchRepository = AppDataSource.getRepository(Match);

    const newMatch = matchRepository.create({
      ...parsed.data,
      homeScore: homeScore ?? 0,
      awayScore: awayScore ?? 0,
      status: getMatchStatus(startTime, endTime),
    });

    const savedMatch = await matchRepository.save(newMatch);

    return res.status(201).json({ data: savedMatch });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to create match.", details: error });
  }
});
