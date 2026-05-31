/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Download, 
  DollarSign, 
  Plus, 
  Check, 
  Filter,
  TrendingDown,
  RefreshCw,
  FileSpreadsheet,
  Trash2
} from 'lucide-react';
import { Payment, Reservation } from '../types';

interface PaymentsViewProps {
  payments: Payment[];
  reservations: Reservation[];
  onAddPayment: (p: Payment) => void;
  onDeletePayments?: (ids: string[]) => void;
}

export default function PaymentsView({ payments, reservations, onAddPayment, onDeletePayments }: PaymentsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Payment' | 'Deposit' | 'Refund'>('All');
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Split-billing processor state
  const [targetResId, setTargetResId] = useState('');
  const [chargeType, setChargeType] = useState<'Payment' | 'Deposit' | 'Refund'>('Payment');
  const [chargeMethod, setChargeMethod] = useState<'Swipe' | 'cash' | 'Maestro' | 'Bank Transfer' | 'Credit Card'>('Credit Card');
  const [chargeAmount, setChargeAmount] = useState('250.00');
  const [chargeRef, setChargeRef] = useState('Approved-TX901');

  // Filter Payments
  const filteredPayments = payments.filter(pay => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      pay.customerName.toLowerCase().includes(term) ||
      pay.reservationId.includes(term) ||
      pay.paymentMethod.toLowerCase().includes(term) ||
      pay.id.includes(term);

    const matchesType = filterType === 'All' || pay.paymentType === filterType;
    return matchesSearch && matchesType;
  });

  // Calculate sum counts
  const sumPayments = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  // Spreadsheet/CSV export generator
  const exportToCSV = () => {
    // CSV Header row
    const headers = [
      'ID', 
      'Reservation ID', 
      'Customer', 
      'Payment Type', 
      'Payment Method', 
      'Date', 
      'Amount', 
      'Reference Status', 
      'Pickup Date', 
      'Return Date', 
      'Pickup Location', 
      'Vehicle Class', 
      'Total Price', 
      'Total Revenue'
    ];

    const rows = filteredPayments.map(p => [
      p.id,
      p.reservationId,
      `"${p.customerName.replace(/"/g, '""')}"`,
      p.paymentType,
      p.paymentMethod,
      p.date,
      p.amount,
      p.reference,
      p.pickupDate,
      p.returnDate,
      p.pickupLocation,
      p.vehicleClass,
      p.totalPrice,
      p.totalRevenue
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `HQRental_Billing_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProcessCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetResId) return;

    const matchedRes = reservations.find(r => r.id === targetResId);
    if (!matchedRes) return;

    const amt = parseFloat(chargeAmount) || 0;

    const targetPayment: Payment = {
      id: (payments.length + 39).toString(),
      reservationId: targetResId,
      customerName: matchedRes.customerName,
      paymentType: chargeType,
      paymentMethod: chargeMethod,
      date: new Date().toISOString().slice(0, 10),
      amount: amt,
      reference: chargeRef || 'Processed-POS',
      paymentStatus: 'Approved',
      pickupDate: matchedRes.pickupDate,
      returnDate: matchedRes.returnDate,
      pickupLocation: matchedRes.pickupLocation,
      vehicleClass: matchedRes.vehicleClass,
      totalPrice: matchedRes.totalPrice,
      totalRevenue: matchedRes.totalRevenue
    };

    onAddPayment(targetPayment);
    setShowChargeModal(false);
    setChargeAmount('250.00');
    setChargeRef('Approved-TX901');
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title & Stats panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Financial Ledger</h1>
          </div>
          <p className="text-sm text-slate-500 font-sans mt-0.5">
            View transaction logs, process contract secure deposits or final split balances, and export audit files.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* CSV Exporter */}
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-sans font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export to Spreadsheet (CSV)</span>
          </button>
          
          <button 
            onClick={() => setShowChargeModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-3.5 py-2 text-xs font-sans font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Process Transaction</span>
          </button>
        </div>
      </div>

      {/* Audit Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Filtered Volume</span>
            <h4 className="text-xl font-bold text-slate-800 font-mono mt-1">${sumPayments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
          </div>
          <DollarSign className="w-8 h-8 text-slate-300" />
        </div>
        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Active Deposits Held</span>
            <h4 className="text-xl font-bold text-blue-600 font-mono mt-1">
              ${payments.filter(p => p.paymentType === 'Deposit').reduce((sum, p) => sum + p.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
          </div>
          <TrendingDown className="w-8 h-8 text-blue-200" />
        </div>
        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Audit Status</span>
            <h4 className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2.5 py-1 w-fit mt-1.5 font-mono">
              COMPLIANT • 2026 AUDIT RDY
            </h4>
          </div>
          <Check className="w-8 h-8 text-emerald-300" />
        </div>
      </div>

      {/* Tabs Filter Mode Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 items-center gap-3 w-full">
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
            <input
              type="text"
              placeholder="Search payments by reservation ID, customer, method..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white pl-10 pr-4 py-2 text-sm font-sans rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>

          {selectedIds.length > 0 && onDeletePayments && (
            <button
              onClick={() => {
                if (confirm(`Delete the ${selectedIds.length} selected financial transactions?`)) {
                  onDeletePayments(selectedIds);
                  setSelectedIds([]);
                }
              }}
              className="flex items-center gap-1 bg-red-600 text-white px-3.5 py-2 text-xs font-sans font-semibold rounded-lg hover:bg-red-700 transition shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}
        </div>

        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs shrink-0 self-start md:self-auto">
          {[
            { id: 'All', label: 'All Transactions' },
            { id: 'Payment', label: 'Rental Fees' },
            { id: 'Deposit', label: 'Security Deposits' },
            { id: 'Refund', label: 'Processed Refunds' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFilterType(opt.id as any)}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                filterType === opt.id 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive tabular spreadsheet matching screenshot 5 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[1250px]">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-xs font-bold font-sans uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center">
                <input 
                  type="checkbox" 
                  className="rounded text-blue-500 focus:ring-blue-400"
                  checked={filteredPayments.length > 0 && selectedIds.length === filteredPayments.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(filteredPayments.map(p => p.id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                />
              </th>
              <th className="py-3 px-3">ID</th>
              <th className="py-3 px-3 text-center">Res ID</th>
              <th className="py-3 px-4">Customer Name</th>
              <th className="py-3 px-4">Payment Type</th>
              <th className="py-3 px-4">Payment Method</th>
              <th className="py-3 px-4 font-mono">Date</th>
              <th className="py-3 px-3 text-right">Amount</th>
              <th className="py-3 px-4">Reference</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4">Pickup Date</th>
              <th className="py-3 px-4">Return Date</th>
              <th className="py-3 px-4">Pickup Location</th>
              <th className="py-3 px-4">Vehicle Class</th>
              <th className="py-3 px-3 text-right">Total Price</th>
              <th className="py-3 px-3 text-right">Total Revenue</th>
            </tr>
          </thead>
          <tbody className="text-sm font-sans divide-y divide-slate-100">
            {filteredPayments.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition">
                <td className="py-3 px-4 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded text-blue-500" 
                    checked={selectedIds.includes(p.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(prev => [...prev, p.id]);
                      } else {
                        setSelectedIds(prev => prev.filter(id => id !== p.id));
                      }
                    }}
                  />
                </td>
                <td className="py-3 px-3 font-mono text-xs text-slate-400 font-semibold">{p.id}</td>
                <td className="py-3 px-3 text-center font-mono text-xs">
                  <span className="text-blue-600 font-bold hover:underline cursor-pointer">{p.reservationId}</span>
                </td>
                <td className="py-3 px-4 font-bold text-slate-900">{p.customerName}</td>
                <td className="py-3 px-4">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    p.paymentType === 'Deposit' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    p.paymentType === 'Refund' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {p.paymentType}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="bg-slate-50 border border-slate-150 text-slate-600 text-xs px-2 py-0.5 rounded">
                    {p.paymentMethod}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">{p.date}</td>
                <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">${p.amount.toFixed(2)}</td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">{p.reference}</td>
                <td className="py-3 px-4 text-center">
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100">
                    {p.paymentStatus}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-400">{p.pickupDate}</td>
                <td className="py-3 px-4 font-mono text-xs text-slate-400">{p.returnDate}</td>
                <td className="py-3 px-4 text-xs text-slate-500">{p.pickupLocation}</td>
                <td className="py-3 px-4 text-xs">
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded">
                    {p.vehicleClass}
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-500">${p.totalPrice.toFixed(2)}</td>
                <td className="py-3 px-3 text-right font-mono text-slate-600">${p.totalRevenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Charger Splitting dialog */}
      {showChargeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold font-sans text-slate-900">Process Virtual Terminal Charge</h3>
              <button onClick={() => setShowChargeModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleProcessCharge} className="mt-4 space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Target Booking (Res ID)</label>
                <select 
                  required
                  value={targetResId}
                  onChange={(e) => setTargetResId(e.target.value)}
                  className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                >
                  <option value="">-- Choose Booking --</option>
                  {reservations.map(r => (
                    <option key={r.id} value={r.id}>
                      [{r.id}] {r.customerName} - {r.vehicleClass} (${r.totalPrice})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Billing Category</label>
                  <select 
                    value={chargeType}
                    onChange={(e) => setChargeType(e.target.value as any)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                  >
                    <option value="Payment">Rental Fees (Split Payment)</option>
                    <option value="Deposit">Security Deposit Auth</option>
                    <option value="Refund">Refund Payout</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Payment Method</label>
                  <select 
                    value={chargeMethod}
                    onChange={(e) => setChargeMethod(e.target.value as any)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Swipe">Swipe POS Machine</option>
                    <option value="cash">Cash Terminal</option>
                    <option value="Maestro">Maestro</option>
                    <option value="Bank Transfer">Bank Wire Transfer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Charge Amount ($)</label>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Authorization Reference</label>
                  <input 
                    type="text" 
                    value={chargeRef}
                    onChange={(e) => setChargeRef(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 text-[11px] rounded-lg text-slate-600 block mt-2 leading-relaxed">
                📢 <strong>Split Billing Protocol:</strong> Security deposits are securely held in authorization hold state, segregated from operational rental revenues as requested by normalized audit standards.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowChargeModal(false)}
                  className="px-4 py-2 font-sans bg-slate-100 rounded-lg text-slate-500 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 font-sans bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700 transition"
                >
                  Confirm Authorization Call
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
