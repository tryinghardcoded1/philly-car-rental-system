/**
 * SPDX-License-Identifier: Apache-2.0
 */

export type VehicleStatus = 'Available' | 'Rented' | 'Maintenance' | 'Hold' | 'Relocating';

export interface Vehicle {
  id: string;
  model: string;
  licensePlate: string;
  vehicleClass: 'Economic Manual' | 'Economic Automatic' | 'Premium' | 'SUV' | 'Luxury';
  status: VehicleStatus;
  mileage: number; // in km
  fuelLevel: number; // percentage
  engineTemp: number; // Celsius
  obdStatus: 'Healthy' | 'Warning' | 'Error';
  lastLocation: { lat: number; lng: number; address: string };
  telemetryStream: { time: string; speed: number; rpm: number }[];
  nextMaintenanceDate: string;
  preventativeNotes: string[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  driverLicense: string;
  licenseExpiry: string;
  licenseCountry: string;
  totalPaid: number;
  totalDurationDays: number;
}

export type ReservationStatus = 'Pending' | 'Confirmed' | 'Checked Out' | 'Checked In' | 'Canceled' | 'Relocating' | 'Open' | 'Quote';

export interface Reservation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation?: string;
  vehicleClass: string;
  assignedVehicleId?: string; // Links to Vehicle.id
  totalPrice: number;
  totalRevenue: number;
  totalPaid: number;
  totalRefunded: number;
  outstandingBalance: number;
  status: ReservationStatus;
  digitalAgreementSigned: boolean;
  signatureData?: string; // base64 preview or string
  notes?: string;
  contractType: 'Short-Term' | 'Long-Term';
}

export interface ReservationAttempt {
  id: string;
  email: string;
  phone: string;
  pickupLocation: string;
  returnLocation: string;
  pickupDate: string;
  returnDate: string;
  contactStatus: 'Contacted' | 'Not Contacted' | 'In Progress';
  reservationType: string;
  branch: string;
  totalAvailableVehicles: number;
  vehicleClass: string;
  lastStep: number; // Step 1-4
  dateAttempted: string;
}

export interface Quote {
  id: string;
  reservationType: string;
  customerName: string;
  customerEmail: string;
  pickupDate: string;
  returnDate: string;
  vehicleClass: string;
  commissionPartner?: string;
  clientPaysAtPartner?: boolean;
  rackPrice: number;
  totalPrice: number;
  status: 'Open' | 'Approved' | 'Expired';
  tags: string[];
  discounts: number;
  comments?: string;
}

export interface Payment {
  id: string;
  reservationId: string;
  customerName: string;
  paymentType: 'Payment' | 'Deposit' | 'Refund' | 'Fine Payment';
  paymentMethod: 'Swipe' | 'cash' | 'Maestro' | 'Bank Transfer' | 'Credit Card';
  date: string;
  amount: number;
  reference: string;
  paymentStatus: 'Approved' | 'Pending' | 'Failed';
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  vehicleClass: string;
  totalPrice: number;
  totalRevenue: number;
}

export interface Fine {
  id: string;
  fineNumber: string;
  fineType: 'Speeding' | 'Red Light' | 'Parking' | 'Toll Violation' | 'Overdue Return';
  vehicleLicensePlate: string;
  customerName: string;
  dateOfFine: string;
  dateTimeOfOffense: string;
  amount: number;
  paidToAuthority: 'Yes' | 'No' | 'In Process';
  notes?: string;
}

export interface ClaimsAdjuster {
  name: string;
  company: string;
  email: string;
  phone: string;
}

export interface InsuranceClaim {
  id: string;
  claimNumber: string;
  vehicleId: string;
  vehicleModel: string;
  vehicleLicensePlate: string;
  reservationId: string;
  customerName: string;
  incidentDate: string;
  reportedDate: string;
  description: string;
  estimatedDamageAmount: number;
  claimResolutionStatus: 'Pending Adjuster' | 'Under Investigation' | 'Approved' | 'Settled' | 'Rejected';
  adjusterInfo: ClaimsAdjuster;
  photoEvidenceUrls: string[]; // Mock links or base64 data
  communications: { date: string; sender: string; message: string }[];
}

export interface RateItem {
  id: string;
  vehicleClass: string;
  baseDailyRate: number;
  weekendRate: number;
  seasonalMonthlyRate: number; // for long term contracts spanning May to March
  multiplier: number;
}
