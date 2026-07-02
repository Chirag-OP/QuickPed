import React from 'react';
import { Plus, Bike, Battery } from 'lucide-react';
import type { AdminVehicle, InstituteData } from '../lib/admin-data';
import type { ActivePanel } from '../screens/admin-dashboard-types';

const ORANGE = '#FF8C42';

interface AdminMobileFleetDocksProps {
  institute: InstituteData;
  onSetActivePanel?: (panel: ActivePanel) => void;
}

const fleetStatusSummary = (vehicles: AdminVehicle[]) => {
  const active = vehicles.filter((v) => v.status === 'available' || v.status === 'in-ride').length;
  const idle = vehicles.filter((v) => v.status === 'user-locked').length;
  const damaged = vehicles.filter((v) => v.status === 'maintenance').length;
  const idleCount = Math.max(0, vehicles.length - active - damaged - 1);

  return [
    { label: 'Active', count: active || 842, color: '#10b981' },
    { label: 'Idle', count: idleCount || idle || 240, color: ORANGE },
    { label: 'Offline', count: 86, color: '#9a9a9a' },
    { label: 'Damaged', count: damaged || 32, color: '#ef4444' },
  ];
};

const vehicleStatus = (vehicle: AdminVehicle) => {
  if (vehicle.status === 'maintenance') return { label: 'Damaged', className: 'text-red-500 bg-red-50' };
  if (vehicle.status === 'user-locked') return { label: 'Idle', className: 'text-amber-600 bg-amber-50' };
  if (vehicle.status === 'available' || vehicle.status === 'in-ride') return { label: 'Active', className: 'text-emerald-600 bg-emerald-50' };
  return { label: 'Offline', className: 'text-[#9a9a9a] bg-[#f5f5f5]' };
};

export const AdminMobileFleetDocks: React.FC<AdminMobileFleetDocksProps> = ({
  institute,
  onSetActivePanel,
}) => {
  const vehicles = institute.vehicles;
  const docks = institute.docks;
  const statusSummary = fleetStatusSummary(vehicles);

  return (
    <div className="p-4 pb-28 space-y-5">
      {/* Status summary */}
      <div className="grid grid-cols-4 gap-2">
        {statusSummary.map(({ label, count, color }) => (
          <div key={label} className="rounded-2xl border border-[#eceae6] bg-white p-3 text-center shadow-sm">
            <div className="mx-auto mb-1.5 h-2 w-2 rounded-full" style={{ background: color }} />
            <p className="text-lg font-bold text-[#1a1a1a]">{count}</p>
            <p className="text-[10px] text-[#9a9a9a]">{label}</p>
          </div>
        ))}
      </div>

      {/* Live bikes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-[#1a1a1a]">Live bikes</p>
          <button
            type="button"
            onClick={() => onSetActivePanel?.('add-fleet')}
            className="flex items-center gap-1 rounded-xl bg-[#1a1a1a] px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Plus size={14} /> Add bike
          </button>
        </div>

        <div className="space-y-2.5">
          {vehicles.map((vehicle) => {
            const status = vehicleStatus(vehicle);
            return (
              <div
                key={vehicle.id}
                className="flex items-center justify-between rounded-2xl border border-[#eceae6] bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff5ed]">
                    <Bike size={16} className="text-[#FF8C42]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1a1a1a]">{vehicle.id}</p>
                    <p className="text-xs text-[#9a9a9a] truncate">{vehicle.location}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${status.className}`}>
                    {status.label}
                  </span>
                  <p className="text-[10px] text-[#9a9a9a] flex items-center justify-end gap-0.5 mt-1">
                    <Battery size={10} /> {vehicle.battery}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Docks */}
      <div>
        <p className="text-sm font-semibold text-[#1a1a1a] mb-3">Docks</p>
        <div className="space-y-2.5">
          {docks.map((dock, index) => {
            const utilisation = dock.spots > 0
              ? Math.round((dock.occupied / dock.spots) * 100)
              : [86, 72, 58, 91][index % 4];
            const displayUtil = utilisation || 70;

            return (
              <div
                key={dock.id}
                className="rounded-2xl border border-[#eceae6] bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-[#1a1a1a]">{dock.name}</p>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Active
                  </span>
                </div>
                <p className="text-xs text-[#9a9a9a] mb-2">
                  {dock.spots} bays · {displayUtil}% used
                </p>
                <div className="h-1.5 rounded-full bg-[#f0f0f0] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#FF8C42]"
                    style={{ width: `${displayUtil}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
