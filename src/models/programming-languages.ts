import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Employee } from "./employee";
import { Job } from "./job";

@Entity({
  name: "LANGUAGES",
})
export class Language extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Employee, (employee) => employee.languages)
  employees: Employee[];

  @ManyToMany(() => Job, (job) => job.languages)
  jobs: Job[];
}
