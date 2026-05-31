/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Gauge, 
  MapPin, 
  Battery, 
  Flame, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  Clock, 
  Sliders, 
  User, 
  Wrench,
  WashingMachine,
  Plus,
  UploadCloud
} from 'lucide-react';
import { Vehicle } from '../types';

interface FleetViewProps {
  vehicles: Vehicle[];
  onAddVehicle: (v: Vehicle) => void;
  onUpdateVehicle: (updated: Vehicle) => void;
  onTriggerImport?: () => void;
}

export default function FleetView({ vehicles, onAddVehicle, onUpdateVehicle, onTriggerImport }: FleetViewProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>(vehicles[0] || {} as Vehicle);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [vClass, setVClass] = useState<'Economic Manual' | 'Economic Automatic' | 'Premium' | 'SUV' | 'Luxury'>('Premium');
  const [mileage, setMileage] = useState('85000');
  const [fuel, setFuel] = useState('100');

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!model || !plate) return;

    const newV: Vehicle = {
      id: 'V' + (vehicles.length + 1).toString(),
      model: model,
      licensePlate: plate,
      vehicleClass: vClass,
      status: 'Available',
      mileage: parseFloat(mileage) || 0,
      fuelLevel: parseFloat(fuel) || 100,
      engineTemp: 85,
      obdStatus: 'Healthy',
      lastLocation: { lat: 39.9526, lng: -75.1652, address: 'Office Depot, Philly, PA' },
      telemetryStream: [{ time: '00:00', speed: 0, rpm: 750 }],
      nextMaintenanceDate: new Date().toISOString().slice(0, 10),
      preventativeNotes: ['General fluid test', 'Refueling diagnostics']
    };

    onAddVehicle(newV);
    setShowAddModal(false);
    setModel('');
    setPlate('');
  };

  const handleAddMaintenanceNote = (note: string) => {
    if (!note.trim()) return;
    const updated = {
      ...selectedVehicle,
      preventativeNotes: [...selectedVehicle.preventativeNotes, note]
    };
    onUpdateVehicle(updated);
    setSelectedVehicle(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Fleet & Telematics Monitor</h1>
          </div>
          <p className="text-sm text-slate-500 font-sans mt-0.5">
            Monitor real-time OBD status, verify current telemetry values, and coordinate preventative maintenance cycles.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto select-none">
          {onTriggerImport && (
            <button 
              onClick={onTriggerImport}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-205 text-slate-705 px-3.5 py-2 text-xs font-sans font-semibold rounded-lg transition shadow-2xs cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-blue-500" />
              <span>Import CSV</span>
            </button>
          )}
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-3.5 py-2 text-xs font-sans font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Fleet Vehicle</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: List of Fleet members */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between pl-1">
            <h3 className="text-xs font-bold font-sans text-slate-400 uppercase tracking-widest">Operational Fleet Registry</h3>
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {vehicles.map(v => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVehicle(v)}
                className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between gap-3 ${
                  selectedVehicle.id === v.id 
                    ? 'bg-blue-50/50 border-blue-500 shadow-sm' 
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm font-sans">{v.model}</h4>
                  <span className="text-[10px] font-mono text-slate-400 font-medium tracking-tight uppercase block">{v.licensePlate} • {v.vehicleClass}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                    v.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    v.status === 'Rented' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    v.status === 'Maintenance' ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' :
                    'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                    {v.status}
                  </span>
                  <span className={`text-[9px] font-mono block mt-1 ${
                    v.obdStatus === 'Healthy' ? 'text-emerald-500' :
                    v.obdStatus === 'Warning' ? 'text-amber-500' : 'text-rose-500'
                  }`}>
                    {v.obdStatus === 'Healthy' ? 'OBD Clear' : `OBD ${v.obdStatus}`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right column: Selected fleet member telemetry details & maintenance logs (2 blocks wide) */}
        <div className="lg:col-span-2 space-y-6">
          {selectedVehicle.id ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              
              {/* Header card with name & quick status updates */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="bg-slate-100 text-slate-600 font-mono text-[10px] px-2 py-0.5 rounded uppercase font-semibold">Vehicle Profile: {selectedVehicle.id}</span>
                  <h2 className="text-xl font-bold text-slate-900 font-sans mt-1">{selectedVehicle.model}</h2>
                  <span className="text-[11px] text-slate-400 font-mono">DONGLE UUID: OBD-STREAM-PHL{selectedVehicle.id}0A</span>
                </div>

                {/* Quick Status Setter dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-sans">Set Status:</span>
                  <select
                    value={selectedVehicle.status}
                    onChange={(e) => {
                      const updated = { ...selectedVehicle, status: e.target.value as any };
                      onUpdateVehicle(updated);
                      setSelectedVehicle(updated);
                    }}
                    className="text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 font-sans font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Rented">Rented</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Hold">Hold</option>
                    <option value="Relocating">Relocating</option>
                  </select>
                </div>
              </div>

              {/* Grid of OBD gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 border border-slate-150 rounded-xl relative overflow-hidden text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Fuel Level</span>
                  <div className="text-2xl font-bold font-mono text-slate-800 mt-2 flex items-center justify-center gap-1">
                    <Battery className={`w-5 h-5 shrink-0 ${selectedVehicle.fuelLevel < 35 ? 'text-rose-500 font-bold' : 'text-emerald-500'}`} />
                    <span>{selectedVehicle.fuelLevel}%</span>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1 font-mono">PID 2F Standard</div>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-150 rounded-xl relative overflow-hidden text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Coolant Temp</span>
                  <div className="text-2xl font-bold font-mono text-slate-800 mt-2 flex items-center justify-center gap-1">
                    <Flame className={`w-5 h-5 shrink-0 ${selectedVehicle.engineTemp > 95 ? 'text-rose-500' : 'text-slate-400'}`} />
                    <span>{selectedVehicle.engineTemp}°C</span>
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1 font-mono">PID 05 Engine Bus</div>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-150 rounded-xl relative overflow-hidden text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Total Odo</span>
                  <div className="text-2xl font-bold font-mono text-slate-800 mt-2">
                    {selectedVehicle.mileage.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1 font-mono">km Cumulative</div>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-150 rounded-xl relative overflow-hidden text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">OBD Diagnostic</span>
                  <div className={`text-sm font-bold uppercase mt-3 flex items-center justify-center gap-1 py-1 px-2.5 rounded-full ${
                    selectedVehicle.obdStatus === 'Healthy' ? 'bg-emerald-50 text-emerald-700' :
                    selectedVehicle.obdStatus === 'Warning' ? 'bg-amber-50 text-amber-700' :
                    'bg-rose-50 text-rose-700 animate-pulse'
                  }`}>
                    {selectedVehicle.obdStatus === 'Healthy' ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Clear</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Active Error</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Physical GPS map location segment */}
              <div className="p-4 bg-slate-900 text-slate-300 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-rose-500" /> <strong>Active Geolocation Traced</strong></span>
                  <span className="text-[10px] font-mono text-slate-400">Lat: {selectedVehicle.lastLocation.lat.toFixed(5)}, Lng: {selectedVehicle.lastLocation.lng.toFixed(5)}</span>
                </div>
                <div className="text-sm font-sans font-semibold text-white pl-5">
                  {selectedVehicle.lastLocation.address}
                </div>
                <div className="text-[10px] font-mono text-slate-500 pl-5 leading-normal">
                  Frequency: 1.5Hz WebSocket stream. Reverse geocoder reported accurate coordinates inside Philly operations boundaries.
                </div>
              </div>

              {/* Maintenance checklist section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-800">
                    <Wrench className="w-4.5 h-4.5 text-blue-600" />
                    <h3 className="font-bold text-sm font-sans">Preventative Repairs Planner</h3>
                  </div>
                  <span className="font-mono text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    Due inspection: {selectedVehicle.nextMaintenanceDate}
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedVehicle.preventativeNotes.map((nt, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-sans">
                      <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" defaultChecked={idx === 0} />
                      <span className="flex-1 text-slate-700">{nt}</span>
                      <span className="text-[10px] font-mono text-slate-400">Task {idx + 1}</span>
                    </div>
                  ))}
                </div>

                {/* Log new maintenance action */}
                <div className="pt-2">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formEl = e.currentTarget as HTMLFormElement;
                      const inputEl = formEl.elements.namedItem('taskNote') as HTMLInputElement;
                      handleAddMaintenanceNote(inputEl.value);
                      formEl.reset();
                    }}
                    className="flex gap-2"
                  >
                    <input 
                      type="text" 
                      name="taskNote"
                      placeholder="e.g. Flush radiator coolant and verify spark plugs clearance" 
                      className="flex-1 text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button 
                      type="submit" 
                      className="px-4 py-2 font-sans font-semibold text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                    >
                      Schedule
                    </button>
                  </form>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 font-sans border border-dashed border-slate-200 rounded-2xl">
              No active fleet vehicle selected. Select a model to monitor its telematics dashboard.
            </div>
          )}
        </div>

      </div>

      {/* Add vehicle modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold font-sans text-slate-900">Add Vehicle to Philly Base</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleCreateVehicle} className="mt-4 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Vehicle Brand & Model</label>
                <input 
                  type="text" required placeholder="e.g. Audi A4 Ultra Sport"
                  value={model} onChange={(e) => setModel(e.target.value)}
                  className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">License Plate ID</label>
                  <input 
                    type="text" required placeholder="e.g. PHL-401X"
                    value={plate} onChange={(e) => setPlate(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Vehicle Class</label>
                  <select 
                    value={vClass} onChange={(e) => setVClass(e.target.value as any)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                  >
                    <option value="Premium">Premium Sedan</option>
                    <option value="SUV">SUV Utility</option>
                    <option value="Economic Automatic">Economic Auto</option>
                    <option value="Economic Manual">Economic Manual</option>
                    <option value="Luxury">Luxury Sports</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Initial Mileage (km)</label>
                  <input 
                    type="number" value={mileage} onChange={(e) => setMileage(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Current Fuel Level (%)</label>
                  <input 
                    type="number" value={fuel} onChange={(e) => setFuel(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="button" onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg text-slate-500"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 rounded-lg text-white font-semibold"
                >
                  Initialize Fleet Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
