import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Trip } from './Trip';
import { Expense } from './Expense';
import { BudgetCategory } from '../types/enums';

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'trip_id' })
  tripId!: string;

  @Column({
    type: 'enum',
    enum: BudgetCategory,
  })
  category!: BudgetCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  spent!: number;

  @Column({ length: 3, default: 'USD' })
  currency!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Trip, (trip) => trip.budgets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' })
  trip!: Trip;

  @OneToMany(() => Expense, (expense) => expense.budget)
  expenses!: Expense[];
}
