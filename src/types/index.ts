// Core type definitions for TripWeaver

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;


export interface Trip {
  id: string;
  userId: string;
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  coverImage?: string;
  description?: string;
  collaborators: string[];
  createdAt: Date;
  updatedAt: Date;


export interface Destination {
  id: string;
  tripId: string;
  dayNumber: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  category: PlaceCategory;
  notes?: string;
  estimatedDuration?: number; // in minutes
  duration?: string; // display duration like '1h', '30min'
  cost?: number;
  photos?: string[];
  startTime?: string;
  endTime?: string;
  order: number;


export type PlaceCategory = 
  | 'restaurant'
  | 'attraction'
  | 'hotel'
  | 'shopping'
  | 'transport'
  | 'activity'
  | 'other';

export interface DayItinerary {
  tripId: string;
  dayNumber: number;
  date: Date;
  destinations: Destination[];
  totalDistance?: number;
  totalDuration?: number;
  notes?: string;


export interface Budget {
  id: string;
  tripId: string;
  category: BudgetCategory;
  amount: number;
  spent: number;
  currency: string;


export type BudgetCategory = 
  | 'accommodation'
  | 'food'
  | 'transportation'
  | 'activities'
  | 'shopping'
  | 'other';

export interface Expense {
  id: string;
  tripId: string;
  budgetId: string;
  category: BudgetCategory;
  amount: number;
  currency: string;
  description: string;
  date: Date;
  paidBy: string;
  splitType: 'even' | 'percentage' | 'exact' | 'shares';
  splitDetails: SplitDetail[];
  splitWith?: string[];


export interface SplitDetail {
  userId: string;
  amount: number;
  percentage?: number;
  shares?: number;


export interface Memory {
  id: string;
  tripId: string;
  userId: string;
  type: 'photo' | 'note' | 'video';
  content: string;
  caption?: string;
  location?: {
    latitude: number;
    longitude: number;
  ;
  createdAt: Date;


export interface Collaboration {
  tripId: string;
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  invitedAt: Date;
  acceptedAt?: Date;


export interface RouteInfo {
  distance: number;
  duration: number;
  polyline: string;
  steps: RouteStep[];


export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;

