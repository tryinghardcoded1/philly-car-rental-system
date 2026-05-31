/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ReservationsView from './components/ReservationsView';
import ReservationAttemptsView from './components/ReservationAttemptsView';
import QuotesView from './components/QuotesView';
import PaymentsView from './components/PaymentsView';
import FinesView from './components/FinesView';
import FleetView from './components/FleetView';
import ClaimsView from './components/ClaimsView';
import RatesView from './components/RatesView';
import BookingSimulator from './components/BookingSimulator';
import CustomerView from './components/CustomerView';
import FilesView from './components/FilesView';
import ExternalChargesView from './components/ExternalChargesView';
import CalendarView from './components/CalendarView';
import CommissionPartnersView from './components/CommissionPartnersView';
import CommissionsView from './components/CommissionsView';
import TelematicsView from './components/TelematicsView';
import MaintenanceView from './components/MaintenanceView';
import RepairOrdersView from './components/RepairOrdersView';
import ImportView from './components/ImportView';
import ExportView from './components/ExportView';
import DeleteView from './components/DeleteView';
import ImportModal from './components/ImportModal';
import LoginView from './components/LoginView';
import { UploadCloud } from 'lucide-react';

import { 
  INITIAL_VEHICLES, 
  INITIAL_CUSTOMERS, 
  INITIAL_RESERVATIONS, 
  INITIAL_ATTEMPTS, 
  INITIAL_QUOTES, 
  INITIAL_PAYMENTS, 
  INITIAL_FINES, 
  INITIAL_CLAIMS, 
  INITIAL_RATES 
} from './data/mockData';

