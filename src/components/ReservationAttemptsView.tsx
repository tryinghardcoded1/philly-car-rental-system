/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Mail, 
  Search, 
  RefreshCw, 
  AlertCircle,
  ExternalLink,
  Check,
  UserX,
  PhoneCall,
  Trash2
} from 'lucide-react';
import { ReservationAttempt } from '../types';

interface ReservationAttemptsViewProps {
  attempts: ReservationAttempt[];
  onConvertToReservation: (attempt: ReservationAttempt) => void;
  onUpdateStatus: (id: string, nextStatus: 'Contacted' | 'In Progress') => void;
  onDeleteAttempts?: (ids: string[]) => void;
}

export default function ReservationAttemptsView({ 
  attempts, 
  onConvertToReservation,
  onUpdateStatus,
  onDeleteAttempts
}: ReservationAttemptsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'All' | 'NotContact' | 'InProg' | 'Contacted'>('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter list
  const filteredAttempts = attempts.filter(att => {
    // search
    const matchesSearch = 
      (att.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (att.phone || '').includes(searchTerm) ||
      att.id.includes(searchTerm) ||
      att.vehicleClass.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // contact filter
    if (filterMode === 'NotContact') return att.contactStatus === 'Not Contacted';
    if (filterMode === 'InProg') return att.contactStatus === 'In Progress';
    if (filterMode === 'Contacted') return att.contactStatus === 'Contacted';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Title & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserX className="w-6 h-6 text-indigo-600 animate-pulse" />
            <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Reservation Attempts</h1>
          </div>
          <p className="text-sm text-slate-500 font-sans mt-0.5">
            Recover lost checkouts. Traces booking intent when visitors abandon the portal before submitting the deposit fee.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-rose-600 font-mono bg-rose-50 border border-rose-100 py-1.5 px-3 rounded-full font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>78% Potential recovery margin</span>
        </div>
      </div>

      {/* Tab Filter & Search Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Search abandonment logs by email, device class ID, or visitor telephone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white pl-10 pr-4 py-2.5 text-sm font-sans rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {selectedIds.length > 0 && onDeleteAttempts && (
          <button
            onClick={() => {
              if (confirm(`Delete the ${selectedIds.length} selected attempts?`)) {
                onDeleteAttempts(selectedIds);
                setSelectedIds([]);
              }
            }}
            className="flex items-center gap-1.5 bg-red-600 text-white px-3.5 py-2.5 text-xs font-sans font-semibold rounded-xl hover:bg-red-700 transition shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Selected ({selectedIds.length})</span>
          </button>
        )}
        
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs shrink-0 self-start">
          {[
            { id: 'All', label: 'All Drafts' },
            { id: 'NotContact', label: 'Not Contacted' },
            { id: 'InProg', label: 'In Progress' },
            { id: 'Contacted', label: 'Resolved/Contacted' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFilterMode(opt.id as any)}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                filterMode === opt.id 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Table based on screenshot 3 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-xs font-bold font-sans uppercase tracking-wider">
              <th className="py-3.5 px-4 w-12 text-center">
                <input 
                  type="checkbox" 
                  className="rounded text-blue-500 focus:ring-blue-400"
                  checked={filteredAttempts.length > 0 && selectedIds.length === filteredAttempts.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(filteredAttempts.map(a => a.id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                />
              </th>
              <th className="py-3.5 px-4"># ID</th>
              <th className="py-3.5 px-4">Draft Email</th>
              <th className="py-3.5 px-4">Phone Number</th>
              <th className="py-3.5 px-4">Pickup Location</th>
              <th className="py-3.5 px-4">Return Location</th>
              <th className="py-3.5 px-4">Pickup Date/Time</th>
              <th className="py-3.5 px-4">Return Date/Time</th>
              <th className="py-3.5 px-4">Contact status</th>
              <th className="py-3.5 px-4">Reservation Type</th>
              <th className="py-3.5 px-3">Branch</th>
              <th className="py-3.5 px-3 text-center">Avail Cars</th>
              <th className="py-3.5 px-4">Vehicle Class Requested</th>
              <th className="py-3.5 px-3 text-center">Last Step ID</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm font-sans divide-y divide-slate-100">
            {filteredAttempts.length === 0 ? (
              <tr>
                <td colSpan={15} className="py-12 text-center text-slate-400 font-sans">
                  No draft attempts matching criteria found. All checkouts are active.
                </td>
              </tr>
            ) : (
              filteredAttempts.map((att) => (
                <tr key={att.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded text-blue-500 focus:ring-blue-500" 
                      checked={selectedIds.includes(att.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(prev => [...prev, att.id]);
                        } else {
                          setSelectedIds(prev => prev.filter(id => id !== att.id));
                        }
                      }}
                    />
                  </td>
                  <td className="py-3 px-4 font-mono text-xs font-semibold text-blue-600">
                    {att.id}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {att.email ? (
                      <span className="hover:underline cursor-pointer">{att.email}</span>
                    ) : (
                      <span className="text-slate-400 italic">No email saved</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">
                    {att.phone || <span className="text-slate-300">—</span>}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600">{att.pickupLocation}</td>
                  <td className="py-3 px-4 text-xs text-slate-600">{att.returnLocation}</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">{att.pickupDate}</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">{att.returnDate}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                      att.contactStatus === 'Contacted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      att.contactStatus === 'In Progress' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        att.contactStatus === 'Contacted' ? 'bg-emerald-400' :
                        att.contactStatus === 'In Progress' ? 'bg-amber-400' :
                        'bg-rose-400'
                      }`} />
                      {att.contactStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-400">
                    {att.reservationType}
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-600">{att.branch}</td>
                  <td className="py-3 px-3 text-center font-mono text-xs font-semibold text-slate-800">
                    {att.totalAvailableVehicles}
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      att.vehicleClass === 'Vehicle class not set'
                        ? 'bg-slate-100 text-slate-400 font-normal italic'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}>
                      {att.vehicleClass}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center">
                        {att.lastStep}
                      </span>
                      <span className="text-[9px] text-slate-400 font-sans">
                        {att.lastStep === 4 ? 'Review' : att.lastStep === 3 ? 'Options' : 'Vehicle Selection'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {att.contactStatus === 'Not Contacted' && (
                        <button 
                          onClick={() => onUpdateStatus(att.id, 'In Progress')}
                          className="p-1 px-2 text-[10px] bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded text-slate-600 flex items-center gap-1"
                          title="Flag contacted"
                        >
                          <PhoneCall className="w-3 h-3 text-slate-400" />
                          <span>Contact</span>
                        </button>
                      )}
                      
                      <button 
                        onClick={() => {
                          onUpdateStatus(att.id, 'Contacted');
                          onConvertToReservation(att);
                        }}
                        className="flex items-center gap-1 p-1 px-2.5 text-[10px] bg-blue-50 hover:bg-blue-100 border border-blue-200/50 hover:border-blue-300 text-blue-700 font-semibold rounded transition"
                        title="Convert to Reservation"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Convert</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Dynamic recovery tip */}
      <div className="p-4 bg-indigo-50/50 border border-indigo-150 rounded-xl flex items-center gap-3">
        <Mail className="w-5 h-5 text-indigo-600 shrink-0" />
        <p className="text-xs text-slate-600 font-sans">
          <strong>Recover abandoned carts:</strong> Clicking "Convert" instantly transitions their saved draft class and date configuration over to the active booking planner where you may select a live vehicle model and finalize prices.
        </p>
      </div>

    </div>
  );
}
