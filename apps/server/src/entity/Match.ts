import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { MatchStatus } from "@repo/contracts";
import { Commentary } from "./Commentary";

@Entity("matches")
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "text",
  })
  sport: string;

  @Column({
    type: "text",
    name: "home_team",
  })
  homeTeam: string;

  @Column({
    type: "text",
    name: "away_team",
  })
  awayTeam: string;

  @Column({
    name: "start_time",
    type: "timestamptz",
    nullable: true,
  })
  startTime: Date | null;

  @Column({
    name: "end_time",
    type: "timestamptz",
    nullable: true,
  })
  endTime: Date | null;

  @Column({
    enum: MatchStatus,
    type: "enum",
    default: MatchStatus.Scheduled,
  })
  status: MatchStatus;

  @Column({
    name: "home_score",
    default: 0,
    type: "int",
  })
  homeScore: number;

  @Column({
    name: "away_score",
    default: 0,
    type: "int",
  })
  awayScore: number;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamptz",
    name: "updated_at",
  })
  updatedAt: Date;

  @OneToMany(() => Commentary, (commentary) => commentary.match)
  commentaries: Commentary[];
}
