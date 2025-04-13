import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Employer } from "./employer";
import { Employee } from "./employee";
import Role from "../enums/role";

@Entity({
  name: "USERS",
})
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: "enum", enum: ["employee", "employer"] })
  role: Role;

  @Column({ type: "text", nullable: true })
  refreshToken: string | null;

  @OneToOne(() => Employee, (employee) => employee.user)
  employee: Employee;

  @OneToOne(() => Employer, (employer) => employer.user)
  employer: Employer;
}
