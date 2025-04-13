import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user";
import { Job } from "./job";

@Entity({
  name: "EMPLOYERS",
})
export class Employer extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  companyName: string;

  @OneToOne(() => User, (user) => user.employer)
  @JoinColumn()
  user: User;

  @OneToMany(() => Job, (job) => job.employer)
  jobs: Job[];
}
