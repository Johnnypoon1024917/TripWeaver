import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Trip } from './Trip';
import { PlaceCategory } from '../types/enums';

@Entity('destinations')
export class Destination {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'trip_id' })
  tripId!: string;

  @Column({ name: 'day_number', type: 'int' })
  dayNumber!: number;

  @Column()
  name!: string;

  @Column()
  address!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude!: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude!: number;

  @Column({ name: 'place_id', nullable: true })
  placeId?: string;

  @Column({
    type: 'enum',
    enum: PlaceCategory,
    default: PlaceCategory.ATTRACTION,
  })
  category!: PlaceCategory;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'estimated_duration', type: 'int', nullable: true })
  estimatedDuration?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost?: number;

  @Column('simple-array', { nullable: true })
  photos?: string[];

  @Column({ name: 'start_time', nullable: true })
  startTime?: string;

  @Column({ name: 'end_time', nullable: true })
  endTime?: string;

  @Column({ type: 'int', default: 0 })
  order!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Trip, (trip) => trip.destinations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trip_id' })
  trip!: Trip;
}
