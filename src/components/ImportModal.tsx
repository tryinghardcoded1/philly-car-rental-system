/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Database, 
  Download, 
  RefreshCw, 
  X,
  Info,
  Layers
} from 'lucide-react';
import { Reservation, Vehicle, Customer, Fine } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSchema?: 'reservations' | 'vehicles' | 'customers' | 'fines';
  onImportReservations: (reservations: Reservation[]) => void;
  onImportVehicles: (vehicles: Vehicle[]) => void;
  onImportCustomers: (customers: Customer[]) => void;
  onImportFines: (fines: Fine[]) => void;
}

type SchemaType = 'reservations' | 'vehicles' | 'customers' | 'fines';

export default function ImportModal({
  isOpen,
  onClose,
  initialSchema = 'reservations',
  onImportReservations,
  onImportVehicles,
  onImportCustomers,
  onImportFines
}: ImportModalProps) {
  const [targetSchema, setTargetSchema] = useState<SchemaType>(initialSchema);
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

  // Sync initialSchema when modal opens or schema shifts
  useEffect(() => {
    if (isOpen) {
      setTargetSchema(initialSchema);
      setParseResults(null);
      setPasteContent('');
      setFileName(null);
      setImportCompleted(false);
    }
  }, [isOpen, initialSchema]);

  if (!isOpen) return null;

  const getTemplatePlaceholder = () => {
    if (targetSchema === 'reservations') {
      return `id,customerName,customerEmail,vehicleClass,pickupDate,returnDate,totalPrice,status,pickupLocation,contractType
101,Precious Thompson,precious@booking.com,Premium,2026-06-01,2026-06-05,450.00,Open,Center Hub,Short-Term
102,Marcus Vance,marcus.v@philly.org,SUV,2026-06-02,2026-06-10,980.00,Open,Northwest Office,Short-Term`;
    }
    if (targetSchema === 'vehicles') {
      return `id,model,licensePlate,vehicleClass,status,mileage,fuelLevel
V-401,Tesla Model Y (2024),PHL-EV-999,Premium,Available,12400,100
V-402,Jeep Grand Cherokee (2023),PHL-SUV-828,SUV,Available,34200,75`;
    }
    if (targetSchema === 'customers') {
      return `id,name,email,phone,totalPaid,totalDurationDays,driverLicense,licenseExpiry
C-301,Samantha Reese,samantha.reese@icloud.com,(267) 555-1200,1450.00,18,DL-PH305105,2028-10-18
C-302,David Chandler,david.chan@gmail.com,(215) 555-8930,350.00,4,DL-NJ104829,2029-04-12`;
    }
    return `id,fineNumber,fineType,vehicleLicensePlate,customerName,dateOfFine,dateTimeOfOffense,amount,paidToAuthority,notes
F-601,FN-38295,Parking,PHL-EV-952,Precious Thompson,2026-05-15,2026-05-15 14:30,45.00,No,Meter Expired
F-602,FN-49582,Speeding,PHL-SUV-828,Marcus Vance,2026-05-18,2026-05-18 09:12,120.00,Yes,Radar Over 15mph`;
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
        errors: ["Raw content input is empty."],
        summary: "Please provide valid .csv data or paste rows above before validating."
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
          errors: ["Missing headers or body row."],
          summary: "A valid CSV must contain at least a header line and one operational records line."
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
          errors.push(`Row ${idx + 2}: Column alignment mismatch (expected ${headers.length}, got ${cols.length})`);
          return;
        }

        const obj: any = {};
        headers.forEach((h, colIdx) => {
          obj[h] = cols[colIdx];
        });
        records.push(obj);
      });

      validateAndSetRecords(records, errors);
    } catch (err: any) {
      setParseResults({
        success: false,
        data: [],
        errors: [`Syntax reading error: ${err.message}`],
        summary: "Failed to read CSV/JSON values correctly."
      });
    }
  };

  const validateAndSetRecords = (records: any[], initialErrors: string[] = []) => {
    const errors = [...initialErrors];
    const validatedData: any[] = [];

    records.forEach((rec, idx) => {
      const recordId = rec.id || `Imported-${targetSchema}-${Math.floor(1000 + Math.random() * 9000)}`;

      if (targetSchema === 'reservations') {
        const validated: Reservation = {
          id: recordId,
          customerName: rec.customerName || 'Anonymous Client',
          customerEmail: rec.customerEmail || 'imported@phillycarrental.com',
          customerPhone: rec.customerPhone || rec.phone || '(215) 555-0199',
          pickupDate: rec.pickupDate || '2026-06-01',
          returnDate: rec.returnDate || '2026-06-05',
          pickupLocation: rec.pickupLocation || 'Philly Hub',
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
          model: rec.model || `${rec.make || 'Toyota'} ${rec.model || 'Cruiser'}(${rec.year || '2024'})`,
          licensePlate: rec.licensePlate || 'PHL-MOCK-XX',
          vehicleClass: (rec.vehicleClass as any) || 'Premium',
          status: (rec.status as any) || 'Available',
          mileage: parseInt(rec.mileage) || 12050,
          fuelLevel: parseInt(rec.fuelLevel) || 100,
          engineTemp: 85,
          obdStatus: 'Healthy',
          lastLocation: { lat: 40.015, lng: -75.18, address: 'Philly Regional Hub' },
          telemetryStream: [{ time: '12:00', speed: 0, rpm: 750 }],
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
      summary: `Successfully parsed and staged ${validatedData.length} records.`
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-4xl w-full my-8 flex flex-col overflow-hidden max-h-[90vh] font-sans">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UploadCloud className="w-5 h-5 text-blue-600 animate-pulse" />
            <div>
              <h2 className="text-base font-bold text-slate-905">Operational CSV & JSON Importer</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Bulk-insert mock or enterprise entries directly into the active viewport session.</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 px-2 text-slate-400 hover:bg-slate-100 rounded-md transition text-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Success Panel */}
          {importCompleted && (
            <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-xl flex items-start gap-3 select-none">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-emerald-800">Operational Update Merged</span>
                <p className="text-[11px] text-emerald-600 mt-1">
                  Successfully imported <strong>{importCount}</strong> entries into the active table module. Ledgers and active totals recalculated immediately.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setImportCompleted(false)}
                    className="text-[10px] text-emerald-700 font-bold hover:underline mt-2 cursor-pointer"
                  >
                    Import more CSV data
                  </button>
                  <span className="text-[10px] text-slate-350 font-bold mt-2 select-none">|</span>
                  <button
                    onClick={onClose}
                    className="text-[10px] text-slate-600 font-bold hover:underline mt-2 cursor-pointer"
                  >
                    Close dialog
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Config Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 border border-slate-200/60 rounded-xl select-none">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700">Target Table Register</span>
              <p className="text-[10px] text-slate-400 font-sans">Choose the schema structure your CSV fits into</p>
            </div>

            <div className="flex bg-slate-200/70 p-1 rounded-lg text-[11px] font-semibold">
              {(['reservations', 'vehicles', 'customers', 'fines'] as SchemaType[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setTargetSchema(tab);
                    setParseResults(null);
                    setImportCompleted(false);
                  }}
                  className={`px-3 py-1.5 rounded transition capitalize cursor-pointer ${
                    targetSchema === tab
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Drag Drop File Block */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest leading-none">
                File Uploader
              </label>

              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 relative h-40 ${
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
                <UploadCloud className="w-8 h-8 text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-slate-800 truncate px-4 max-w-full">
                    {fileName ? `File: ${fileName}` : 'Drop here or Browse'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    supports .csv and raw .json
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                <div className="flex gap-2 items-center">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] font-bold text-slate-750">Sample Structure File</span>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleTemplate}
                  className="flex items-center gap-1 bg-white hover:bg-slate-50 border px-2 py-1 text-[10px] font-bold text-slate-700 rounded-md transition shadow-2xs cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Get Template</span>
                </button>
              </div>
            </div>

            {/* Pasting raw Data option */}
            <div className="space-y-3">
              <div className="flex items-center justify-between select-none leading-none">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest leading-none">
                  Paste Raw Data Rows
                </label>
                <button
                  type="button"
                  onClick={() => setPasteContent(getTemplatePlaceholder())}
                  className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Load Sample CSV Rows
                </button>
              </div>

              <textarea
                value={pasteContent}
                onChange={(e) => {
                  setPasteContent(e.target.value);
                  setParseResults(null);
                }}
                placeholder={`id,customerName,customerEmail,phone...\n101,John Doe,john@test.com...`}
                className="w-full h-52 bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] font-mono text-slate-705 focus:outline-none focus:border-blue-400 focus:bg-white resize-none"
              />
            </div>

          </div>

          {/* Actions line */}
          <div className="bg-slate-50 p-4 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
            <p className="text-[10px] text-slate-400 max-w-md leading-relaxed">
              Automated headers analysis maps standard CSV layouts. Click the stage analyzer to confirm proper alignment before running import.
            </p>
            <button
              type="button"
              onClick={handleRunParser}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 font-bold text-white text-xs rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer self-end sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Validate & Stage Sheet</span>
            </button>
          </div>

          {/* Staged results visualizer */}
          {parseResults && (
            <div className="border border-slate-220 rounded-xl overflow-hidden shadow-2xs select-none">
              
              <div className={`p-3.5 border-b flex items-center justify-between ${
                parseResults.success 
                  ? 'bg-emerald-50/50 border-emerald-100 text-emerald-805' 
                  : 'bg-amber-100/50 border-amber-200 text-amber-805'
              }`}>
                <div className="flex items-center gap-2">
                  {parseResults.success ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 animate-bounce" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  )}
                  <span className="text-xs font-bold leading-none">{parseResults.summary}</span>
                </div>
              </div>

              {parseResults.errors.length > 0 && (
                <div className="p-4 bg-red-50 border-b border-red-150 text-red-700 text-xs font-sans">
                  <span className="font-bold">Errors found in validation check:</span>
                  <ul className="list-disc pl-5 mt-1 text-[11px] font-mono max-h-24 overflow-y-auto">
                    {parseResults.errors.map((err, idx) => <li key={idx}>{err}</li>)}
                  </ul>
                </div>
              )}

              {parseResults.data.length > 0 && (
                <div>
                  <div className="p-3 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b">
                    Structured Table Preview (Top {Math.min(parseResults.data.length, 3)} Records)
                  </div>
                  <div className="max-h-40 overflow-y-auto bg-white divide-y divide-slate-100 text-[11px]">
                    {parseResults.data.slice(0, 3).map((item, i) => (
                      <div key={i} className="p-3 flex items-center justify-between hover:bg-slate-50/50">
                        <div className="truncate pr-4">
                          <span className="font-mono font-bold text-slate-400 mr-2">#{item.id}</span>
                          <span className="font-bold text-slate-750">
                            {targetSchema === 'reservations' ? item.customerName :
                             targetSchema === 'vehicles' ? item.model :
                             targetSchema === 'customers' ? item.name : item.notes}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 py-0.5 px-2 rounded-full font-bold">
                          Stage ok
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions line */}
                  <div className="p-3.5 bg-slate-50 border-t flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setParseResults(null)}
                      className="px-3.5 py-1.5 text-xs text-slate-500 bg-white hover:bg-slate-100 border transition rounded-lg font-bold cursor-pointer"
                    >
                      Discard Stage
                    </button>
                    <button
                      type="button"
                      onClick={handleCommitImport}
                      className="px-4 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 transition rounded-lg font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>Commit {parseResults.data.length} Records</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer shadow-2xs"
          >
            Close Operational Window
          </button>
        </div>

      </div>
    </div>
  );
}
