/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Hammer, 
  Search, 
  PlusCircle, 
  CheckCheck, 
  Clock, 
  AlertOctagon, 
  Compass, 
  Building2, 
  ExternalLink,
  DollarSign,
  Briefcase
} from 'lucide-react';

interface RepairOrder {
  id: string;
  claimId?: string; // Optional links to claims
  vehicleModel: string;
  vehiclePlate: string;
  issueDescription: string;
  vendorGarage: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  estimateAmount: number;
  partsOrdered: boolean;
  status: 'Pending Diagnostics' | 'Under Repair' | 'Awaiting Parts' | 'Completed & Released';
  dateOpened: string;
}

export default function RepairOrdersView() {
  const [orders, setOrders] = useState<RepairOrder[]>([
    { id: 'RO-401', claimId: 'CLM-08', vehicleModel: 'BMW 650 i Coupe', vehiclePlate: 'BMR-650B', issueDescription: 'Front bumper structural fracture and headlight assembly refit', vendorGarage: 'Philly Collision & Body Shop', priority: 'High', estimateAmount: 1850.00, partsOrdered: true, status: 'Under Repair', dateOpened: '2026-05-26' },
    { id: 'RO-402', vehicleModel: 'Toyota Prius Hybrid', vehiclePlate: 'TOY-HYB3', issueDescription: 'Cooling system fan replacement and active CAN bus diagnostic override', vendorGarage: 'Precision Hybrid Mechanics', priority: 'Critical', estimateAmount: 430.00, partsOrdered: false, status: 'Pending Diagnostics', dateOpened: '2026-05-31' },
    { id: 'RO-403', claimId: 'CLM-12', vehicleModel: 'Volvo 850 - 191', vehiclePlate: 'PHL-850A', issueDescription: 'Rear suspension alignment following highway pothole impact', vendorGarage: 'Center City Wheel & Tire', priority: 'Medium', estimateAmount: 320.00, partsOrdered: true, status: 'Awaiting Parts', dateOpened: '2026-05-28' },
    { id: 'RO-404', vehicleModel: 'Renault Super 5', vehiclePlate: 'REN-5161', issueDescription: 'Oxygen sensor swap & exhaust leak seal testing', vendorGarage: 'Fishtown Retro Car Repair', priority: 'Low', estimateAmount: 195.00, partsOrdered: true, status: 'Completed & Released', dateOpened: '2026-05-20' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [issue, setIssue] = useState('');
  const [garage, setGarage] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [estimate, setEstimate] = useState('');
  const [claimId, setClaimId] = useState('');

  const filteredOrders = orders.filter(o => 
    o.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.vendorGarage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.trim() || !plate.trim() || !issue.trim() || !garage.trim() || !estimate) return;

    const newRO: RepairOrder = {
      id: 'RO-' + (orders.length + 401),
      claimId: claimId || undefined,
      vehicleModel: model,
      vehiclePlate: plate,
      issueDescription: issue,
      vendorGarage: garage,
      priority,
      estimateAmount: parseFloat(estimate),
      partsOrdered: false,
      status: 'Pending Diagnostics',
      dateOpened: new Date().toISOString().substring(0, 10)
    };

    setOrders(prev => [newRO, ...prev]);
    setModel('');
    setPlate('');
    setIssue('');
    setGarage('');
    setEstimate('');
    setClaimId('');
    setShowAddForm(false);
  };

  const handleAdvanceState = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        let nextStatus: typeof o.status = o.status;
        if (o.status === 'Pending Diagnostics') nextStatus = 'Under Repair';
        else if (o.status === 'Under Repair') nextStatus = 'Awaiting Parts';
        else if (o.status === 'Awaiting Parts') nextStatus = 'Completed & Released';
        return { ...o, status: nextStatus, partsOrdered: nextStatus !== 'Pending Diagnostics' };
      }
      return o;
    }));
  };

  const totals = {
    exp: orders.reduce((sum, o) => sum + o.estimateAmount, 0),
    activeCount: orders.filter(o => o.status !== 'Completed & Released').length,
    highPriority: orders.filter(o => (o.priority === 'High' || o.priority === 'Critical') && o.status !== 'Completed & Released').length
  };

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-sans tracking-tight">Active Mechanical Repair Orders (RO)</h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">Issue formal garage assignments, authorize repair estimates, and track vehicle progress inside body shops.</p>
        </div>

        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Launch Mechanical Order</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4 select-none">
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Active Repair Estimates</span>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">${totals.exp.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <span className="text-[9px] text-blue-600 bg-blue-50/80 px-1.5 py-0.5 border border-blue-150 rounded font-bold mt-1 inline-block">Committed Repair Capital</span>
        </div>
        
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Worksheets in Progress</span>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">{totals.activeCount} orders</div>
          <span className="text-[9px] text-indigo-650 bg-indigo-50/80 px-1.5 py-0.5 border border-indigo-150 rounded font-bold mt-1 inline-block">Off-road Grounded</span>
        </div>

        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Critical Alert Priority</span>
          <div className="text-xl font-extrabold font-mono text-rose-600 mt-1">{totals.highPriority} High Alert</div>
          <span className="text-[9px] text-rose-650 bg-rose-50/80 px-1.5 py-0.5 border border-rose-150 rounded font-bold mt-1 inline-block">Awaiting body authorization</span>
        </div>
      </div>

      {/* Main Ledger grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        
        {/* Search header panel */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search RO, garage, vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 pl-9 pr-4 py-1.5 rounded-lg text-xs focus:outline-none focus:border-blue-450 text-slate-700"
            />
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Dispatch Sync: Direct body integrations</span>
        </div>

        {/* Ledger table */}
        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-sans space-y-2 select-none">
              <div className="text-3xl">🛠️</div>
              <p className="font-semibold text-slate-705 text-sm">No active workshops registered</p>
              <p className="text-xs text-slate-400">All registered body repairs and diagnostic overhauls match parameters.</p>
            </div>
          ) : (
            <table className="w-full text-left font-sans">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold border-b border-slate-200 select-none">
                <tr>
                  <th className="px-4 py-2.5">RO ID</th>
                  <th className="px-4 py-2.5">Linked Claim</th>
                  <th className="px-4 py-2.5">Odometer Plate ID</th>
                  <th className="px-4 py-2.5">Damage / Work Order Narrative</th>
                  <th className="px-4 py-2.5">Assigned Body Shop</th>
                  <th className="px-4 py-2.5">Priority</th>
                  <th className="px-4 py-2.5 text-right font-mono">Estimate</th>
                  <th className="px-4 py-2.5">Repair State</th>
                  <th className="px-4 py-2.5 text-right">Work Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-600 divide-y divide-slate-100 select-none">
                {filteredOrders.map(ro => (
                  <tr key={ro.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-4 font-mono font-bold text-slate-500">{ro.id}</td>
                    <td className="px-4 py-4 font-mono text-slate-400">
                      {ro.claimId ? (
                        <span className="text-blue-600 bg-blue-50 px-1 py-0.5 border border-blue-100 rounded font-bold">
                          #{ro.claimId}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">None (Internal)</span>
                      )}
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-slate-705">{ro.vehiclePlate}</td>
                    <td className="px-4 py-4">
                      <div className="space-y-0.5 max-w-[220px]">
                        <p className="font-bold text-slate-800 leading-tight truncate">{ro.issueDescription}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{ro.vehicleModel}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-sans text-slate-550">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[150px]">{ro.vendorGarage}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-sans">
                      <span className={`inline-flex items-center font-bold font-mono px-2 py-0.5 text-[9px] rounded-full border ${
                        ro.priority === 'Low' ? 'bg-zinc-50 text-zinc-650 border-zinc-200' :
                        ro.priority === 'Medium' ? 'bg-sky-50 text-sky-750 border-sky-150' :
                        ro.priority === 'High' ? 'bg-amber-50 text-amber-705 border-amber-150' :
                        'bg-rose-50 text-rose-700 border-rose-150 animate-pulse font-black'
                      }`}>
                        {ro.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-extrabold text-slate-900">${ro.estimateAmount.toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-extrabold ${
                        ro.status === 'Completed & Released' ? 'bg-green-50 text-green-700 border border-green-150' :
                        ro.status === 'Pending Diagnostics' ? 'bg-slate-105 text-slate-700 border border-slate-205 font-medium' :
                        ro.status === 'Awaiting Parts' ? 'bg-amber-50 text-amber-700 border border-amber-150' :
                        'bg-blue-50 text-blue-700 border border-blue-150 animate-pulse'
                      }`}>
                        {ro.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {ro.status !== 'Completed & Released' ? (
                        <button 
                          onClick={() => handleAdvanceState(ro.id)}
                          className="bg-slate-900 border border-slate-950 text-white font-bold px-2 py-1.5 rounded hover:bg-slate-800 transition text-[10px] cursor-pointer shadow-3xs"
                        >
                          {ro.status === 'Pending Diagnostics' ? 'Begin Work' : 
                           ro.status === 'Under Repair' ? 'Order Parts' : 'Release Vehicle'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Order Archived</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* CREATE REPAIR ORDER MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Launch Repair Worksheet (RO)</h3>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 text-xs font-mono">✕</button>
            </div>
            
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">Vehicle Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. BMW 650 i Coupe" 
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-450"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">License Plate ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. BMR-650B" 
                    required
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Linked Claim ID (optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. CLM-08" 
                    value={claimId}
                    onChange={(e) => setClaimId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">Mechanical workshop Vendor</label>
                <input 
                  type="text" 
                  placeholder="e.g Philly Collision & Body Shop" 
                  required
                  value={garage}
                  onChange={(e) => setGarage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Priority Level</label>
                  <select 
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  >
                    <option value="Low">Low - Cosmetic</option>
                    <option value="Medium">Medium - Standard check</option>
                    <option value="High">High - Driveability concern</option>
                    <option value="Critical">Critical - Safety risk</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Estimate Estimate ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    required
                    value={estimate}
                    onChange={(e) => setEstimate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">Diagnostics & Mechanical Issue Narrative</label>
                <textarea 
                  rows={2} 
                  required
                  placeholder="Detailed breakdown of mechanical work items commissioned..."
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
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
                  className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs shadow-xs"
                >
                  Launch Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
