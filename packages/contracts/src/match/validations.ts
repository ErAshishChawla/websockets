import { z } from "zod";

export const MATCH_MAX_LIMIT = 100;

export const ListMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});
export type ListMatchesQueryDTO = z.infer<typeof ListMatchesQuerySchema>;

export const MatchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
export type MatchIdParamDTO = z.infer<typeof MatchIdParamSchema>;

export const CreateMatchSchema = z
  .object({
    sport: z.string().min(1),
    homeTeam: z.string().min(1),
    awayTeam: z.string().min(1),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    homeScore: z.coerce.number().int().nonnegative().optional(),
    awayScore: z.coerce.number().int().nonnegative().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.endTime <= data.startTime) {
      ctx.addIssue({
        code: "custom",
        message: "endTime must be chronologically after startTime",
        path: ["endTime"],
      });
    }
  });
export type CreateMatchDTO = z.infer<typeof CreateMatchSchema>;

export const UpdateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});
export type UpdateScoreDTO = z.infer<typeof UpdateScoreSchema>;
