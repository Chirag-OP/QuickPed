import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { QrCode, Camera, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

interface ScanScreenProps {
  onScanSuccess: () => void;
  onClose: () => void;
}

export const ScanScreen: React.FC<ScanScreenProps> = ({ onScanSuccess, onClose }) => {
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setScanning(false);
      setTimeout(() => {
        onScanSuccess();
      }, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <h2 className="text-white text-xl font-semibold">Scan QR Code</h2>
        <button
          onClick={onClose}
          className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
        >
          <X size={24} className="text-white" />
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="relative">
          {/* Scanning Frame */}
          <div className="w-72 h-72 relative">
            {/* Corner Borders */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-3xl" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-3xl" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-3xl" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-3xl" />

            {/* QR Code Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <QrCode size={120} className="text-white/20" />
            </div>

            {/* Scanning Line */}
            {scanning && (
              <motion.div
                className="absolute left-0 right-0 h-1 bg-primary shadow-lg shadow-primary/50"
                animate={{
                  top: ['0%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            )}

            {/* Success Animation */}
            {!scanning && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-primary/20 rounded-3xl backdrop-blur-sm"
              >
                <div className="w-24 h-24 bg-success rounded-full flex items-center justify-center">
                  <Camera size={48} className="text-white" />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-6">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-4 text-center">
            <p className="text-white">
              {scanning
                ? 'Position the QR code within the frame'
                : 'QR Code detected! Starting ride...'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
