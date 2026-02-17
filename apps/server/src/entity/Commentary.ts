import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
} from "typeorm";
import { Match } from "./Match.js";

@Entity("commentaries")
export class Commentary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  actor: string;

  @Column()
  message: string;

  @Column({
    type: "timestamptz",
  })
  minute: Date;

  @Column({
    name: "sequence_no",
  })
  sequenceNo: number;

  @Column({
    type: "jsonb",
  })
  metadata: Record<string, unknown>;

  @ManyToOne(() => Match, (match) => match.commentaries, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "match_id",
  })
  match: Match;
}
