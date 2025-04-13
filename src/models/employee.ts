import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user";
import { Language } from "./programming-languages";
import { Application } from "./application";

@Entity({
  name: "EMPLOYEES",
})
export class Employee extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nationalId: string;

  @Column({ unique: true })
  name: string;

  @Column()
  city: string;

  @Column()
  bio: string;

  @Column({ type: "enum", enum: ["junior", "mid", "senior"] })
  experienceLevel: "junior" | "mid" | "senior";

  @OneToOne(() => User, (user) => user.employee)
  @JoinColumn()
  user: User;

  @OneToMany(() => Application, (application) => application.employee)
  applications: Application[];

  @ManyToMany(() => Language, (language) => language.employees, { eager: true })
  @JoinTable()
  languages: Language[];
}
