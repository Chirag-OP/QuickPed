import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  CheckCircle2,
  Wrench,
  Battery,
  Link as LinkIcon,
  CircleDot
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';

interface ReportIssueScreenProps {
  bikeId: string;
  onSubmit: () => void;
  onSkip: () => void;
}

export const ReportIssueScreen: React.FC<ReportIssueScreenProps> = ({
  bikeId,
  onSubmit,
  onSkip
}) => {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const issues = [
    { id: 'flat-tire', label: 'Flat Tire', icon: CircleDot },
    { id: 'brake', label: 'Brake Failure', icon: AlertCircle },
    { id: 'chain', label: 'Chain Issue', icon: LinkIcon },
    { id: 'battery', label: 'Battery Issue', icon: Battery },
    { id: 'other', label: 'Other', icon: Wrench },
  ];

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      onSubmit();
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle2 size={60} className="text-success" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2">Thank You!</h2>
          <p className="text-muted-foreground">
            Your report helps us maintain our bikes better
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-6 pb-12 rounded-b-3xl">
        <div className="flex items-center gap-3 text-white mb-4">
          <AlertCircle size={32} />
          <div>
            <h1 className="text-2xl font-bold">Report an Issue</h1>
            <p className="text-white/90">Help us keep bikes in top shape</p>
          </div>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
          <CardContent className="p-4">
            <p className="text-sm text-white/80 mb-1">Bike ID</p>
            <p className="text-xl font-bold">{bikeId}</p>
          </CardContent>
        </Card>
      </div>

      <div className="px-6 -mt-8 space-y-6">
        {/* Issue Categories */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>What's the issue?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {issues.map((issue, index) => {
                const Icon = issue.icon;
                return (
                  <motion.button
                    key={issue.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedIssue(issue.id)}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      selectedIssue === issue.id
                        ? 'border-primary bg-primary/10 shadow-lg'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Icon
                      size={32}
                      className={`mx-auto mb-3 ${
                        selectedIssue === issue.id ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                    <p
                      className={`font-medium text-sm ${
                        selectedIssue === issue.id ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {issue.label}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        {selectedIssue && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Additional Details (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Describe the issue in more detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={onSkip} variant="ghost" size="lg" className="flex-1">
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedIssue}
            size="lg"
            className="flex-1"
          >
            Submit Report
          </Button>
        </div>
      </div>
    </div>
  );
};
