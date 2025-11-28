import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Trip } from '../models/Trip';
import { Destination } from '../models/Destination';
import { Budget } from '../models/Budget';
import { Expense } from '../models/Expense';
dotenv.config();
export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER || 'tripweaver',
    password: process.env.POSTGRES_PASSWORD || 'tripweaver_password',
    database: process.env.POSTGRES_DB || 'tripweaver',
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    entities: [User, Trip, Destination, Budget, Expense],
    migrations: ['src/migrations/**/*.ts'],
    subscribers: [],
});
