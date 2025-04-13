import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  BaseEntity,
} from "typeorm";
import { User } from "./user";

@Entity({
  name: "PROFILE_VIEWS",
})
export class ProfileView extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  viewer: User;

  @ManyToOne(() => User, { eager: true })
  viewed: User;

  @CreateDateColumn()
  viewedAt: Date;
}
