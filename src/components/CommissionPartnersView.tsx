/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  PlusCircle, 
  Search, 
  Globe, 
  Mail, 
  Percent, 
  Trash2, 
  CheckCircle, 
  PauseCircle,
  Sparkles,
  Award
} from 'lucide-react';

interface BrokerPartner {
  id: string;
  name: string;
  code: string;
  contactEmail: string;
  commissionType: 'Percentage' | 'Fixed Fee';
  rateValue: number; // rate e.g., 15 for 15% or 45 for $45 per hire
  referralCount: number;
  totalVolumeGenerated: number;
  status: 'Active' | 'Under Review' | 'Suspended';
}

export default function CommissionPartnersView() {
  const [partners, setPartners] = useState<BrokerPartner[]>([
    { id: 'P-501', name: 'Expedia Group LLC', code: 'EXP-PHL-99', contactEmail: 'api-feed@expedia.com', commissionType: 'Percentage', rateValue: 12.5, referralCount: 84, totalVolumeGenerated: 42850, status: 'Active' },
    { id: 'P-502', name: 'RentalCars.com Connect', code: 'RCC-REALSALE', contactEmail: 'affiliates@rentalcars.com', commissionType: 'Percentage', rateValue: 10.0, referralCount: 142, totalVolumeGenerated: 68120, status: 'Active' },
    { id: 'P-503', name: 'Philly Center City Hotel Assoc.', code: 'HOTEL-LCL-88', contactEmail: 'concierge-desk@phillyhotels.org', commissionType: 'Fixed Fee', rateValue: 50.00, referralCount: 19, totalVolumeGenerated: 9500, status: 'Active' },
    { id: 'P-504', name: 'Booking Alliance Group', code: 'BAG-OUT-OF-STATE', contactEmail: 'inbound@bookingalliance.de', commissionType: 'Percentage', rateValue: 15.0, referralCount: 12, totalVolumeGenerated: 14220, status: 'Under Review' },
    { id: 'P-505', name: 'Hampton Inn - NW Philly', code: 'HAMP-NW-90', contactEmail: 'leads@hampton-nw-philly.com', commissionType: 'Fixed Fee', rateValue: 40.00, referralCount: 8, totalVolumeGenerated: 3200, status: 'Suspended' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New partner state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [commType, setCommType] = useState<'Percentage' | 'Fixed Fee'>('Percentage');
  const [rate, setRate] = useState('');

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !rate) return;

    const newPartner: BrokerPartner = {
      id: 'P-' + (partners.length + 501),
      name,
      code: code || 'CODE-' + Math.floor(Math.random() * 900 + 100),
      contactEmail: email,
      commissionType: commType,
      rateValue: parseFloat(rate),
      referralCount: 0,
      totalVolumeGenerated: 0,
      status: 'Active'
    };

    setPartners(prev => [newPartner, ...prev]);
    setName('');
    setCode('');
    setEmail('');
    setRate('');
    setShowAddModal(false);
  };

  const handleToggleStatus = (id: string) => {
    setPartners(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'Active' ? 'Suspended' : 'Active';
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Action Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-sans tracking-tight">Referral Commission Partners</h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">Manage external travel aggregators, corporate brokers, and local luxury hotel concierges directing hires to Philly Car Rental.</p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Commission Partner</span>
        </button>
      </div>

      {/* Stats Summary Rows */}
      <div className="grid grid-cols-4 gap-4 select-none">
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Active Channels</span>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">
            {partners.filter(p => p.status === 'Active').length} <span className="text-xs font-normal text-slate-400">/ {partners.length}</span>
          </div>
        </div>
        
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Aggregate Referral Count</span>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">
            {partners.reduce((sum, p) => sum + p.referralCount, 0)} leads
          </div>
        </div>

        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Referred Volume Generated</span>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">
            ${partners.reduce((sum, p) => sum + p.totalVolumeGenerated, 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Best Yielding Partner</span>
          <div className="text-sm font-extrabold text-blue-605 mt-1 truncate">
            RentalCars.com Connect
          </div>
        </div>
      </div>

      {/* Main Table Segment */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        
        {/* Search header panel */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search partner networks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 pl-9 pr-4 py-1.5 rounded-lg text-xs focus:outline-none focus:border-blue-450 text-slate-700"
            />
          </div>
          <span className="text-[11px] text-slate-400 font-mono font-medium">Reconciliation Cycle: Monthly Automated API feeds</span>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {filteredPartners.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-sans space-y-2">
              <div className="text-3xl">👥</div>
              <p className="font-semibold text-slate-705 text-sm">No affiliate brokers found</p>
              <p className="text-xs text-slate-400">Configure corporate booking referral streams to populate active codes.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold border-b border-slate-200 select-none">
                <tr>
                  <th className="px-4 py-2.5">Partner ID</th>
                  <th className="px-4 py-2.5">Corporate Name</th>
                  <th className="px-4 py-2.5">Promo / Agency Code</th>
                  <th className="px-4 py-2.5">Partner Contact</th>
                  <th className="px-4 py-2.5">Commission Layout</th>
                  <th className="px-4 py-2.5 text-center">Inbound Hires</th>
                  <th className="px-4 py-2.5">Revenue Volume</th>
                  <th className="px-4 py-2.5">Channel Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-600 divide-y divide-slate-100 select-none">
                {filteredPartners.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3.5 font-mono text-slate-400 font-semibold">{p.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 font-bold text-[10px] flex items-center justify-center">
                          {p.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] font-bold text-slate-600 uppercase">
                      {p.code}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{p.contactEmail}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-sans font-semibold text-slate-705">
                        {p.commissionType === 'Percentage' ? `${p.rateValue}% Rate` : `$${p.rateValue.toFixed(2)} Fixed`}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-700">
                      {p.referralCount}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-extrabold text-slate-900">
                      ${p.totalVolumeGenerated.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-extrabold ${
                        p.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-150' :
                        p.status === 'Under Review' ? 'bg-amber-50 text-amber-700 border border-amber-150' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleToggleStatus(p.id)}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                            p.status === 'Active' 
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-150' 
                              : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-150'
                          }`}
                        >
                          {p.status === 'Active' ? 'Deactivate' : 'Re-activate'}
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`Remove commission affiliate ${p.name}?`)) {
                              setPartners(prev => prev.filter(item => item.id !== p.id));
                            }
                          }}
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded transition"
                          title="Remove broker"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* CREATE BROKER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Add Referral Affiliate Partner</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 text-xs font-mono">✕</button>
            </div>
            
            <form onSubmit={handleCreatePartner} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">Partner Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Philly Tour Services" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Agency Code</label>
                  <input 
                    type="text" 
                    placeholder="e.g. TOURS-NW" 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Affiliate Contact Email</label>
                  <input 
                    type="email" 
                    placeholder="booking@phillytours.net" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Deal Logic</label>
                  <select 
                    value={commType} 
                    onChange={(e) => setCommType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  >
                    <option value="Percentage">Percentage Rate (%)</option>
                    <option value="Fixed Fee">Fixed Fee ($)</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Rate Yield Amount</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 15.5 or 50" 
                    required
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-500 font-bold text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs"
                >
                  Establish Connection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
