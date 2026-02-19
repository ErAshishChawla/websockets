import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  RelationId,
} from "typeorm";
import { Match } from "./Match";

@Entity("commentaries")
export class Commentary {
  @PrimaryGeneratedColumn()
  id: number;

  @RelationId((commentary: Commentary) => commentary.match)
  matchId: number;

  @Column({
    nullable: true,
    type: "int",
  })
  minute: number | null;

  @Column({
    nullable: true,
    type: "int",
  })
  sequence: number | null;

  @Column({
    nullable: true,
    type: "text",
  })
  period: string | null;

  @Column({
    nullable: true,
    type: "text",
    name: "event_type",
  })
  eventType: string | null;

  @Column({
    nullable: true,
    type: "text",
  })
  actor: string | null;

  @Column({
    nullable: true,
    type: "text",
  })
  team: string | null;

  @Column({
    type: "text",
  })
  message: string;

  @Column({
    nullable: true,
    type: "jsonb",
  })
  metadata: Record<string, unknown> | null;

  @Column({
    nullable: false,
    default: () => "ARRAY[]::text[]",
    type: "text",
    array: true,
  })
  tags: string[];

  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamptz",
  })
  updatedAt: Date;

  @ManyToOne(() => Match, (match) => match.commentaries, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn({
    name: "match_id",
  })
  match: Match;
}
