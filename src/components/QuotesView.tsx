/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  HelpCircle, 
  CheckCircle2, 
  Tag, 
  Percent,
  Trash2
} from 'lucide-react';
import { Quote } from '../types';

interface QuotesViewProps {
  quotes: Quote[];
  onAddQuote: (q: Quote) => void;
  onDeleteQuote: (id: string) => void;
  onDeleteQuotes?: (ids: string[]) => void;
  onApproveQuote: (id: string) => void;
}

export default function QuotesView({ 
  quotes, 
  onAddQuote, 
  onDeleteQuote, 
  onDeleteQuotes,
  onApproveQuote 
}: QuotesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Form states
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [resType, setResType] = useState('Premium Rental');
  const [vehClass, setVehClass] = useState('Premium');
  const [pickupDate, setPickupDate] = useState('2026-06-05 12:00');
  const [returnDate, setReturnDate] = useState('2026-06-12 12:00');
  const [partner, setPartner] = useState('');
  const [rackPrice, setRackPrice] = useState('500.00');
  const [discount, setDiscount] = useState('50.00');
  const [comment, setComment] = useState('');
  const [tag, setTag] = useState('');

  const filteredQuotes = quotes.filter(q => {
    const term = searchTerm.toLowerCase();
    return (
      q.customerName.toLowerCase().includes(term) ||
      q.customerEmail.toLowerCase().includes(term) ||
      q.vehicleClass.toLowerCase().includes(term) ||
      q.id.toLowerCase().includes(term)
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custEmail) return;

    const rack = parseFloat(rackPrice) || 0;
    const disc = parseFloat(discount) || 0;
    const total = Math.max(0, rack - disc);

    const newQ: Quote = {
      id: 'Q' + (quotes.length + 50).toString(),
      reservationType: resType,
      customerName: custName,
      customerEmail: custEmail,
      pickupDate: pickupDate,
      returnDate: returnDate,
      vehicleClass: vehClass,
      commissionPartner: partner || undefined,
      clientPaysAtPartner: partner ? true : false,
      rackPrice: rack,
      totalPrice: total,
      status: 'Open',
      tags: tag ? [tag] : ['Draft Quote'],
      discounts: disc,
      comments: comment || undefined
    };

    onAddQuote(newQ);
    setShowAddModal(false);
    // Reset Form
    setCustName('');
    setCustEmail('');
    setPartner('');
    setComment('');
    setTag('');
  };

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600 font-sans" />
            <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Active Estimates & Quotes</h1>
          </div>
          <p className="text-sm text-slate-500 font-sans mt-0.5">
            Prepare, tag, and issue pricing estimates. Quotes can be converted immediately into signed reservations.
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 self-start sm:self-auto bg-blue-600 text-white px-3.5 py-2 text-xs font-sans font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Prepare Quote</span>
        </button>
      </div>

      {/* Filter and Live search box */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Search quotes directory by name, email, vehicle grade or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white pl-10 pr-4 py-2.5 text-sm font-sans rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
        </div>
        {selectedIds.length > 0 && onDeleteQuotes && (
          <button
            onClick={() => {
              if (confirm(`Delete the ${selectedIds.length} selected quotes?`)) {
                onDeleteQuotes(selectedIds);
                setSelectedIds([]);
              }
            }}
            className="flex items-center gap-1.5 bg-red-600 text-white px-3.5 py-2 text-xs font-sans font-semibold rounded-lg hover:bg-red-700 transition shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Selected ({selectedIds.length})</span>
          </button>
        )}
      </div>

      {/* Table grid matching screenshot 4 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-slate-50/75 text-slate-500 border-b border-slate-200 text-xs font-bold font-sans uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center">
                <input 
                  type="checkbox" 
                  className="rounded text-blue-500 focus:ring-blue-400"
                  checked={filteredQuotes.length > 0 && selectedIds.length === filteredQuotes.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(filteredQuotes.map(q => q.id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                />
              </th>
              <th className="py-3 px-3 w-16">#</th>
              <th className="py-3 px-4">Reservation Type</th>
              <th className="py-3 px-4">Customer Name</th>
              <th className="py-3 px-4">Customer Email</th>
              <th className="py-3 px-4 text-center">Linked Res ID</th>
              <th className="py-3 px-4">Pickup Date</th>
              <th className="py-3 px-4">Return Date</th>
              <th className="py-3 px-4">Vehicle Class</th>
              <th className="py-3 px-4">Partner Agency</th>
              <th className="py-3 px-4 text-center">Pays At Partner</th>
              <th className="py-3 px-3 text-right">Rack Price</th>
              <th className="py-3 px-3 text-right">Total Price</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4">Tags</th>
              <th className="py-3 px-3 text-right">Discounts</th>
              <th className="py-3 px-4">Internal Notes</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm font-sans divide-y divide-slate-100">
            {filteredQuotes.length === 0 ? (
              <tr>
                <td colSpan={18} className="py-10 text-center text-slate-400 font-sans">
                  No registered active estimates found. Click "Prepare Quote" to generate a summary.
                </td>
              </tr>
            ) : (
              filteredQuotes.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded text-blue-500 focus:ring-blue-550"
                      checked={selectedIds.includes(q.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(prev => [...prev, q.id]);
                        } else {
                          setSelectedIds(prev => prev.filter(id => id !== q.id));
                        }
                      }}
                    />
                  </td>
                  <td className="py-3 px-3 font-mono text-xs text-slate-400 font-semibold">{q.id}</td>
                  <td className="py-3 px-4 font-medium text-slate-700">{q.reservationType}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{q.customerName}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-xs">{q.customerEmail}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-slate-100 text-slate-600 font-semibold text-[11px] px-2 py-0.5 rounded font-mono">
                      {q.id.replace('Q', 'R-')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">{q.pickupDate}</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">{q.returnDate}</td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-100 text-slate-700 font-semibold text-xs px-2 py-0.5 rounded">
                      {q.vehicleClass}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-slate-600">
                    {q.commissionPartner || <span className="text-slate-300 italic">—</span>}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {q.clientPaysAtPartner ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold">YES</span>
                    ) : (
                      <span className="text-slate-300 italic">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-500">${q.rackPrice.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">${q.totalPrice.toFixed(2)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                      q.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      q.status === 'Expired' ? 'bg-slate-100 text-slate-400 border-slate-200' :
                      'bg-amber-100/50 text-amber-700 border-amber-200'
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {q.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-medium font-sans px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-500 text-xs">
                    {q.discounts > 0 ? `-$${q.discounts.toFixed(2)}` : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate" title={q.comments}>
                    {q.comments || <span className="text-slate-300 italic">—</span>}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {q.status === 'Open' && (
                        <button 
                          onClick={() => onApproveQuote(q.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Approve Quote"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => onDeleteQuote(q.id)}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete Quote"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Quote creation modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold font-sans text-slate-900">Prepare New Interactive Quote</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Customer Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Ericka Block"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Customer Email</label>
                  <input 
                    type="email" 
                    required
                    placeholder="email@example.com"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Reservation Target Type</label>
                  <select 
                    value={resType}
                    onChange={(e) => setResType(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none"
                  >
                    <option value="Premium Rental">Premium Rental</option>
                    <option value="Weekend Escape">Weekend Escape</option>
                    <option value="Business Traveler Standard">Business Traveler Standard</option>
                    <option value="Extended Relocation">Extended Relocation</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Vehicle Class</label>
                  <select 
                    value={vehClass}
                    onChange={(e) => setVehClass(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none"
                  >
                    <option value="Economic Manual">Economic Manual</option>
                    <option value="Economic Automatic">Economic Automatic</option>
                    <option value="Premium">Premium</option>
                    <option value="SUV">SUV</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Pickup Estimate Date</label>
                  <input 
                    type="text" 
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Return Estimate Date</label>
                  <input 
                    type="text" 
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Rack Price ($)</label>
                  <input 
                    type="number" 
                    value={rackPrice}
                    onChange={(e) => setRackPrice(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Discount ($)</label>
                  <input 
                    type="number" 
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Affiliate Partner</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Expedia"
                    value={partner}
                    onChange={(e) => setPartner(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Promotional Tag</label>
                  <input 
                    type="text" 
                    placeholder="e.g. E-Sign Pending"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Internal Comments</label>
                  <input 
                    type="text" 
                    placeholder="Client has active insurance waiver."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none"
                  />
                </div>
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
                  Issue Raw Estimate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
