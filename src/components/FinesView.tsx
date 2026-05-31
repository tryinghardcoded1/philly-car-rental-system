/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Scale, 
  Search, 
  Plus, 
  AlertTriangle, 
  Check, 
  Clock, 
  Trash2,
  UploadCloud
} from 'lucide-react';
import { Fine, Vehicle, Customer } from '../types';

interface FinesViewProps {
  fines: Fine[];
  vehicles: Vehicle[];
  customers: Customer[];
  onAddFine: (f: Fine) => void;
  onUpdatePaidStatus: (id: string, status: 'Yes' | 'No' | 'In Process') => void;
  onDeleteFine: (id: string) => void;
  onTriggerImport?: () => void;
}

export default function FinesView({ 
  fines, 
  vehicles, 
  customers, 
  onAddFine, 
  onUpdatePaidStatus,
  onDeleteFine,
  onTriggerImport
}: FinesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [fineType, setFineType] = useState<'Speeding' | 'Red Light' | 'Parking' | 'Toll Violation' | 'Overdue Return'>('Speeding');
  const [vPlate, setVPlate] = useState('');
  const [custName, setCustName] = useState('');
  const [dateFine, setDateFine] = useState('2026-05-31');
  const [dateTimeOffense, setDateTimeOffense] = useState('2026-05-31 14:00');
  const [amount, setAmount] = useState('150.00');
  const [notes, setNotes] = useState('');

  const filteredFines = fines.filter(f => {
    const term = searchTerm.toLowerCase();
    return (
      f.fineNumber.toLowerCase().includes(term) ||
      f.fineType.toLowerCase().includes(term) ||
      f.vehicleLicensePlate.toLowerCase().includes(term) ||
      f.customerName.toLowerCase().includes(term)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vPlate || !custName) return;

    const newFineItem: Fine = {
      id: 'F' + (fines.length + 1).toString(),
      fineNumber: 'FN-' + (new Date().getFullYear()) + '-' + Math.floor(100 + Math.random() * 900),
      fineType: fineType,
      vehicleLicensePlate: vPlate,
      customerName: custName,
      dateOfFine: dateFine,
      dateTimeOfOffense: dateTimeOffense,
      amount: parseFloat(amount) || 0,
      paidToAuthority: 'No',
      notes: notes || undefined
    };

    onAddFine(newFineItem);
    setShowAddModal(false);
    setNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-red-600" />
            <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Fines & Toll Tracker</h1>
          </div>
          <p className="text-sm text-slate-500 font-sans mt-0.5">
            Monitor and resolve incoming traffic, municipal parking tickets, and toll bridge violation notices.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto select-none">
          {onTriggerImport && (
            <button 
              onClick={onTriggerImport}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-205 text-slate-705 px-3.5 py-2 text-xs font-sans font-semibold rounded-lg transition shadow-2xs cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-red-500" />
              <span>Import CSV</span>
            </button>
          )}
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-3.5 py-2 text-xs font-sans font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Traffic Fine</span>
          </button>
        </div>
      </div>

      {/* Live search filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Search fines docket by citation code, license plate, violation category or renter name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white pl-10 pr-4 py-2.5 text-sm font-sans rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
        </div>
      </div>

      {/* Table block matching screenshot 5 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50/75 text-slate-500 border-b border-slate-200 text-xs font-bold font-sans uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center">
                <input type="checkbox" className="rounded text-blue-500" />
              </th>
              <th className="py-3 px-3 w-16">#</th>
              <th className="py-3 px-4">Fine Number</th>
              <th className="py-3 px-4">Fine Type</th>
              <th className="py-3 px-4">Vehicle License Plate</th>
              <th className="py-3 px-4">Associated Renter</th>
              <th className="py-3 px-4">Date of Fine</th>
              <th className="py-3 px-4">Date & Time of Offense</th>
              <th className="py-3 px-4 text-right">Penalty Amt</th>
              <th className="py-3 px-4 text-center">Paid to Authority</th>
              <th className="py-3 px-4">Notes</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm font-sans divide-y divide-slate-100">
            {filteredFines.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-400 font-sans">
                  No active traffic or parking fines on record. Fleet is clear.
                </td>
              </tr>
            ) : (
              filteredFines.map((f, idx) => (
                <tr key={f.id} className="hover:bg-slate-50/50 transition duration-150">
                  <td className="py-3.5 px-4 text-center">
                    <input type="checkbox" className="rounded text-blue-500" />
                  </td>
                  <td className="py-3.5 px-3 font-mono text-xs text-slate-400 font-semibold">{idx + 1}</td>
                  <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-800">{f.fineNumber}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      f.fineType === 'Speeding' ? 'bg-red-50 text-red-700' :
                      f.fineType === 'Red Light' ? 'bg-orange-50 text-orange-700' :
                      f.fineType === 'Toll Violation' ? 'bg-blue-50 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      <AlertTriangle className="w-3 h-3 text-current shrink-0" />
                      {f.fineType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700">{f.vehicleLicensePlate}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{f.customerName}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{f.dateOfFine}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{f.dateTimeOfOffense}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">${f.amount.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-center">
                    <select
                      value={f.paidToAuthority}
                      onChange={(e) => onUpdatePaidStatus(f.id, e.target.value as any)}
                      className={`text-xs font-bold px-3 py-1 rounded-full border cursor-pointer focus:outline-none transition ${
                        f.paidToAuthority === 'Yes' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        f.paidToAuthority === 'In Process' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="In Process">In Process</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate" title={f.notes}>{f.notes || <span className="text-slate-300 italic">—</span>}</td>
                  <td className="py-3.5 px-4 text-center">
                    <button 
                      onClick={() => onDeleteFine(f.id)}
                      className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                      title="Clear citations"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Fine Adding modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold font-sans text-slate-900">Log Traffic Ticket / Penalty</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Violation Type</label>
                  <select 
                    value={fineType}
                    onChange={(e) => setFineType(e.target.value as any)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none"
                  >
                    <option value="Speeding">Speeding Radar Ticket</option>
                    <option value="Red Light">Red Light Camera</option>
                    <option value="Parking">Municipal Parking fine</option>
                    <option value="Toll Violation">EZPass Toll Violation</option>
                    <option value="Overdue Return">Contract Overdue Penalty</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Registered Plate</label>
                  <select 
                    value={vPlate}
                    onChange={(e) => setVPlate(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none"
                    required
                  >
                    <option value="">-- Choose Plate --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.licensePlate}>{v.licensePlate} ({v.model})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Associated Customer Renter</label>
                <select 
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none"
                  required
                >
                  <option value="">-- Associate Customer Profile --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.driverLicense})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Slip Issue Date</label>
                  <input 
                    type="date"
                    value={dateFine}
                    onChange={(e) => setDateFine(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Penalty Charge Size ($)</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Exact Time of Offense</label>
                <input 
                  type="text"
                  placeholder="e.g. 2026-05-31 14:30"
                  value={dateTimeOffense}
                  onChange={(e) => setDateTimeOffense(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Offense details / citation code</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Captured by camera on I-95 south at Marker 14.5"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none"
                />
              </div>

              <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>Notice: Creating a fine will automatically log a notification under CRM customer logs for automatic billing reconciliation.</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-sans bg-slate-100 rounded-lg text-slate-500 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 font-sans bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700 transition"
                >
                  Log Violations Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
