import { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please ensure you have granted permission.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context && video.videoWidth > 0) {
        // Resize logic to stay under 1MB Firestore limit
        const MAX_DIMENSION = 1280;
        let width = video.videoWidth;
        let height = video.videoHeight;

        if (width > height) {
          if (width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        setIsCapturing(true);
        
        // Stop the stream immediately to prevent "refresh" feel
        stopCamera();
        
        onCapture(base64);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-white text-center p-8 max-w-sm">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <X size={32} className="text-red-400" />
            </div>
            <h3 className="text-2xl font-serif mb-4">Camera Error</h3>
            <p className="text-white/60 mb-8">{error}</p>
            <button 
              type="button"
              onClick={onClose}
              className="px-8 py-3 bg-white text-black rounded-full font-medium"
            >
              Go Back
            </button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover"
            />
            
            <AnimatePresence>
              {isCapturing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-white z-10 flex items-center justify-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Sparkles size={64} className="text-olive" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
              <button 
                type="button"
                onClick={onClose}
                className="p-3 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="bg-black/40 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase">
                Live Preview
              </div>

              <button 
                type="button"
                onClick={startCamera}
                className="p-3 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-colors"
              >
                <RefreshCw size={24} />
              </button>
            </div>

            <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center z-20">
              <button 
                type="button"
                onClick={capturePhoto}
                disabled={isCapturing || !stream}
                className="group relative"
              >
                <div className="absolute inset-0 bg-white/20 rounded-full scale-150 blur-xl group-hover:scale-175 transition-transform" />
                <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30">
                  <div className="w-16 h-16 rounded-full border-2 border-black/10 flex items-center justify-center">
                    <Camera size={32} className="text-black" />
                  </div>
                </div>
              </button>
            </div>
          </>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
