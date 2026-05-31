/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Plus, 
  Upload, 
  Image as ImageIcon, 
  Phone, 
  Mail, 
  Clock, 
  Check, 
  Activity, 
  AlertTriangle,
  UserCheck,
  Send,
  MessageSquare
} from 'lucide-react';
import { InsuranceClaim, Vehicle, Reservation } from '../types';

interface ClaimsViewProps {
  claims: InsuranceClaim[];
  vehicles: Vehicle[];
  reservations: Reservation[];
  onAddClaim: (c: InsuranceClaim) => void;
  onUpdateClaim: (updated: InsuranceClaim) => void;
}

export default function ClaimsView({ 
  claims, 
  vehicles, 
  reservations, 
  onAddClaim, 
  onUpdateClaim 
}: ClaimsViewProps) {
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim>(claims[0] || {} as InsuranceClaim);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Correspondence state
  const [operatorMsg, setOperatorMsg] = useState('');

  // Form states for adding new claim
  const [vId, setVId] = useState('');
  const [resId, setResId] = useState('');
  const [incidentDate, setIncidentDate] = useState('2026-05-25');
  const [summary, setSummary] = useState('');
  const [cost, setCost] = useState('850.00');
  const [adjName, setAdjName] = useState('Morgan Vance');
  const [adjCo, setAdjCo] = useState('Keystone claim Adjusters');
  const [adjEmail, setAdjEmail] = useState('morgan.v@keystone.com');
  const [adjPhone, setAdjPhone] = useState('215-555-5201');
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=600'
  ]);

  // Handle Photo Selector & conversion to base64 preview
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const base64str = event.target.result as string;
        
        // If uploading for a new claim form
        setEvidencePhotos(prev => [...prev, base64str]);

        // Or if modifying the currently selected active claim
        if (selectedClaim && selectedClaim.id) {
          const updated = {
            ...selectedClaim,
            photoEvidenceUrls: [...selectedClaim.photoEvidenceUrls, base64str]
          };
          onUpdateClaim(updated);
          setSelectedClaim(updated);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePostCommunication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorMsg.trim()) return;

    const updatedComm = [
      ...selectedClaim.communications,
      {
        date: new Date().toISOString().slice(0, 10),
        sender: 'Staff Agent (philly)',
        message: operatorMsg
      }
    ];

    const updatedClaim = {
      ...selectedClaim,
      communications: updatedComm
    };

    onUpdateClaim(updatedClaim);
    setSelectedClaim(updatedClaim);
    setOperatorMsg('');
  };

  const handleSaveClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vId || !resId) return;

    const targetVeh = vehicles.find(v => v.id === vId);
    const targetRes = reservations.find(r => r.id === resId);
    if (!targetVeh || !targetRes) return;

    const newClaim: InsuranceClaim = {
      id: 'CLM' + (claims.length + 1).toString(),
      claimNumber: 'CLM-' + Math.floor(700 + Math.random() * 300),
      vehicleId: vId,
      vehicleModel: targetVeh.model,
      vehicleLicensePlate: targetVeh.licensePlate,
      reservationId: resId,
      customerName: targetRes.customerName,
      incidentDate: incidentDate,
      reportedDate: new Date().toISOString().slice(0, 10),
      description: summary,
      estimatedDamageAmount: parseFloat(cost) || 350.00,
      claimResolutionStatus: 'Pending Adjuster',
      adjusterInfo: {
        name: adjName,
        company: adjCo,
        email: adjEmail,
        phone: adjPhone
      },
      photoEvidenceUrls: evidencePhotos,
      communications: [
        { date: new Date().toISOString().slice(0, 10), sender: 'Staff Agent', message: 'Reported to claims office. Photo logs synced.' }
      ]
    };

    onAddClaim(newClaim);
    setShowAddModal(false);
    setSelectedClaim(newClaim);
    // reset EvidencePhotos
    setEvidencePhotos([
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=600'
    ]);
  };

  const filteredClaims = claims.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      c.claimNumber.toLowerCase().includes(term) ||
      c.vehicleModel.toLowerCase().includes(term) ||
      c.customerName.toLowerCase().includes(term) ||
      c.adjusterInfo.name.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Damage Claims Desk</h1>
          </div>
          <p className="text-sm text-slate-500 font-sans mt-0.5">
            Log fleet incidents, compile photographic vehicle reports, and track resolution audits with insurance adjusters.
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 self-start sm:self-auto bg-blue-600 text-white px-3.5 py-2 text-xs font-sans font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log Damage Incident</span>
        </button>
      </div>

      {/* Main Grid View split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side Claims List - 5 spans */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold font-sans text-slate-900">Incident Logs</h3>
            <p className="text-xs text-slate-400 font-sans">Index of filed reports and adjuster assignments.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Filter claims by code, vehicle, name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 pl-9 pr-4 py-2 text-xs font-sans rounded-lg border border-slate-200 focus:outline-none"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredClaims.map(claim => (
              <button
                key={claim.id}
                onClick={() => setSelectedClaim(claim)}
                className={`w-full text-left p-4 rounded-xl border transition flex flex-col gap-2 ${
                  selectedClaim.id === claim.id 
                    ? 'bg-blue-50/40 border-blue-400 shadow-xs' 
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-800">{claim.claimNumber}</span>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
                    claim.claimResolutionStatus === 'Settled' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    claim.claimResolutionStatus === 'Pending Adjuster' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    {claim.claimResolutionStatus}
                  </span>
                </div>

                <div className="text-xs font-sans text-slate-600">
                  <div>Model: <strong className="text-slate-800">{claim.vehicleModel}</strong></div>
                  <div>Renter: <strong className="text-slate-800">{claim.customerName}</strong></div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-100/60">
                  <span>Reported: {claim.reportedDate}</span>
                  <span className="font-semibold text-slate-700">${claim.estimatedDamageAmount.toFixed(2)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side Damage Inspection Detail Panel - 7 spans */}
        <div className="lg:col-span-7 space-y-6">
          {selectedClaim.id ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              
              {/* Profile sub-header */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="bg-rose-50 text-rose-700 font-mono text-[9px] px-2 py-0.5 rounded border border-rose-100 font-bold uppercase">DOCKET CODE: {selectedClaim.claimNumber}</span>
                  <h2 className="text-lg font-bold text-slate-900 font-sans mt-1">{selectedClaim.vehicleModel} ({selectedClaim.vehicleLicensePlate})</h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-sans">Workflow:</span>
                  <select
                    value={selectedClaim.claimResolutionStatus}
                    onChange={(e) => {
                      const updated = { ...selectedClaim, claimResolutionStatus: e.target.value as any };
                      onUpdateClaim(updated);
                      setSelectedClaim(updated);
                    }}
                    className="text-xs bg-slate-50 border border-slate-250 rounded font-sans font-semibold text-slate-700 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Pending Adjuster">Pending Adjuster Review</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Approved">Claim Approved</option>
                    <option value="Settled">Audited & Settled</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* General Description Card */}
              <div className="space-y-1 bg-slate-50 border border-slate-150 p-4 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-sans">Report Description Summary</span>
                <p className="text-xs font-sans text-slate-700 leading-relaxed pt-1">
                  {selectedClaim.description}
                </p>
                <div className="text-[10px] font-mono text-slate-400 pt-2 flex justify-between">
                  <span>Incident Date: {selectedClaim.incidentDate}</span>
                  <span>Estimated Payout Value: <strong className="text-slate-700">${selectedClaim.estimatedDamageAmount.toFixed(2)}</strong></span>
                </div>
              </div>

              {/* Adjuster details panel */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-slate-800 uppercase font-sans flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Licensed Adjuster of Record</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="bg-slate-50/50 p-3 border border-slate-100 rounded-lg space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Adjuster Personal</span>
                    <div className="font-bold text-slate-800">{selectedClaim.adjusterInfo.name}</div>
                    <div className="text-slate-500 font-medium">{selectedClaim.adjusterInfo.company}</div>
                  </div>
                  <div className="bg-slate-50/50 p-3 border border-slate-100 rounded-lg space-y-1.5 text-[11px] font-mono text-slate-600">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Insurance contact</span>
                    <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {selectedClaim.adjusterInfo.phone}</div>
                    <div className="flex items-center gap-1.5 text-blue-600 hover:underline cursor-pointer"><Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {selectedClaim.adjusterInfo.email}</div>
                  </div>
                </div>
              </div>

              {/* Photo Evidence section with drag-drop style trigger */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-slate-800 uppercase font-sans flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>Photographic Evidence Attached</span>
                </div>

                {/* Grid of photos */}
                <div className="grid grid-cols-3 gap-3">
                  {selectedClaim.photoEvidenceUrls.length === 0 ? (
                    <div className="col-span-3 py-6 text-center text-slate-400 text-xs italic">
                      No photo evidence attached. Access uploader below.
                    </div>
                  ) : (
                    selectedClaim.photoEvidenceUrls.map((url, uIdx) => (
                      <div key={uIdx} className="relative group rounded-lg overflow-hidden border border-slate-200 h-24 bg-slate-50">
                        <img 
                          src={url} 
                          alt="Fender Damage Preview" 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1 right-1 bg-slate-900/75 text-white font-mono text-[9px] px-1.5 rounded">
                          Claim Pic {uIdx + 1}
                        </div>
                      </div>
                    ))
                  )}

                  {/* Standard aesthetic Image drag file simulation trigger box */}
                  <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg flex flex-col items-center justify-center p-3 text-center cursor-pointer transition h-24 bg-slate-50/50">
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-[10px] font-sans font-bold text-slate-500 mt-1 block">Log Photo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* Adjuster Correspondence / Communications Logger */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-slate-800 uppercase font-sans flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Communications with Adjuster & Audits</span>
                </div>

                <div className="space-y-2 max-h-[160px] overflow-y-auto">
                  {selectedClaim.communications.map((c, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl space-y-1 block text-xs">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                        <span className="font-semibold text-slate-700">{c.sender}</span>
                        <span>{c.date}</span>
                      </div>
                      <p className="text-slate-600 font-sans leading-relaxed">{c.message}</p>
                    </div>
                  ))}
                </div>

                {/* Input form */}
                <form onSubmit={handlePostCommunication} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Type comments or adjuster response updates..."
                    value={operatorMsg}
                    onChange={(e) => setOperatorMsg(e.target.value)}
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 font-sans bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="text-center py-24 text-slate-400 font-sans border border-dashed border-slate-200 rounded-2xl bg-white">
              No dispute claims currently index. Create or select a ticket.
            </div>
          )}
        </div>

      </div>

      {/* Adding Claim Modal dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold font-sans text-slate-900">Log New Incident Dispute Report</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleSaveClaim} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Select Damaged Vehicle</label>
                  <select 
                    value={vId} onChange={(e) => setVId(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                    required
                  >
                    <option value="">-- Choose Unit --</option>
                    {vehicles.map(v => (
                       <option key={v.id} value={v.id}>{v.model} ({v.licensePlate})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Select Reservation Contract</label>
                  <select 
                    value={resId} onChange={(e) => setResId(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                    required
                  >
                    <option value="">-- Choose Reservation --</option>
                    {reservations.map(r => (
                       <option key={r.id} value={r.id}>[Res {r.id}] Renter: {r.customerName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Incident Date</label>
                  <input 
                    type="date" value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Estimated Loss Cost ($)</label>
                  <input 
                    type="number" value={cost} onChange={(e) => setCost(e.target.value)}
                    className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Incident details / damage findings</label>
                <textarea 
                  rows={2} required
                  placeholder="Rear fender panel scratches, headlight shattered..."
                  value={summary} onChange={(e) => setSummary(e.target.value)}
                  className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-sans tracking-wide block">External claims Adjuster contacts</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-0.5">Insurance Analyst Name</label>
                    <input 
                      type="text" value={adjName} onChange={(e) => setAdjName(e.target.value)}
                      className="w-full text-xs font-sans bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-0.5">Carrier Company</label>
                    <input 
                      type="text" value={adjCo} onChange={(e) => setAdjCo(e.target.value)}
                      className="w-full text-xs font-sans bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-0.5 font-mono">Email Address</label>
                    <input 
                      type="email" value={adjEmail} onChange={(e) => setAdjEmail(e.target.value)}
                      className="w-full text-xs font-mono bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-blue-600 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-0.5 font-mono">Telephone</label>
                    <input 
                      type="text" value={adjPhone} onChange={(e) => setAdjPhone(e.target.value)}
                      className="w-full text-xs font-mono bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-slate-600 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="button" onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-sans bg-slate-100 text-slate-500 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 font-sans bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition cursor-pointer"
                >
                  Post Dispute Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
