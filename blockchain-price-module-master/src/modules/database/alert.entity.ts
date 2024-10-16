import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_alert')
export class Alert {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  chain!: string;

  @Column()
  dollar!: number;

  @Column()
  email!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
