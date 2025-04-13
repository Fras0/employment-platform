import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Employee } from "./employee";
import { Employer } from "./employer";
import { Language } from "./programming-languages";
import { Application } from "./application";

@Entity({
  name: "JOBS",
})
export class Job extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  city: string;

  @Column({ type: "enum", enum: ["junior", "mid", "senior"] })
  experienceLevel: "junior" | "mid" | "senior";

  @OneToMany(() => Application, (application) => application.job)
  applications: Application[];

  @ManyToOne(() => Employer, (employer) => employer.jobs)
  @JoinColumn({ name: "employerId" })
  employer: Employer;

  @ManyToMany(() => Employee, (employee) => employee.languages)
  employees: Employee[];

  @ManyToMany(() => Language, (language) => language.jobs, {
    eager: true,
  })
  @JoinTable()
  languages: Language[];
}
