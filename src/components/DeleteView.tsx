/**
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { 
  Trash2, 
  Search, 
  AlertOctagon, 
  RefreshCw, 
  CheckCircle2, 
  ShieldAlert, 
  Filter,
  UserX,
  Car,
  FileText,
  Scale
} from 'lucide-react';
import { Reservation, Vehicle, Customer, Fine } from '../types';

interface DeleteViewProps {
  reservations: Reservation[];
  vehicles: Vehicle[];
  customers: Customer[];
  fines: Fine[];
  onDeleteReservation: (id: string) => void;
  onDeleteVehicle: (id: string) => void;
  onDeleteCustomer: (id: string) => void;
  onDeleteFine: (id: string) => void;
  onResetDatabase: () => void;
}

type DeleteSchemaType = 'reservations' | 'vehicles' | 'customers' | 'fines';

export default function DeleteView({
  reservations,
  vehicles,
  customers,
  fines,
  onDeleteReservation,
  onDeleteVehicle,
  onDeleteCustomer,
  onDeleteFine,
  onResetDatabase
}: DeleteViewProps) {
  const [activeSchema, setActiveSchema] = useState<DeleteSchemaType>('reservations');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [factoryResetConfirm, setFactoryResetConfirm] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const getRecordList = (): any[] => {
    switch (activeSchema) {
      case 'reservations': return reservations;
      case 'vehicles': return vehicles;
      case 'customers': return customers;
      case 'fines': return fines;
    }
  };

  const getPrimaryHeader = (rec: any) => {
    switch (activeSchema) {
      case 'reservations': return rec.customerName;
      case 'vehicles': return `${rec.make} ${rec.model} (${rec.year})`;
      case 'customers': return rec.name;
      case 'fines': return rec.violationBrief;
    }
  };

  const getSecondaryHeader = (rec: any) => {
    switch (activeSchema) {
      case 'reservations': return rec.customerEmail;
      case 'vehicles': return rec.licensePlate;
      case 'customers': return rec.email;
      case 'fines': return rec.licensePlate;
    }
  };

  const getTertiaryHeader = (rec: any) => {
    switch (activeSchema) {
      case 'reservations': return `ID: ${rec.id} • ${rec.vehicleClass}`;
      case 'vehicles': return `Plate: ${rec.licensePlate} • ID: ${rec.id}`;
      case 'customers': return `ID: ${rec.id} • Tier: ${rec.loyaltyTier}`;
      case 'fines': return `ID: ${rec.id} • ${rec.fineAuthority}`;
    }
  };

  const filteredRecords = getRecordList().filter(rec => {
    const stringData = JSON.stringify(rec).toLowerCase();
    return stringData.includes(searchTerm.toLowerCase());
  });

  const triggerRecordDelete = (id: string) => {
    setSelectedRecordId(id);
    setShowConfirmModal(true);
  };

  const handleExecuteDelete = () => {
    if (!selectedRecordId) return;

    switch (activeSchema) {
      case 'reservations':
        onDeleteReservation(selectedRecordId);
        break;
      case 'vehicles':
        onDeleteVehicle(selectedRecordId);
        break;
      case 'customers':
        onDeleteCustomer(selectedRecordId);
        break;
      case 'fines':
        onDeleteFine(selectedRecordId);
        break;
    }

    const deletedId = selectedRecordId;
    setSelectedRecordId(null);
    setShowConfirmModal(false);
    setActionSuccessMessage(`Successfully deleted record ${deletedId} from the Live Database state.`);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const handleExecuteFullReset = () => {
    onResetDatabase();
    setFactoryResetConfirm(false);
    setActionSuccessMessage("The Live Operational Database has successfully been reset back to pre-seeded Philly Hub defaults.");
    setTimeout(() => setActionSuccessMessage(null), 5000);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title block */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600 animate-pulse" />
            <span>Database Admin Rules & Record Deletion Center</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Maintain database health by selectively purging incorrect reservation entries, fleet vehicles, out-of-date clients, or erroneous fines.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFactoryResetConfirm(true)}
          className="bg-slate-100 hover:bg-red-50 border border-slate-220 hover:border-red-200 hover:text-red-700 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs self-start md:self-auto shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Wipe & Reset Default Demo Database</span>
        </button>
      </div>

      {actionSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-250/85 rounded-xl flex items-start gap-3 select-none">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-emerald-800 leading-normal">{actionSuccessMessage}</p>
        </div>
      )}

      {/* Database Schema Select tabs */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold shrink-0 select-none">
            {(['reservations', 'vehicles', 'customers', 'fines'] as DeleteSchemaType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveSchema(tab);
                  setSearchTerm('');
                }}
                className={`px-3 py-1.5 rounded transition capitalize cursor-pointer flex items-center gap-1.5 ${
                  activeSchema === tab
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'reservations' && <FileText className="w-3.5 h-3.5 text-blue-500" />}
                {tab === 'vehicles' && <Car className="w-3.5 h-3.5 text-emerald-500" />}
                {tab === 'customers' && <UserX className="w-3.5 h-3.5 text-amber-500" />}
                {tab === 'fines' && <Scale className="w-3.5 h-3.5 text-red-500" />}
                <span className="capitalize">{tab}</span>
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full self-start sm:self-auto">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search target ${activeSchema}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-220 pl-9 pr-4 py-1.5 rounded-lg text-xs focus:outline-none focus:border-red-400 text-slate-700"
            />
          </div>

        </div>

        {/* Database List */}
        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {filteredRecords.length === 0 ? (
            <div className="p-16 text-center select-none space-y-2">
              <span className="text-3xl text-slate-300 block">🔍</span>
              <p className="text-sm font-bold text-slate-700">No matching records found</p>
              <p className="text-xs text-slate-400">Try modifying your query descriptor to identify the entries.</p>
            </div>
          ) : (
            filteredRecords.map((rec) => (
              <div key={rec.id} className="p-4 hover:bg-slate-50/40 transition flex items-center justify-between gap-4 select-none">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 truncate">{getPrimaryHeader(rec)}</span>
                    <span className="text-[10px] bg-slate-100 font-mono font-bold text-slate-500 px-1.5 py-0.5 rounded border">
                      {rec.id}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 text-[11px] text-slate-400 font-sans mt-1">
                    <span className="truncate">{getSecondaryHeader(rec)}</span>
                    <span className="hidden sm:inline text-slate-200">•</span>
                    <span className="font-medium text-slate-500">{getTertiaryHeader(rec)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => triggerRecordDelete(rec.id)}
                  className="p-2 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition shrink-0 cursor-pointer"
                  title="Purge record"
                >
                  <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500 transition" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50/70 text-right text-[11px] font-mono text-slate-405 border-t border-slate-100 select-none">
          Live Loaded Count: {filteredRecords.length} / {getRecordList().length} registers
        </div>
      </div>

      {/* Individual record delete confirmation modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border rounded-2xl p-6 max-w-sm w-full shadow-2xl select-none animate-in fade-in zoom-in-95 duration-200">
            <div className="flex gap-3 text-red-600">
              <ShieldAlert className="w-10 h-10 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Confirm Record Purge</h3>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Are you absolutely certain you want to permanently delete record <strong>{selectedRecordId}</strong> from the Live database? This action is irreversible.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setSelectedRecordId(null);
                  setShowConfirmModal(false);
                }}
                className="px-3.5 py-1.5 border hover:bg-slate-50 text-slate-500 text-xs font-bold rounded-lg cursor-pointer transition"
              >
                Keep Record
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer transition shadow-sm"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wipe Database Modal */}
      {factoryResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl select-none animate-in fade-in zoom-in-95 duration-200">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center shrink-0">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Authorize Full Sandbox Re-Seeding</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  You are about to WIPE all runtime modifications (including imported rows, manual reservations, custom vehicles, or claims registrations) and restore the system to Philly NW Regional defaults.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setFactoryResetConfirm(false)}
                className="px-3.5 py-2 border hover:bg-slate-50 text-slate-500 text-xs font-bold rounded-lg cursor-pointer transition"
              >
                Cancel Purge
              </button>
              <button
                type="button"
                onClick={handleExecuteFullReset}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer transition shadow-sm flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Execute Complete Sandbox Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