import { 
  Vehicle, 
  Customer, 
  Reservation, 
  ReservationAttempt, 
  Quote, 
  Payment, 
  Fine, 
  InsuranceClaim, 
  RateItem 
} from './types';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('pcr_is_logged_in') === 'true');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Global Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSchema, setImportSchema] = useState<'reservations' | 'vehicles' | 'customers' | 'fines'>('reservations');

  // Core global data tables state
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [attempts, setAttempts] = useState<ReservationAttempt[]>(INITIAL_ATTEMPTS);
  const [quotes, setQuotes] = useState<Quote[]>(INITIAL_QUOTES);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [fines, setFines] = useState<Fine[]>(INITIAL_FINES);
  const [claims, setClaims] = useState<InsuranceClaim[]>(INITIAL_CLAIMS);
  const [rates, setRates] = useState<RateItem[]>(INITIAL_RATES);

  // Bulk Deletions
  const handleDeleteReservations = (ids: string[]) => {
    setReservations(prev => prev.filter(r => !ids.includes(r.id)));
  };

  const handleDeleteAttempts = (ids: string[]) => {
    setAttempts(prev => prev.filter(a => !ids.includes(a.id)));
  };

  const handleDeleteQuotes = (ids: string[]) => {
    setQuotes(prev => prev.filter(q => !ids.includes(q.id)));
  };

  const handleDeletePayments = (ids: string[]) => {
    setPayments(prev => prev.filter(p => !ids.includes(p.id)));
  };

  const handleDeleteFines = (ids: string[]) => {
    setFines(prev => prev.filter(f => !ids.includes(f.id)));
  };

  const handleDeleteVehicles = (ids: string[]) => {
    setVehicles(prev => prev.filter(v => !ids.includes(v.id)));
  };

  const handleDeleteClaims = (ids: string[]) => {
    setClaims(prev => prev.filter(c => !ids.includes(c.id)));
  };

  const handleDeleteRates = (ids: string[]) => {
    setRates(prev => prev.filter(r => !ids.includes(r.id)));
  };

  const handleDeleteCustomers = (ids: string[]) => {
    setCustomers(prev => prev.filter(c => !ids.includes(c.id)));
  };

  // Mutators and Callback handlers

  // Vehicles
  const handleAddVehicle = (newV: Vehicle) => {
    setVehicles(prev => [newV, ...prev]);
  };

  const handleUpdateVehicle = (updatedV: Vehicle) => {
    setVehicles(prev => prev.map(v => v.id === updatedV.id ? updatedV : v));
  };

  // Customers
  const handleAddCustomer = (newC: Customer) => {
    setCustomers(prev => [newC, ...prev]);
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdateCustomer = (updatedC: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedC.id ? updatedC : c));
  };

  // Reservations
  const handleAddReservation = (newR: Reservation) => {
    setReservations(prev => [newR, ...prev]);
  };

  const handleUpdateReservation = (updatedR: Reservation) => {
    setReservations(prev => prev.map(r => r.id === updatedR.id ? updatedR : r));
  };

  const handleUpdateReservationStatus = (id: string, newStatus: any) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const handleDeleteReservation = (id: string) => {
    setReservations(prev => prev.filter(r => r.id !== id));
  };

  // Reservation Attempts Recovery Action
  const handleUpdateAttemptStatus = (id: string, nextStatus: 'Contacted' | 'In Progress') => {
    setAttempts(prev => prev.map(att => att.id === id ? { ...att, contactStatus: nextStatus } : att));
  };

  const handleConvertAttemptToReservation = (attempt: ReservationAttempt) => {
    // Computes matching pricing
    const matchingRate = rates.find(r => r.vehicleClass === attempt.vehicleClass) || rates[0];
    const computedTotal = matchingRate.baseDailyRate * 5 * matchingRate.multiplier; // default 5 days placeholder conversion

    const convertedRes: Reservation = {
      id: Math.floor(100 + Math.random() * 900).toString(),
      customerName: 'Recovered Lead (' + attempt.id + ')',
      customerEmail: attempt.email || 'recovered@phillycarrental.com',
      customerPhone: attempt.phone,
      pickupDate: attempt.pickupDate,
      returnDate: attempt.returnDate,
      pickupLocation: attempt.pickupLocation,
      vehicleClass: attempt.vehicleClass === 'Vehicle class not set' ? 'Premium' : attempt.vehicleClass,
      totalPrice: computedTotal,
      totalRevenue: computedTotal * 0.95,
      totalPaid: 0,
      totalRefunded: 0,
      outstandingBalance: computedTotal,
      status: 'Open',
      digitalAgreementSigned: false,
      contractType: 'Short-Term'
    };

    setReservations(prev => [convertedRes, ...prev]);
    setActiveTab('reservations');
  };

  // Quotes
  const handleAddQuote = (newQ: Quote) => {
    setQuotes(prev => [newQ, ...prev]);
  };

  const handleDeleteQuote = (id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
  };

  const handleApproveQuote = (id: string) => {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: 'Approved' } : q));
    const matchedQ = quotes.find(q => q.id === id);
    if (matchedQ) {
      // automatically generate corresponding reservation
      const linkedRes: Reservation = {
        id: Math.floor(100 + Math.random() * 900).toString(),
        customerName: matchedQ.customerName,
        customerEmail: matchedQ.customerEmail,
        pickupDate: matchedQ.pickupDate,
        returnDate: matchedQ.returnDate,
        pickupLocation: 'Office',
        vehicleClass: matchedQ.vehicleClass,
        totalPrice: matchedQ.totalPrice,
        totalRevenue: matchedQ.totalPrice * 0.95,
        totalPaid: 0,
        totalRefunded: 0,
        outstandingBalance: matchedQ.totalPrice,
        status: 'Open',
        digitalAgreementSigned: false,
        contractType: 'Short-Term'
      };
      setReservations(prev => [linkedRes, ...prev]);
    }
  };

  // Payments
  const handleAddPayment = (newP: Payment) => {
    setPayments(prev => [newP, ...prev]);

    // Simulates payment allocation to reservation balances
    setReservations(prev => prev.map(res => {
      if (res.id === newP.reservationId) {
        const nextPaid = res.totalPaid + newP.amount;
        const nextOustanding = Math.max(0, res.totalPrice - nextPaid);
        return {
          ...res,
          totalPaid: nextPaid,
          outstandingBalance: nextOustanding
        };
      }
      return res;
    }));
  };

  // Fines
  const handleAddFine = (newF: Fine) => {
    setFines(prev => [newF, ...prev]);
  };

  const handleUpdateFinePaidStatus = (id: string, status: 'Yes' | 'No' | 'In Process') => {
    setFines(prev => prev.map(f => f.id === id ? { ...f, paidToAuthority: status } : f));
  };

  const handleDeleteFine = (id: string) => {
    setFines(prev => prev.filter(f => f.id !== id));
  };

  // Claims
  const handleAddClaim = (newC: InsuranceClaim) => {
    setClaims(prev => [newC, ...prev]);
  };

  const handleUpdateClaim = (updatedC: InsuranceClaim) => {
    setClaims(prev => prev.map(c => c.id === updatedC.id ? updatedC : c));
  };

  // Vehicles Deletion Support
  const handleDeleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  // Database Sandbox Reset Support
  const handleResetDatabase = () => {
    setVehicles(INITIAL_VEHICLES);
    setCustomers(INITIAL_CUSTOMERS);
    setReservations(INITIAL_RESERVATIONS);
    setAttempts(INITIAL_ATTEMPTS);
    setQuotes(INITIAL_QUOTES);
    setPayments(INITIAL_PAYMENTS);
    setFines(INITIAL_FINES);
    setClaims(INITIAL_CLAIMS);
  };

  // Bulk Import Ingestion Helpers
  const handleImportReservations = (newRes: Reservation[]) => {
    setReservations(prev => [...newRes, ...prev]);
  };

  const handleImportVehicles = (newVeh: Vehicle[]) => {
    setVehicles(prev => [...newVeh, ...prev]);
  };

  const handleImportCustomers = (newCust: Customer[]) => {
    setCustomers(prev => [...newCust, ...prev]);
  };

  const handleImportFines = (newFines: Fine[]) => {
    setFines(prev => [...newFines, ...prev]);
  };

  // Rendering current Tab component
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            vehicles={vehicles} 
            customers={customers}
            reservations={reservations} 
            claims={claims}
            finesCount={fines.length}
          />
        );
      case 'reservations':
        return (
          <ReservationsView 
            reservations={reservations} 
            vehicles={vehicles} 
            onAddReservation={handleAddReservation}
            onUpdateStatus={handleUpdateReservationStatus}
            onDeleteReservation={handleDeleteReservation}
            onDeleteReservations={handleDeleteReservations}
            onTriggerImport={() => {
              setImportSchema('reservations');
              setIsImportModalOpen(true);
            }}
          />
        );
      case 'attempts':
        return (
          <ReservationAttemptsView 
            attempts={attempts} 
            onConvertToReservation={handleConvertAttemptToReservation}
            onUpdateStatus={handleUpdateAttemptStatus}
            onDeleteAttempts={handleDeleteAttempts}
          />
        );
      case 'quotes':
        return (
          <QuotesView 
            quotes={quotes}
            onAddQuote={handleAddQuote}
            onDeleteQuote={handleDeleteQuote}
            onDeleteQuotes={handleDeleteQuotes}
            onApproveQuote={handleApproveQuote}
          />
        );
      case 'payments':
        return (
          <PaymentsView 
            payments={payments} 
            reservations={reservations}
            onAddPayment={handleAddPayment}
            onDeletePayments={handleDeletePayments}
          />
        );
      case 'fines':
        return (
          <FinesView 
            fines={fines} 
            vehicles={vehicles}
            customers={customers}
            onAddFine={handleAddFine}
            onUpdatePaidStatus={handleUpdateFinePaidStatus}
            onDeleteFine={handleDeleteFine}
            onDeleteFines={handleDeleteFines}
            onTriggerImport={() => {
              setImportSchema('fines');
              setIsImportModalOpen(true);
            }}
          />
        );
      case 'fleet':
        return (
          <FleetView 
            vehicles={vehicles} 
            onAddVehicle={handleAddVehicle}
            onUpdateVehicle={handleUpdateVehicle}
            onTriggerImport={() => {
              setImportSchema('vehicles');
              setIsImportModalOpen(true);
            }}
          />
        );
      case 'claims':
        return (
          <ClaimsView 
            claims={claims} 
            vehicles={vehicles}
            reservations={reservations}
            onAddClaim={handleAddClaim}
            onUpdateClaim={handleUpdateClaim}
            onDeleteClaims={handleDeleteClaims}
          />
        );
      case 'rates':
        return (
          <RatesView 
            rates={rates} 
            onDeleteRates={handleDeleteRates}
          />
        );
      case 'booking':
        return (
          <BookingSimulator 
            rates={rates} 
            vehicles={vehicles}
            onAddReservation={handleAddReservation}
          />
        );
      case 'customers':
        return (
          <CustomerView 
            customers={customers}
            onAddCustomer={handleAddCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onDeleteCustomers={handleDeleteCustomers}
            onUpdateCustomer={handleUpdateCustomer}
            onTriggerImport={() => {
              setImportSchema('customers');
              setIsImportModalOpen(true);
            }}
          />
        );
      case 'external_charges':
        return (
          <ExternalChargesView />
        );
      case 'calendar':
        return (
          <CalendarView />
        );
      case 'commission_partners':
        return (
          <CommissionPartnersView />
        );
      case 'commissions':
        return (
          <CommissionsView />
        );
      case 'telematics':
        return (
          <TelematicsView />
        );
      case 'maintenance':
        return (
          <MaintenanceView />
        );
      case 'repair_orders':
        return (
          <RepairOrdersView />
        );
      case 'files':
        return (
          <FilesView />
        );
      case 'import_data':
        return (
          <ImportView 
            onImportReservations={handleImportReservations}
            onImportVehicles={handleImportVehicles}
            onImportCustomers={handleImportCustomers}
            onImportFines={handleImportFines}
          />
        );
      case 'export_data':
        return (
          <ExportView 
            reservations={reservations} 
            vehicles={vehicles}
            customers={customers}
            fines={fines}
            payments={payments}
          />
        );
      case 'delete_records':
        return (
          <DeleteView 
            reservations={reservations}
            vehicles={vehicles}
            customers={customers}
            fines={fines}
            onDeleteReservation={handleDeleteReservation}
            onDeleteVehicle={handleDeleteVehicle}
            onDeleteCustomer={handleDeleteCustomer}
            onDeleteFine={handleDeleteFine}
            onResetDatabase={handleResetDatabase}
          />
        );
      default:
        return (
          <div className="py-12 text-center text-slate-500 font-sans">
            Modular route not configured.
          </div>
        );
    }
  };

  if (!isLoggedIn) {
    return (
      <LoginView 
        onLoginSuccess={() => {
          localStorage.setItem('pcr_is_logged_in', 'true');
          setIsLoggedIn(true);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans overflow-hidden">
      
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed} 
      />

      {/* Primary operational panel container */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header styled with high visual fidelity like Design HTML */}
        <header className="h-16 bg-white border-b border-slate-200 shrink-0 flex items-center justify-between px-6 sm:px-8 shadow-xs">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-slate-800 font-sans tracking-tight">
              {
                activeTab === 'dashboard' ? 'Operational Overview' :
                activeTab === 'reservations' ? 'Reservations Ledger' :
                activeTab === 'attempts' ? 'Recoveries Desk' :
                activeTab === 'quotes' ? 'Quotes Register' :
                activeTab === 'payments' ? 'Billing & Payments' :
                activeTab === 'external_charges' ? 'External Surcharges & Tolls' :
                activeTab === 'calendar' ? 'Center City Dispatch Calendar' :
                activeTab === 'commissions' ? 'Acquisition Commission Ledger' :
                activeTab === 'commission_partners' ? 'Referral Commission Partners' :
                activeTab === 'telematics' ? 'Fleet OBD-II & GPS Telematics Terminal' :
                activeTab === 'fleet' ? 'Vehicles Ledger' :
                activeTab === 'maintenance' ? 'Preventative Maintenance Schedules' :
                activeTab === 'repair_orders' ? 'Active Mechanical Repair Orders' :
                activeTab === 'customers' ? 'Client CRM Analytics' :
                activeTab === 'booking' ? 'Enterprise Booking Desk' :
                activeTab === 'claims' ? 'Damage Claims Desk' :
                activeTab === 'files' ? 'Enterprise Files & CRM Attachments' :
                activeTab === 'fines' ? 'Regulatory Fines & Tolls' :
                activeTab === 'import_data' ? 'Enterprise Bulk Importer & Data Mapping' :
                activeTab === 'export_data' ? 'Enterprise Exporter & Datasets Backup Desk' :
                activeTab === 'delete_records' ? 'Live System Purges & Records Administration' :
                activeTab === 'rates' ? 'Dynamic Tariff Rates' : 'Operational Overview'
              }
            </h1>
            <span className="h-4 w-[1px] bg-slate-200 hidden sm:block" />
            <span className="text-[10px] font-mono font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 py-0.5 px-2.5 rounded-full flex items-center gap-1 hidden sm:flex">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Philly NW Hub • Active
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 rounded-md p-1 font-sans text-xs shrink-0 select-none">
              <button className="px-3 py-1 text-[11px] font-semibold bg-white shadow-xs rounded border border-slate-200 text-slate-800">
                Real-time
              </button>
              <button className="px-3 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-700 transition">
                History
              </button>
            </div>

            <button 
              onClick={() => {
                if (activeTab === 'reservations') {
                  setImportSchema('reservations');
                } else if (activeTab === 'fleet') {
                  setImportSchema('vehicles');
                } else if (activeTab === 'customers') {
                  setImportSchema('customers');
                } else if (activeTab === 'fines') {
                  setImportSchema('fines');
                } else {
                  setImportSchema('reservations');
                }
                setIsImportModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 font-sans font-semibold text-white text-xs rounded-lg transition shadow-xs cursor-pointer select-none"
              title="Bulk Import CSV/JSON from any page"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Import CSV</span>
            </button>
            
            <button className="p-2 text-slate-400 hover:text-slate-600 transition relative cursor-pointer" title="Alert Notifications">
              <span className="text-sm">🔔</span>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-550 rounded-full animate-pulse" />
            </button>

            <button 
              onClick={() => {
                localStorage.removeItem('pcr_is_logged_in');
                setIsLoggedIn(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans font-semibold text-xs rounded-lg transition border border-slate-200 cursor-pointer select-none"
              title="Logout session"
            >
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic content sandbox */}
        <div className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {renderTabContent()}
        </div>

      </main>

      {/* Persistent global data importer overlay */}
      <ImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        initialSchema={importSchema}
        onImportReservations={handleImportReservations}
        onImportVehicles={handleImportVehicles}
        onImportCustomers={handleImportCustomers}
        onImportFines={handleImportFines}
      />

    </div>
  );
}
