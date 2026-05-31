/**
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { 
  DownloadCloud, 
  FileSpreadsheet, 
  Settings, 
  CheckCircle2, 
  Calendar, 
  Layers, 
  CheckSquare, 
  Square,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Reservation, Vehicle, Customer, Fine, Payment } from '../types';

interface ExportViewProps {
  reservations: Reservation[];
  vehicles: Vehicle[];
  customers: Customer[];
  fines: Fine[];
  payments: Payment[];
}

export default function ExportView({
  reservations,
  vehicles,
  customers,
  fines,
  payments
}: ExportViewProps) {
  const [selectedTables, setSelectedTables] = useState({
    reservations: true,
    vehicles: true,
    customers: true,
    payments: false,
    fines: false
  });

  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [includeSystemMetadata, setIncludeSystemMetadata] = useState(true);
  const [dateRangeFilter, setDateRangeFilter] = useState('All time');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const toggleTableSelection = (key: keyof typeof selectedTables) => {
    setSelectedTables(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getRecordCount = (key: keyof typeof selectedTables) => {
    switch (key) {
      case 'reservations': return reservations.length;
      case 'vehicles': return vehicles.length;
      case 'customers': return customers.length;
      case 'payments': return payments.length;
      case 'fines': return fines.length;
      default: return 0;
    }
  };

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        if (val === undefined || val === null) {
          return '';
        }
        const stringVal = String(val);
        // Handle values containing commas or quotes
        if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
          return `"${stringVal.replace(/"/g, '""')}"`;
        }
        return stringVal;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  };

  const handleTriggerExport = () => {
    const activeTables = Object.entries(selectedTables)
      .filter(([_, value]) => value === true)
      .map(([key]) => key);

    if (activeTables.length === 0) {
      alert("Please select at least one data category to build the export package.");
      return;
    }

    try {
      activeTables.forEach(tableName => {
        let exportData: any[] = [];
        switch (tableName) {
          case 'reservations': exportData = reservations; break;
          case 'vehicles': exportData = vehicles; break;
          case 'customers': exportData = customers; break;
          case 'payments': exportData = payments; break;
          case 'fines': exportData = fines; break;
        }

        // Add optional export attributes
        if (includeSystemMetadata) {
          exportData = exportData.map(item => ({
            ...item,
            exportTimestamp: new Date().toISOString(),
            operatorSignature: 'philly_nw_dispatch'
          }));
        }

        let mimeType = 'text/csv';
        let fileContent = '';
        let fileExt = 'csv';

        if (format === 'json') {
          mimeType = 'application/json';
          fileContent = JSON.stringify(exportData, null, 2);
          fileExt = 'json';
        } else {
          fileContent = convertToCSV(exportData);
          fileExt = 'csv';
        }

        const blob = new Blob([fileContent], { type: `${mimeType};charset=utf-8;` });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `rentscale_export_${tableName}_${new Date().toISOString().slice(0,10)}.${fileExt}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

      setDownloadSuccess(`Successfully compiled and downloaded ${activeTables.length} datasets inside the client window browser context.`);
      setTimeout(() => setDownloadSuccess(null), 6000);
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden font-sans">
      
      {/* Header section */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <DownloadCloud className="w-5 h-5 text-blue-600" />
          <span>Unified Data Exporter & Backup Console</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Export live ledger sheets into Excel-compatible CSV formats or JSON system dumps. Fully synchronized to operational state.
        </p>
      </div>

      <div className="p-6 space-y-6">

        {downloadSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 select-none">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-emerald-800">Export Cycle Complete</p>
              <p className="text-[11px] text-emerald-600 mt-1">{downloadSuccess}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* List selection columns */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Select Backing Datasets to Compile
            </h3>

            <div className="space-y-2 select-none">
              {(['reservations', 'vehicles', 'customers', 'payments', 'fines'] as Array<keyof typeof selectedTables>).map(key => {
                const count = getRecordCount(key);
                const isChecked = selectedTables[key];

                return (
                  <div
                    key={key}
                    onClick={() => toggleTableSelection(key)}
                    className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition ${
                      isChecked 
                        ? 'border-blue-500 bg-blue-50/30 font-bold text-blue-805' 
                        : 'border-slate-200 bg-slate-50/30 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                      <div>
                        <span className="text-xs font-bold capitalize">{key === 'fines' ? 'Fines & Violations' : key === 'vehicles' ? 'Vehicles List (Fleet)' : key}</span>
                        <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                          {key === 'reservations' && 'Active bookings, lease conditions, customer rates'}
                          {key === 'vehicles' && 'Make, models, battery level, OBD telematics data'}
                          {key === 'customers' && 'Active clients contact, total spent, profile levels'}
                          {key === 'payments' && 'Payment gateway references, invoice statuses'}
                          {key === 'fines' && 'PPA municipality citations, speed cameras'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-medium px-2 py-0.5 bg-slate-200/60 border rounded text-slate-600">
                      {count} records
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Controls */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Export Format & Settings
            </h3>

            {/* Target File Format Selector */}
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-220/80 rounded-xl">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                File Type Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('csv')}
                  className={`p-3 border rounded-lg text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                    format === 'csv'
                      ? 'border-blue-500 bg-white font-bold text-blue-800 shadow-3xs'
                      : 'border-slate-200 bg-slate-50 text-slate-500 font-medium'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5 text-emerald-550" />
                  <span className="text-xs">CSV Spreadsheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('json')}
                  className={`p-3 border rounded-lg text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                    format === 'json'
                      ? 'border-blue-500 bg-white font-bold text-blue-800 shadow-3xs'
                      : 'border-slate-200 bg-slate-50 text-slate-500 font-medium'
                  }`}
                >
                  <Settings className="w-5 h-5 text-indigo-500" />
                  <span className="text-xs">JSON Backup Dump</span>
                </button>
              </div>
            </div>

            {/* Additional parameters */}
            <div className="space-y-4">
              {/* Date Filter */}
              <div className="space-y-1.5 select-none">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Timeline Constraints
                </label>
                <select
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value)}
                  className="w-full bg-white border border-slate-220 text-xs rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-blue-450"
                >
                  <option>All time - Cumulative history</option>
                  <option>Current Fiscal Month (May 2026)</option>
                  <option>Current Quarter (Q2 2026)</option>
                  <option>Today Only (Snapshot)</option>
                </select>
              </div>

              {/* Checkbox item */}
              <div
                onClick={() => setIncludeSystemMetadata(!includeSystemMetadata)}
                className="flex items-start gap-2.5 p-3.5 border border-slate-150 rounded-xl cursor-pointer bg-slate-50/20 select-none"
              >
                <input
                  type="checkbox"
                  checked={includeSystemMetadata}
                  onChange={() => {}}
                  className="mt-0.5 rounded text-blue-600 cursor-pointer focus:ring-0"
                />
                <div>
                  <span className="text-[11px] font-bold text-slate-700 leading-none">Inject Client Environment Auditing Stamps</span>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                    Appends timestamp and philly_nw_dispatch operational signature attributes directly onto each output row.
                  </p>
                </div>
              </div>

              {/* Warning label */}
              <div className="flex gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-[10px] leading-relaxed text-amber-800 select-none">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Export Safety Warning:</strong> Ensure proper handling of downloaded PII customer datasets (emails, phone numbers, total invoice spend) in compliance with local privacy frameworks.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Compile action area */}
        <div className="p-4 border-t flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/50 rounded-b-xl gap-4 select-none">
          <div className="flex gap-2 items-center text-[11px] text-slate-500">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Generated dynamically on the system level with no server network delays.</span>
          </div>
          <button
            onClick={handleTriggerExport}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-lg transition shadow-md shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Generate & Push Live File Packages</span>
          </button>
        </div>

      </div>
    </div>
  );
}
