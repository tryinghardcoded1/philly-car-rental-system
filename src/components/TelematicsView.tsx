/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Gauge, 
  MapPin, 
  Activity, 
  HelpCircle, 
  ShieldAlert, 
  Key, 
  Settings, 
  Fuel, 
  Thermometer, 
  Navigation,
  Sparkles,
  Search,
  Lock,
  Unlock,
  Radio,
  Zap,
  AlertCircle
} from 'lucide-react';
import { Vehicle } from '../types';

export default function TelematicsView() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 'V1',
      model: 'Volvo 850 - 191',
      licensePlate: 'PHL-850A',
      vehicleClass: 'Premium',
      status: 'Available',
      mileage: 124500,
      fuelLevel: 85,
      engineTemp: 88,
      obdStatus: 'Healthy',
      lastLocation: { lat: 39.9526, lng: -75.1652, address: 'Center City, Philadelphia, PA' },
      telemetryStream: [
        { time: '18:50', speed: 45, rpm: 2100 },
        { time: '18:51', speed: 50, rpm: 2200 },
        { time: '18:52', speed: 0, rpm: 750 },
        { time: '18:53', speed: 32, rpm: 1800 }
      ],
      nextMaintenanceDate: '2026-06-15',
      preventativeNotes: ['Brake pads replacement scheduled', 'Oil filter test check due']
    },
    {
      id: 'V2',
      model: 'BMW 650 i Coupe Sport - 181',
      licensePlate: 'BMR-650B',
      vehicleClass: 'Premium',
      status: 'Rented',
      mileage: 82100,
      fuelLevel: 45,
      engineTemp: 92,
      obdStatus: 'Healthy',
      lastLocation: { lat: 40.0001, lng: -75.1196, address: 'Near University City, Philly, PA' },
      telemetryStream: [
        { time: '19:10', speed: 65, rpm: 2800 },
        { time: '19:11', speed: 70, rpm: 3100 },
        { time: '19:12', speed: 68, rpm: 2950 }
      ],
      nextMaintenanceDate: '2026-07-01',
      preventativeNotes: ['Tire alignment and rotation']
    },
    {
      id: 'V3',
      model: 'Renault Super 5 - 161',
      licensePlate: 'REN-5161',
      vehicleClass: 'Economic Manual',
      status: 'Available',
      mileage: 185000,
      fuelLevel: 60,
      engineTemp: 95,
      obdStatus: 'Warning',
      lastLocation: { lat: 39.9312, lng: -75.1805, address: 'South Philadelphia, PA' },
      telemetryStream: [
        { time: '12:12', speed: 20, rpm: 1500 },
        { time: '12:13', speed: 25, rpm: 1750 }
      ],
      nextMaintenanceDate: '2026-06-05',
      preventativeNotes: ['Coolant flush recommended', 'Oxygen sensor check']
    },
    {
      id: 'V4',
      model: 'EXTREME RV SPORTSMASTER - 171',
      licensePlate: 'RV-SPORTY',
      vehicleClass: 'SUV',
      status: 'Rented',
      mileage: 45000,
      fuelLevel: 98,
      engineTemp: 84,
      obdStatus: 'Healthy',
      lastLocation: { lat: 40.0215, lng: -75.2131, address: 'Manayunk, Philadelphia, PA' },
      telemetryStream: [
        { time: '16:15', speed: 35, rpm: 1600 },
        { time: '16:16', speed: 40, rpm: 1800 }
      ],
      nextMaintenanceDate: '2026-08-10',
      preventativeNotes: ['Generator system check', 'Water tank sterilization']
    },
    {
      id: 'V5',
      model: 'Toyota Prius Hybrid-300',
      licensePlate: 'TOY-HYB3',
      vehicleClass: 'Economic Automatic',
      status: 'Maintenance',
      mileage: 95000,
      fuelLevel: 20,
      engineTemp: 102,
      obdStatus: 'Error',
      lastLocation: { lat: 39.9620, lng: -75.1412, address: 'Fishtown Repair Depot, PA' },
      telemetryStream: [],
      nextMaintenanceDate: '2026-05-31',
      preventativeNotes: ['Check Engine Light active', 'Hybrid battery cooling fan cleaning']
    }
  ]);

  const [selectedVehId, setSelectedVehId] = useState<string>('V2');
  const [liveTelemetryMode, setLiveTelemetryMode] = useState(true);
  const selectedVehicle = vehicles.find(v => v.id === selectedVehId) || vehicles[0];

  // Map Coordinates simulation
  const [mapCars, setMapCars] = useState<{ id: string; x: number; y: number; label: string; status: string }[]>([
    { id: 'V1', x: 210, y: 310, label: 'Volvo (PHL-850A)', status: 'Available' },
    { id: 'V2', x: 190, y: 180, label: 'BMW (BMR-650B)', status: 'Rented' },
    { id: 'V3', x: 280, y: 390, label: 'Renault (REN-5161)', status: 'Available' },
    { id: 'V4', x: 70, y: 110, label: 'EXTREME RV (RV-SPORTY)', status: 'Rented' },
    { id: 'V5', x: 420, y: 220, label: 'Prius (TOY-HYB3)', status: 'Maintenance' },
  ]);

  // Telemetry real-time clock simulator
  useEffect(() => {
    if (!liveTelemetryMode) return;
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        if (v.status === 'Rented' && v.telemetryStream.length > 0) {
          // Add a new random tick representing movement
          const lastTick = v.telemetryStream[v.telemetryStream.length - 1];
          const newSpeed = Math.min(100, Math.max(0, Math.floor(lastTick.speed + (Math.random() * 12 - 6))));
          const newRpm = Math.min(4500, Math.max(800, Math.floor(newSpeed * 35 + 750 + (Math.random() * 200 - 100))));
          const now = new Date();
          const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
          const updatedStream = [...v.telemetryStream.slice(1), { time: timeStr, speed: newSpeed, rpm: newRpm }];
          return {
            ...v,
            fuelLevel: Math.max(5, parseFloat((v.fuelLevel - 0.05).toFixed(2))),
            telemetryStream: updatedStream
          };
        }
        return v;
      }));
    }, 4500);

    return () => clearInterval(interval);
  }, [liveTelemetryMode]);

  const handleRemoteCommand = (command: string, vehiclePlate: string) => {
    alert(`Sending OTA Remote command [${command.toUpperCase()}] over Sigfox telemetry network to physical unit: ${vehiclePlate}\nResult: 200 OK ACK Received.`);
  };

  const handleClearOBDError = (id: string) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, obdStatus: 'Healthy', engineTemp: 84 } : v));
    alert('Cleared physical fault codes via OBD CAN bus. Telemetry status reset: Healthy.');
  };

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-sans tracking-tight">Fleet OBD-II & GPS Telematics Terminal</h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">Diagnose mechanical CAN bus telemetry, analyze streaming vehicle velocities, and override vehicle security OTA over the air.</p>
        </div>

        {/* Live / Simulated Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono select-none">
          <span className={`w-2 h-2 rounded-full ${liveTelemetryMode ? 'bg-emerald-500 animate-ping' : 'bg-slate-350'}`} />
          <button 
            onClick={() => setLiveTelemetryMode(!liveTelemetryMode)}
            className="font-bold text-slate-705 text-[10px] uppercase cursor-pointer"
          >
            {liveTelemetryMode ? 'Live Telemetry Active' : 'Hold Stream'}
          </button>
        </div>
      </div>

      {/* Grid of details & layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Aspect: Philly GPS SVG Map overlay with marker navigation */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col p-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 select-none">
            <h3 className="font-bold text-slate-800 text-xs font-sans flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-slate-700 animate-pulse" />
              <span>Philly Dispatch Grid • Local Fleet Dot Overlay</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Precision: Real-time RTK GPS 2.5m</span>
          </div>

          {/* SVG Map Container */}
          <div className="bg-slate-950 h-[320px] rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-800 mt-4 select-none">
            
            {/* Visual Vector Grid Lines */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>

            {/* Philadelphia Map Vectors */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Delaware River */}
              <path d="M 450 0 C 420 150, 480 320, 430 500 L 500 500 L 500 0 Z" fill="#0c1d33" opacity="0.6" stroke="#1d4ed8" strokeWidth="2" />
              {/* Schuylkill River */}
              <path d="M 120 0 C 130 180, 200 240, 150 500" stroke="#1d4ed8" strokeWidth="4" opacity="0.4" />
              
              {/* major arteries */}
              <path d="M 0 250 L 500 250" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" /> {/* Market St */}
              <path d="M 220 0 L 220 500" stroke="#1e293b" strokeWidth="2" /> {/* Broad St (Center) */}
              <path d="M 0 100 L 450 400" stroke="#0f172a" strokeWidth="3" opacity="0.5" /> {/* I-76 Roadway */}
              
              {/* Key hub labels */}
              <text x="210" y="270" fill="#94a3b8" fontSize="10" fontWeight="bold">Center City</text>
              <text x="40" y="70" fill="#475569" fontSize="9" fontWeight="bold">Manayunk</text>
              <text x="350" y="160" fill="#475569" fontSize="9" fontWeight="bold">Fishtown</text>
            </svg>

            {/* Live Interactive vehicle dots */}
            {mapCars.map(car => {
              const active = car.id === selectedVehId;
              const isRented = car.status === 'Rented';
              const isOffline = car.status === 'Maintenance';
              return (
                <button
                  key={car.id}
                  onClick={() => setSelectedVehId(car.id)}
                  style={{ left: `${car.x}px`, top: `${car.y}px` }}
                  className="absolute p-0 border-0 focus:outline-none focus:ring-0 group cursor-pointer"
                >
                  {/* Outer circle animation for active or rented */}
                  <span className={`absolute -inset-2 rounded-full opacity-40 ${
                    active ? 'bg-blue-400 animate-ping' : 
                    isOffline ? 'bg-orange-450' : 
                    isRented ? 'bg-emerald-450 animate-pulse' : 'bg-sky-400 animate-pulse'
                  }`} />
                  
                  {/* Dot center */}
                  <span className={`relative w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-md ${
                    active ? 'bg-blue-600' :
                    isOffline ? 'bg-orange-550' :
                    isRented ? 'bg-emerald-600' : 'bg-slate-600'
                  }`}>
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  </span>

                  {/* Popover Hover Label Details */}
                  <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white rounded p-1.5 text-[9px] font-mono leading-tight whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition shadow-lg ${
                    active ? 'opacity-100 scale-100 bg-blue-950 border-blue-600/60' : 'scale-90'
                  }`}>
                    <div className="font-bold">{car.label}</div>
                    <div className="text-[8px] text-slate-400 mt-0.5">{car.status}</div>
                  </div>
                </button>
              );
            })}

          </div>

          {/* Quick interactive Selector row below map */}
          <div className="grid grid-cols-5 gap-2 mt-4">
            {vehicles.map(v => {
              const activeIdx = v.id === selectedVehId;
              return (
                <div 
                  key={v.id}
                  onClick={() => setSelectedVehId(v.id)}
                  className={`p-2.5 rounded-xl border font-sans cursor-pointer transition select-none ${
                    activeIdx 
                      ? 'bg-slate-50 border-slate-300 text-slate-900' 
                      : 'border-slate-100 text-slate-500 hover:bg-slate-50/50'
                  }`}
                >
                  <p className="text-[9px] uppercase font-bold text-slate-440 font-mono tracking-tighter shrink-0">{v.licensePlate}</p>
                  <h4 className="font-extrabold text-[11px] truncate leading-tight mt-0.5">{v.model.split('-')[0]}</h4>
                  <div className={`text-[9px] font-bold mt-1.5 inline-block ${
                    v.obdStatus === 'Healthy' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100 px-1 rounded' :
                    v.obdStatus === 'Warning' ? 'text-amber-700 bg-amber-50 border border-amber-100 px-1 rounded' :
                    'text-rose-700 bg-rose-50 border border-rose-100 px-1 rounded'
                  }`}>
                    {v.obdStatus} OBD
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Aspect: Detailed OBD diagnostics telemetry stream */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col p-4 space-y-4">
          
          <div className="pb-3 border-b border-slate-100 select-none">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Stream Monitor</span>
            <h3 className="font-extrabold text-slate-800 text-sm font-sans mt-0.5">{selectedVehicle.model}</h3>
            <p className="text-[10px] text-slate-400 font-mono font-bold">NODE ID: {selectedVehicle.id} • License {selectedVehicle.licensePlate}</p>
          </div>

          {/* Dial tickers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-2.5 border border-slate-150 rounded-xl space-y-1">
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5 text-slate-500" /> Fuel Reserve
              </span>
              <div className="text-sm font-black font-mono text-slate-900 leading-tight">
                {selectedVehicle.fuelLevel}%
              </div>
              <div className="w-full bg-slate-200 h-1 rounded overflow-hidden">
                <div 
                  className={`h-1 ${selectedVehicle.fuelLevel < 35 ? 'bg-amber-550' : 'bg-emerald-555'}`} 
                  style={{ width: `${selectedVehicle.fuelLevel}%` }} 
                />
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 border border-slate-150 rounded-xl space-y-1">
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-slate-500" /> Coolant Temp
              </span>
              <div className="text-sm font-black font-mono text-slate-900 leading-tight">
                {selectedVehicle.engineTemp}°C
              </div>
              <span className={`text-[8px] font-bold ${selectedVehicle.engineTemp > 98 ? 'text-rose-600 bg-rose-50 px-1 rounded' : 'text-slate-400'}`}>
                {selectedVehicle.engineTemp > 98 ? 'Warning: High Temp' : 'Within Threshold'}
              </span>
            </div>
          </div>

          {/* Streaming speeds line ticker */}
          <div className="bg-slate-900 rounded-xl p-3 text-white space-y-2 select-none min-h-[120px] font-mono border border-slate-850">
            <div className="flex justify-between items-center pb-1 border-b border-slate-800">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Radio className="w-3 h-3 text-blue-400 animate-pulse" /> Speed Packet log
              </span>
              <span className="text-[8px] text-emerald-450 animate-pulse font-bold">1.2Hz STREAM</span>
            </div>

            <div className="space-y-1.5 text-[10px]">
              {selectedVehicle.telemetryStream.length === 0 ? (
                <div className="text-slate-500 text-center py-6 leading-normal">
                  No active CAN stream packets.<br />
                  Vehicle is locked in parking array.
                </div>
              ) : (
                selectedVehicle.telemetryStream.map((tick, runIdx) => (
                  <div key={runIdx} className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-500">[{tick.time}]</span>
                    <span>VELOCITY: <strong className="text-white font-black">{tick.speed} km/h</strong></span>
                    <span className="text-slate-400">RPM: <strong className="text-blue-400 font-bold">{tick.rpm}</strong></span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action overrides and remote command triggers */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">OTA OTA CAN Overrides</span>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleRemoteCommand('unbolt-lock', selectedVehicle.licensePlate)}
                className="bg-slate-50 border border-slate-205 flex items-center justify-center gap-1.5 py-2 hover:bg-slate-100 rounded-lg text-slate-800 font-bold text-[10px] shadow-3xs cursor-pointer transition"
              >
                <Unlock className="w-3.5 h-3.5 text-blue-505" />
                <span>Remote Unlock</span>
              </button>
              <button 
                onClick={() => handleRemoteCommand('arm-lock', selectedVehicle.licensePlate)}
                className="bg-slate-50 border border-slate-205 flex items-center justify-center gap-1.5 py-2 hover:bg-slate-100 rounded-lg text-slate-800 font-bold text-[10px] shadow-3xs cursor-pointer transition"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Remote Lock</span>
              </button>
            </div>

            <button 
              onClick={() => handleRemoteCommand('ping-obd-bus', selectedVehicle.licensePlate)}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-950 text-white rounded-lg py-2 text-[10px] font-bold transition flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-450 shrink-0" />
              <span>Diagnostic Ping OBD Bus</span>
            </button>
          </div>

          {/* Diagnostic warnings override check */}
          {selectedVehicle.obdStatus !== 'Healthy' && (
            <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 text-[10.5px] text-amber-900 leading-normal space-y-2 select-none border-dashed">
              <div className="flex gap-1.5 items-center">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-extrabold font-mono text-[10px] uppercase">Active Diagnostic trouble code found</span>
              </div>
              <p>Physical unit returned a core check engine alert regarding coolant parameters and hybrid fan cleanliness. Resolve locally, then tap override to flush CAN state.</p>
              <button 
                onClick={() => handleClearOBDError(selectedVehicle.id)}
                className="bg-amber-120 border border-amber-300 font-extrabold text-[9px] hover:bg-amber-200 px-2 py-1 rounded transition text-amber-950 text-center block w-full uppercase tracking-wider"
              >
                Flush / OBD Override Code
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
