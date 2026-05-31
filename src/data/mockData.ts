/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vehicle, Customer, Reservation, ReservationAttempt, Quote, Payment, Fine, InsuranceClaim, RateItem } from '../types';

export const INITIAL_VEHICLES: Vehicle[] = [];

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_RESERVATIONS: Reservation[] = [];

export const INITIAL_ATTEMPTS: ReservationAttempt[] = [];

export const INITIAL_QUOTES: Quote[] = [];

export const INITIAL_PAYMENTS: Payment[] = [];

export const INITIAL_FINES: Fine[] = [];

export const INITIAL_CLAIMS: InsuranceClaim[] = [];

export const INITIAL_RATES: RateItem[] = [
  { id: 'R1', vehicleClass: 'Economic Manual', baseDailyRate: 45.00, weekendRate: 50.00, seasonalMonthlyRate: 980.00, multiplier: 1.0 },
  { id: 'R2', vehicleClass: 'Economic Automatic', baseDailyRate: 55.00, weekendRate: 65.00, seasonalMonthlyRate: 1100.00, multiplier: 1.15 },
  { id: 'R3', vehicleClass: 'Premium', baseDailyRate: 90.00, weekendRate: 110.00, seasonalMonthlyRate: 1950.00, multiplier: 1.5 },
  { id: 'R4', vehicleClass: 'SUV', baseDailyRate: 110.00, weekendRate: 130.00, seasonalMonthlyRate: 2400.00, multiplier: 1.8 },
  { id: 'R5', vehicleClass: 'Luxury', baseDailyRate: 180.00, weekendRate: 220.00, seasonalMonthlyRate: 4100.00, multiplier: 2.5 }
];
