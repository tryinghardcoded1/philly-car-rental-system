/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  DollarSign, 
  PlusCircle, 
  Search, 
  MapPin, 
  Send, 
  Check, 
  Clock, 
  AlertTriangle,
  Receipt,
  FileMinus,
  Sparkles,
  RefreshCw,
  Stamp,
  Trash2
} from 'lucide-react';

interface ExternalCharge {
  id: string;
  reservationId: string;
  customerName: string;
  chargeType: 'Toll' | 'Traffic Fine' | 'Refuel Fee' | 'Towing' | 'Cleaning Fine';
  provider: string; // e.g., EZPass PA, Philadelphia Parking Authority
  amount: number;
  incidentDate: string;
  status: 'Draft' | 'Posted to Contract' | 'Paid by Client' | 'Disputed';
  notes?: string;
}

export default function ExternalChargesView() {
  const [charges, setCharges] = useState<ExternalCharge[]>([]);

  const [activeFilter, setActiveFilter] = useState<'All' | 'Draft' | 'Posted' | 'Paid' | 'Disputed'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Create charge form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [resId, setResId] = useState('');
  const [custName, setCustName] = useState('');
  const [type, setType] = useState<'Toll' | 'Traffic Fine' | 'Refuel Fee' | 'Towing' | 'Cleaning Fine'>('Toll');
  const [provider, setProvider] = useState('');
  const [amountVal, setAmountVal] = useState('');
  const [notes, setNotes] = useState('');

  const filteredCharges = charges.filter(c => {
    // Tab Filter
    if (activeFilter === 'Draft' && c.status !== 'Draft') return false;
    if (activeFilter === 'Posted' && c.status !== 'Posted to Contract') return false;
    if (activeFilter === 'Paid' && c.status !== 'Paid by Client') return false;
    if (activeFilter === 'Disputed' && c.status !== 'Disputed') return false;

    // Search filter
    const matchesSearch = c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.reservationId.includes(searchTerm) || 
                          c.chargeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.provider.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleCreateCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !amountVal) return;

    const newC: ExternalCharge = {
      id: 'EC-' + (charges.length + 301),
      reservationId: resId || 'General',
      customerName: custName,
      chargeType: type,
      provider: provider || 'Generic Agency',
      amount: parseFloat(amountVal),
      incidentDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Draft',
      notes: notes
    };

    setCharges(prev => [newC, ...prev]);
    // Reset Form
    setResId('');
    setCustName('');
    setProvider('');
    setAmountVal('');
    setNotes('');
    setShowAddForm(false);
  };

  const handlePostToContract = (id: string) => {
    setCharges(prev => prev.map(c => c.id === id ? { ...c, status: 'Posted to Contract' } : c));
    alert(`Charge is successfully posted and consolidated on customer's contract ledger invoice.`);
  };

  const handleMarkAsPaid = (id: string) => {
    setCharges(prev => prev.map(c => c.id === id ? { ...c, status: 'Paid by Client' } : c));
  };

  const totals = {
    unbilled: charges.filter(c => c.status === 'Draft').reduce((acc, current) => acc + current.amount, 0),
    posted: charges.filter(c => c.status === 'Posted to Contract').reduce((acc, current) => acc + current.amount, 0),
    disputed: charges.filter(c => c.status === 'Disputed').reduce((acc, current) => acc + current.amount, 0)
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Control Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-sans tracking-tight">External Surcharges & Tolls</h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">Track, reconcile, and pass onto active contract ledgers all external tollway, parking fine, and refueling penalties.</p>
        </div>

        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Register External Charge</span>
        </button>
      </div>

      {/* Metrics Header Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Unbilled Penalties</span>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">${totals.unbilled.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-mono font-bold mt-1 inline-block border border-amber-100">Draft Status</span>
        </div>
        
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Posted to Invoices</span>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">${totals.posted.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <span className="text-[9px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono font-bold mt-1 inline-block border border-blue-100">Revenue Integrated</span>
        </div>

        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Active Disputes</span>
          <div className="text-xl font-extrabold font-mono text-rose-600 mt-1">${totals.disputed.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <span className="text-[9px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-mono font-bold mt-1 inline-block border border-rose-100">Awaiting Manager Audit</span>
        </div>
      </div>

      {/* Main Operational Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        
        {/* Table Filter Tabs */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex bg-slate-200 p-1 rounded-lg text-xs font-sans max-w-sm shrink-0 select-none">
            {[
              { id: 'All', label: 'All Surcharges' },
              { id: 'Draft', label: 'Drafts' },
              { id: 'Posted', label: 'Posted' },
              { id: 'Paid', label: 'Settled' },
              { id: 'Disputed', label: 'Disputes' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-md font-bold text-xs whitespace-nowrap transition cursor-pointer ${
                  activeFilter === tab.id 
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/40' 
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
                placeholder="Search by customer, tollway, ticket ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 pl-9 pr-4 py-1.5 rounded-lg text-xs focus:outline-none focus:border-blue-450 text-slate-700"
              />
            </div>
            {selectedIds.length > 0 && (
              <button
                onClick={() => {
                  if (confirm(`Delete the ${selectedIds.length} selected external surcharges?`)) {
                    setCharges(prev => prev.filter(c => !selectedIds.includes(c.id)));
                    setSelectedIds([]);
                  }
                }}
                className="flex items-center gap-1 bg-red-600 text-white px-3.5 py-1.5 text-xs font-sans font-semibold rounded-lg hover:bg-red-700 transition shrink-0 shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete ({selectedIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          {filteredCharges.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-sans space-y-2">
              <div className="text-3xl">🧾</div>
              <h3 className="font-semibold text-slate-700 text-sm">No surcharge logs matched</h3>
              <p className="text-xs text-slate-400">All registered municipal tolls, driving violations and custom cleaning penalties match current view parameters.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold border-b border-slate-200 select-none">
                <tr>
                  <th className="px-4 py-2.5 w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded text-blue-500 focus:ring-blue-400"
                      checked={filteredCharges.length > 0 && selectedIds.length === filteredCharges.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(filteredCharges.map(c => c.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-2.5">Surcharge ID</th>
                  <th className="px-4 py-2.5">Contract/Res ID</th>
                  <th className="px-4 py-2.5">Client & Recipient</th>
                  <th className="px-4 py-2.5">Penalty Classification</th>
                  <th className="px-4 py-2.5">Issuer/Agency</th>
                  <th className="px-4 py-2.5">Date Added</th>
                  <th className="px-4 py-2.5">Amount</th>
                  <th className="px-4 py-2.5 font-semibold">Integrity Status</th>
                  <th className="px-4 py-2.5 text-right">Ledger Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-600 divide-y divide-slate-100 select-none">
                {filteredCharges.map(charge => (
                  <tr key={charge.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded text-blue-505" 
                        checked={selectedIds.includes(charge.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(prev => [...prev, charge.id]);
                          } else {
                            setSelectedIds(prev => prev.filter(id => id !== charge.id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-500">
                      {charge.id}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-700">
                      #{charge.reservationId}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {charge.customerName}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold border ${
                        charge.chargeType === 'Toll' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                        charge.chargeType === 'Traffic Fine' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        charge.chargeType === 'Cleaning Fine' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        charge.chargeType === 'Towing' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                        'bg-zinc-100 text-zinc-700 border-zinc-200'
                      }`}>
                        {charge.chargeType.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-550 truncate max-w-[150px]">
                      {charge.provider}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                      {charge.incidentDate}
                    </td>
                    <td className="px-4 py-3 font-mono font-extrabold text-slate-900">
                      ${charge.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        charge.status === 'Draft' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                        charge.status === 'Posted to Contract' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        charge.status === 'Paid by Client' ? 'bg-green-50 text-green-700 border border-green-200 font-bold' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {charge.status === 'Draft' ? <Clock className="w-3 h-3" /> :
                         charge.status === 'Posted to Contract' ? <Send className="w-3 h-3" /> :
                         charge.status === 'Paid by Client' ? <Check className="w-3 h-3" /> :
                         <AlertTriangle className="w-3 h-3" />}
                        {charge.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        {charge.status === 'Draft' && (
                          <>
                            <button 
                              onClick={() => handlePostToContract(charge.id)}
                              className="bg-blue-50 hover:bg-blue-105 hover:text-blue-700 text-blue-600 px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 border border-blue-150"
                              title="Consolidate fee onto active contract invoice"
                            >
                              <span>Post Fee</span>
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm(`Dismiss/Delete this administrative surcharge?`)) {
                                  setCharges(prev => prev.filter(c => c.id !== charge.id));
                                }
                              }}
                              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded transition"
                              title="Delete penalty"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {charge.status === 'Posted to Contract' && (
                          <button 
                            onClick={() => handleMarkAsPaid(charge.id)}
                            className="bg-green-50 hover:bg-green-100 text-green-700 px-20 px-2 py-1 rounded text-[10px] font-extrabold transition border border-green-200"
                          >
                            Mark Settled
                          </button>
                        )}
                        {charge.status === 'Paid by Client' && (
                          <span className="text-[10px] text-slate-400 italic">No actions pending</span>
                        )}
                        {charge.status === 'Disputed' && (
                          <button 
                            onClick={() => {
                              const note = prompt('Please add administrative resolution notes to override dispute classification:');
                              if (note) {
                                setCharges(prev => prev.map(c => c.id === charge.id ? { ...c, notes: note, status: 'Posted to Contract' } : c));
                              }
                            }}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-705 px-2 py-1 border border-amber-200 rounded text-[10px] font-bold"
                          >
                            Resolve Dispute
                          </button>
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

      {/* MODAL / NEW FORM DRAWER CONTAINER */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm font-sans flex items-center gap-1.5">
                <Stamp className="w-4 h-4 text-blue-500" />
                <span>Register Surcharge Penalty</span>
              </h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-mono"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateCharge} className="space-y-3.5">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Contract Reservation ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 102" 
                    required
                    value={resId}
                    onChange={(e) => setResId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Client Legal Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Kristian Kutch" 
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Charge Classification</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  >
                    <option value="Toll">Municipal Toll</option>
                    <option value="Traffic Fine">Speeding / Parking Ticket</option>
                    <option value="Refuel Fee">Refueling Recovery Fee</option>
                    <option value="Cleaning Fine">Detailed Cleaning Violation</option>
                    <option value="Towing">Impound Towing Cost</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Charge Amount ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    required
                    value={amountVal}
                    onChange={(e) => setAmountVal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">Issuing Agency / Provider</label>
                <input 
                  type="text" 
                  placeholder="e.g. Pennsylvania Turnpike Commission" 
                  required
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">Administrative Description Notes</label>
                <textarea 
                  rows={2}
                  placeholder="Insert notes like exit nodes, mechanical check levels or citation numbers..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-500 font-bold text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs"
                >
                  Instantiate Charge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
