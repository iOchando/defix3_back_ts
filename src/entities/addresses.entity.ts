import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, OneToOne, JoinColumn, OneToMany, ManyToOne } from "typeorm"
import { User } from "./user.entity"

@Entity({name: "addresses"})
export class Address extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => User, (user) => user.defix_id)
  user!: User

  @Column({
    nullable: false
  })
  name!: string

  @Column({
    nullable: false
  })
  address!: string
}