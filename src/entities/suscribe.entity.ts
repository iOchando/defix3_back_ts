import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class Suscribe extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({
    nullable: false
  })
  email!: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}