'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { Download, Home, Settings, BarChart3, Zap, Cog, QrCode, Globe, User, Wifi, Mail, MessageSquare, Code, Smartphone, Play } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface CodeFormData {
  text: string;
  codeType: 'barcode' | 'qrcode';
  // Barcode specific fields
  format: string;
  width: number;
  height: number;
  displayValue: boolean;
  background: string;
  lineColor: string;
  // QR Code specific fields
  qrErrorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  qrSize: number;
  qrMargin: number;
  // Template fields
  useTemplate: boolean;
  selectedTemplate: string;
  templateData: Record<string, string>;
}

interface QRTemplate {
  id: string;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'select';
    placeholder: string;
    required?: boolean;
    options?: Array<{ value: string; label: string }>;
  }>;
  generate: (data: Record<string, string>) => string;
}

const barcodeFormats = [
  { value: 'CODE128', label: 'CODE128' },
  { value: 'CODE39', label: 'CODE39' },
  { value: 'EAN13', label: 'EAN13' },
  { value: 'EAN8', label: 'EAN8' },
  { value: 'UPC', label: 'UPC' },
  { value: 'ITF14', label: 'ITF14' },
  { value: 'MSI', label: 'MSI' },
  { value: 'pharmacode', label: 'Pharmacode' },
];

const qrErrorLevels = [
  { value: 'L', label: 'Low (~7%)', description: 'Good for clean environments' },
  { value: 'M', label: 'Medium (~15%)', description: 'Balanced option' },
  { value: 'Q', label: 'Quartile (~25%)', description: 'Good for noisy environments' },
  { value: 'H', label: 'High (~30%)', description: 'Maximum error correction' },
];

