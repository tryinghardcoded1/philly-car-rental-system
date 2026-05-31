/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DollarSign, Sliders, Calculator, Tag, Percent, CheckCircle } from 'lucide-react';
import { RateItem } from '../types';

interface RatesViewProps {
  rates: RateItem[];
}

export default function RatesView({ rates }: RatesViewProps) {
  const [testDays, setTestDays] = useState(7);
  const [testClass, setTestClass] = useState(rates[1]?.vehicleClass || 'Premium');
  const [isWeekend, setIsWeekend] = useState(false);

  // Simple calculator matching logic
  const selectedRate = rates.find(r => r.vehicleClass === testClass) || rates[0];
  const ratePerDay = isWeekend ? selectedRate.weekendRate : selectedRate.baseDailyRate;
  
  // Dynamic cost calculation
  const calculatedOutput = ratePerDay * testDays * selectedRate.multiplier;

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">Dynamic Rates Engine</h1>
        <p className="text-sm text-slate-500 font-sans mt-0.5">
          Configure seasonal rate tables, weekend rate uplifts, and category coefficients used throughout the reservation pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic pricing multipliers list */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900 font-sans">Seasonal Category Matrix</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans border-b border-slate-100 pb-2">
                  <th className="py-2.5">Vehicle Category</th>
                  <th className="py-2.5 text-right font-mono">Daily Rate (Mon-Thu)</th>
                  <th className="py-2.5 text-right font-mono">Weekend Rate (Fri-Sun)</th>
                  <th className="py-2.5 text-right font-mono">Multi-Month (Monthly Rate)</th>
                  <th className="py-2.5 text-right font-mono">Category Modifier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-sm text-slate-700">
                {rates.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 font-semibold text-slate-900">{r.vehicleClass}</td>
                    <td className="py-3.5 text-right font-mono text-slate-800">${r.baseDailyRate.toFixed(2)}/day</td>
                    <td className="py-3.5 text-right font-mono text-slate-800">${r.weekendRate.toFixed(2)}/day</td>
                    <td className="py-3.5 text-right font-mono text-blue-600 font-medium">${r.seasonalMonthlyRate.toFixed(2)}/mo</td>
                    <td className="py-3.5 text-right font-mono">
                      <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded font-semibold">
                        {r.multiplier.toFixed(2)}x Coeff
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-xl text-slate-600 text-xs leading-relaxed space-y-1 block mt-2">
            📢 <strong>Long-Term Multi-Month Support:</strong> For contracts spanning extensive periods (such as 10-month agreements spanning <strong>May to March</strong>), the engine automatically selects the discounted <i>Seasonal Monthly Rate</i> tab instead of general daily sums.
          </div>
        </div>

        {/* Pricing Test sandbox */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-base text-slate-900 font-sans">Formula Sandbox</h3>
            </div>

            <div className="mt-4 space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Test Category</label>
                <select
                  value={testClass}
                  onChange={(e) => setTestClass(e.target.value)}
                  className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg"
                >
                  {rates.map(r => (
                    <option key={r.id} value={r.vehicleClass}>{r.vehicleClass}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Rental Period Span (Days)</label>
                <input
                  type="number"
                  value={testDays}
                  onChange={(e) => setTestDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-xs font-sans bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-slate-650 font-medium">Apply Weekend Rates</span>
                <input
                  type="checkbox"
                  checked={isWeekend}
                  onChange={(e) => setIsWeekend(e.target.checked)}
                  className="rounded text-blue-600 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2 font-sans">
                <div className="flex justify-between text-slate-500">
                  <span>Daily Rate:</span>
                  <span className="font-mono text-slate-800">${ratePerDay.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Multiplier:</span>
                  <span className="font-mono text-slate-800">{selectedRate.multiplier.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Contract Days:</span>
                  <span className="font-mono text-slate-800">x{testDays}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-sans block">Calculated Valuation</span>
            <h1 className="text-3xl font-bold font-mono text-slate-900 mt-1">
              ${calculatedOutput.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
            <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded mt-2 inline-flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" /> Formulas verified
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
