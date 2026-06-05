import React, { useState } from 'react';
import { motion } from 'motion/react';
import { IndianRupee, Settings, ClipboardText, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const pricingPlans = [
  { id: 'standard', title: 'Standard', price: 15, duration: 'per ride', badge: 'Popular' },
  { id: 'business', title: 'Business', price: 12, duration: 'per ride', badge: 'Best value' },
  { id: 'night', title: 'Night Saver', price: 8, duration: 'night', badge: 'Off-peak' },
];

export const PricingConfig: React.FC = () => {
  const [dailyFee, setDailyFee] = useState('15');
  const [subscriptionFee, setSubscriptionFee] = useState('299');
  const [discount, setDiscount] = useState('10');

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pricing Configuration</h1>
          <p className="text-muted-foreground">Adjust pricing rules, subscriptions, and discounts.</p>
        </div>
        <Button className="rounded-full px-4 py-2">
          <Settings size={16} className="mr-2" /> Save Pricing
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>{plan.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <IndianRupee size={18} />
                  <p className="text-2xl font-bold">{plan.price}</p>
                </div>
                <p className="text-sm text-muted-foreground">{plan.duration}</p>
                <div className="rounded-3xl bg-muted p-3 text-sm font-medium">{plan.badge}</div>
                <Button className="w-full">Edit Plan</Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 mt-6">
        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Core Fees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Per Ride Fee"
                value={dailyFee}
                onChange={(e) => setDailyFee(e.target.value)}
                placeholder="Enter fee"
              />
              <Input
                label="Subscription Fee"
                value={subscriptionFee}
                onChange={(e) => setSubscriptionFee(e.target.value)}
                placeholder="Enter fee"
              />
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Percent size={18} /> Recommended discount: 10%
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Billing Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl bg-muted p-4">
              <p className="text-sm text-muted-foreground">Final cost per ride</p>
              <p className="text-3xl font-bold">₹{dailyFee}</p>
            </div>
            <Button className="w-full">Apply Configuration</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
