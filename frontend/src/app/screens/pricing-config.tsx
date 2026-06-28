import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Edit2, IndianRupee, Percent, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { formatCurrency } from '../lib/utils';
import type { AdminPricing, InstituteData } from '../lib/admin-data';
interface PricingConfigProps {
  institute: InstituteData;
  onUpdateInstitute: (updater: (institute: InstituteData) => InstituteData) => void;
}
const pricingFields: Array<{ key: keyof AdminPricing; label: string; type: 'number' | 'text'; step?: string }> = [
  { key: 'baseFare', label: 'Base Fare', type: 'number', step: '0.5' },
  { key: 'perMinute', label: 'Per Minute Charge', type: 'number', step: '0.5' },
  { key: 'reservation', label: 'Reservation Charge', type: 'number', step: '0.5' },
  { key: 'subscription', label: 'Subscription Fee / Month', type: 'number' },
  { key: 'discount', label: 'Discount (%)', type: 'number' },
  { key: 'pricingStructure', label: 'Pricing Structure', type: 'text' },
];
const updatePricingValue = (pricing: AdminPricing, key: keyof AdminPricing, value: string): AdminPricing => {
  if (key === 'pricingStructure') {
    return { ...pricing, pricingStructure: value };
  }
  return { ...pricing, [key]: Number(value) || 0 };
};
export const PricingConfig: React.FC<PricingConfigProps> = ({ institute, onUpdateInstitute }) => {
  const [successMsg, setSuccessMsg] = useState('');
  const [saved, setSaved] = useState(false);
  const pricing = institute.pricing;
  const sampleRideCost = pricing.baseFare + pricing.perMinute * 10 + pricing.reservation;
  const discountedSubscription = pricing.subscription * (1 - pricing.discount / 100);
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    window.setTimeout(() => setSuccessMsg(''), 3000);
  };
  const handlePricingChange = (key: keyof AdminPricing, value: string) => {
    onUpdateInstitute((current) => ({
      ...current,
      pricing: updatePricingValue(current.pricing, key, value),
    }));
  };
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    showSuccess(`${institute.name} pricing saved.`);
    window.setTimeout(() => setSaved(false), 1800);
  };
  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-success text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 text-sm font-semibold"
          >
            <CheckCircle2 size={16} /> {successMsg}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pricing Configuration</h1>
          <p className="text-muted-foreground">Edit {institute.name} pricing. Changes reflect instantly in the admin UI.</p>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit2 size={20} className="text-primary" /> Edit Pricing Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {pricingFields.map((field) => (
                  <div key={field.key} className={field.key === 'pricingStructure' ? 'space-y-1 md:col-span-2' : 'space-y-1'}>
                    <label className="text-xs text-muted-foreground">{field.label}</label>
                    <Input
                      type={field.type}
                      min={field.type === 'number' ? '0' : undefined}
                      max={field.key === 'discount' ? '100' : undefined}
                      step={field.step}
                      value={pricing[field.key]}
                      onChange={(e) => handlePricingChange(field.key, e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>
                ))}
              </div>
              <div className="rounded-3xl bg-primary/10 border border-primary/20 p-4">
                <p className="text-xs font-semibold text-primary mb-2">LIVE PREVIEW</p>
                <p className="text-sm">
                  Base {formatCurrency(pricing.baseFare)} + 10 min {formatCurrency(pricing.perMinute * 10)} + reservation {formatCurrency(pricing.reservation)}
                </p>
                <p className="text-2xl font-bold text-primary mt-2">{formatCurrency(sampleRideCost)}</p>
              </div>
              <Button type="submit" className="w-full">
                {saved ? <><CheckCircle2 size={16} className="mr-2" /> Saved</> : <><Save size={16} className="mr-2" /> Save Pricing</>}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Current Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Base Fare', value: formatCurrency(pricing.baseFare) },
                { label: 'Per Minute', value: formatCurrency(pricing.perMinute) },
                { label: 'Reservation', value: formatCurrency(pricing.reservation) },
                { label: 'Subscription', value: `${formatCurrency(pricing.subscription)}/mo` },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl bg-muted p-4">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Billing Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">Monthly subscription</p>
                <div className="flex items-center gap-1 font-bold text-3xl">
                  <IndianRupee size={22} />{pricing.subscription}
                </div>
              </div>
              <div className="rounded-3xl bg-success/10 p-4">
                <p className="text-sm text-muted-foreground">After {pricing.discount}% discount</p>
                <div className="flex items-center gap-1 font-bold text-3xl text-success">
                  <IndianRupee size={22} />{discountedSubscription.toFixed(2)}
                </div>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <Percent size={16} /> Discount applies to subscription fee.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
