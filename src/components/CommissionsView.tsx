/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calculator, 
  Search, 
  Check, 
  Clock, 
  AlertOctagon, 
  Coins, 
  FileCheck2,
  RefreshCw,
  TrendingDown,
  Trash2
} from 'lucide-react';

interface CommissionLedger {
  id: string;
  reservationId: string;
  partnerName: string;
  bookingTotal: number;
  rateValue: number; // e.g., 10 for 10% or 50 for $50 fixed fee
  commissionType: 'Percentage' | 'Fixed Fee';
  calculatedDue: number;
  accrualDate: string;
  reconciliationStatus: 'Accrued' | 'Settled' | 'Disputed' | 'Waived';
}

export default function CommissionsView() {
  const [ledgers, setLedgers] = useState<CommissionLedger[]>([]);

  const [activeTab, setActiveTab] = useState<'All' | 'Accrued' | 'Settled' | 'Disputed' | 'Waived'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredLedgers = ledgers.filter(l => {
    if (activeTab === 'Accrued' && l.reconciliationStatus !== 'Accrued') return false;
    if (activeTab === 'Settled' && l.reconciliationStatus !== 'Settled') return false;
    if (activeTab === 'Disputed' && l.reconciliationStatus !== 'Disputed') return false;
    if (activeTab === 'Waived' && l.reconciliationStatus !== 'Waived') return false;

    const matchesSearch = l.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.reservationId.includes(searchTerm) || 
                          l.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleSettleCom = (id: string) => {
    setLedgers(prev => prev.map(l => l.id === id ? { ...l, reconciliationStatus: 'Settled' } : l));
    alert(`Commission item successfully finalized and processed for payment routing.`);
  };

  const handleDisputeCom = (id: string) => {
    setLedgers(prev => prev.map(l => l.id === id ? { ...l, reconciliationStatus: 'Disputed' } : l));
  };

  const totals = {
    accrued: ledgers.filter(l => l.reconciliationStatus === 'Accrued').reduce((sum, l) => sum + l.calculatedDue, 0),
    settled: ledgers.filter(l => l.reconciliationStatus === 'Settled').reduce((sum, l) => sum + l.calculatedDue, 0),
    disputed: ledgers.filter(l => l.reconciliationStatus === 'Disputed').reduce((sum, l) => sum + l.calculatedDue, 0)
  };

  const handleSettleAllAccrued = () => {
    const count = ledgers.filter(l => l.reconciliationStatus === 'Accrued').length;
    if (count === 0) {
      alert('No accrued affiliate commissions currently pending settlement.');
      return;
    }
    if (confirm(`Approve monthly disbursements for all ${count} accrued accounts?`)) {
      setLedgers(prev => prev.map(l => l.reconciliationStatus === 'Accrued' ? { ...l, reconciliationStatus: 'Settled' } : l));
      alert('Disbursements successfully completed.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Dispatch Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-sans tracking-tight">Acquisition Commission Ledger</h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">Audit, reconcile and settle travel platform referral fees owed on active or completed vehicle hires.</p>
        </div>

        <button 
          onClick={handleSettleAllAccrued}
          className="bg-slate-900 border border-slate-950 text-white hover:bg-slate-800 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <Coins className="w-3.5 h-3.5 text-blue-400" />
          <span>Settle All Accrued Hubs</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4 select-none">
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Accrued Outstanding</span>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">${totals.accrued.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <span className="text-[9px] text-blue-600 bg-blue-50/80 px-1.5 py-0.5 border border-blue-200/50 rounded font-bold mt-1 inline-block">Payable in 15 days</span>
        </div>
        
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Disbursed Volume (LTM)</span>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">${totals.settled.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <span className="text-[9px] text-green-600 bg-green-50/80 px-1.5 py-0.5 border border-green-200/50 rounded font-bold mt-1 inline-block">Cleared via Bank ACH</span>
        </div>

        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Flagged Discrepancies</span>
          <div className="text-xl font-extrabold font-mono text-rose-600 mt-1">${totals.disputed.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <span className="text-[9px] text-rose-600 bg-rose-50/80 px-1.5 py-0.5 border border-rose-200/55 rounded font-bold mt-1 inline-block">Mismatched API IDs</span>
        </div>
      </div>

      {/* Main Ledger Table panel */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        
        {/* Dynamic Nav Tabs */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
          <div className="flex bg-slate-200 p-1 rounded-lg text-xs font-sans max-w-sm shrink-0">
            {[
              { id: 'All', label: 'All Commissions' },
              { id: 'Accrued', label: 'Accrued Due' },
              { id: 'Settled', label: 'Fully Settled' },
              { id: 'Disputed', label: 'Disputes' },
              { id: 'Waived', label: 'Waived' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-md font-bold text-xs whitespace-nowrap transition cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-white text-slate-900 shadow-3xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by broker or res ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 pl-9 pr-4 py-1.5 rounded-lg text-xs focus:outline-none focus:border-blue-450 text-slate-700"
              />
            </div>
            {selectedIds.length > 0 && (
              <button
                onClick={() => {
                  if (confirm(`Delete the ${selectedIds.length} selected commission ledgers?`)) {
                    setLedgers(prev => prev.filter(l => !selectedIds.includes(l.id)));
                    setSelectedIds([]);
                  }
                }}
                className="flex items-center gap-1 bg-red-600 text-white px-3.5 py-1.5 text-xs font-sans font-semibold rounded-lg hover:bg-red-700 transition shrink-0 shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* table container */}
        <div className="overflow-x-auto">
          {filteredLedgers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-sans space-y-2 select-none">
              <div className="text-3xl">🧮</div>
              <p className="font-semibold text-slate-705 text-sm">No ledger accounts match</p>
              <p className="text-xs text-slate-400">Monthly reconciliation cycles automatically trigger next day on verified bookings.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold border-b border-slate-200 select-none">
                <tr>
                  <th className="px-4 py-2.5 w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded text-blue-500 focus:ring-blue-400"
                      checked={filteredLedgers.length > 0 && selectedIds.length === filteredLedgers.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(filteredLedgers.map(l => l.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-2.5">Accrual ID</th>
                  <th className="px-4 py-2.5">Reservation Link</th>
                  <th className="px-4 py-2.5">Referring Broker Affiliate</th>
                  <th className="px-4 py-2.5 text-right">Reservation Total</th>
                  <th className="px-4 py-2.5">Contract Accord Rate</th>
                  <th className="px-4 py-2.5 text-right">Commission Due</th>
                  <th className="px-4 py-2.5">Accrual Trigger Time</th>
                  <th className="px-4 py-2.5 font-semibold">Settle Status</th>
                  <th className="px-4 py-2.5 text-right">Audit Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-600 divide-y divide-slate-100 select-none">
                {filteredLedgers.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/55 transition">
                    <td className="px-4 py-3.5 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded text-blue-505" 
                        checked={selectedIds.includes(l.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(prev => [...prev, l.id]);
                          } else {
                            setSelectedIds(prev => prev.filter(id => id !== l.id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-500">{l.id}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-800">#{l.reservationId}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold text-[9px] flex items-center justify-center shrink-0">
                          {l.partnerName.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-700 truncate max-w-[130px]">{l.partnerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold">
                      ${l.bookingTotal.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 font-medium">
                      {l.commissionType === 'Percentage' ? `${l.rateValue}% Promo` : `$${l.rateValue.toFixed(2)} Flat`}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-extrabold text-slate-900 border-r border-slate-50">
                      ${l.calculatedDue.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-400 whitespace-nowrap">{l.accrualDate}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-extrabold ${
                        l.reconciliationStatus === 'Accrued' ? 'bg-blue-50 text-blue-700 border border-blue-150' :
                        l.reconciliationStatus === 'Settled' ? 'bg-green-50 text-green-700 border border-green-150' :
                        l.reconciliationStatus === 'Disputed' ? 'bg-rose-50 text-rose-700 border border-rose-150' :
                        'bg-zinc-100 text-zinc-650 border border-zinc-200'
                      }`}>
                        {l.reconciliationStatus === 'Settled' ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {l.reconciliationStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {l.reconciliationStatus === 'Accrued' && (
                          <>
                            <button 
                              onClick={() => handleSettleCom(l.id)}
                              className="bg-green-50 hover:bg-green-100 text-green-700 px-2 py-1 border border-green-150 rounded text-[10px] font-bold transition flex items-center gap-1"
                              title="Instruct payment execution"
                            >
                              <span>Approve</span>
                            </button>
                            <button 
                              onClick={() => handleDisputeCom(l.id)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-650 px-2 py-1 border border-rose-150 rounded text-[10px] font-bold transition flex items-center gap-1"
                              title="Flag as disputed booking ID"
                            >
                              <span>Flag</span>
                            </button>
                          </>
                        )}
                        {l.reconciliationStatus === 'Settled' && (
                          <span className="text-[10px] text-slate-450 italic font-medium leading-none">Voucher paid</span>
                        )}
                        {l.reconciliationStatus === 'Disputed' && (
                          <button 
                            onClick={() => {
                              const note = prompt('Enter resolution override message to execute settlement:');
                              if (note) handleSettleCom(l.id);
                            }}
                            className="text-[10px] bg-slate-900 border border-slate-950 text-white font-bold px-2 py-1 rounded cursor-pointer transition hover:bg-slate-800"
                          >
                            Recalculate
                          </button>
                        )}
                        {l.reconciliationStatus === 'Waived' && (
                          <span className="text-[10px] text-slate-400">Voided contract</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

    </div>
  );
}
