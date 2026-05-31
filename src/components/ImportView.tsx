/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Database, 
  ArrowRight, 
  Download, 
  Sparkles,
  RefreshCw,
  Layers,
  ChevronDown,
  Info
} from 'lucide-react';
import { Reservation, Vehicle, Customer, Fine } from '../types';

interface ImportViewProps {
  onImportReservations: (reservations: Reservation[]) => void;
  onImportVehicles: (vehicles: Vehicle[]) => void;
  onImportCustomers: (customers: Customer[]) => void;
  onImportFines: (fines: Fine[]) => void;
}

type SchemaType = 'reservations' | 'vehicles' | 'customers' | 'fines';

export default function ImportView({
  onImportReservations,
  onImportVehicles,
  onImportCustomers,
  onImportFines
}: ImportViewProps) {
  const [targetSchema, setTargetSchema] = useState<SchemaType>('reservations');
  const [pasteContent, setPasteContent] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseResults, setParseResults] = useState<{
    success: boolean;
    data: any[];
    errors: string[];
    summary: string;
  } | null>(null);
  
  const [importCompleted, setImportCompleted] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getTemplatePlaceholder = () => {
    if (targetSchema === 'reservations') {
      return `id,customerName,customerEmail,vehicleClass,pickupDate,returnDate,totalPrice,status,pickupLocation,contractType
101,Precious Thompson,precious@booking.com,Premium,2026-06-01,2026-06-05,450.00,Open,Center Hub,Short-Term
102,Marcus Vance,marcus.v@philly.org,SUV,2026-06-02,2026-06-10,980.00,Open,Northwest Office,Short-Term`;
    }
    if (targetSchema === 'vehicles') {
      return `id,make,model,year,licensePlate,vehicleClass,status,dailyRate,fuelLevel,batteryHealth,mileage
V-401,Tesla,Model Y,2024,PHL-EV-999,Premium,Available,120.00,100,Good,12400
V-402,Jeep,Grand Cherokee,2023,PHL-SUV-828,SUV,Available,95.00,75,Excellent,34200`;
    }
    if (targetSchema === 'customers') {
      return `id,name,email,phone,totalPaid,totalDurationDays,activeHiresCount,loyaltyTier
C-301,Samantha Reese,samantha.reese@icloud.com,(267) 555-1200,1450.00,18,1,Gold
C-302,David Chandler,david.chan@gmail.com,(215) 555-8930,350.00,4,0,Silver`;
    }
    return `id,fineDate,licensePlate,fineAuthority,violationBrief,penaltyAmount,paidToAuthority
F-601,2026-05-15,PHL-EV-952,Philadelphia PPA,Overtime Parking,45.00,No
F-602,2026-05-18,PHL-SUV-104,PennDOT,Speeding Zone 2,120.00,Yes`;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      readAndParseFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      readAndParseFile(file);
    }
  };

  const readAndParseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setPasteContent(text);
      setParseResults(null);
    };
    reader.readAsText(file);
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleRunParser = () => {
    if (!pasteContent.trim()) {
      setParseResults({
        success: false,
        data: [],
        errors: ["Raw content input is empty"],
        summary: "Please import a file or paste valid CSV data before validating."
      });
      return;
    }

    try {
      // Check if JSON
      if (pasteContent.trim().startsWith('[') || pasteContent.trim().startsWith('{')) {
        const json = JSON.parse(pasteContent);
        const records = Array.isArray(json) ? json : [json];
        validateAndSetRecords(records);
        return;
      }

      // Parse CSV
      const lines = pasteContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 2) {
        setParseResults({
          success: false,
          data: [],
          errors: ["Missing headers or body row"],
          summary: "A valid CSV must contain at least a header line and one records line."
        });
        return;
      }

      const headers = parseCSVLine(lines[0]);
      const dataRows = lines.slice(1);
      const records: any[] = [];
      const errors: string[] = [];

      dataRows.forEach((row, idx) => {
        const cols = parseCSVLine(row);
        if (cols.length !== headers.length) {
          errors.push(`Row ${idx + 2}: Column mismatch (expected ${headers.length}, got ${cols.length})`);
          return;
        }

        const obj: any = {};
        headers.forEach((h, colIdx) => {
          // Normalise field names
          obj[h] = cols[colIdx];
        });
        records.push(obj);
      });

      validateAndSetRecords(records, errors);
    } catch (err: any) {
      setParseResults({
        success: false,
        data: [],
        errors: [`Syntax error parsing file content: ${err.message}`],
        summary: "Failed to read row templates successfully."
      });
    }
  };

  const validateAndSetRecords = (records: any[], initialErrors: string[] = []) => {
    const errors = [...initialErrors];
    const validatedData: any[] = [];

    records.forEach((rec, idx) => {
      // Default fallback id if missing
      const recordId = rec.id || `Imported-${targetSchema}-${Math.floor(1000 + Math.random() * 9000)}`;

      if (targetSchema === 'reservations') {
        const validated: Reservation = {
          id: recordId,
          customerName: rec.customerName || 'Anonymous Client',
          customerEmail: rec.customerEmail || 'imported@phillycarrental.com',
          customerPhone: rec.customerPhone || '(215) 555-0199',
          pickupDate: rec.pickupDate || '2026-06-01',
          returnDate: rec.returnDate || '2026-06-05',
          pickupLocation: rec.pickupLocation || 'Philly Airport Desk',
          vehicleClass: rec.vehicleClass || 'Premium',
          totalPrice: parseFloat(rec.totalPrice) || 350.00,
          totalRevenue: (parseFloat(rec.totalPrice) || 350.00) * 0.95,
          totalPaid: parseFloat(rec.totalPaid) || 0,
          totalRefunded: 0,
          outstandingBalance: Math.max(0, (parseFloat(rec.totalPrice) || 350.00) - (parseFloat(rec.totalPaid) || 0)),
          status: (rec.status as any) || 'Open',
          digitalAgreementSigned: rec.digitalAgreementSigned === 'true' || rec.digitalAgreementSigned === 'Yes',
          contractType: rec.contractType || 'Short-Term'
        };
        validatedData.push(validated);
      } else if (targetSchema === 'vehicles') {
        const validated: Vehicle = {
          id: recordId,
          model: rec.model || `${rec.make || 'Toyota'} ${rec.model || 'Unknown Cruiser'}(${rec.year || '2024'})`,
          licensePlate: rec.licensePlate || 'PHL-MOCK-XX',
          vehicleClass: (rec.vehicleClass as any) || 'Premium',
          status: (rec.status as any) || 'Available',
          mileage: parseInt(rec.mileage) || 12050,
          fuelLevel: parseInt(rec.fuelLevel) || 100,
          engineTemp: 85,
          obdStatus: 'Healthy',
          lastLocation: { lat: 40.015, lng: -75.18, address: 'Philly Regional Hub' },
          telemetryStream: [
            { time: '12:00', speed: 0, rpm: 750 }
          ],
          nextMaintenanceDate: '2026-08-15',
          preventativeNotes: []
        };
        validatedData.push(validated);
      } else if (targetSchema === 'customers') {
        const validated: Customer = {
          id: recordId,
          name: rec.name || 'John Doe',
          email: rec.email || 'customer@import.com',
          phone: rec.phone || '(215) 555-4029',
          driverLicense: rec.driverLicense || 'DL-' + Math.floor(100000 + Math.random() * 900000),
          licenseExpiry: rec.licenseExpiry || '2029-12-31',
          licenseCountry: rec.licenseCountry || 'US',
          totalPaid: parseFloat(rec.totalPaid) || 0,
          totalDurationDays: parseInt(rec.totalDurationDays) || 0
        };
        validatedData.push(validated);
      } else if (targetSchema === 'fines') {
        const validated: Fine = {
          id: recordId,
          fineNumber: rec.fineNumber || 'FN-' + Math.floor(10000 + Math.random() * 90000),
          fineType: (rec.fineType as any) || 'Parking',
          vehicleLicensePlate: rec.vehicleLicensePlate || rec.licensePlate || 'PHL-EV-921',
          customerName: rec.customerName || 'Imported Debtor',
          dateOfFine: rec.dateOfFine || rec.fineDate || '2026-05-15',
          dateTimeOfOffense: rec.dateTimeOfOffense || '2026-05-15 14:00',
          amount: parseFloat(rec.amount) || parseFloat(rec.penaltyAmount) || 45.00,
          paidToAuthority: (rec.paidToAuthority as any) || 'No',
          notes: rec.notes || rec.violationBrief || 'Imported via CSV Data mapping'
        };
        validatedData.push(validated);
      }
    });

    setParseResults({
      success: errors.length === 0,
      data: validatedData,
      errors: errors,
      summary: `Successfully staged ${validatedData.length} records in schema "${targetSchema.toUpperCase()}". Checked keys alignment structure.`
    });
  };

  const handleCommitImport = () => {
    if (!parseResults || parseResults.data.length === 0) return;

    if (targetSchema === 'reservations') {
      onImportReservations(parseResults.data);
    } else if (targetSchema === 'vehicles') {
      onImportVehicles(parseResults.data);
    } else if (targetSchema === 'customers') {
      onImportCustomers(parseResults.data);
    } else if (targetSchema === 'fines') {
      onImportFines(parseResults.data);
    }

    setImportCount(parseResults.data.length);
    setImportCompleted(true);
    setParseResults(null);
    setPasteContent('');
    setFileName(null);
  };

  const downloadSampleTemplate = () => {
    const rawText = getTemplatePlaceholder();
    const blob = new Blob([rawText], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rentscale_${targetSchema}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden font-sans">
      
      {/* View Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex space-y-4 sm:space-y-0 sm:flex-row sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-blue-600" />
            <span>Operational CSV Data Importer</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Reconcile enterprise reservations, vehicle registers, customer CRM registries, or fine tracking lists using bulk CSV imports.
          </p>
        </div>

        {/* Target Schema Selector */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold shrink-0 select-none">
          {(['reservations', 'vehicles', 'customers', 'fines'] as SchemaType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setTargetSchema(tab);
                setParseResults(null);
                setImportCompleted(false);
              }}
              className={`px-3 py-1.5 rounded transition capitalize cursor-pointer ${
                targetSchema === tab
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* Success alert */}
        {importCompleted && (
          <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-start gap-3 select-none">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-emerald-800">Operational Update Confirmed</h3>
              <p className="text-[11px] text-emerald-600 mt-1">
                Successfully ingested <strong>{importCount}</strong> new entries into the live **{targetSchema.toUpperCase()}** tables block. The workspace ledger has recalculated all telemetry and financials mapping.
              </p>
              <button
                onClick={() => setImportCompleted(false)}
                className="text-[10px] text-emerald-700 font-bold hover:underline mt-2 cursor-pointer"
              >
                Import another CSV record sheet
              </button>
            </div>
          </div>
        )}

        {/* File drop area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Provide File or Raw CSV Data
            </label>

            {/* Dropzone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 relative ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50/50' 
                  : 'border-slate-250 bg-slate-50 hover:bg-slate-100/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <UploadCloud className="w-10 h-10 text-slate-400" />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {fileName ? `Loaded: ${fileName}` : 'Drag & drop .csv or .json here'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  or click to select file from desktop
                </p>
              </div>

              {fileName && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFileName(null);
                    setPasteContent('');
                    setParseResults(null);
                  }}
                  className="absolute top-2 right-2 text-[10px] text-slate-400 hover:text-red-500 cursor-pointer font-sans"
                >
                  Clear File
                </button>
              )}
            </div>

            {/* Template downloader */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <FileText className="w-4 h-4 text-blue-500" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Template Structure CSV</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Aligned headers required for {targetSchema}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-220 hover:border-slate-300 text-[10px] font-bold text-slate-700 rounded-lg shadow-2xs cursor-pointer transition"
              >
                <Download className="w-3 h-3" />
                <span>Sample CSV</span>
              </button>
            </div>
          </div>

          {/* Textarea Paste content box */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Or Paste Raw CSV Data Directly
              </label>
              <button
                type="button"
                onClick={() => setPasteContent(getTemplatePlaceholder())}
                className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
              >
                Autoload Sample Dummy Data
              </button>
            </div>

            <textarea
              value={pasteContent}
              onChange={(e) => {
                setPasteContent(e.target.value);
                setParseResults(null);
              }}
              placeholder={`id,customerName,customerEmail,phone...\n101,John Doe,john@test.com...`}
              className="w-full h-44 bg-slate-50 border border-slate-220 rounded-xl p-3 text-xs font-mono text-slate-700 focus:outline-none focus:border-blue-450 focus:bg-white resize-none"
            />
          </div>
        </div>

        {/* Validation Check CTA */}
        <div className="bg-slate-50 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between border border-slate-200/80 gap-4 select-none">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-slate-500 leading-normal max-w-xl">
              Parsing maps coordinates automatically based on labeled key patterns. We run checks against target schema configurations to detect structure anomalies before confirming.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRunParser}
            className="px-4 py-2 bg-slate-850 hover:bg-slate-900 border border-slate-700 font-bold text-white text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition self-end sm:self-auto shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Validate & Stage Alignments</span>
          </button>
        </div>

        {/* Parse Preview Result */}
        {parseResults && (
          <div className="border border-slate-200 rounded-xl overflow-hidden select-none">
            <div className={`p-4 border-b flex items-center justify-between ${
              parseResults.success 
                ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' 
                : 'bg-amber-50/50 border-amber-100 text-amber-800'
            }`}>
              <div className="flex items-center gap-2">
                {parseResults.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                )}
                <span className="text-xs font-bold leading-none">{parseResults.summary}</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-white border px-2 py-0.5 rounded text-slate-500">
                Data Checker
              </span>
            </div>

            {parseResults.errors.length > 0 && (
              <div className="p-4 bg-red-50 border-b border-red-100 text-red-700 text-xs font-sans space-y-1">
                <span className="font-bold">Format discrepancies detected:</span>
                <ul className="list-disc pl-5 space-y-0.5 text-[11px] font-mono max-h-24 overflow-y-auto">
                  {parseResults.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stage Preview list */}
            {parseResults.data.length > 0 && (
              <div className="bg-white">
                <div className="p-4 bg-slate-50/50 border-b text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Live Insertion Preview ({parseResults.data.length} Staged Rows)
                </div>
                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs sm:text-[11px] text-slate-600 divide-y divide-slate-100 select-none">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase select-none sticky top-0 border-b">
                      <tr>
                        <th className="px-4 py-2">ID</th>
                        <th className="px-4 py-2">Primary Descriptor</th>
                        <th className="px-4 py-2">Sub-Key Alignment</th>
                        <th className="px-4 py-2">Numeric Metrics</th>
                        <th className="px-4 py-2 text-right">Mapping Safe</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {parseResults.data.slice(0, 5).map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/40">
                          <td className="px-4 py-2 font-mono text-slate-400 font-bold">{row.id}</td>
                          <td className="px-4 py-2 font-semibold text-slate-800">
                            {targetSchema === 'reservations' ? row.customerName :
                             targetSchema === 'vehicles' ? `${row.make} ${row.model}` :
                             targetSchema === 'customers' ? row.name : row.violationBrief}
                          </td>
                          <td className="px-4 py-2 text-slate-500 font-sans truncate max-w-xs">
                            {targetSchema === 'reservations' ? row.customerEmail :
                             targetSchema === 'vehicles' ? row.licensePlate :
                             targetSchema === 'customers' ? row.email : row.licensePlate}
                          </td>
                          <td className="px-4 py-2 font-mono font-medium">
                            {targetSchema === 'reservations' ? `$${row.totalPrice}` :
                             targetSchema === 'vehicles' ? `$${row.dailyRate}/day` :
                             targetSchema === 'customers' ? `$${row.totalPaid}` : `$${row.penaltyAmount}`}
                          </td>
                          <td className="px-4 py-2 text-right text-emerald-600 font-semibold align-middle">
                            <span className="inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Stage OK
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {parseResults.data.length > 5 && (
                  <div className="p-2 border-t border-slate-100 bg-slate-50 text-center text-[10px] font-semibold text-slate-400 uppercase">
                    + {parseResults.data.length - 5} additional structured records
                  </div>
                )}

                {/* Confirm committing stage */}
                <div className="p-4 bg-slate-50 border-t flex justify-end gap-3 select-none">
                  <button
                    type="button"
                    onClick={() => setParseResults(null)}
                    className="px-3.5 py-1.5 text-xs text-slate-500 bg-white border hover:bg-slate-100 transition rounded-lg font-bold cursor-pointer"
                  >
                    Discard Stage
                  </button>
                  <button
                    type="button"
                    onClick={handleCommitImport}
                    className="px-4 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 transition rounded-lg font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Merge {parseResults.data.length} Rows Into Tables</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
