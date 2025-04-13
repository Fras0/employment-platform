import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user";

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
}
