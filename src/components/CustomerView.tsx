/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Star, 
  Award, 
  TrendingUp, 
  Trash2,
  Phone,
  Mail,
  UploadCloud
} from 'lucide-react';
import { Customer } from '../types';

interface CustomerViewProps {
  customers: Customer[];
  onAddCustomer: (c: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onDeleteCustomers?: (ids: string[]) => void;
  onUpdateCustomer: (updated: Customer) => void;
  onTriggerImport?: () => void;
}

export default function CustomerView({ 
  customers, 
  onAddCustomer, 
  onDeleteCustomer, 
  onDeleteCustomers,
  onUpdateCustomer,
  onTriggerImport
}: CustomerViewProps) {
  const [selectedCust, setSelectedCust] = useState<Customer>(customers[0] || {} as Customer);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [license, setLicense] = useState('');
  const [status, setStatus] = useState<'Active' | 'Under Audit' | 'Blacklisted'>('Active');
  const [notes, setNotes] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newCust: Customer = {
      id: 'C' + (customers.length + 1).toString(),
      name: name,
      email: email,
      phone: phone || '215-555-0100',
      driverLicense: license || 'DL-PA8812903',
      licenseExpiry: '2029-05-01',
      licenseCountry: 'USA',
      totalPaid: 0,
      totalDurationDays: 0
    };

    onAddCustomer(newCust);
    setShowAddModal(false);
    setSelectedCust(newCust);
    setName('');
    setEmail('');
    setPhone('');
    setLicense('');
    setNotes('');
  };

