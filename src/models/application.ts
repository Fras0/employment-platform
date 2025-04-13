import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { Employee } from "./employee";

import { Job } from "./job";

@Entity({
  name: "APPLICATIONS",
})
export class Application extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "enum",
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  })
  status: "pending" | "accepted" | "rejected";

  @ManyToOne(() => Employee, (employee) => employee.applications)
  @JoinColumn({ name: "employeeId" })
  employee: Employee;

  @ManyToOne(() => Job, (job) => job.applications)
  @JoinColumn({ name: "jobId" })
  job: Job;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
