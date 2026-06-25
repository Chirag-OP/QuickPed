import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, Camera, X, CheckCircle, Bike, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { NotificationBell } from '../components/notification-bell';

interface ScanScreenProps {
  onScanSuccess: () => void;
  onClose: () => void;
}

type ScanPhase =
  | 'requesting-permission'
  | 'permission-denied'
  | 'camera-active'
  | 'detected'
  | 'unlocking'
  | 'ride-started';

export const ScanScreen: React.FC<ScanScreenProps> = ({ onScanSuccess, onClose }) => {
  const [phase, setPhase] = useState<ScanPhase>('requesting-permission');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setPhase('camera-active');

      
      setTimeout(() => {
        setPhase('detected');
        setTimeout(() => {
          setPhase('unlocking');
          setTimeout(() => {
            setPhase('ride-started');
            stopCamera();
            setTimeout(() => onScanSuccess(), 1800);
          }, 1500);
        }, 900);
      }, 3000);
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPhase('permission-denied');
      } else {
        setCameraError(err.message || 'Camera unavailable');
        setPhase('permission-denied');
      }
    }
  };

  useEffect(() => {
    
    const t = setTimeout(() => startCamera(), 600);
    return () => {
      clearTimeout(t);
      stopCamera();
    };
    
  }, []);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const scanning = phase === 'camera-active';

  return (
<div className="fixed inset-0 z-50 bg-[#1B130F] overflow-hidden">
  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />
        {}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        muted
        playsInline
      />

      {}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      {}
      <div className="relative z-10 flex flex-col h-full">
        {}
     <div className="absolute top-6 left-0 right-0 z-20 flex items-center justify-between px-6">

  {/* Close Button */}
  <button
    onClick={handleClose}
    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md"
  >
    <X size={22} className="text-white" />
  </button>

  {/* Scanning Badge */}
  <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md">

    <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>

    <span className="text-sm font-medium text-white">
      Scanning
    </span>

  </div>

  {/* Flash Button */}
  <button
    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md"
  >
    <Zap size={20} className="text-white" />
  </button>

</div>

        {}
        <div className="flex-1 flex items-center justify-center px-6">
          <AnimatePresence mode="wait">

            {}
            {phase === 'requesting-permission' && (
              <motion.div
                key="perm"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="flex flex-col items-center gap-6 text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/40"
                >
                  <Camera size={48} className="text-primary" />
                </motion.div>
                <div>
                  <p className="text-white text-lg font-semibold mb-1">Camera Access Needed</p>
                  <p className="text-white/60 text-sm max-w-xs">
                    Allow camera access to scan the QR code on the bike and start your ride.
                  </p>
                </div>
                <Button onClick={startCamera} className="px-8">
                  Allow Camera
                </Button>
              </motion.div>
            )}

            {}
            {phase === 'permission-denied' && (
              <motion.div
                key="denied"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center gap-5 text-center"
              >
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500/40">
                  <X size={40} className="text-red-400" />
                </div>
                <div>
                  <p className="text-white text-lg font-semibold mb-1">Camera Access Denied</p>
                  <p className="text-white/60 text-sm max-w-xs">
                    {cameraError ||
                      'Please allow camera access in your browser settings and try again.'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleClose} className="border-white/20 text-white hover:bg-white/10">
                    Cancel
                  </Button>
                  <Button onClick={startCamera}>Try Again</Button>
                </div>
              </motion.div>
            )}

            {}
            {(phase === 'camera-active' || phase === 'detected' || phase === 'unlocking') && (
              <motion.div
                key="frame"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="relative"
              >
                <div className="w-72 h-72 relative">
                  {}
                  <motion.div
                    animate={phase === 'detected' ? { borderColor: '#22c55e' } : {}}
                    className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-3xl transition-colors duration-300"
                  />
                  <motion.div
                    animate={phase === 'detected' ? { borderColor: '#22c55e' } : {}}
                    className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-3xl transition-colors duration-300"
                  />
                  <motion.div
                    animate={phase === 'detected' ? { borderColor: '#22c55e' } : {}}
                    className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-3xl transition-colors duration-300"
                  />
                  <motion.div
                    animate={phase === 'detected' ? { borderColor: '#22c55e' } : {}}
                    className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-3xl transition-colors duration-300"
                  />

                  {}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <QrCode size={100} className="text-white/10" />
                  </div>

                  {}
                  {scanning && (
                    <motion.div
                      className="absolute left-2 right-2 h-0.5 bg-primary shadow-lg shadow-primary/60 rounded-full"
                      animate={{ top: ['4%', '96%'] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}

                  {}
                  {phase === 'detected' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.5, 0] }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 bg-orange-400/30 rounded-2xl"
                    />
                  )}

                  {}
                  {(phase === 'detected' || phase === 'unlocking') && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 12 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl backdrop-blur-sm"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <motion.div
                          animate={phase === 'unlocking' ? { rotate: 360 } : {}}
                          transition={{ duration: 0.8, ease: 'easeInOut' }}
                          className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/40"
                        >
                          {phase === 'unlocking' ? (
                            <Bike size={40} className="text-white" />
                          ) : (
                            <CheckCircle size={40} className="text-white" />
                          )}
                        </motion.div>
                        <p className="text-white text-sm font-semibold">
                          {phase === 'detected' ? 'QR Code Detected!' : 'Unlocking Bike...'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {}
            {phase === 'ride-started' && (
              <motion.div
                key="started"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
                className="flex flex-col items-center gap-5 text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ repeat: 2, duration: 0.5 }}
                  className="w-28 h-28 bg-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/50"
                >
                  <Zap size={56} className="text-white" />
                </motion.div>
                <div>
                  <p className="text-white text-2xl font-bold mb-1">Ride Started!</p>
                  <p className="text-orange-400 text-sm">Bike #A204 is now unlocked</p>
                </div>
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.6, ease: 'linear' }}
                  className="h-1 bg-orange-400 rounded-full w-48"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {}
        <div className="absolute bottom-0 left-0 right-0 rounded-t-[34px] bg-[#F8F8F8] px-5 pt-4 pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.18)]">

    {/* Drag Handle */}

    <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-gray-300" />



    {/* Bike Card */}

    <div className="flex items-center justify-between">

        <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100">

                <Bike
                    className="text-orange-500"
                    size={24}
                />

            </div>

            <div>

                <h3 className="font-bold text-lg text-gray-900">

                    QuickPad · QP-2417

                </h3>

                <p className="text-gray-500 text-sm">

                    Hostel C dock · 4 cycles ready

                </p>

            </div>

        </div>

        <span className="rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-700">

            Ready

        </span>

    </div>



    {/* Fare Card */}

    <div className="mt-6 rounded-3xl bg-white p-5">

        <div className="flex items-center justify-between text-gray-700">

            <span>

                Unlock fee

            </span>

            <span className="font-semibold">

                ₹5

            </span>

        </div>



        <div className="mt-4 flex items-center justify-between text-gray-700">

            <span>

                First 5 minutes

            </span>

            <span className="font-semibold text-green-600">

                Free

            </span>

        </div>



        <hr className="my-4" />



        <div className="flex items-center justify-between">

            <span className="text-lg font-bold">

                Total to pay now

            </span>

            <span className="text-2xl font-bold">

                ₹5

            </span>

        </div>

    </div>



    {/* Pay Button */}

    <Button

        className="mt-6 h-14 w-full rounded-full bg-black text-white text-lg font-semibold hover:bg-black"

    >

        Pay ₹5 & Unlock

    </Button>

</div>
      </div>
    </div>
  );
};