const QR_TEMPLATES: QRTemplate[] = [
  {
    id: 'website',
    name: 'Website URL',
    icon: Globe,
    description: 'Create QR code for website or URL',
    fields: [
      { key: 'url', label: 'Website URL', type: 'url', placeholder: 'https://example.com', required: true }
    ],
    generate: (data) => data.url
  },
  {
    id: 'contact',
    name: 'Contact (vCard)',
    icon: User,
    description: 'Create QR code with contact information',
    fields: [
      { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', required: true },
      { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1234567890' },
      { key: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
      { key: 'org', label: 'Organization', type: 'text', placeholder: 'Company Name' },
      { key: 'url', label: 'Website', type: 'url', placeholder: 'https://company.com' }
    ],
    generate: (data) => {
      return `BEGIN:VCARD
VERSION:3.0
FN:${data.name}
${data.org ? `ORG:${data.org}` : ''}
${data.phone ? `TEL:${data.phone}` : ''}
${data.email ? `EMAIL:${data.email}` : ''}
${data.url ? `URL:${data.url}` : ''}
END:VCARD`;
    }
  },
  {
    id: 'wifi',
    name: 'WiFi Network',
    icon: Wifi,
    description: 'Create QR code for WiFi connection',
    fields: [
      { key: 'ssid', label: 'Network Name (SSID)', type: 'text', placeholder: 'MyWiFi', required: true },
      { key: 'password', label: 'Password', type: 'text', placeholder: 'password123' },
      { key: 'security', label: 'Security Type', type: 'select', placeholder: 'Select security type', 
        options: [
          { value: 'WPA', label: 'WPA/WPA2' },
          { value: 'WEP', label: 'WEP' },
          { value: 'nopass', label: 'Open (No Password)' }
        ] 
      }
    ],
    generate: (data) => {
      const security = data.security || 'nopass';
      return `WIFI:T:${security};S:${data.ssid};P:${data.password || ''};H:false;;`;
    }
  },
  {
    id: 'gmail',
    name: 'Gmail Compose',
    icon: Mail,
    description: 'Open Gmail with pre-filled message',
    fields: [
      { key: 'to', label: 'To Email', type: 'email', placeholder: 'recipient@example.com', required: true },
      { key: 'subject', label: 'Subject', type: 'text', placeholder: 'Email Subject' },
      { key: 'body', label: 'Message', type: 'textarea', placeholder: 'Email message content...' }
    ],
    generate: (data) => {
      const baseUrl = 'https://mail.google.com/mail/?view=cm&fs=1';
      const params = new URLSearchParams();
      if (data.to) params.append('to', data.to);
      if (data.subject) params.append('su', data.subject);
      if (data.body) params.append('body', data.body);
      return `${baseUrl}&${params.toString()}`;
    }
  },
  {
    id: 'sms',
    name: 'SMS Message',
    icon: MessageSquare,
    description: 'Create QR code for SMS message',
    fields: [
      { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1234567890', required: true },
      { key: 'message', label: 'Message', type: 'textarea', placeholder: 'SMS message content...' }
    ],
    generate: (data) => {
      return `sms:${data.phone}?body=${encodeURIComponent(data.message || '')}`;
    }
  },
  {
    id: 'playstore',
    name: 'Play Store App',
    icon: Play,
    description: 'Open Android app in Play Store',
    fields: [
      { key: 'packageName', label: 'Package Name', type: 'text', placeholder: 'com.example.app', required: true },
      { key: 'referrer', label: 'Referrer (optional)', type: 'text', placeholder: 'utm_source=qr_code' }
    ],
    generate: (data) => {
      let url = `https://play.google.com/store/apps/details?id=${data.packageName}`;
      if (data.referrer) {
        url += `&referrer=${encodeURIComponent(data.referrer)}`;
      }
      return url;
    }
  },
  {
    id: 'appstore',
    name: 'App Store App',
    icon: Smartphone,
    description: 'Open iOS app in App Store',
    fields: [
      { key: 'appId', label: 'App Store ID', type: 'text', placeholder: '123456789', required: true },
      { key: 'campaignToken', label: 'Campaign Token (optional)', type: 'text', placeholder: 'campaign_id' }
    ],
    generate: (data) => {
      let url = `https://apps.apple.com/app/id${data.appId}`;
      if (data.campaignToken) {
        url += `?ct=${encodeURIComponent(data.campaignToken)}`;
      }
      return url;
    }
  },
  {
    id: 'json',
    name: 'JSON Data',
    icon: Code,
    description: 'Create QR code with custom JSON data',
    fields: [
      { key: 'json', label: 'JSON Data', type: 'textarea', placeholder: '{"name": "value", "key": "data"}', required: true }
    ],
    generate: (data) => {
      try {
        // Validate JSON
        JSON.parse(data.json);
        return data.json;
      } catch {
        return data.json; // Return as-is if invalid JSON
      }
    }
  }
];

export function BarcodeGenerator() {
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [generatedType, setGeneratedType] = useState<'barcode' | 'qrcode'>('barcode');
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [canvasReady, setCanvasReady] = useState<boolean>(false);
  const [templateData, setTemplateData] = useState<Record<string, string>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barcodeRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, watch, formState: { errors }, reset, getValues, setValue } = useForm<CodeFormData>({
    defaultValues: {
      text: '123456789012',
      codeType: 'barcode',
      format: 'CODE128',
      width: 2,
      height: 100,
      displayValue: true,
      background: '#ffffff',
      lineColor: '#000000',
      qrErrorCorrectionLevel: 'M',
      qrSize: 200,
      qrMargin: 4,
      useTemplate: false,
      selectedTemplate: 'website',
      templateData: {},
    }
  });

  const watchedCodeType = watch('codeType');
  const watchedUseTemplate = watch('useTemplate');
  const watchedSelectedTemplate = watch('selectedTemplate');
  
  // Get the currently selected template
  const selectedTemplate = QR_TEMPLATES.find(t => t.id === watchedSelectedTemplate);

  // Test if libraries are available
  useEffect(() => {
    console.log('JsBarcode available:', typeof JsBarcode);
    console.log('QRCode available:', typeof QRCode);
    setDebugInfo(`JsBarcode: ${typeof JsBarcode} | QRCode: ${typeof QRCode}`);
  }, []);

  // Initialize canvas with retry mechanism
  useEffect(() => {
    const initializeCanvas = () => {
      console.log('Initializing canvas...');
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        console.log('Canvas element found:', canvas);
        
        try {
          canvas.width = 600;
          canvas.height = 400;
          const ctx = canvas.getContext('2d');
          console.log('Canvas context:', ctx);
          
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            console.log('Canvas initialized successfully');
            setDebugInfo(prev => prev + ' | Canvas initialized');
            setCanvasReady(true);
            return true;
          } else {
            console.error('Failed to get canvas context');
            setDebugInfo(prev => prev + ' | Canvas context failed');
          }
        } catch (error) {
          console.error('Canvas initialization error:', error);
          setDebugInfo(prev => prev + ' | Canvas init error: ' + error);
        }
      } else {
        console.log('Canvas ref not yet available, will retry...');
        setDebugInfo(prev => prev + ' | Canvas ref not available');
      }
      return false;
    };

    // Try to initialize immediately
    if (!initializeCanvas()) {
      // If failed, retry after a short delay
      const timeout = setTimeout(() => {
        if (!initializeCanvas()) {
          // Try one more time after another delay
          setTimeout(() => {
            initializeCanvas();
          }, 500);
        }
      }, 100);
      
      return () => clearTimeout(timeout);
    }
  }, []);

  // Additional effect to monitor canvas availability
  useEffect(() => {
    const checkCanvas = () => {
      if (canvasRef.current && !canvasReady) {
        console.log('Canvas became available, initializing...');
        const canvas = canvasRef.current;
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          setCanvasReady(true);
          setDebugInfo(prev => prev + ' | Canvas ready');
        }
      }
    };

    const interval = setInterval(checkCanvas, 100);
    return () => clearInterval(interval);
  }, [canvasReady]);

  // Template handling functions
  const handleTemplateChange = (templateId: string) => {
    setValue('selectedTemplate', templateId);
    setTemplateData({});
  };

  const handleTemplateDataChange = (key: string, value: string) => {
    setTemplateData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const generateFromTemplate = () => {
    const template = QR_TEMPLATES.find(t => t.id === watchedSelectedTemplate);
    if (!template) return;

    // Validate required fields
    const missingFields = template.fields
      .filter(field => field.required && !templateData[field.key])
      .map(field => field.label);

    if (missingFields.length > 0) {
      setError(`Please fill in required fields: ${missingFields.join(', ')}`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const qrData = template.generate(templateData);
      setValue('text', qrData);
      
      // Auto-generate the QR code
      const currentData = getValues();
      generateCode({
        ...currentData,
        text: qrData,
        codeType: 'qrcode'
      });
    } catch (error: Error | unknown) {
      setError(`Template generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setError(''), 3000);
    }
  };

  const generateCode = async (data: CodeFormData) => {
    console.log('=== CODE GENERATION START ===');
    console.log('Data received:', data);
    console.log('Canvas ready:', canvasReady);
    console.log('Canvas ref current:', !!canvasRef.current);
    
    setError('');
    setIsGenerating(true);
    
    try {
      // Wait a moment to ensure canvas is ready
      if (!canvasRef.current) {
        console.log('Canvas not ready, waiting...');
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Check if canvas is available
      if (!canvasRef.current) {
        throw new Error('Canvas reference not available after waiting');
      }
      console.log('✓ Canvas reference OK');

      // Check if text is provided
      if (!data.text || data.text.trim() === '') {
        throw new Error('No text provided for code generation');
      }
      console.log('✓ Text provided:', data.text);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }
      console.log('✓ Canvas context OK');

      // Clear canvas
      console.log('Clearing canvas...');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = data.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      console.log('✓ Canvas cleared');

      if (data.codeType === 'barcode') {
        // Generate barcode
        console.log('Generating barcode...');
        if (typeof JsBarcode !== 'function') {
          throw new Error('JsBarcode is not available');
        }

        JsBarcode(canvas, data.text, {
          format: data.format,
          width: Number(data.width) || 2,
          height: Number(data.height) || 100,
          displayValue: data.displayValue,
          background: data.background,
          lineColor: data.lineColor,
          margin: 10,
        });
        console.log('✓ Barcode generated');
      } else {
        // Generate QR code
        console.log('Generating QR code...');
        if (typeof QRCode === 'undefined') {
          throw new Error('QRCode library is not available');
        }

        const qrOptions = {
          errorCorrectionLevel: data.qrErrorCorrectionLevel,
          width: Number(data.qrSize) || 200,
          margin: Number(data.qrMargin) || 4,
          color: {
            dark: data.lineColor,
            light: data.background,
          },
        };

        // Generate QR code to canvas
        await QRCode.toCanvas(canvas, data.text, qrOptions);
        console.log('✓ QR code generated');
      }
      
      setGeneratedCode(data.text);
      setGeneratedType(data.codeType);
      setHasGenerated(true);
      setError('');
      setDebugInfo(`${data.codeType === 'barcode' ? 'Barcode' : 'QR Code'} generated successfully!`);
      
      console.log('=== CODE GENERATION SUCCESS ===');
    } catch (error: Error | unknown) {
      console.error('=== CODE GENERATION FAILED ===');
      console.error('Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      setDebugInfo(`Error: ${errorMessage}`);
      setHasGenerated(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const testBasicGeneration = async () => {
    console.log('Testing basic code generation...');
    console.log('Canvas ref:', !!canvasRef.current);
    console.log('Canvas ready:', canvasReady);
    
    // Wait for canvas if not ready
    if (!canvasRef.current) {
      console.log('Waiting for canvas...');
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    if (canvasRef.current) {
      try {
        console.log('Attempting basic barcode generation...');
        JsBarcode(canvasRef.current, "Hello World", {
          format: "CODE128",
          width: 2,
          height: 100,
          displayValue: true
        });
        console.log('Basic test successful');
        setHasGenerated(true);
        setGeneratedCode('Hello World');
        setGeneratedType('barcode');
        setDebugInfo('Basic test successful');
        setError('');
      } catch (error: Error | unknown) {
        console.error('Basic test failed:', error);
        setError(`Basic test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      setError('Canvas still not available for basic test');
    }
  };

  const testQRGeneration = async () => {
    console.log('Testing QR code generation...');
    
    if (!canvasRef.current) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    if (canvasRef.current) {
      try {
        console.log('Attempting QR code generation...');
        await QRCode.toCanvas(canvasRef.current, "Hello QR World", {
          width: 200,
          margin: 4,
          errorCorrectionLevel: 'M'
        });
        console.log('QR test successful');
        setHasGenerated(true);
        setGeneratedCode('Hello QR World');
        setGeneratedType('qrcode');
        setDebugInfo('QR test successful');
        setError('');
      } catch (error: Error | unknown) {
        console.error('QR test failed:', error);
        setError(`QR test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      setError('Canvas still not available for QR test');
    }
  };

  const onSubmit = async (data: CodeFormData) => {
    console.log('Form submitted with data:', data);
    await generateCode(data);
  };

  const handleQuickGenerate = async () => {
    console.log('Quick generate clicked');
    const data = getValues();
    console.log('Current form values:', data);
    await generateCode(data);
  };

  const resetForm = () => {
    reset();
    setGeneratedCode('');
    setGeneratedType('barcode');
    setHasGenerated(false);
    setError('');
    setDebugInfo('Form reset');
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const exportToPNG = () => {
    if (!canvasRef.current || !hasGenerated) {
      alert('Please generate a code first');
      return;
    }
    
    const link = document.createElement('a');
    link.download = `${generatedType}-${generatedCode}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
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
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Barcode & QR Code Generator</h1>
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-1 flex border dark:border-slate-700">
            <button
              type="button"
              onClick={() => setMode('simple')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-md transition-all ${
                mode === 'simple' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span className="font-medium">Simple Mode</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('advanced')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-md transition-all ${
                mode === 'advanced' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <Cog className="h-4 w-4" />
              <span className="font-medium">Advanced Mode</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Settings Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border dark:border-slate-700">
                <div className="flex items-center space-x-2 mb-6">
                  <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
                </div>

                <div className="space-y-4">
                  {/* Code Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Code Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center space-x-2 p-3 border dark:border-slate-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                        <input
                          {...register('codeType')}
                          type="radio"
                          value="barcode"
                          className="text-blue-600 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                        />
                        <BarChart3 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Barcode</span>
                      </label>
                      <label className="flex items-center space-x-2 p-3 border dark:border-slate-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                        <input
                          {...register('codeType')}
                          type="radio"
                          value="qrcode"
                          className="text-blue-600 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                        />
                        <QrCode className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">QR Code</span>
                      </label>
                    </div>
                  </div>

                  {/* Text Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {watchedCodeType === 'qrcode' ? 'QR Code Data' : 'Barcode Text'} *
                    </label>
                    <input
                      {...register('text', { required: 'Text is required' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                      placeholder={watchedCodeType === 'qrcode' ? 'Enter data for QR code (URL, text, etc.)' : 'Enter text to encode'}
                    />
                    {errors.text && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.text.message}</p>
                    )}
                  </div>

                  {/* Barcode Specific Options */}
                  {watchedCodeType === 'barcode' && (
                    <>
                      {/* Format Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Barcode Format
                        </label>
                        <select
                          {...register('format')}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                        >
                          {barcodeFormats.map((format) => (
                            <option key={format.value} value={format.value}>
                              {format.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Dimensions */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Width
                          </label>
                          <input
                            {...register('width', { valueAsNumber: true })}
                            type="number"
                            min="1"
                            max="10"
                            step="0.1"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Height
                          </label>
                          <input
                            {...register('height', { valueAsNumber: true })}
                            type="number"
                            min="50"
                            max="300"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                          />
                        </div>
                      </div>

                      {/* Display Text */}
                      <div className="flex items-center">
                        <input
                          {...register('displayValue')}
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700"
                        />
                        <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Display Text Below Barcode
                        </label>
                      </div>
                    </>
                  )}

                  {/* QR Code Specific Options */}
                  {watchedCodeType === 'qrcode' && (
                    <>
                      {/* Use Template Toggle */}
                      <div className="flex items-center space-x-2">
                        <input
                          {...register('useTemplate')}
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700"
                        />
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Use QR Template
                        </label>
                      </div>

                      {/* Template Selection */}
                      {watchedUseTemplate && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select Template
                          </label>
                          <select
                            {...register('selectedTemplate')}
                            onChange={(e) => handleTemplateChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700 mb-4"
                          >
                            {QR_TEMPLATES.map((template) => (
                              <option key={template.id} value={template.id}>
                                {template.name}
                              </option>
                            ))}
                          </select>

                          {/* Template Fields */}
                          {selectedTemplate && (
                            <div className="space-y-3 p-4 bg-blue-50 dark:bg-slate-700/50 rounded-lg border dark:border-slate-600">
                              <div className="flex items-center space-x-2 mb-3">
                                <selectedTemplate.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <h4 className="font-medium text-blue-900 dark:text-blue-200">{selectedTemplate.name}</h4>
                              </div>
                              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">{selectedTemplate.description}</p>
                              
                              {selectedTemplate.fields.map((field: { key: string; label: string; type: string; placeholder: string; required?: boolean; options?: Array<{ value: string; label: string }> }) => (
                                <div key={field.key}>
                                  <label className="block text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                                    {field.label} {field.required && '*'}
                                  </label>
                                  {field.type === 'textarea' ? (
                                    <textarea
                                      value={templateData[field.key] || ''}
                                      onChange={(e) => handleTemplateDataChange(field.key, e.target.value)}
                                      placeholder={field.placeholder}
                                      className="w-full px-3 py-2 border border-blue-300 dark:border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-600 min-h-[80px]"
                                      required={field.required}
                                    />
                                  ) : field.type === 'select' ? (
                                    <select
                                      value={templateData[field.key] || ''}
                                      onChange={(e) => handleTemplateDataChange(field.key, e.target.value)}
                                      className="w-full px-3 py-2 border border-blue-300 dark:border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-600"
                                      required={field.required}
                                    >
                                      <option value="">Select {field.label}</option>
                                      {field.options?.map((option: { value: string; label: string }) => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <input
                                      type={field.type}
                                      value={templateData[field.key] || ''}
                                      onChange={(e) => handleTemplateDataChange(field.key, e.target.value)}
                                      placeholder={field.placeholder}
                                      className="w-full px-3 py-2 border border-blue-300 dark:border-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-600"
                                      required={field.required}
                                    />
                                  )}
                                </div>
                              ))}
                              
                              <button
                                type="button"
                                onClick={generateFromTemplate}
                                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
                              >
                                Generate from Template
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* QR Code Options */}
                      {!watchedUseTemplate && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Error Correction Level
                            </label>
                            <select
                              {...register('qrErrorCorrectionLevel')}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                            >
                              <option value="L">Low (7%)</option>
                              <option value="M">Medium (15%)</option>
                              <option value="Q">Quartile (25%)</option>
                              <option value="H">High (30%)</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Size (px)
                              </label>
                              <input
                                {...register('qrSize', { valueAsNumber: true })}
                                type="number"
                                min="100"
                                max="500"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Margin
                              </label>
                              <input
                                {...register('qrMargin', { valueAsNumber: true })}
                                type="number"
                                min="0"
                                max="10"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* Advanced Options */}
                  {mode === 'advanced' && (
                    <div className="pt-4 border-t border-gray-200 dark:border-slate-600">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Colors</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Background
                          </label>
                          <input
                            {...register('background')}
                            type="color"
                            className="w-full h-10 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {watchedCodeType === 'qrcode' ? 'QR Color' : 'Line Color'}
                          </label>
                          <input
                            {...register('lineColor')}
                            type="color"
                            className="w-full h-10 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Generate Buttons */}
                  <div className="pt-6 border-t border-gray-200 dark:border-slate-600 space-y-3">
                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <BarChart3 className="h-4 w-4" />
                          <span>Generate {watchedCodeType === 'qrcode' ? 'QR Code' : 'Barcode'}</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleQuickGenerate}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                      <Zap className="h-4 w-4" />
                      <span>Quick Generate</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={resetForm}
                      className="w-full px-4 py-2 bg-gray-600 dark:bg-slate-600 hover:bg-gray-700 dark:hover:bg-slate-500 text-white rounded-lg transition-colors font-medium"
                    >
                      Reset Form
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border dark:border-slate-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Preview & Export</h2>
                
                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-800 dark:text-red-400 font-medium">❌ {error}</p>
                  </div>
                )}
                
                {/* Code Preview */}
                <div className="mb-8">
                  <div 
                    ref={barcodeRef}
                    className="flex justify-center items-center p-8 bg-gray-50 dark:bg-slate-700 rounded-lg min-h-[300px] border-2 border-dashed border-gray-300 dark:border-slate-600"
                  >
                    {/* Canvas - Always rendered but positioned absolutely */}
                    <canvas
                      ref={canvasRef}
                      className={`border border-gray-200 dark:border-slate-600 bg-white ${hasGenerated ? 'block' : 'hidden'}`}
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                    
                    {/* Placeholder - Only shown when no code generated */}
                    {!hasGenerated && (
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        <div className="flex justify-center items-center space-x-4 mb-4">
                          <BarChart3 className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                          <span className="text-2xl text-gray-300 dark:text-gray-600">+</span>
                          <QrCode className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                        </div>
                        <p className="text-lg font-medium">Your barcode or QR code will appear here</p>
                        <p className="text-sm">
                          {!canvasReady ? 'Canvas is loading...' : 'Select a code type and click generate'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Export Button */}
                <div className="mb-8">
                  <button
                    type="button"
                    onClick={exportToPNG}
                    disabled={!hasGenerated}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export PNG</span>
                  </button>
                </div>

                {/* Status */}
                {hasGenerated && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-6">
                    <p className="text-green-800 dark:text-green-400 font-medium">
                      ✅ {generatedType === 'qrcode' ? 'QR Code' : 'Barcode'} generated successfully!
                    </p>
                  </div>
                )}

                {/* Usage Tips */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">💡 Tips:</h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• <strong>EAN13:</strong> Requires exactly 12 digits</li>
                    <li>• <strong>QR Templates:</strong> Use Gmail template to create email links, WiFi template for network sharing</li>
                    <li>• <strong>App Store:</strong> Use App Store ID (found in app URL) for iOS apps</li>
                    <li>• <strong>Play Store:</strong> Use package name (com.example.app) for Android apps</li>
                    <li>• <strong>Export:</strong> Right-click the generated code to save or copy</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 