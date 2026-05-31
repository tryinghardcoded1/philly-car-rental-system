/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  CalendarRange, 
  UserX, 
  FileText, 
  CreditCard, 
  Scale, 
  Gauge, 
  ShieldAlert, 
  DollarSign, 
  Calculator,
  ChevronLeft,
  ChevronRight,
  Car,
  Users,
  Receipt,
  Calendar,
  Coins,
  Network,
  Folder,
  Radio,
  Wrench,
  Hammer,
  UploadCloud,
  DownloadCloud,
  Trash2
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Overview' },
    { id: 'reservations', label: 'Reservations', icon: CalendarRange, category: 'Car Rental' },
    { id: 'attempts', label: 'Reservation Attempts', icon: UserX, category: 'Car Rental' },
    { id: 'quotes', label: 'Quotes', icon: FileText, category: 'Car Rental' },
    { id: 'payments', label: 'Payments', icon: CreditCard, category: 'Car Rental' },
    { id: 'external_charges', label: 'External Charges', icon: Receipt, category: 'Car Rental' },
    { id: 'calendar', label: 'Calendar Grid', icon: Calendar, category: 'Car Rental' },
    { id: 'commissions', label: 'Commissions', icon: Coins, category: 'Car Rental' },
    { id: 'commission_partners', label: 'Commission Partners', icon: Network, category: 'Car Rental' },
    
    { id: 'telematics', label: 'Telematics Map Feed', icon: Radio, category: 'Fleet OBD-II' },
    { id: 'fleet', label: 'Vehicles Ledger', icon: Car, category: 'Fleet OBD-II' },
    { id: 'maintenance', label: 'Maintenance Schedule', icon: Wrench, category: 'Fleet OBD-II' },
    { id: 'repair_orders', label: 'Mechanical Repair Orders', icon: Hammer, category: 'Fleet OBD-II' },
    
    { id: 'customers', label: 'Client CRM Profile', icon: Users, category: 'Customer Portal' },
    { id: 'booking', label: 'Booking Desk (Sign)', icon: Calculator, category: 'Customer Portal' },
    { id: 'claims', label: 'Insurance & Claims', icon: ShieldAlert, category: 'Operations & Ops' },
    { id: 'files', label: 'CRM Files Manager', icon: Folder, category: 'Operations & Ops' },
    { id: 'fines', label: 'Fines & Tolls list', icon: Scale, category: 'Operations & Ops' },
    { id: 'rates', label: 'Dynamic Base Rates', icon: DollarSign, category: 'Operations & Ops' },
    
    { id: 'import_data', label: 'Import CSV Data', icon: UploadCloud, category: 'Data & Admin Tasks' },
    { id: 'export_data', label: 'Export Records Ledger', icon: DownloadCloud, category: 'Data & Admin Tasks' },
    { id: 'delete_records', label: 'Purges & Sandbox Reset', icon: Trash2, category: 'Data & Admin Tasks' }
  ];

  // Group items by category
  const categories = ['Overview', 'Car Rental', 'Fleet OBD-II', 'Customer Portal', 'Operations & Ops', 'Data & Admin Tasks'];

  return (
    <aside 
      className={`bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col border-r border-slate-800/60 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header with custom image logo */}
      <div className="p-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-slate-700/60">
            <img 
              src="https://phillycarrental.com/wp-content/uploads/2026/05/Untitled-design-2.png" 
              alt="Philly Car Rental Logo" 
              className="w-full h-full object-contain p-0.5"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallback = parent.querySelector('.fallback-svg');
                  if (fallback) fallback.classList.remove('hidden');
                }
              }}
            />
            <svg className="w-5 h-5 text-white fallback-svg hidden" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3z"/>
              <path d="M14 7h-3v8h1.05a2.5 2.5 0 014.9 0H17a1 1 0 001-1V9.414a1 1 0 00-.293-.707l-2-2A1 1 0 0015.414 7h-.414z"/>
            </svg>
          </div>
          {!collapsed && (
            <span className="text-white font-bold tracking-tight text-[15px] whitespace-nowrap">
              Philly Car Rental
            </span>
          )}
        </div>
        {!collapsed && (
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-500 hover:text-white hover:bg-slate-800 p-1 rounded-md transition ml-1"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {collapsed && (
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-500 hover:text-white hover:bg-slate-800 p-1 rounded-md transition"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-2 space-y-4 overflow-y-auto">
        {categories.map((cat) => {
          const itemsInCat = menuItems.filter(item => item.category === cat);
          if (itemsInCat.length === 0) return null;

          return (
            <div key={cat} className="space-y-1">
              {!collapsed && (
                <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-4 block">
                  {cat}
                </h3>
              )}
              {itemsInCat.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm transition-all duration-200 group relative ${
                      isActive 
                        ? 'bg-slate-800 text-white font-semibold shadow-sm border border-slate-700/50' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mr-3 shrink-0 transition-opacity ${isActive ? 'opacity-100 text-blue-450' : 'opacity-70 group-hover:opacity-100'}`} />
                    {!collapsed && (
                      <span className="font-sans truncate">{item.label}</span>
                    )}

                    {/* Tooltip for collapsed mode */}
                    {collapsed && (
                      <div className="absolute left-16 top-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 transition origin-left bg-slate-950 text-white text-xs rounded py-1.5 px-3 z-50 whitespace-nowrap font-sans pointer-events-none shadow-xl border border-slate-800">
                        {item.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Operator Session Info */}
      <div className="p-4 border-t border-slate-800 shrink-0 text-xs font-mono text-slate-500">
        {!collapsed ? (
          <div className="space-y-1">
            <div className="text-slate-400 font-sans truncate">Active Operator: philly</div>
            <div className="text-[10px] text-slate-500 leading-tight">Branch: Philadelphia NW</div>
            <div className="text-[9px] text-blue-400/80 mt-1">v1.2.6-stable</div>
          </div>
        ) : (
          <div className="text-center font-sans font-semibold text-blue-500">P</div>
        )}
      </div>
    </aside>
  );
}
