/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Car, 
  Activity, 
  TrendingUp, 
  Users, 
  Wrench, 
  ShieldAlert, 
  Clock, 
  MapPin, 
  Gauge,
  Sliders,
  ChevronRight,
  Database
} from 'lucide-react';
import { Vehicle, Customer, Reservation, InsuranceClaim } from '../types';

interface DashboardViewProps {
  vehicles: Vehicle[];
  customers: Customer[];
  reservations: Reservation[];
  claims: InsuranceClaim[];
  finesCount: number;
}

export default function DashboardView({ 
  vehicles, 
  customers, 
  reservations, 
  claims, 
  finesCount 
}: DashboardViewProps) {
  const [crmMetric, setCrmMetric] = useState<'duration' | 'payments'>('payments');
  const [selectedTelemetryVehicle, setSelectedTelemetryVehicle] = useState<Vehicle>(vehicles[0] || {} as Vehicle);
  
  // Real-time telematics simulator state
  const [liveSpeed, setLiveSpeed] = useState<number>(45);
  const [liveRpm, setLiveRpm] = useState<number>(2100);

  // Simulated GPS trace coordinates on a canvas-style map element
  const [gpsDotOffset, setGpsDotOffset] = useState({ x: 120, y: 70 });

  // Sync selected telemetry vehicle when list of vehicles changes
  useEffect(() => {
    if (vehicles.length > 0) {
      const exists = vehicles.find(v => v.id === selectedTelemetryVehicle.id);
      if (!exists) {
        setSelectedTelemetryVehicle(vehicles[0]);
      }
    } else {
      setSelectedTelemetryVehicle({} as Vehicle);
    }
  }, [vehicles, selectedTelemetryVehicle.id]);

  useEffect(() => {
    if (!selectedTelemetryVehicle || !selectedTelemetryVehicle.id) return;
    setLiveSpeed(selectedTelemetryVehicle.telemetryStream?.[0]?.speed || 40);
    setLiveRpm(selectedTelemetryVehicle.telemetryStream?.[0]?.rpm || 1900);
  }, [selectedTelemetryVehicle]);

  // Telemetry fluctuation simulator
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedTelemetryVehicle.status === 'Rented') {
        setLiveSpeed(prev => {
          const delta = Math.floor(Math.random() * 9) - 4;
          const next = Math.max(10, Math.min(125, prev + delta));
          return next;
        });
        setLiveRpm(prev => {
          const delta = Math.floor(Math.random() * 201) - 100;
          const next = Math.max(800, Math.min(4500, prev + delta));
          return next;
        });
        setGpsDotOffset(prev => ({
          x: Math.max(20, Math.min(280, prev.x + (Math.random() * 4 - 2))),
          y: Math.max(20, Math.min(180, prev.y + (Math.random() * 4 - 2)))
        }));
      } else {
        setLiveSpeed(0);
        setLiveRpm(selectedTelemetryVehicle.status === 'Maintenance' ? 0 : 750); // idling if available/hold
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [selectedTelemetryVehicle]);

  // Compute stats
  const totalFleetSize = vehicles.length;
  const activeRentals = vehicles.filter(v => v.status === 'Rented').length;
  const fleetUtilization = totalFleetSize > 0 ? Math.round((activeRentals / totalFleetSize) * 100) : 0;
  
  const totalOutstandingBalance = reservations.reduce((sum, r) => sum + (r.outstandingBalance || 0), 0);
  const activeClaimsCount = claims.filter(c => c.claimResolutionStatus !== 'Settled' && c.claimResolutionStatus !== 'Rejected').length;

  const totalPaymentsSecured = customers.reduce((sum, c) => sum + c.totalPaid, 0);

  // CRM dynamic queries: top 10 customers based on rule
  const queryTopTierCustomers = (): Customer[] => {
    return [...customers]
      .sort((a, b) => {
        if (crmMetric === 'payments') {
          return b.totalPaid - a.totalPaid;
        } else {
          return b.totalDurationDays - a.totalDurationDays;
        }
      })
      .slice(0, 10);
  };

  const topTierList = queryTopTierCustomers();

  return (
    <div className="space-y-6">
      {/* Upper Title and Overview Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-slate-900">Operational Overview</h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">Real-time status monitor of Philly branch fleet telematics, risk events, and billing ledgers.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs md:self-end">
          <Database className="w-3.5 h-3.5 text-blue-505" />
          <span>SCHEMA NORMALIZED • TELEMETRY ACTIVE</span>
        </div>
      </div>

      {/* Grid of Key Tickers with Professional Polish details */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Available Fleet</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-2xl font-extrabold font-mono text-slate-950">{totalFleetSize - activeRentals} <span className="text-xs font-normal text-slate-405">/ {totalFleetSize}</span></p>
            <span className="text-[10px] text-green-700 bg-green-50/80 px-2 py-0.5 border border-green-200/50 rounded font-mono font-bold">
              {Math.round(((totalFleetSize - activeRentals) / (totalFleetSize || 1)) * 100)}% Free
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Secured Volume</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-2xl font-extrabold font-mono text-slate-950">${Math.round(totalPaymentsSecured / 1000)}k</p>
            <span className="text-[10px] text-blue-700 bg-blue-50/80 px-2 py-0.5 border border-blue-200/50 rounded font-mono font-bold">
              Cleared
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Outstanding</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-2xl font-extrabold font-mono text-slate-950">${Math.round(totalOutstandingBalance / 1000)}k</p>
            <span className="text-[10px] text-amber-700 bg-amber-50/80 px-2 py-0.5 border border-amber-200/50 rounded font-mono font-bold font-medium font-bold">
              Pending
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Open Claims</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-2xl font-extrabold font-mono text-slate-950">0{activeClaimsCount}</p>
            <span className="text-[10px] text-rose-700 bg-rose-50/80 px-2 py-0.5 border border-rose-200/50 rounded font-bold">
              Review
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active Fines</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-2xl font-extrabold font-mono text-slate-950">0{finesCount}</p>
            <span className="text-[10px] text-indigo-700 bg-indigo-50/80 px-2 py-0.5 border border-indigo-200/50 rounded font-mono font-bold">
              Offenses
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: CRM Analytics Scoreboard & OBD Telematics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: CRM Advanced Analytics (Top-Tier Clients querying) - 7 spans */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900 font-sans">CRM Advanced Analytics</h2>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">Query and identify the top 10 premium clients dynamically.</p>
            </div>
            {/* Filter Toggle Mode */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs shrink-0 inline-flex self-start">
              <button 
                onClick={() => setCrmMetric('payments')}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  crmMetric === 'payments' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Top Paying ($)
              </button>
              <button 
                onClick={() => setCrmMetric('duration')}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  crmMetric === 'duration' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Rented Longest (Days)
              </button>
            </div>
          </div>

          {/* CRM Scoreboard */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans border-b border-slate-100 pb-3">
                  <th className="py-2.5 pl-2">Rank</th>
                  <th className="py-2.5">Customer Name</th>
                  <th className="py-2.5">Driver License</th>
                  <th className="py-2.5">Rental Span</th>
                  <th className="py-2.5 text-right pr-2">Total Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 font-sans text-sm">
                {topTierList.map((client, idx) => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 pl-2 shrink-0">
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium ${
                        idx === 0 ? 'bg-amber-100 text-amber-700 font-bold border border-amber-200' :
                        idx === 1 ? 'bg-slate-100 text-slate-700 font-bold border border-slate-200' :
                        idx === 2 ? 'bg-amber-50 text-amber-800 font-semibold' :
                        'text-slate-500'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-slate-900">
                      <div>
                        <div>{client.name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{client.email}</div>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-xs text-slate-500">{client.driverLicense}</td>
                    <td className="py-3 font-mono text-xs">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-medium">
                        {client.totalDurationDays} Days Active
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2 font-semibold text-slate-900 font-mono">
                      ${client.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Fleet OBD Telematics & Diagnostics - 5 spans */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900 font-sans">Live OBD Diagnostics</h2>
              </div>
              {/* Selector */}
              {vehicles.length > 0 && (
                <select 
                  value={selectedTelemetryVehicle.id || ''}
                  onChange={(e) => {
                    const found = vehicles.find(v => v.id === e.target.value);
                    if (found) setSelectedTelemetryVehicle(found);
                  }}
                  className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-700 font-sans focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.id === 'V5' ? `⚠️ ${v.model}` : v.model}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedTelemetryVehicle && selectedTelemetryVehicle.id ? (
              /* Simulated Live Display */
              <div className="mt-5 space-y-4">
                
                {/* Styled Mock Vector GPS Map box */}
                <div className="bg-slate-950 h-44 rounded-xl relative overflow-hidden flex flex-col justify-between p-3 border border-slate-800">
                  {/* Simulated contour design elements representing street grid */}
                  <svg className="absolute inset-0 w-full h-full text-slate-900/30 opacity-60" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,20 Q120,40 300,10 M40,0 L80,180 M220,0 L200,180 M0,100 L300,130" stroke="currentColor" strokeWidth="2" fill="none" />
                    <circle cx="100" cy="50" r="40" stroke="currentColor" strokeWidth="1" strokeDasharray="3" fill="none" />
                    <circle cx="200" cy="110" r="60" stroke="currentColor" strokeWidth="1" strokeDasharray="3" fill="none" />
                  </svg>

                  <div className="z-10 flex justify-between items-start">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono leading-none bg-emerald-500/20 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        GPS STREAM ACTIVE
                      </span>
                      <h4 className="text-white text-xs font-semibold mt-1 font-sans">{selectedTelemetryVehicle.model}</h4>
                      <span className="text-[10px] text-slate-400 font-mono tracking-tight">{selectedTelemetryVehicle.licensePlate}</span>
                    </div>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-900/40">
                      Philly Center-City
                    </span>
                  </div>

                  {/* Animated Vehicle Location Node on Vector Map */}
                  <div 
                    className="absolute transition-all duration-1000 ease-in-out"
                    style={{ left: `${gpsDotOffset.x}px`, top: `${gpsDotOffset.y}px` }}
                  >
                    <div className="w-4 h-4 rounded-full bg-blue-500/40 border border-blue-400 flex items-center justify-center animate-pulse">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    </div>
                    {selectedTelemetryVehicle.lastLocation && (
                      <div className="absolute top-4 left-4 bg-slate-900/90 text-white text-[9px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap shadow border border-slate-800">
                        Lat: {selectedTelemetryVehicle.lastLocation.lat.toFixed(4)}
                      </div>
                    )}
                  </div>

                  <div className="z-10 flex justify-between items-end text-[10px] font-mono text-slate-400">
                    <span>GPS Traced: {selectedTelemetryVehicle.lastLocation?.address || 'N/A'}</span>
                    <span className="text-white">{(selectedTelemetryVehicle.mileage || 0).toLocaleString()} km</span>
                  </div>
                </div>

                {/* Engine Metrics & Gauges */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-center">
                    <div className="text-slate-400 text-[10px] font-sans font-medium uppercase">Live Speed</div>
                    <div className="text-lg font-bold text-slate-800 mt-1 font-mono">{liveSpeed} <span className="text-xs font-normal">km/h</span></div>
                    <div className="text-[9px] font-mono mt-0.5 text-slate-400">OBD Bus PID 0D</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-center">
                    <div className="text-slate-405 text-[10px] font-sans font-medium uppercase">Engine Speed</div>
                    <div className="text-lg font-bold text-slate-800 mt-1 font-mono">{liveRpm} <span className="text-xs font-normal">RPM</span></div>
                    <div className="text-[9px] font-mono mt-0.5 text-slate-400">OBD Bus PID 0C</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-center">
                    <div className="text-slate-440 text-[10px] font-sans font-medium uppercase">Fuel Level</div>
                    <div className={`text-lg font-bold mt-1 font-mono ${
                      (selectedTelemetryVehicle.fuelLevel || 0) < 30 ? 'text-rose-600' : 'text-slate-800'
                    }`}>{selectedTelemetryVehicle.fuelLevel || 0}%</div>
                    <div className="text-[9px] font-mono mt-0.5 text-slate-400">PID 2F</div>
                  </div>
                </div>

                {/* Controller Details */}
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg flex items-center justify-between text-xs font-sans text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      selectedTelemetryVehicle.obdStatus === 'Healthy' ? 'bg-emerald-500' :
                      selectedTelemetryVehicle.obdStatus === 'Warning' ? 'bg-amber-500' :
                      'bg-rose-500'
                    }`} />
                    <span>Frequencies Module: <strong className="font-semibold text-slate-800">{selectedTelemetryVehicle.obdStatus || 'N/A'} OBD-II</strong></span>
                  </div>
                  <div className="font-mono text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                    Status: {selectedTelemetryVehicle.status || 'N/A'}
                  </div>
                </div>

              </div>
            ) : (
              <div className="mt-5 py-12 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-6 text-center text-slate-400 font-sans">
                <Car className="w-8 h-8 text-slate-300 stroke-[1.5] mb-2" />
                <p className="text-xs font-medium">No live telemetry available</p>
                <p className="text-[10px] text-slate-450 max-w-[200px] mt-1 leading-relaxed">
                  Add a fleet vehicle or import schema entries page to enable direct real-time OBD status feeds.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Preventative Maintenance Schedules List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <Wrench className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900 font-sans">Fleet Preventative Maintenance Logs</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map(v => (
            <div key={v.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm font-sans">{v.model}</h4>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{v.licensePlate}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                  v.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  v.status === 'Rented' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {v.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 font-sans">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Next inspection date: <strong className="text-slate-800 font-semibold">{v.nextMaintenanceDate}</strong></span>
                </div>
                <div className="flex items-start gap-1.5 mt-2">
                  <Sliders className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 block mb-0.5">Preventative tasks:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                      {v.preventativeNotes.map((note, nIdx) => (
                        <li key={nIdx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
