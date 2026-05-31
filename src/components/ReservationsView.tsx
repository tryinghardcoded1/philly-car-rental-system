/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Calendar, 
  SlidersHorizontal,
  ChevronDown,
  CheckCircle,
  Eye,
  Trash2,
  FileCheck2,
  User,
  DollarSign,
  UploadCloud
} from 'lucide-react';
import { Reservation, Vehicle } from '../types';

interface ReservationsViewProps {
  reservations: Reservation[];
  vehicles: Vehicle[];
  onAddReservation: (res: Reservation) => void;
  onUpdateStatus: (id: string, newStatus: any) => void;
  onDeleteReservation: (id: string) => void;
  onDeleteReservations: (ids: string[]) => void;
  onTriggerImport?: () => void;
}

export default function ReservationsView({ 
  reservations, 
  vehicles, 
  onAddReservation,
  onUpdateStatus,
  onDeleteReservation,
  onDeleteReservations,
  onTriggerImport
}: ReservationsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'TodayReturns' | 'TomorrowPickups' | 'TodayPickups' | 'OnRent' | 'Completed' | 'Cancelled' | 'Outstanding'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // New reservation form state
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newPickupDate, setNewPickupDate] = useState('2026-06-01 10:00');
  const [newReturnDate, setNewReturnDate] = useState('2026-06-15 10:00');
  const [newPickupLocation, setNewPickupLocation] = useState('Office');
  const [newVehicleClass, setNewVehicleClass] = useState('Premium');
  const [newAssignedVehicle, setNewAssignedVehicle] = useState('');
  const [newPrice, setNewPrice] = useState('750.00');
  const [newOutstanding, setNewOutstanding] = useState('750.00');
  const [newStatus, setNewStatus] = useState<'Open' | 'Quote' | 'Pending'>('Open');

  // Filter logic based on HQ Tabs in screenshot
  const filterReservations = () => {
    let list = reservations;
    
    // search
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      list = list.filter(r => 
        r.customerName.toLowerCase().includes(term) ||
        r.customerEmail.toLowerCase().includes(term) ||
        r.id.includes(term) ||
        r.vehicleClass.toLowerCase().includes(term)
      );
    }

    // tabs
    const today = '2026-05-31'; // Simulated current date from environment context
    const tomorrow = '2026-06-01';

    switch (activeTab) {
      case 'TodayReturns':
        return list.filter(r => r.returnDate.startsWith(today));
      case 'TomorrowPickups':
        return list.filter(r => r.pickupDate.startsWith(tomorrow));
      case 'TodayPickups':
        return list.filter(r => r.pickupDate.startsWith(today));
      case 'OnRent':
        return list.filter(r => r.status === 'Open' && r.assignedVehicleId);
      case 'Completed':
        return list.filter(r => r.status === 'Checked In');
      case 'Cancelled':
        return list.filter(r => r.status === 'Canceled');
      case 'Outstanding':
        return list.filter(r => r.outstandingBalance > 0);
      case 'All':
      default:
        return list;
    }
  };

  const filteredList = filterReservations();

  // Sum valuations for bottom total row exactly like screenshot #2
  const sumPrice = filteredList.reduce((sum, r) => sum + r.totalPrice, 0);
  const sumRevenue = filteredList.reduce((sum, r) => sum + r.totalRevenue, 0);
  const sumPaid = filteredList.reduce((sum, r) => sum + r.totalPaid, 0);
  const sumRefunded = filteredList.reduce((sum, r) => sum + r.totalRefunded, 0);
  const sumOutstanding = filteredList.reduce((sum, r) => sum + r.outstandingBalance, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustEmail) return;

    const priceNum = parseFloat(newPrice) || 0;
    const revNum = priceNum * 0.95; // default 5% service commission
    const outNum = parseFloat(newOutstanding) || 0;
    const paidNum = priceNum - outNum;

    const newRes: Reservation = {
      id: (reservations.length + 51).toString(),
      customerName: newCustName,
      customerEmail: newCustEmail,
      customerPhone: newCustPhone,
      pickupDate: newPickupDate,
      returnDate: newReturnDate,
      pickupLocation: newPickupLocation,
      returnLocation: newPickupLocation,
      vehicleClass: newVehicleClass,
      assignedVehicleId: newAssignedVehicle || undefined,
      totalPrice: priceNum,
      totalRevenue: revNum,
      totalPaid: paidNum,
      totalRefunded: 0,
      outstandingBalance: outNum,
      status: newStatus as any,
      digitalAgreementSigned: false,
      contractType: 'Short-Term'
    };

    onAddReservation(newRes);
    setShowAddModal(false);
    // reset
    setNewCustName('');
    setNewCustEmail('');
    setNewCustPhone('');
  };

  return (
    <div className="space-y-6">
      
      {/* Upper header action area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Reservations Ledger</h1>
          <p className="text-sm text-slate-500 font-sans mt-0.5">Manage active bookings, vehicle handovers, and collect payments.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto select-none">
          {onTriggerImport && (
            <button 
              onClick={onTriggerImport}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-2 text-xs font-sans font-semibold rounded-lg transition shadow-2xs cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-blue-500" />
              <span>Import CSV</span>
            </button>
          )}
          <button 
            onClick={() => setActiveTab('All')}
            className="px-3.5 py-2 text-xs font-sans font-medium text-slate-600 bg-white border border-slate-200/80 rounded-lg hover:bg-slate-50 transition"
          >
            Availability Check
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-3.5 py-2 text-xs font-sans font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* Grid Tabs with Professional Polish styling */}
      <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-nowrap overflow-x-auto gap-1 text-sm font-sans no-scrollbar">
          {[
            { id: 'All', label: 'All Booking Logs' },
            { id: 'TodayReturns', label: "Today's Returns" },
            { id: 'TomorrowPickups', label: "Tomorrow's Pickups" },
            { id: 'TodayPickups', label: "Today's Pickups" },
            { id: 'OnRent', label: 'On Rent' },
            { id: 'Completed', label: 'Completed' },
            { id: 'Cancelled', label: 'Canceled' },
            { id: 'Outstanding', label: 'Outstanding Balance' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Live search box */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Search by customer name, email, booking class, or reservation ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white pl-10 pr-4 py-2.5 text-sm font-sans rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {selectedIds.length > 0 && (
            <button
              onClick={() => {
                if (confirm(`Delete the ${selectedIds.length} selected reservations?`)) {
                  onDeleteReservations(selectedIds);
                  setSelectedIds([]);
                }
              }}
              className="flex items-center gap-1 bg-red-650 text-white px-3.5 py-2 text-xs font-sans font-semibold rounded-lg hover:bg-red-750 transition shadow-sm cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}
          <span className="text-xs text-slate-400 font-mono">Count: {filteredList.length}</span>
        </div>
      </div>

      {/* Table Module matching screenshot 2 exactly */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-slate-50/75 text-slate-500 border-b border-slate-200 text-xs font-bold font-sans uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center">
                <input 
                  type="checkbox" 
                  className="rounded text-blue-500 focus:ring-blue-400" 
                  checked={filteredList.length > 0 && selectedIds.length === filteredList.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(filteredList.map(r => r.id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                />
              </th>
              <th className="py-3 px-3 w-16">#</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Pickup Date</th>
              <th className="py-3 px-4">Return Date</th>
              <th className="py-3 px-4">Pickup Loc</th>
              <th className="py-3 px-4">Vehicle Class</th>
              <th className="py-3 px-4">Vehicle Model</th>
              <th className="py-3 px-3 text-right">Total Price</th>
              <th className="py-3 px-3 text-right">Total Rev</th>
              <th className="py-3 px-3 text-right">Total Paid</th>
              <th className="py-3 px-3 text-right">Refunded</th>
              <th className="py-3 px-3 text-right">Outstanding</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm font-sans divide-y divide-slate-100">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={15} className="py-8 text-center text-slate-400 font-sans">
                  No matching reservations found under current search criteria.
                </td>
              </tr>
            ) : (
              filteredList.map((res) => {
                const assignedVehicle = vehicles.find(v => v.id === res.assignedVehicleId);
                return (
                  <tr key={res.id} className="hover:bg-slate-50/50 transition duration-150 align-middle">
                    <td className="py-3.5 px-4 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded text-blue-500 focus:ring-blue-500" 
                        checked={selectedIds.includes(res.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(prev => [...prev, res.id]);
                          } else {
                            setSelectedIds(prev => prev.filter(id => id !== res.id));
                          }
                        }}
                      />
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs text-slate-400">
                      {res.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-semibold text-slate-950 text-blue-600 hover:underline cursor-pointer">{res.customerName}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{res.customerEmail}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                      {res.pickupDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                      {res.returnDate}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {res.pickupLocation}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                        {res.vehicleClass}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                      {assignedVehicle ? (
                        <div className="flex items-center gap-1.5 text-blue-600 font-semibold bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          {assignedVehicle.model}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-normal italic">Not Assigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right font-semibold font-mono text-slate-800">
                      ${res.totalPrice.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-[13px] text-slate-500">
                      ${res.totalRevenue.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-[13px] text-emerald-600">
                      ${res.totalPaid.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-[13px] text-rose-500">
                      ${res.totalRefunded.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-semibold font-mono text-amber-600">
                      ${res.outstandingBalance.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <select
                        value={res.status}
                        onChange={(e) => onUpdateStatus(res.id, e.target.value as any)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none transition ${
                          res.status === 'Open' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                          res.status === 'Quote' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                          res.status === 'Checked In' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          res.status === 'Canceled' ? 'bg-slate-50 text-slate-500 border-slate-200' :
                          'bg-blue-50 text-blue-600 border-blue-200'
                        }`}
                      >
                        <option value="Open">Open</option>
                        <option value="Quote">Quote</option>
                        <option value="Checked In">Checked In</option>
                        <option value="Canceled">Canceled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => onUpdateStatus(res.id, 'Checked In')} 
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Complete Booking"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDeleteReservation(res.id)} 
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {/* Dynamic Footer Row matching screenshot 2 exactly */}
          {filteredList.length > 0 && (
            <tfoot>
              <tr className="bg-slate-100 font-mono font-bold text-slate-800 text-sm border-t-2 border-slate-200">
                <td className="py-4 px-4 text-center"></td>
                <td colSpan={7} className="py-4 px-4 text-right pr-8 font-sans font-bold">
                  Page Summary Valuation:
                </td>
                <td className="py-4 px-3 text-right font-mono">${sumPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="py-4 px-3 text-right font-mono font-medium text-slate-600">${sumRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="py-4 px-3 text-right font-mono text-emerald-700">${sumPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="py-4 px-3 text-right font-mono text-rose-600">${sumRefunded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="py-4 px-3 text-right font-mono text-amber-700">${sumOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td colSpan={2} className="py-4 px-4"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Add Booking Modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold font-sans text-slate-900">Create New Rental Contract</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Customer Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Kristian Kutch"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="w-full text-sm font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Customer Email</label>
                  <input 
                    type="email" 
                    required
                    placeholder="name@gmail.com"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    className="w-full text-sm font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="215-555-xxxx"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    className="w-full text-sm font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Vehicle Class</label>
                  <select 
                    value={newVehicleClass}
                    onChange={(e) => setNewVehicleClass(e.target.value)}
                    className="w-full text-sm font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  <label className="text-xs font-semibold text-slate-500 uppercase">Pickup Date/Time</label>
                  <input 
                    type="text" 
                    value={newPickupDate}
                    onChange={(e) => setNewPickupDate(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Return Date/Time</label>
                  <input 
                    type="text" 
                    value={newReturnDate}
                    onChange={(e) => setNewReturnDate(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Handoff Assigned Car</label>
                  <select 
                    value={newAssignedVehicle}
                    onChange={(e) => setNewAssignedVehicle(e.target.value)}
                    className="w-full text-sm font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- No Vehicle Assigned --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.model} ({v.licensePlate})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Booking Status</label>
                  <select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full text-sm font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Open">Open</option>
                    <option value="Quote">Quote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Contract Total Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => {
                      setNewPrice(e.target.value);
                      setNewOutstanding(e.target.value);
                    }}
                    className="w-full text-sm font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Outstanding Balance ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newOutstanding}
                    onChange={(e) => setNewOutstanding(e.target.value)}
                    className="w-full text-sm font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-sans font-medium text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-xs font-sans font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                  Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
