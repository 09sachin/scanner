'use client';

import { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
// @ts-expect-error - Quagga doesn't have proper TypeScript types
import Quagga from 'quagga';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Upload, Home, Scan, CheckCircle, AlertCircle, QrCode, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface ScanResult {
  data: string;
  format: string;
  type: 'barcode' | 'qrcode';
  timestamp: Date;
}

interface QuaggaResult {
  codeResult?: {
    code: string;
    format: string;
  };
}

interface ScanResult2 {
  result?: {
    format?: {
      formatName?: string;
    };
  };
  format?: string;
}

export function Scanner() {
  const [scanMode, setScanMode] = useState<'upload' | 'camera'>('upload');
  const [cameraType, setCameraType] = useState<'both' | 'qr' | 'barcode'>('both');
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [cameraActive, setCameraActive] = useState(false);
  const [scanPaused, setScanPaused] = useState(false);
  const [lastScannedData, setLastScannedData] = useState<string>('');
  const [scannerReady, setScannerReady] = useState(false);

  console.log('lastScannedData', lastScannedData);  
  console.log('scanResults', scannerReady)
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagePreviewRef = useRef<HTMLImageElement>(null);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scannerElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize audio for scan success sound
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      // Create a simple beep sound using Web Audio API
      createBeepSound();
    }
    
    // Cleanup camera when component unmounts or scan mode changes
    return () => {
      if (html5QrcodeRef.current) {
        html5QrcodeRef.current.stop().catch(() => {
          console.warn('⚠️ Error clearing previous scanner (this is normal)');
        }).finally(() => {
          html5QrcodeRef.current = null;
        });
      }
    };
  }, [scanMode]);

  // Separate useEffect for scanner element initialization
  useEffect(() => {
    if (scanMode === 'camera') {
      setScannerReady(true);
    }
  }, [scanMode]);

  // Create beep sound using Web Audio API
  const createBeepSound = () => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      const audioContext = new (window.AudioContext || (window as unknown as typeof window.AudioContext))();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // 800 Hz beep
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
      
      const playBeep = () => {
        try {
          const newOscillator = audioContext.createOscillator();
          const newGainNode = audioContext.createGain();
          
          newOscillator.connect(newGainNode);
          newGainNode.connect(audioContext.destination);
          
          newOscillator.frequency.value = 800;
          newOscillator.type = 'sine';
          
          newGainNode.gain.setValueAtTime(0, audioContext.currentTime);
          newGainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
          newGainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
          
          newOscillator.start(audioContext.currentTime);
          newOscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
          console.warn('Could not play beep sound:', error);
        }
      };
      
      // Store the playBeep function for later use
      if (audioRef.current) {
        (audioRef.current as HTMLAudioElement & { playBeep: () => void }).playBeep = playBeep;
      }
    }
  };

  // Play success sound
  const playSuccessSound = () => {
    try {
      const audioElement = audioRef.current as HTMLAudioElement & { playBeep?: () => void };
      if (audioElement && audioElement.playBeep) {
        audioElement.playBeep();
      }
    } catch (error) {
      console.warn('Could not play success sound:', error);
    }
  };

  const addScanResult = (data: string, format: string, type: 'barcode' | 'qrcode', showSuccess: boolean = false) => {
    const newResult: ScanResult = {
      data,
      format,
      type,
      timestamp: new Date()
    };
    setScanResults(prev => [newResult, ...prev]);
    
    // Show success message for file uploads
    if (showSuccess) {
      setSuccess(`✅ ${type === 'qrcode' ? 'QR Code' : 'Barcode'} scanned successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const scanImageForQR = (imageData: ImageData) => {
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code) {
      addScanResult(code.data, 'QR Code', 'qrcode', true);
      return true;
    }
    return false;
  };

  const scanImageForBarcode = (canvas: HTMLCanvasElement): Promise<boolean> => {
    return new Promise((resolve) => {
      Quagga.decodeSingle({
        decoder: {
          readers: ['code_128_reader', 'ean_reader', 'ean_8_reader', 'code_39_reader', 'code_39_vin_reader', 'codabar_reader', 'upc_reader', 'upc_e_reader', 'i2of5_reader']
        },
        locate: true,
        src: canvas.toDataURL()
      }, (result: QuaggaResult) => {
        if (result && result.codeResult) {
          addScanResult(result.codeResult.code, result.codeResult.format, 'barcode', true);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setIsScanning(true);

    try {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError('Failed to create canvas context');
          setIsScanning(false);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        let foundCode = false;

        // Try QR code first
        if (cameraType === 'both' || cameraType === 'qr') {
          foundCode = scanImageForQR(imageData);
        }

        // Try barcode if QR not found
        if (!foundCode && (cameraType === 'both' || cameraType === 'barcode')) {
          foundCode = await scanImageForBarcode(canvas);
        }

        if (!foundCode) {
          setError('No barcode or QR code found in the image. Please try a clearer image.');
        }

        setIsScanning(false);
      };

      img.onerror = () => {
        setError('Failed to load image');
        setIsScanning(false);
      };

      img.src = URL.createObjectURL(file);
      
      // Show preview
      if (imagePreviewRef.current) {
        imagePreviewRef.current.src = img.src;
        imagePreviewRef.current.style.display = 'block';
      }
    } catch {
      setError('Error processing image');
      setIsScanning(false);
    }
  };

  const startCameraScanning = async () => {
    console.log('🔍 Starting camera scanning process...');
    setError('');
    setCameraActive(true);
    
    try {
      // Clear any existing scanner
      if (html5QrcodeRef.current) {
        console.log('🧹 Clearing existing scanner...');
        html5QrcodeRef.current.stop().catch(() => {
          console.warn('⚠️ Error clearing previous scanner (this is normal)');
        });
        html5QrcodeRef.current = null;
      }

      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported in this browser. Please use HTTPS or a modern browser.');
      }

      // Check if the target element exists
      const targetElement = document.getElementById('qr-reader');
      if (!targetElement) {
        console.error('❌ Scanner container #qr-reader not found');
        throw new Error('Scanner container not found. Please refresh the page.');
      }
      
      // Double-check with ref
      if (!scannerElementRef.current) {
        console.error('❌ Scanner element ref not available');
        throw new Error('Scanner element not ready. Please try again.');
      }
      
      console.log('📱 Target element found:', targetElement);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        rememberLastUsedCamera: true,
        supportedScanTypes: cameraType === 'qr' ? [1] : cameraType === 'barcode' ? [0] : [0, 1]
      };

      console.log('⚙️ Scanner config:', config);

      html5QrcodeRef.current = new Html5Qrcode("qr-reader");

      console.log('🆕 Scanner instance created');

      // Success callback
      const onScanSuccess = (decodedText: string, decodedResult: ScanResult2) => {
        // Prevent multiple rapid scans
        if (scanPaused) {
          console.log('⏸️ Scan paused, ignoring result');
          return;
        }
        
        console.log('✅ Scan successful!', { decodedText, decodedResult });
        
        // Play success sound immediately
        playSuccessSound();
        
        try {
          let format = 'Unknown';
          let type: 'barcode' | 'qrcode' = 'qrcode';

          if (decodedResult?.result?.format) {
            format = decodedResult.result.format.formatName || 'Unknown';
            const formatLower = format.toLowerCase();
            if (formatLower.includes('qr') || formatLower.includes('data_matrix')) {
              type = 'qrcode';
            } else {
              type = 'barcode';
            }
          } else if (decodedResult?.format) {
            format = decodedResult.format;
            type = format.toLowerCase().includes('qr') ? 'qrcode' : 'barcode';
          }

          console.log(`🎯 Detected ${type} with format: ${format}`);
          
          // Set state in batches to minimize re-renders
          setScanPaused(true);
          setLastScannedData(decodedText);
          setSuccess(`✅ ${type === 'qrcode' ? 'QR Code' : 'Barcode'} scanned successfully!`);
          
          // Add to results
          addScanResult(decodedText, format, type);
          
          // Resume scanning after 3 seconds
          setTimeout(() => {
            console.log('▶️ Resuming scan...');
            setScanPaused(false);
            setLastScannedData('');
            setSuccess('');
          }, 3000);
          
        } catch (err) {
          console.error('❌ Error processing scan result:', err);
          
          // Still show the scanned data even if processing fails
          setScanPaused(true);
          setLastScannedData(decodedText);
          setError('Error processing scan result');
          addScanResult(decodedText, 'Unknown', 'qrcode');
          
          // Resume scanning after error
          setTimeout(() => {
            setScanPaused(false);
            setLastScannedData('');
            setError('');
          }, 2000);
        }
      };

      // Error callback
      const onScanError = (error: string) => {
        if (!error.includes('NotFoundException') && 
            !error.includes('No MultiFormat Readers') &&
            !error.includes('No code found')) {
          console.warn('⚠️ Scan error:', error);
        }
      };

      // Get cameras and start scanning
      console.log('🚀 Getting available cameras...');
      
      const cameras = await Html5Qrcode.getCameras();
      console.log('📷 Available cameras:', cameras);
      
      if (cameras && cameras.length > 0) {
        // Use back camera if available, otherwise use first camera
        const cameraId = cameras.find(camera => 
          camera.label.toLowerCase().includes('back') || 
          camera.label.toLowerCase().includes('rear')
        )?.id || cameras[0].id;
        
        console.log('📱 Using camera:', cameraId);
        
        const startConfig = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          supportedScanTypes: cameraType === 'qr' ? [1] : cameraType === 'barcode' ? [0] : [0, 1]
        };
        
        await html5QrcodeRef.current.start(
          cameraId,
          startConfig,
          onScanSuccess,
          onScanError
        );
        
        console.log('📱 Camera scanner started successfully');
        
        // Set scanner as ready to hide loading overlay
        setScannerReady(true);
        
        // Check if camera video appears and hide loading state
        setTimeout(() => {
          const videoElement = document.querySelector('#qr-reader video');
          if (videoElement) {
            console.log('📹 Camera video element found and active');
          } else {
            console.warn('⚠️ Camera video not found after 2 seconds');
            // Don't show error immediately, give it more time
            setTimeout(() => {
              const videoCheck = document.querySelector('#qr-reader video');
              if (!videoCheck && cameraActive) {
                setError('Camera failed to start. Please try again.');
                setCameraActive(false);
                setScannerReady(false);
              }
            }, 3000);
          }
        }, 2000);
      } else {
        throw new Error('No cameras found on this device');
      }
      
    } catch (error: Error | unknown) {
      console.error('💥 Failed to start camera scanning:', error);
      let errorMessage = 'Failed to start camera scanning. ';
      
      if (error instanceof Error) {
        if (error.message.includes('not supported')) {
          errorMessage += 'Camera access requires HTTPS or localhost.';
        } else if (error.message.includes('Permission') || error.message.includes('NotAllowed')) {
          errorMessage += 'Please allow camera permission and refresh the page.';
        } else if (error.message.includes('NotFound')) {
          errorMessage += 'No camera found on this device.';
        } else if (error.message.includes('NotReadable')) {
          errorMessage += 'Camera is being used by another application.';
        } else if (error.message.includes('container not found')) {
          errorMessage += 'Scanner interface not ready. Please refresh the page.';
        } else {
          errorMessage += 'Please check browser console for details.';
        }
      } else {
        errorMessage += 'Please check browser console for details.';
      }
      
      setError(errorMessage);
      setCameraActive(false);
    }
  };

  const stopCameraScanning = async () => {
    try {
      if (html5QrcodeRef.current) {
        console.log('🛑 Stopping camera scanner...');
        
        // Add timeout to prevent hanging
        const stopPromise = html5QrcodeRef.current.stop();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Stop timeout')), 5000)
        );
        
        try {
          await Promise.race([stopPromise, timeoutPromise]);
          console.log('✅ Camera stopped successfully');
        } catch (stopError) {
          console.warn('⚠️ Stop operation error (continuing cleanup):', stopError);
        }
        
        html5QrcodeRef.current = null;
      }
    } catch (error) {
      console.warn('⚠️ Error stopping camera (this is usually normal):', error);
    } finally {
      // Always reset state regardless of stop success
      setCameraActive(false);
      setScanPaused(false);
      setLastScannedData('');
      setSuccess('');
      setScannerReady(false);
    }
  };

  // Wrapper for async startCameraScanning to handle errors properly
  const handleStartCamera = () => {
    // Add small delay to ensure DOM is stable
    setTimeout(() => {
      startCameraScanning().catch((error) => {
        console.error('💥 Failed to start camera:', error);
        setCameraActive(false);
        setScannerReady(false);
      });
    }, 100);
  };

  // Test camera access
  const testCameraAccess = async () => {
    setError('');
    try {
      console.log('Testing camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      // Stop the test stream immediately
      stream.getTracks().forEach(track => track.stop());
      setSuccess('✅ Camera access test successful! You can now start scanning.');
      setTimeout(() => setSuccess(''), 3000);
      return true;
    } catch (error: Error | unknown) {
      console.error('Camera test failed:', error);
      let errorMessage = '❌ Camera test failed: ';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage += 'Permission denied. Please allow camera access in browser settings.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No camera found on this device.';
        } else if (error.name === 'NotReadableError') {
          errorMessage += 'Camera is being used by another application.';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage += 'Camera constraints not supported.';
        } else if (error.message.includes('https')) {
          errorMessage += 'Camera requires HTTPS connection for security.';
        } else {
          errorMessage += `${error.name || 'Unknown error'}. Try refreshing the page.`;
        }
      } else {
        errorMessage += 'Unknown error occurred. Try refreshing the page.';
      }
      
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
      return false;
    }
  };

  const clearResults = () => {
    setScanResults([]);
    setSuccess('');
    setError('');
  };

  const clearPreview = () => {
    if (imagePreviewRef.current) {
      imagePreviewRef.current.style.display = 'none';
      imagePreviewRef.current.src = '';
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('Copied to clipboard!');
      setTimeout(() => setSuccess(''), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
              <Home className="h-5 w-5" />
              <span className="font-medium">Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Scan className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Scanner</h1>
            </div>
          </div>
        </div>

        {/* Scan Mode Toggle */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-1 flex border dark:border-slate-700">
            <button
              onClick={() => setScanMode('upload')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-md transition-all ${
                scanMode === 'upload' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <Upload className="h-4 w-4" />
              <span className="font-medium">Upload Image</span>
            </button>
            <button
              onClick={() => setScanMode('camera')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-md transition-all ${
                scanMode === 'camera' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <Camera className="h-4 w-4" />
              <span className="font-medium">Camera Scan</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Scan Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border dark:border-slate-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                <Scan className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span>{scanMode === 'upload' ? 'Upload & Scan' : 'Camera Scanner'}</span>
              </h2>

              {/* Error/Success Messages */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <p className="text-red-800 dark:text-red-400 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <p className="text-green-800 dark:text-green-400 font-medium">{success}</p>
                  </div>
                </div>
              )}

              {scanMode === 'upload' ? (
                <div className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Image File
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-lg hover:border-purple-400 dark:hover:border-purple-500 transition-colors">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
                            <span>Upload a file</span>
                            <input
                              ref={fileInputRef}
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleFileUpload}
                              disabled={isScanning}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Image Preview */}
                  <div className="min-h-[300px] bg-gray-50 dark:bg-slate-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 flex items-center justify-center">
                    <img
                      ref={imagePreviewRef}
                      className="max-w-full max-h-[300px] hidden rounded-lg shadow-lg"
                      alt="Preview"
                    />
                    <div className="text-center text-gray-500 dark:text-gray-400" id="preview-placeholder">
                      <Scan className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                      <p className="text-lg font-medium">Image preview will appear here</p>
                      <p className="text-sm">Upload an image to start scanning</p>
                    </div>
                  </div>

                  {/* Clear Preview Button */}
                  <button
                    onClick={clearPreview}
                    className="w-full px-4 py-2 bg-gray-600 dark:bg-slate-600 hover:bg-gray-700 dark:hover:bg-slate-500 text-white rounded-lg transition-colors font-medium"
                  >
                    Clear Preview
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Camera Controls */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Scan Type
                      </label>
                      <select
                        value={cameraType}
                        onChange={(e) => setCameraType(e.target.value as 'both' | 'qr' | 'barcode')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                        disabled={cameraActive}
                      >
                        <option value="both">Both QR & Barcode</option>
                        <option value="qr">QR Code Only</option>
                        <option value="barcode">Barcode Only</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={cameraActive ? stopCameraScanning : handleStartCamera}
                        disabled={isScanning}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          cameraActive
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-purple-400'
                        }`}
                      >
                        {cameraActive ? 'Stop Camera' : 'Start Camera'}
                      </button>
                    </div>
                  </div>

                  {/* Camera Scanner */}
                  <div className="relative">
                    <div 
                      ref={scannerElementRef}
                      id="qr-reader" 
                      className={`w-full min-h-[400px] bg-gray-50 dark:bg-slate-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 ${
                        cameraActive ? 'block' : 'flex items-center justify-center'
                      }`}
                    >
                      {!cameraActive && (
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          <Camera className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                          <p className="text-lg font-medium">Camera scanner ready</p>
                          <p className="text-sm">Click "Start Camera" to begin scanning</p>
                        </div>
                      )}
                    </div>

                    {/* Camera Controls Overlay */}
                    {cameraActive && (
                      <div className="absolute top-4 right-4 flex space-x-2">
                        <button
                          onClick={() => setScanPaused(!scanPaused)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                        >
                          {scanPaused ? 'Resume' : 'Pause'}
                        </button>
                        <button
                          onClick={() => setCameraActive(false)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium"
                        >
                          Stop
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Scanning Status */}
              {isScanning && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <p className="text-blue-800 dark:text-blue-300 font-medium">
                      Scanning for codes...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Scan Results</h2>
                {scanResults.length > 0 && (
                  <button
                    onClick={clearResults}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {scanResults.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <Scan className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-sm">No scans yet</p>
                  <p className="text-xs">Results will appear here</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {scanResults.map((result, index) => (
                    <div key={index} className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            {result.type === 'qrcode' ? (
                              <QrCode className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            ) : (
                              <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            )}
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              {result.format}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-gray-100 break-all mb-2">
                            {result.data}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {result.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(result.data)}
                          className="ml-2 p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          title="Copy to clipboard"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Usage Tips */}
            <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h3 className="font-medium text-purple-900 dark:text-purple-200 mb-2">📱 Scanning Tips:</h3>
              <ul className="text-sm text-purple-800 dark:text-purple-300 space-y-1">
                <li>• Hold camera steady and ensure good lighting</li>
                <li>• Center the code in the camera view</li>
                <li>• Try different distances if scan fails</li>
                <li>• Upload images should be clear and high contrast</li>
                <li>• Multiple codes in one image will be detected</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 