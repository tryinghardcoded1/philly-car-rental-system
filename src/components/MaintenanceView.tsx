/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Wrench, 
  Search, 
  PlusCircle, 
  Check, 
  Clock, 
  AlertTriangle,
  FileText,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles,
  Trash2
} from 'lucide-react';

interface MaintInspection {
  id: string;
  vehicleId: string;
  vehicleModel: string;
  vehiclePlate: string;
  type: 'Oil & Filter' | 'Brake Pads' | 'Tire Rotation' | 'State Emission' | 'Hybrid Battery Clean';
  currentMileage: number;
  dueDate: string;
  estimatedCost: number;
  status: 'Scheduled' | 'Due Soon' | 'Overdue' | 'Initiated';
  technicianNotes?: string;
}

export default function MaintenanceView() {
  const [inspections, setInspections] = useState<MaintInspection[]>([
    { id: 'M-701', vehicleId: 'V1', vehicleModel: 'Volvo 850 - 191', vehiclePlate: 'PHL-850A', type: 'Brake Pads', currentMileage: 124500, dueDate: '2026-06-15', estimatedCost: 280.00, status: 'Scheduled', technicianNotes: 'Front calipers squeaking slightly on test track.' },
    { id: 'M-702', vehicleId: 'V2', vehicleModel: 'BMW 650 i Coupe', vehiclePlate: 'BMR-650B', type: 'Tire Rotation', currentMileage: 82100, dueDate: '2026-07-01', estimatedCost: 120.00, status: 'Scheduled', technicianNotes: 'Align tread depths during multi-point audit.' },
    { id: 'M-703', vehicleId: 'V3', vehicleModel: 'Renault Super 5', vehiclePlate: 'REN-5161', type: 'Oil & Filter', currentMileage: 185000, dueDate: '2026-06-05', estimatedCost: 85.00, status: 'Due Soon', technicianNotes: 'Verify leak from oil cooler line during filter swab.' },
    { id: 'M-704', vehicleId: 'V5', vehicleModel: 'Toyota Prius Hybrid', vehiclePlate: 'TOY-HYB3', type: 'Hybrid Battery Clean', currentMileage: 95000, dueDate: '2026-05-31', estimatedCost: 350.00, status: 'Overdue', technicianNotes: 'Grounded because of active OBD fan fault check.' },
    { id: 'M-705', vehicleId: 'V4', vehicleModel: 'RV Sportsmaster', vehiclePlate: 'RV-SPORTY', type: 'State Emission', currentMileage: 45000, dueDate: '2026-05-24', estimatedCost: 150.00, status: 'Initiated', technicianNotes: 'Pending PA municipal stamp at Center City garage.' }
  ]);

  const [activeFilter, setActiveFilter] = useState<'All' | 'Scheduled' | 'Due' | 'Overdue'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState<'Oil & Filter' | 'Brake Pads' | 'Tire Rotation' | 'State Emission' | 'Hybrid Battery Clean'>('Oil & Filter');
  const [cost, setCost] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [mileage, setMileage] = useState('');
  const [notes, setNotes] = useState('');

  const filteredInspec = inspections.filter(item => {
    if (activeFilter === 'Scheduled' && item.status !== 'Scheduled') return false;
    if (activeFilter === 'Due' && item.status !== 'Due Soon' && item.status !== 'Initiated') return false;
    if (activeFilter === 'Overdue' && item.status !== 'Overdue') return false;

    const matchesSearch = item.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleCreateInspection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim() || !model.trim() || !cost || !dueDate) return;

    const newInspec: MaintInspection = {
      id: 'M-' + (inspections.length + 701),
      vehicleId: 'V' + (inspections.length + 1),
      vehicleModel: model,
      vehiclePlate: plate,
      type: type,
      currentMileage: mileage ? parseInt(mileage) : 65000,
      dueDate: dueDate,
      estimatedCost: parseFloat(cost),
      status: 'Scheduled',
      technicianNotes: notes
    };

    setInspections(prev => [newInspec, ...prev]);
    // Reset
    setPlate('');
    setModel('');
    setCost('');
    setDueDate('');
    setMileage('');
    setNotes('');
    setShowAddForm(false);
  };

  const handleCompleteIns = (id: string) => {
    alert(`Vehicle multi-point inspection registered!\nOdometer certified and released back into active hire availability.`);
    setInspections(prev => prev.filter(ins => ins.id !== id)); // simple state pop
  };

  const totals = {
    exp: inspections.reduce((sum, item) => sum + item.estimatedCost, 0),
    overdueCount: inspections.filter(item => item.status === 'Overdue').length,
    scheduledCount: inspections.filter(item => item.status === 'Scheduled').length,
  };

  return (
    <div className="space-y-6">
      
      {/* Upper row header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-sans tracking-tight">Preventative Maintenance Schedules</h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">Control vehicle service cycles, track PA state emission requirements, and pre-emptively overhaul active rental vehicles.</p>
        </div>

        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Sheduler Service Window</span>
        </button>
      </div>

      {/* Metrics widgets */}
      <div className="grid grid-cols-3 gap-4 select-none">
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Aggregated Cost Estimation</span>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">${totals.exp.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <span className="text-[9px] text-blue-600 bg-blue-50/80 px-1.5 py-0.5 border border-blue-150 rounded font-bold mt-1 inline-block">Active Allocations</span>
        </div>
        
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Overdue Inspections</span>
          <div className="text-xl font-extrabold font-mono text-rose-600 mt-1">{totals.overdueCount} Grounded</div>
          <span className="text-[9px] text-rose-650 bg-rose-50/80 px-1.5 py-0.5 border border-rose-150 rounded font-bold mt-1 inline-block">Actions Needed ASAP</span>
        </div>

        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Schedules Booked</span>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">{totals.scheduledCount} Vehicles</div>
          <span className="text-[9px] text-zinc-600 bg-zinc-50/80 px-1.5 py-0.5 border border-zinc-200 rounded font-bold mt-1 inline-block font-mono">Center City Depot</span>
        </div>
      </div>

      {/* Tab filter and ledger grids */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        
        {/* Dynamic Nav items */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
          <div className="flex bg-slate-200 p-1 rounded-lg text-xs font-sans max-w-sm shrink-0">
            {[
              { id: 'All', label: 'All Audits' },
              { id: 'Scheduled', label: 'Scheduled' },
              { id: 'Due', label: 'Due / In Window' },
              { id: 'Overdue', label: 'Grounded / Overdue' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-md font-bold text-xs whitespace-nowrap transition cursor-pointer ${
                  activeFilter === tab.id 
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
                placeholder="Search by model, license plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 pl-9 pr-4 py-1.5 rounded-lg text-xs focus:outline-none focus:border-blue-450 text-slate-700"
              />
            </div>
            {selectedIds.length > 0 && (
              <button
                onClick={() => {
                  if (confirm(`Delete the ${selectedIds.length} selected maintenance logs?`)) {
                    setInspections(prev => prev.filter(ins => !selectedIds.includes(ins.id)));
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

        {/* Inspections list ledger code */}
        <div className="overflow-x-auto">
          {filteredInspec.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-sans space-y-2 select-none">
              <div className="text-3xl">🔧</div>
              <p className="font-semibold text-slate-705 text-sm">No inspections match filter</p>
              <p className="text-xs text-slate-400">All preventative fluid and tread checks are cleared within limits.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold border-b border-slate-200 select-none">
                <tr>
                  <th className="px-4 py-2.5 w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded text-blue-500 focus:ring-blue-400"
                      checked={filteredInspec.length > 0 && selectedIds.length === filteredInspec.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(filteredInspec.map(ins => ins.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-2.5">Schedule ID</th>
                  <th className="px-4 py-2.5">Vehicle License</th>
                  <th className="px-4 py-2.5">Model</th>
                  <th className="px-4 py-2.5">Service Classification</th>
                  <th className="px-4 py-2.5">Last Odometer log</th>
                  <th className="px-4 py-2.5">Deadline date</th>
                  <th className="px-4 py-2.5 text-right">Estimated Cost</th>
                  <th className="px-4 py-2.5 font-semibold">Grounded Status</th>
                  <th className="px-4 py-2.5 text-right">Ledger Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs text-slate-600 divide-y divide-slate-100 select-none">
                {filteredInspec.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3.5 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded text-blue-505" 
                        checked={selectedIds.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(prev => [...prev, item.id]);
                          } else {
                            setSelectedIds(prev => prev.filter(id => id !== item.id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-500">{item.id}</td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-700">{item.vehiclePlate}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-800">{item.vehicleModel}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-blue-50 text-blue-750 border border-blue-150">
                        {item.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-550">{item.currentMileage.toLocaleString()} km</td>
                    <td className="px-4 py-3.5 font-mono font-semibold text-slate-800">{item.dueDate}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-extrabold text-slate-900">${item.estimatedCost.toFixed(2)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        item.status === 'Scheduled' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                        item.status === 'Due Soon' ? 'bg-amber-50 text-amber-700 border border-amber-150' :
                        item.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border border-rose-150 animate-pulse' :
                        'bg-blue-50 text-blue-700 border border-blue-150'
                      }`}>
                        {item.status === 'Overdue' ? <AlertTriangle className="w-3 h-3 text-rose-505" /> : <Clock className="w-3 h-3 animate-pulse" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleCompleteIns(item.id)}
                          className="bg-green-50 hover:bg-green-105 hover:text-green-700 text-green-600 px-2 py-1.5 rounded text-[10px] font-bold border border-green-150 transition"
                          title="Register completion & release car"
                        >
                          Mark Completed
                        </button>
                        <button 
                          onClick={() => alert(`Reviewing diagnostic details for: ${item.vehicleModel}\nNote: ${item.technicianNotes || 'None'}`)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500"
                        >
                          <FileText className="w-3.5 h-3.5" />
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

      {/* CREATE SERVICE SCHEDULE MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Schedule Preventative Window</h3>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 text-xs font-mono">✕</button>
            </div>
            
            <form onSubmit={handleCreateInspection} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">Vehicle Model Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. BMW 650 i Coupe Sport" 
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">License Plate ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. PHL-113B" 
                    required
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Last Mileage parameter (km)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 120500" 
                    required
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Inspection category</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  >
                    <option value="Oil & Filter">Oil & Filter Change</option>
                    <option value="Brake Pads">Brake Calipers & Pads</option>
                    <option value="Tire Rotation">Tire Rotation / balance</option>
                    <option value="State Emission">PA State Emission Certification</option>
                    <option value="Hybrid Battery Clean">Hybrid battery servicing</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Service Deadline</label>
                  <input 
                    type="date" 
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Estimated cost ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  required
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">Administrative diagnostics notes</label>
                <textarea 
                  rows={2}
                  placeholder="Add details of visual wear or diagnostic warning alarms..."
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
                  Sheduler Window
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
