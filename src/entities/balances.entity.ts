import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, OneToMany, OneToOne, JoinColumn, ManyToOne } from "typeorm"
import { User } from "./user.entity"

@Entity()
export class Balances extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => User, (user) => user.defix_id)
  user!: User

  @Column({
    nullable: false
  })
  blockchain!: string

  @Column({
    nullable: false
  })
  coin!: string

  @Column({
    nullable: false,
    type: "float"
  })
  balance!: number
}