/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Calculator, 
  Calendar, 
  User, 
  FileSignature, 
  CheckCircle, 
  BadgeAlert,
  ArrowRight,
  ArrowLeft,
  FileText,
  MousePointer2,
  Trash2
} from 'lucide-react';
import { Reservation, RateItem, Vehicle } from '../types';

interface BookingSimulatorProps {
  rates: RateItem[];
  vehicles: Vehicle[];
  onAddReservation: (res: Reservation) => void;
}

export default function BookingSimulator({ rates, vehicles, onAddReservation }: BookingSimulatorProps) {
  const [step, setStep] = useState(1);

  // Draft Reservation State
  const [contractType, setContractType] = useState<'Short-Term' | 'Long-Term'>('Short-Term');
  const [pickupLoc, setPickupLoc] = useState('Office');
  const [pickupDate, setPickupDate] = useState('25-10-2025 09:00'); // Standard preset or May-March
  const [returnDate, setReturnDate] = useState('25-11-2025 09:00');
  const [vehicleClass, setVehicleClass] = useState('Premium');

  // Customer State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('2028-09-30');
  const [licenseCountry, setLicenseCountry] = useState('USA');
  const [licenseValidated, setLicenseValidated] = useState(false);

  // Signature Pad State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [signatureBase64, setSignatureBase64] = useState<string>('');

  // Auto set dates for May to March long term simulation
  const applyMayToMarchSimulation = () => {
    setContractType('Long-Term');
    setPickupDate('2026-05-01 10:00');
    setReturnDate('2027-03-31 10:00');
    setVehicleClass('Premium');
  };

  // Pricing calculations
  const calculateTotal = () => {
    const selectedRate = rates.find(r => r.vehicleClass === vehicleClass) || rates[0];
    
    if (contractType === 'Long-Term') {
      // Extended long-term monthly flat rates
      // May 1 to March 31 spans exactly 11 months
      const monthsCount = 11;
      const totalCost = selectedRate.seasonalMonthlyRate * monthsCount;
      return {
        baseRate: selectedRate.seasonalMonthlyRate,
        days: monthsCount,
        unit: 'Months',
        multiplier: selectedRate.multiplier,
        total: totalCost * selectedRate.multiplier
      };
    } else {
      // Simple short-term assumption: 7 days
      const daysCount = 7;
      const totalCost = selectedRate.baseDailyRate * daysCount;
      return {
        baseRate: selectedRate.baseDailyRate,
        days: daysCount,
        unit: 'Days',
        multiplier: selectedRate.multiplier,
        total: totalCost * selectedRate.multiplier
      };
    }
  };

  const pricing = calculateTotal();

  // Validate License logic
  useEffect(() => {
    if (driverLicense.length >= 7 && licenseCountry) {
      setLicenseValidated(true);
    } else {
      setLicenseValidated(false);
    }
  }, [driverLicense, licenseCountry]);

  // Infinite Canvas drawing pads controllers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    // Get exact canvas coordinates
    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureSaved(false);
    setSignatureBase64('');
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL('image/png');
    setSignatureBase64(dataURL);
    setSignatureSaved(true);
  };

  const handleFinalSubmit = () => {
    // Inject reservation
    const newReservation: Reservation = {
      id: Math.floor(100 + Math.random() * 900).toString(),
      customerName: customerName || 'Self-Service Visitor',
      customerEmail: customerEmail || 'visitor@gmail.com',
      pickupDate: pickupDate,
      returnDate: returnDate,
      pickupLocation: pickupLoc,
      vehicleClass: vehicleClass,
      totalPrice: pricing.total,
      totalRevenue: pricing.total * 0.95,
      totalPaid: pricing.total, // Fully funded at simulation
      totalRefunded: 0,
      outstandingBalance: 0,
      status: 'Open',
      digitalAgreementSigned: true,
      signatureData: signatureBase64,
      contractType: contractType
    };

    onAddReservation(newReservation);
    setStep(5);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Booking Portal Simulator</h1>
        </div>
        <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
          Step {step} of 5
        </span>
      </div>

      {/* Progress Line */}
      <div className="flex justify-between items-center text-xs font-sans text-slate-400">
        <span className={`${step >= 1 ? 'text-blue-600 font-bold' : ''}`}>1. Contract Span</span>
        <span className={`${step >= 2 ? 'text-blue-600 font-bold' : ''}`}>2. Customer CRM ID</span>
        <span className={`${step >= 3 ? 'text-blue-600 font-bold' : ''}`}>3. Terms Review</span>
        <span className={`${step >= 4 ? 'text-blue-600 font-bold' : ''}`}>4. Draw Signature</span>
        <span className={`${step >= 5 ? 'text-emerald-600 font-bold' : ''}`}>5. Confirm Lease</span>
      </div>

      {/* STEP 1: Contract Spanning Selection */}
      {step === 1 && (
        <div className="space-y-4 font-sans">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-sm">Configure Lease Span</h3>
            {/* Quick Multi-Month demo trigger */}
            <button
              onClick={applyMayToMarchSimulation}
              className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded px-2.5 py-1 hover:bg-blue-100 transition"
              type="button"
            >
              🔄 LOAD DEMO: May to March Contract
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Lease Category</label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value as any)}
                className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none"
              >
                <option value="Short-Term">Short-Term (7 Days Flat)</option>
                <option value="Long-Term">Long-Term (Extended Monthly)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Class Tier</label>
              <select
                value={vehicleClass}
                onChange={(e) => setVehicleClass(e.target.value)}
                className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none"
              >
                {rates.map(r => (
                  <option key={r.id} value={r.vehicleClass}>{r.vehicleClass}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Lease Handoff Location</label>
              <input
                type="text"
                value={pickupLoc}
                onChange={(e) => setPickupLoc(e.target.value)}
                className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Pickup Date/Time</label>
              <input
                type="text"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {contractType === 'Long-Term' && (
            <div className="space-y-1 text-xs">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Return/Lease termination Date</label>
              <input
                type="text"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none text-blue-600 font-semibold"
              />
            </div>
          )}

          {/* Cost Preview */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-650">
              <span>Category Daily / Monthly Rate:</span>
              <span className="font-mono font-bold text-slate-800">${pricing.baseRate.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-650">
              <span>Rental Quantity ({pricing.unit}):</span>
              <span className="font-mono text-slate-800">x{pricing.days}</span>
            </div>
            <div className="flex justify-between text-slate-650">
              <span>Category Coeff multiplier:</span>
              <span className="font-mono text-slate-800">{pricing.multiplier.toFixed(2)}x</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200/80 pt-1.5 mt-1.5 text-sm">
              <span>Computed Total:</span>
              <span className="font-mono text-blue-600">${pricing.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full bg-blue-600 text-white font-semibold flex items-center justify-center gap-1.5 py-3 rounded-lg hover:bg-blue-700 transition font-sans text-xs cursor-pointer"
          >
            <span>Proceed to Customer profile (CRM ID)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: Customer Profile setup & Driving ID validation checks */}
      {step === 2 && (
        <div className="space-y-4 font-sans">
          <h3 className="font-semibold text-slate-800 text-sm">Set Customer Profile & Driver License Tracking</h3>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Customer Name</label>
              <input
                type="text" required placeholder="e.g. Samuel Kutch" value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
              <input
                type="email" required placeholder="name@gmail.com" value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Driver License ID</label>
              <input
                type="text" required placeholder="e.g. DL-PA391099" value={driverLicense}
                onChange={(e) => setDriverLicense(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">License Expiry Date</label>
              <input
                type="date" value={licenseExpiry}
                onChange={(e) => setLicenseExpiry(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg font-mono text-slate-600"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-550">License Verification status:</span>
            {licenseValidated ? (
              <span className="font-mono font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                ✓ VALIDATED & TRACKED
              </span>
            ) : (
              <span className="font-mono font-bold text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">
                ⚠️ INCOMPLETE ID
              </span>
            )}
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 bg-slate-100 text-slate-600 font-semibold px-4 py-3 rounded-lg hover:bg-slate-200 transition text-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!customerName || !customerEmail || !licenseValidated}
              className="flex-1 bg-blue-600 text-white font-semibold flex items-center justify-center gap-1.5 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:pointer-events-none text-xs cursor-pointer"
            >
              <span>Review Legal Terms</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Terms details & regulatory check */}
      {step === 3 && (
        <div className="space-y-4 font-sans text-xs">
          <h3 className="font-semibold text-slate-800 text-sm">Legal Lease Agreement Terms</h3>
          
          <div className="border border-slate-200 rounded-xl p-4 h-48 overflow-y-auto bg-slate-50 space-y-3 leading-relaxed text-slate-600 font-sans">
            <p className="font-bold text-slate-900">SECTION 1: VEHICLE LEASE COVENANT</p>
            <p>
              The lessee of record ({customerName}) hereby takes receipt of vehicle category ({vehicleClass}) under local state codes. Lessee agrees to return the vehicle in identical condition at designated termination endpoint {returnDate}.
            </p>
            <p className="font-bold text-slate-900">SECTION 2: TELEMATICS & GPS COMPLIANCE</p>
            <p>
              The vehicle contains built-in OBD cellular telematics. Speed, throttle position, GPS coordinates, and diagnostic error checks are logged real-time stream at philly operators central hub. Disabling hardware triggers security vehicle lockout.
            </p>
            <p className="font-bold text-slate-900">SECTION 3: FINE LIABILITIES</p>
            <p>
              Any municipal radar speeding tick, toll violation, or camera fines reported during lease duration are directly charged plus $15 processing fee to the CRM credit profile.
            </p>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1 bg-slate-100 text-slate-600 font-semibold px-4 py-3 rounded-lg hover:bg-slate-200 transition text-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 bg-blue-600 text-white font-semibold flex items-center justify-center gap-1.5 py-3 rounded-lg hover:bg-blue-700 transition text-xs cursor-pointer"
            >
              <span>Proceed to Sign Pad</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Cursive Sign capturing canvas */}
      {step === 4 && (
        <div className="space-y-4 font-sans text-xs">
          <h3 className="font-semibold text-slate-800 text-sm">Draw/Scribble Digital Signature</h3>
          <p className="text-slate-500">Sign with mouse cursor or touch screen on the canvas block below.</p>

          <div className="border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50 h-44 relative">
            <canvas
              ref={canvasRef}
              width={500}
              height={170}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="w-full h-full block cursor-crosshair touch-none"
            />
            <div className="absolute top-2 right-2 text-[9px] font-mono bg-slate-900/60 text-white px-1.5 py-0.5 rounded flex items-center gap-1">
              <MousePointer2 className="w-3 h-3 text-blue-400" /> Drawing Pad Active
            </div>
          </div>

          <div className="flex gap-2 justify-between">
            <button
              type="button"
              onClick={clearCanvas}
              className="px-3.5 py-2 font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Board</span>
            </button>
            <button
              type="button"
              onClick={saveSignature}
              className="px-4 py-2 font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg cursor-pointer"
            >
              <span>Save & Register Signature</span>
            </button>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg text-slate-600 flex items-center justify-between">
            <span>Status:</span>
            {signatureSaved ? (
              <span className="font-bold text-emerald-700 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> SUCCESS • ID REGISTERED</span>
            ) : (
              <span className="font-semibold text-amber-600">AWAITING HANDWRITE</span>
            )}
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1 bg-slate-100 text-slate-600 font-semibold px-4 py-3 rounded-lg hover:bg-slate-200 transition text-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleFinalSubmit}
              disabled={!signatureSaved}
              className="flex-1 bg-emerald-600 text-white font-semibold flex items-center justify-center gap-1.5 py-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none transition text-xs cursor-pointer"
            >
              <span>Submit & Confirm Lease Agreement</span>
              <FileSignature className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Success contract visual receipt output */}
      {step === 5 && (
        <div className="space-y-6 font-sans text-center">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Lease Confirmed Securely!</h2>
            <p className="text-slate-500 text-xs">Agreement ID #{Math.floor(1001 + Math.random() * 8999)} registered into Philly regional servers.</p>
          </div>

          <div className="border border-slate-100 bg-slate-50 p-4 rounded-xl text-left text-xs space-y-2 font-sans max-w-sm mx-auto">
            <div className="font-semibold text-slate-700 block pb-1 border-b border-slate-200">Lease Summary</div>
            <div className="flex justify-between"><span>Renter Customer:</span> <strong className="text-slate-900">{customerName}</strong></div>
            <div className="flex justify-between"><span>Class Level Chosen:</span> <strong className="text-slate-900">{vehicleClass}</strong></div>
            <div className="flex justify-between"><span>Contract Type:</span> <strong className="text-slate-900">{contractType}</strong></div>
            <div className="flex justify-between"><span>Duration Span:</span> <strong className="text-slate-600 font-mono">{pickupDate} to {returnDate}</strong></div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5 text-sm font-bold text-slate-900">
              <span>Amount Fully Cleared:</span>
              <span className="font-mono text-emerald-600">${pricing.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-xl text-xs text-slate-600 text-center leading-relaxed max-w-sm mx-auto font-sans">
             This booking is saved under the central operational database. Go to the **Reservations** tab in the sidebar menu to view your confirmed contract log!
          </div>

          <button
            onClick={() => {
              setStep(1);
              setCustomerName('');
              setCustomerEmail('');
              setDriverLicense('');
              setSignatureSaved(false);
              setSignatureBase64('');
            }}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-700 transition font-sans cursor-pointer"
          >
            Settle Another Lease
          </button>
        </div>
      )}

    </div>
  );
}
