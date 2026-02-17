import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { MatchStatus } from "@repo/contracts";
import { Commentary } from "./Commentary.js";

@Entity("matches")
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sport: string;

  @Column({
    name: "home_team",
  })
  homeTeam: string;

  @Column({
    name: "away_team",
  })
  awayTeam: string;

  @Column({
    name: "start_time",
    type: "timestamptz",
  })
  startTime: Date;

  @Column({
    enum: MatchStatus,
    type: "enum",
  })
  status: MatchStatus;

  @Column({
    name: "home_score",
    default: 0,
  })
  homeScore: number;

  @Column({
    name: "away_score",
    default: 0,
  })
  awayScore: number;

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updatedAt: Date;

  @OneToMany(() => Commentary, (commentary) => commentary.match)
  commentaries: Commentary[];
}
