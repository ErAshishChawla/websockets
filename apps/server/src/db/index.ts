import "reflect-metadata";
import { DataSource } from "typeorm";
import { dbConfig } from "../config/db";
import { env } from "../config";
import { Match } from "../entity/Match";
import { Commentary } from "../entity/Commentary";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: dbConfig.DATABASE_URL,
  synchronize: env.NODE_ENV !== "production" ? true : false,
  logging: env.NODE_ENV === "development" ? true : false,
  entities: [Match, Commentary],
});
