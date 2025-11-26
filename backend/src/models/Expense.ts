import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Trip } from './Trip';
import { Budget } from './Budget';
import { BudgetCategory } from '../types/enums';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'trip_id' })
  tripId!: string;

  @Column({ name: 'budget_id' })
  budgetId!: string;

  @Column()
  category!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ length: 3, default: 'USD' })
  currency!: string;

  @Column()
  description!: string;

  @Column({ type: 'date' })
  date!: Date;

  @Column({ name: 'paid_by' })
  paidBy!: string;

  @Column('simple-array', { name: 'split_with', nullable: true })
  splitWith?: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' })
  trip!: Trip;

  @ManyToOne(() => Budget, (budget) => budget.expenses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'budget_id' })
  budget!: Budget;
}
