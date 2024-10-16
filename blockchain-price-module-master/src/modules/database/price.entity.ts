import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('price_update')
export class Price {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  network!: string;

  @Column()
  tokenName!: string;

  @Column()
  tokenAddress!: string;

  @Column()
  tokenSymbol!: string;

  @Column()
  tokenDecimals!: string;

  @Column('decimal', { precision: 20, scale: 10 })
  price!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
