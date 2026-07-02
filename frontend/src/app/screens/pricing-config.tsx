import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, IndianRupee, Plus, Save, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { formatCurrency } from '../lib/utils';
import {
  defaultFareRules,
  type AdminFareRule,
  type FareUserRole,
  type FareVehicleType,
  type InstituteData,
} from '../lib/admin-data';

interface PricingConfigProps {
  institute: InstituteData;
  onUpdateInstitute: (updater: (institute: InstituteData) => InstituteData) => void;
}

const vehicleTypes: FareVehicleType[] = ['BICYCLE', 'E_BIKE'];
const userRoles: FareUserRole[] = ['GUEST_RIDER', 'VERIFIED_RIDER'];

const labelize = (value: string) => value.replace(/_/g, ' ');
const comboKey = (vehicleType: FareVehicleType, userRole: FareUserRole) => `${vehicleType}:${userRole}`;

export const PricingConfig: React.FC<PricingConfigProps> = ({ institute, onUpdateInstitute }) => {
  const [successMsg, setSuccessMsg] = useState('');
  const [saved, setSaved] = useState(false);

  const fareRules = institute.fareRules?.length ? institute.fareRules : defaultFareRules;
  const usedCombos = useMemo(() => new Set(fareRules.map((rule) => comboKey(rule.vehicleType, rule.userRole))), [fareRules]);
  const availableCombos = vehicleTypes.flatMap((vehicleType) =>
    userRoles.map((userRole) => ({ vehicleType, userRole, key: comboKey(vehicleType, userRole) }))
  ).filter((combo) => !usedCombos.has(combo.key));

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    window.setTimeout(() => setSuccessMsg(''), 3000);
  };

  const updateRules = (rules: AdminFareRule[]) => {
    const primaryRule = rules[0];
    onUpdateInstitute((current) => ({
      ...current,
      fareRules: rules,
      pricing: primaryRule
        ? {
            ...current.pricing,
            baseFare: primaryRule.baseFare,
            perMinute: primaryRule.perMinuteRate,
            pricingStructure: `${primaryRule.vehicleType} ${primaryRule.userRole}: base ${primaryRule.baseFare}, ${primaryRule.baseDurationMinutes} min, per minute ${primaryRule.perMinuteRate}`,
          }
        : current.pricing,
    }));
  };

  const handleRuleChange = (ruleId: string, patch: Partial<AdminFareRule>) => {
    updateRules(
      fareRules.map((rule) => {
        if (rule.id !== ruleId) return rule;
        return { ...rule, ...patch };
      })
    );
  };

  const handleAddRule = () => {
    const nextCombo = availableCombos[0];
    if (!nextCombo) return;

    updateRules([
      ...fareRules,
      {
        id: `${institute.id}-fare-${Date.now().toString(36)}`,
        vehicleType: nextCombo.vehicleType,
        userRole: nextCombo.userRole,
        baseFare: nextCombo.vehicleType === 'E_BIKE' ? 10 : 5,
        baseDurationMinutes: 15,
        perMinuteRate: nextCombo.vehicleType === 'E_BIKE' ? 2 : 1,
      },
    ]);
  };

  const handleRemoveRule = (ruleId: string) => {
    updateRules(fareRules.filter((rule) => rule.id !== ruleId));
  };

  const isVehicleOptionDisabled = (rule: AdminFareRule, vehicleType: FareVehicleType) =>
    vehicleType !== rule.vehicleType && usedCombos.has(comboKey(vehicleType, rule.userRole));

  const isRoleOptionDisabled = (rule: AdminFareRule, userRole: FareUserRole) =>
    userRole !== rule.userRole && usedCombos.has(comboKey(rule.vehicleType, userRole));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    showSuccess(`${institute.name} fare rules saved.`);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="min-h-full bg-[#F9F9F9] p-6 pb-8">
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#ee5f13] px-6 py-3 text-sm font-semibold text-white shadow-xl"
          >
            <CheckCircle2 size={16} /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1f1714]">Fare Configurations</h1>
          <p className="text-muted-foreground">{institute.name} pricing matrix by vehicle type and rider role.</p>
        </div>
        <Button className="rounded-full bg-[#181818] text-white hover:bg-[#111]" onClick={handleAddRule} disabled={availableCombos.length === 0}>
          <Plus size={16} /> Add Rule
        </Button>
      </div>

      <form onSubmit={handleSave} className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card className="border-0 bg-white shadow-[0_8px_18px_rgba(15,15,15,0.035)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
              <IndianRupee size={20} className="text-[#ee5f13]" /> Pricing Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fareRules.map((rule, index) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="rounded-[20px] border border-border/70 bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
              >
                <div className="grid gap-3 lg:grid-cols-[1fr_1fr_0.8fr_0.8fr_0.8fr_auto] lg:items-end">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Vehicle Type</label>
                    <select
                      value={rule.vehicleType}
                      onChange={(e) => handleRuleChange(rule.id, { vehicleType: e.target.value as FareVehicleType })}
                      className="h-11 w-full rounded-xl border border-border/80 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ee5f13]/20"
                    >
                      {vehicleTypes.map((vehicleType) => (
                        <option key={vehicleType} value={vehicleType} disabled={isVehicleOptionDisabled(rule, vehicleType)}>
                          {labelize(vehicleType)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">User Role</label>
                    <select
                      value={rule.userRole}
                      onChange={(e) => handleRuleChange(rule.id, { userRole: e.target.value as FareUserRole })}
                      className="h-11 w-full rounded-xl border border-border/80 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ee5f13]/20"
                    >
                      {userRoles.map((userRole) => (
                        <option key={userRole} value={userRole} disabled={isRoleOptionDisabled(rule, userRole)}>
                          {labelize(userRole)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Base Fare</label>
                    <Input type="number" min="0" step="0.5" value={rule.baseFare} onChange={(e) => handleRuleChange(rule.id, { baseFare: Number(e.target.value) || 0 })} className="h-11 rounded-xl bg-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Base Duration</label>
                    <Input type="number" min="1" value={rule.baseDurationMinutes} onChange={(e) => handleRuleChange(rule.id, { baseDurationMinutes: Number(e.target.value) || 1 })} className="h-11 rounded-xl bg-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Per Minute</label>
                    <Input type="number" min="0" step="0.25" value={rule.perMinuteRate} onChange={(e) => handleRuleChange(rule.id, { perMinuteRate: Number(e.target.value) || 0 })} className="h-11 rounded-xl bg-white" />
                  </div>
                  <Button type="button" variant="destructive" size="sm" className="h-11 rounded-full" onClick={() => handleRemoveRule(rule.id)}>
                    <Trash2 size={15} />
                  </Button>
                </div>
              </motion.div>
            ))}
            {fareRules.length === 0 && (
              <div className="rounded-2xl bg-[#f3f1ee] p-6 text-center text-sm text-muted-foreground">
                No fare rules configured.
              </div>
            )}
            <Button type="submit" className="w-full rounded-full bg-[#ee5f13] text-white hover:bg-[#d65a13]">
              {saved ? <><CheckCircle2 size={16} /> Saved</> : <><Save size={16} /> Save Fare Matrix</>}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-0 bg-white shadow-[0_8px_18px_rgba(15,15,15,0.035)]">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">Combinations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vehicleTypes.flatMap((vehicleType) =>
                userRoles.map((userRole) => {
                  const rule = fareRules.find((item) => item.vehicleType === vehicleType && item.userRole === userRole);
                  return (
                    <div key={comboKey(vehicleType, userRole)} className="flex items-center justify-between rounded-2xl bg-[#f3f1ee] p-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{labelize(vehicleType)}</p>
                        <p className="text-xs text-muted-foreground">{labelize(userRole)}</p>
                      </div>
                      <Badge className={rule ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}>
                        {rule ? formatCurrency(rule.baseFare) : 'OPEN'}
                      </Badge>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-[0_8px_18px_rgba(15,15,15,0.035)]">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">Ride Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fareRules.slice(0, 3).map((rule) => {
                const extraMinutes = Math.max(0, 25 - rule.baseDurationMinutes);
                const fare = rule.baseFare + extraMinutes * rule.perMinuteRate;
                return (
                  <div key={`${rule.id}-preview`} className="rounded-2xl border border-border/70 p-4">
                    <p className="text-xs text-muted-foreground">{labelize(rule.vehicleType)} - {labelize(rule.userRole)}</p>
                    <p className="mt-1 text-2xl font-bold text-[#ee5f13]">{formatCurrency(fare)}</p>
                    <p className="text-xs text-muted-foreground">25 minute sample ride</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};
