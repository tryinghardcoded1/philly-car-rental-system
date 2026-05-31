/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CalendarRange, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  MapPin, 
  Clock, 
  User, 
  Car,
  Filter,
  Sparkles
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  type: 'Pickup' | 'Return' | 'Maintenance';
  title: string;
  client: string;
  vehicle: string;
  location: string;
  time: string;
  dateKey: number; // Day of the current month
  status: 'Pending' | 'Completed' | 'Delayed';
}

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState('May 2026');
  const [selectedDay, setSelectedDay] = useState<number>(31);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Pickup' | 'Return' | 'Maintenance'>('All');

  // Hardcoded calendar events reflecting Philly headquarters operations
  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: 'E1', type: 'Pickup', title: 'Check-out Premium Roadster', client: 'Kristian Kutch', vehicle: 'BMW 650i (V2)', location: 'Philadelphia NW Hub', time: '10:00 AM', dateKey: 12, status: 'Completed' },
    { id: 'E2', type: 'Return', title: 'Check-in Off-Road Expedition', client: 'Sam T. (Recovered)', vehicle: 'EXTREME RV (V4)', location: 'Center City Philadelphia Offsite', time: '04:30 PM', dateKey: 15, status: 'Completed' },
    { id: 'E3', type: 'Maintenance', title: 'Preventative Brakes & Alignment Check', client: 'Tech Depot', vehicle: 'Volvo 850 (V1)', location: 'Fishtown Repair Depot', time: '08:00 AM', dateKey: 5, status: 'Completed' },
    { id: 'E4', type: 'Pickup', title: 'Lease Checkout Standard Hybrid', client: 'Precious Terry', vehicle: 'Renault Super 5 (V3)', location: 'Philadelphia NW Hub', time: '11:15 AM', dateKey: 1, status: 'Completed' },
    { id: 'E5', type: 'Return', title: 'Check-in Family SUV Return', client: 'Lucas Flatley', vehicle: 'BMW 650i (V2)', location: 'Philadelphia NW Hub', time: '02:00 PM', dateKey: 31, status: 'Pending' },
    { id: 'E6', type: 'Pickup', title: 'Check-out Enterprise Utility Lease', client: 'Joanne Reynolds', vehicle: 'Volvo 850 (V1)', location: 'Fishtown Corporate Hub', time: '09:30 AM', dateKey: 31, status: 'Pending' },
    { id: 'E7', type: 'Maintenance', title: 'OBD Coolant Error Overhaul', client: 'Mechanic Main', vehicle: 'Toyota Prius (V5)', location: 'Fishtown Repair Depot', time: '12:00 PM', dateKey: 31, status: 'Pending' },
    { id: 'E8', type: 'Pickup', title: 'Check-out Standard Hybrid', client: 'Quinn Harper', vehicle: 'Toyota Prius (V5)', location: 'Philadelphia NW Hub', time: '03:45 PM', dateKey: 20, status: 'Completed' },
  ]);

  // Calendar parameters for May 2026 (starts on a Friday, 31 days)
  const prevMonthDays = 4; // April days to show as overlap (Mon-Thur)
  const currentMonthLength = 31;
  const daysArray: (number | null)[] = [];
  
  // Padding for starting day (Friday)
  for (let i = 27; i <= 30; i++) {
    daysArray.push(null); // represent April overlap
  }
  for (let idx = 1; idx <= currentMonthLength; idx++) {
    daysArray.push(idx);
  }

  // Filtered list of events mapping to selectedDay plus the category filters
  const selectedDayEvents = events.filter(e => {
    const matchesDay = e.dateKey === selectedDay;
    const matchesCategory = activeFilter === 'All' || e.type === activeFilter;
    return matchesDay && matchesCategory;
  });

  // Calculate count of events per category for current day
  const getEventCountForTypeAndDay = (day: number, type: 'Pickup' | 'Return' | 'Maintenance') => {
    return events.filter(e => e.dateKey === day && e.type === type).length;
  };

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-sans tracking-tight">Center City Dispatch Calendar</h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">Visually coordinate active customer handovers, vehicle dropoffs, and preventative diagnostics across Philly fleets.</p>
        </div>

        {/* Categories / Legend toggles */}
        <div className="flex bg-slate-200 p-1 rounded-lg text-xs font-sans self-start sm:self-auto select-none">
          {[
            { id: 'All', label: 'All Operations' },
            { id: 'Pickup', label: 'Pickups' },
            { id: 'Return', label: 'Returns' },
            { id: 'Maintenance', label: 'Maintenance' }
          ].map(tag => (
            <button
              key={tag.id}
              onClick={() => setActiveFilter(tag.id as any)}
              className={`px-3 py-1.5 rounded-md font-bold text-xs transition cursor-pointer ${
                activeFilter === tag.id 
                  ? 'bg-white text-slate-900 shadow-3xs border border-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Layout Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Aspect: The Month Grid scheduler */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col p-4">
          
          {/* Calendar Header with month slider */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 select-none">
            <h3 className="font-bold text-slate-800 text-sm font-sans flex items-center gap-2">
              <CalendarRange className="w-4 h-4 text-blue-505" />
              <span>{currentMonth}</span>
            </h3>
            <div className="flex gap-1.5">
              <button 
                onClick={() => alert('Dispatch calendar is optimized for active May 2026 operations.')}
                className="p-1 hover:bg-slate-100 rounded border border-slate-200 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
              </button>
              <button 
                onClick={() => alert('Future dispatch cycles will sync on the start of June 2026.')}
                className="p-1 hover:bg-slate-100 rounded border border-slate-200 transition"
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Weekday titles */}
          <div className="grid grid-cols-7 gap-1 text-center py-2 text-[10px] uppercase font-bold text-slate-400 select-none border-b border-slate-50">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 mt-1 flex-1">
            {daysArray.map((day, idx) => {
              if (day === null) {
                return (
                  <div key={`empty-${idx}`} className="bg-slate-50/50 min-h-[70px] p-1 border border-slate-100/50 rounded-lg text-slate-300 text-right text-[10px] font-mono">
                    April
                  </div>
                );
              }

              const isSelected = selectedDay === day;
              const payouts = getEventCountForTypeAndDay(day, 'Pickup');
              const checkins = getEventCountForTypeAndDay(day, 'Return');
              const maint = getEventCountForTypeAndDay(day, 'Maintenance');
              const hasEvents = payouts > 0 || checkins > 0 || maint > 0;

              return (
                <div 
                  key={`day-${day}`}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[72px] p-1.5 border rounded-xl flex flex-col justify-between transition relative cursor-pointer select-none ${
                    isSelected 
                      ? 'bg-blue-50/50 border-blue-500/80 text-blue-900 shadow-2xs' 
                      : 'bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50/30 text-slate-800'
                  }`}
                >
                  <span className={`text-[11px] font-mono font-bold text-right block self-end rounded-full w-5 h-5 flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white font-extrabold' : 'text-slate-400'}`}>
                    {day}
                  </span>

                  {/* Indicator Ticks inside day Cell */}
                  <div className="space-y-0.5 mt-1">
                    {payouts > 0 && (
                      <div className="text-[9px] bg-sky-50 text-sky-700 font-extrabold px-1 rounded truncate leading-normal flex items-center gap-0.5 max-w-full">
                        <span className="w-1 h-1 bg-sky-500 rounded-full" />
                        <span>{payouts} Pickup{payouts > 1 && 's'}</span>
                      </div>
                    )}
                    {checkins > 0 && (
                      <div className="text-[9px] bg-green-50 text-green-700 font-extrabold px-1 rounded truncate leading-normal flex items-center gap-0.5 max-w-full">
                        <span className="w-1 h-1 bg-green-500 rounded-full" />
                        <span>{checkins} Return{checkins > 1 && 's'}</span>
                      </div>
                    )}
                    {maint > 0 && (
                      <div className="text-[9px] bg-amber-50 text-amber-700 font-extrabold px-1 rounded truncate leading-normal flex items-center gap-0.5 max-w-full">
                        <span className="w-1 h-1 bg-amber-500 rounded-full" />
                        <span>{maint} Service</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Aspect: Detailed daily Dispatch Agenda List */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col p-4 space-y-4">
          
          <div className="pb-2 border-b border-slate-100 flex items-center justify-between select-none">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Dispatch Agenda</span>
              <h4 className="font-bold text-slate-800 text-xs">May {selectedDay}, 2026</h4>
            </div>
            
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold border border-slate-200">
              {selectedDayEvents.length} Event{selectedDayEvents.length !== 1 && 's'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 min-h-[300px]">
            {selectedDayEvents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-sans space-y-2 select-none py-12">
                <div className="text-2xl text-slate-350">🏖️</div>
                <p className="font-semibold text-slate-605 text-xs">No active handovers scheduled</p>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto">Click other calendar dates (like May 12, May 15, or May 31) to inspect booked actions.</p>
              </div>
            ) : (
              selectedDayEvents.map(event => (
                <div 
                  key={event.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    event.type === 'Pickup' ? 'bg-sky-50/50 border-sky-100' :
                    event.type === 'Return' ? 'bg-green-50/50 border-green-100' :
                    'bg-amber-50/50 border-amber-100'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 font-mono rounded ${
                      event.type === 'Pickup' ? 'bg-sky-200/60 text-sky-800' :
                      event.type === 'Return' ? 'bg-green-200/60 text-green-800' :
                      'bg-amber-200/60 text-amber-800'
                    }`}>
                      {event.type.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">{event.time}</span>
                  </div>

                  <h5 className="font-bold text-slate-800 text-xs mt-2 font-sans">{event.title}</h5>
                  
                  <div className="space-y-1 mt-2.5 text-[11px] text-slate-600 font-sans">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Client: <strong className="text-slate-800">{event.client}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Vehicle: <strong className="text-slate-800 font-mono">{event.vehicle}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between select-none">
                    <span className="text-[10px] text-slate-400">Order Ref: #{event.id}</span>
                    <button 
                      onClick={() => alert(`Operational handover event #${event.id} marked as authorized & signed by philly.`)}
                      className="text-[10px] bg-slate-900 border border-slate-950 text-white hover:bg-slate-800 transition font-bold px-2 py-1 rounded"
                    >
                      Process Log
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Guidelines box */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-normal flex gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p>Handovers require active identity scans (checked in **CRM Verification**) and a completed digital damage claim waiver beforehand.</p>
          </div>

        </div>

      </div>

    </div>
  );
}