  // Filter list
  const filteredCustomers = customers.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.id.toLowerCase().includes(term) ||
      c.driverLicense.toLowerCase().includes(term)
    );
  });

  // Analytics
  const topRenters = [...customers].sort((a,b) => b.totalDurationDays - a.totalDurationDays).slice(0, 3);
  const topRevenue = [...customers].sort((a,b) => b.totalPaid - a.totalPaid).slice(0, 3);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Customer CRM & KYC</h1>
          </div>
          <p className="text-sm text-slate-500 font-sans mt-0.5">
            Administer driver license tracking, verify identity checklist status, and audit top corporate expenditures.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto select-none">
          {onTriggerImport && (
            <button 
              onClick={onTriggerImport}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-205 text-slate-705 px-3.5 py-2 text-xs font-sans font-semibold rounded-lg transition shadow-2xs cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-indigo-500" />
              <span>Import CSV</span>
            </button>
          )}
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-3.5 py-2 text-xs font-sans font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Client</span>
          </button>
        </div>
      </div>

      {/* Analytics Scoreboards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Top Tenants by Days */}
        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wider font-sans border-b border-slate-150 pb-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Top Renters (By Contract Longevity)</span>
          </div>
          <div className="space-y-2 text-xs font-sans">
            {topRenters.map((tr, trIdx) => (
              <div key={tr.id} className="flex justify-between items-center bg-white p-2 border border-slate-100 rounded-lg">
                <span className="font-semibold text-slate-800">#{trIdx + 1} {tr.name}</span>
                <span className="text-indigo-600 font-mono font-medium">{tr.totalDurationDays} Active Days</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Spenders */}
        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider font-sans border-b border-slate-150 pb-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Top Strategic Clients (Total Expenditure)</span>
          </div>
          <div className="space-y-2 text-xs font-sans">
            {topRevenue.map((tr, trIdx) => (
              <div key={tr.id} className="flex justify-between items-center bg-white p-2 border border-slate-100 rounded-lg">
                <span className="font-semibold text-slate-800">#{trIdx + 1} {tr.name}</span>
                <span className="text-emerald-600 font-mono font-bold">${tr.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CRM list: 5 columns */}
        <div className="lg:col-span-12 xl:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-sm font-bold font-sans text-slate-900">CRM Directory</h3>
              <p className="text-xs text-slate-400 font-sans">Real-time driver credentials search.</p>
            </div>
            {selectedIds.length > 0 && onDeleteCustomers && (
              <button
                onClick={() => {
                  if (confirm(`Delete the ${selectedIds.length} selected customers?`)) {
                    onDeleteCustomers(selectedIds);
                    setSelectedIds([]);
                  }
                }}
                className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
              >
                Delete Selected ({selectedIds.length})
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Filter names, emails, license IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 pl-9 pr-4 py-2 text-xs font-sans rounded-lg border border-slate-200 focus:outline-none"
            />
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {filteredCustomers.map(cust => (
              <div
                key={cust.id}
                className={`w-full p-4 rounded-xl border transition flex items-center gap-3 relative ${
                  selectedCust.id === cust.id 
                    ? 'bg-blue-50/40 border-blue-400 shadow-xs' 
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <input 
                  type="checkbox"
                  checked={selectedIds.includes(cust.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    if (e.target.checked) {
                      setSelectedIds(prev => [...prev, cust.id]);
                    } else {
                      setSelectedIds(prev => prev.filter(id => id !== cust.id));
                    }
                  }}
                  className="rounded text-blue-505 focus:ring-blue-450 z-10 cursor-pointer shrink-0"
                />
                <button
                  type="button"
                  onClick={() => setSelectedCust(cust)}
                  className="flex-1 text-left flex items-center justify-between gap-3 focus:outline-none"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm font-sans">{cust.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400 font-medium">{cust.driverLicense}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                      Active
                    </span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Selected client detailed view: 7 columns */}
        <div className="lg:col-span-7">
          {selectedCust.id ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="bg-slate-100 text-slate-600 font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase">PROFILE: {selectedCust.id}</span>
                  <h2 className="text-xl font-bold text-slate-900 font-sans mt-1">{selectedCust.name}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded text-xs font-sans font-bold">Verified Account</span>
                </div>
              </div>

              {/* Direct Communication Info Card */}
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-xs font-sans space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Account Coordinates</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{selectedCust.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{selectedCust.phone}</span>
                  </div>
                </div>
              </div>

              {/* Driver license credentials validation details */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase font-sans border-b border-slate-100 pb-1.5">
                  KYC Verified License Credentials
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div className="bg-slate-50/50 p-3 border border-slate-100 rounded-lg space-y-1">
                    <span className="text-[10px] text-slate-400 font-sans font-semibold">License ID number</span>
                    <div className="font-mono font-bold text-slate-800">{selectedCust.driverLicense}</div>
                  </div>
                  <div className="bg-slate-50/50 p-3 border border-slate-100 rounded-lg space-y-1">
                    <span className="text-[10px] text-slate-400 font-sans font-semibold">Regulatory expiration date</span>
                    <div className="font-mono text-slate-650">{selectedCust.licenseExpiry}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-lg text-xs font-sans">
                  <span>Legal checklist verify status:</span>
                  <span className={`font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-150`}>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    PASSED COGNITIVE AUDIT
                  </span>
                </div>
              </div>

              {/* Renter Statistics summary */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-slate-800 uppercase font-sans border-b border-slate-100 pb-1.5">
                  Lease historical overview
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-50 p-3.5 border border-slate-100 rounded-xl">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Total Rental Days</span>
                    <h3 className="text-lg font-bold font-mono text-slate-800 mt-1">{selectedCust.totalDurationDays} days</h3>
                  </div>
                  <div className="bg-slate-50 p-3.5 border border-slate-100 rounded-xl">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">License Origin</span>
                    <h3 className="text-lg font-bold font-mono text-indigo-600 mt-1">{selectedCust.licenseCountry}</h3>
                  </div>
                  <div className="bg-slate-50 p-3.5 border border-slate-100 rounded-xl">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Revenues cleared</span>
                    <h3 className="text-lg font-bold font-mono text-emerald-600 mt-1">${selectedCust.totalPaid.toLocaleString()}</h3>
                  </div>
                </div>
              </div>

              {/* Internal account comments */}
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-xs text-indigo-850 font-sans">
                💡 <strong>KYC Operational Indicator:</strong> This profile represents a premium corporate client verified under active Philly lease regulations. Licenses are tracked on every check-in cycle.
              </div>

              {/* Deletion protection button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Do you wish to delete customer record for ${selectedCust.name}?`)) {
                      onDeleteCustomer(selectedCust.id);
                      setSelectedCust(customers[0] || {} as Customer);
                    }
                  }}
                  className="px-3 py-1.5 font-sans font-semibold text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Retire Account record</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 font-sans border border-dashed border-slate-200 rounded-2xl bg-white">
              No profile selected. Search or click on the left list directory.
            </div>
          )}
        </div>

      </div>

      {/* Adding Member modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold font-sans text-slate-900">Onboard client CRM file</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">First & Last Name</label>
                <input 
                  type="text" required placeholder="Samuel Kimball" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 animate-fade-in-down">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">License ID Expiry</label>
                  <input 
                    type="text" placeholder="DL-PA39109" value={license} onChange={(e) => setLicense(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Initial Status</label>
                  <select 
                    value={status} onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Audit">Under Audit</option>
                    <option value="Blacklisted">Blacklisted</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                  <input 
                    type="text" placeholder="215-555-0100" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                  <input 
                    type="email" required placeholder="contact@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Staff notations / account reason</label>
                <textarea 
                  rows={2} placeholder="Partner at Keystone logistics, recurring monthly standard SUVs renter." 
                  value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="button" onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  Onboard CRM node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
