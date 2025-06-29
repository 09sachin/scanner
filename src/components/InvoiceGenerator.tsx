'use client';

import { useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { 
  Download, 
  Home, 
  FileText, 
  Plus, 
  Minus, 
  User, 
  Save,
  Eye,
  Building2,
  Calculator,
  Package,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  gstRate: number;
  gstAmount: number;
}

interface InvoiceFormData {
  // Business Details
  businessName: string;
  businessAddress: string;
  businessGst: string;
  businessPhone: string;
  businessEmail: string;
  
  // Customer Details
  customerName: string;
  customerAddress: string;
  customerGst: string;
  customerPhone: string;
  
  // Invoice Details
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  placeOfSupply: string;
  
  // Items
  items: InvoiceItem[];
  
  // Additional Details
  notes: string;
  terms: string;
  
  // Template
  template: string;
}

const gstRates = [0, 5, 12, 18, 28];

const templates = [
  { value: 'modern', label: 'Modern' },
  { value: 'classic', label: 'Classic' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'professional', label: 'Professional' }
];

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

export function InvoiceGenerator() {
  const [previewMode, setPreviewMode] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<InvoiceFormData>({
    defaultValues: {
      businessName: '',
      businessAddress: '',
      businessGst: '',
      businessPhone: '',
      businessEmail: '',
      customerName: '',
      customerAddress: '',
      customerGst: '',
      customerPhone: '',
      invoiceNumber: `INV-${Date.now()}`,
      invoiceDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      placeOfSupply: '',
      items: [{ description: '', quantity: 1, rate: 0, amount: 0, gstRate: 18, gstAmount: 0 }],
      notes: '',
      terms: 'Payment due within 30 days',
      template: 'modern'
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchedItems = watch('items');
  const watchedTemplate = watch('template');

  const calculateItemAmount = (index: number) => {
    const quantity = watchedItems[index]?.quantity || 0;
    const rate = watchedItems[index]?.rate || 0;
    const gstRate = watchedItems[index]?.gstRate || 0;
    
    const amount = quantity * rate;
    const gstAmount = (amount * gstRate) / 100;
    
    setValue(`items.${index}.amount`, amount);
    setValue(`items.${index}.gstAmount`, gstAmount);
  };

  const getTotalAmount = () => {
    return watchedItems.reduce((total, item) => total + (item.amount || 0), 0);
  };

  const getTotalGst = () => {
    return watchedItems.reduce((total, item) => total + (item.gstAmount || 0), 0);
  };

  const getGrandTotal = () => {
    return getTotalAmount() + getTotalGst();
  };

  const validateGST = (gst: string) => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  const exportToPDF = async () => {
    if (!invoiceRef.current) return;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`invoice-${watch('invoiceNumber')}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  const addItem = () => {
    append({ description: '', quantity: 1, rate: 0, amount: 0, gstRate: 18, gstAmount: 0 });
  };

  const onSubmit = (data: InvoiceFormData) => {
    console.log('Invoice data:', data);
    setPreviewMode(true);
  };

  const renderInvoiceTemplate = () => {
    const formData = watch();
    
    const templateStyles = {
      modern: 'bg-white border-l-4 border-blue-500',
      classic: 'bg-white border border-gray-300',
      minimal: 'bg-white',
      professional: 'bg-white shadow-lg border'
    };

    return (
      <div ref={invoiceRef} className={`p-8 ${templateStyles[watchedTemplate as keyof typeof templateStyles]} max-w-4xl mx-auto`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
            <p className="text-gray-600">#{formData.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold text-gray-900">{formData.businessName}</h2>
            <p className="text-gray-600 whitespace-pre-line">{formData.businessAddress}</p>
            <p className="text-gray-600">GST: {formData.businessGst}</p>
            <p className="text-gray-600">{formData.businessPhone}</p>
            <p className="text-gray-600">{formData.businessEmail}</p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
            <p className="font-medium">{formData.customerName}</p>
            <p className="text-gray-600 whitespace-pre-line">{formData.customerAddress}</p>
            {formData.customerGst && <p className="text-gray-600">GST: {formData.customerGst}</p>}
            <p className="text-gray-600">{formData.customerPhone}</p>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Invoice Date:</p>
                <p className="font-medium">{format(new Date(formData.invoiceDate), 'dd/MM/yyyy')}</p>
              </div>
              <div>
                <p className="text-gray-600">Due Date:</p>
                <p className="font-medium">{format(new Date(formData.dueDate), 'dd/MM/yyyy')}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600">Place of Supply:</p>
                <p className="font-medium">{formData.placeOfSupply}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Qty</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Rate</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                <th className="border border-gray-300 px-4 py-2 text-right">GST %</th>
                <th className="border border-gray-300 px-4 py-2 text-right">GST Amount</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{item.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">₹{item.rate.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">₹{item.amount.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{item.gstRate}%</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">₹{item.gstAmount.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                    ₹{(item.amount + item.gstAmount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="flex justify-between py-2">
              <span>Subtotal:</span>
              <span>₹{getTotalAmount().toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Total GST:</span>
              <span>₹{getTotalGst().toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-gray-300 font-bold text-lg">
              <span>Grand Total:</span>
              <span>₹{getGrandTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes and Terms */}
        {(formData.notes || formData.terms) && (
          <div className="grid grid-cols-2 gap-8">
            {formData.notes && (
              <div>
                <h4 className="font-semibold mb-2">Notes:</h4>
                <p className="text-gray-600 whitespace-pre-line">{formData.notes}</p>
              </div>
            )}
            {formData.terms && (
              <div>
                <h4 className="font-semibold mb-2">Terms & Conditions:</h4>
                <p className="text-gray-600 whitespace-pre-line">{formData.terms}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Calculate totals
  const totals = {
    subtotal: getTotalAmount(),
    totalGst: getTotalGst(),
    grandTotal: getGrandTotal()
  };

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPreviewMode(false)}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <Save className="h-5 w-5" />
                <span>Edit</span>
              </button>
              <div className="flex items-center space-x-2">
                <User className="h-6 w-6 text-green-600 dark:text-green-400" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoice Preview</h1>
              </div>
            </div>
            <button
              onClick={exportToPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export PDF</span>
            </button>
          </div>

          {renderInvoiceTemplate()}
        </div>
      </div>
    );
  }

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
              <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoice Generator</h1>
            </div>
          </div>
          <button
            onClick={() => setPreviewMode(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Business Information */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border dark:border-slate-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Business Information</span>
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Business Name *
                    </label>
                    <input
                      {...register('businessName', { required: 'Business name is required' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                      placeholder="Your Business Name"
                    />
                    {errors.businessName && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.businessName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      GST Number *
                    </label>
                    <input
                      {...register('businessGst', { 
                        required: 'GST number is required',
                        pattern: {
                          value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                          message: 'Invalid GST number format'
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                      placeholder="22AAAAA0000A1Z5"
                    />
                    {errors.businessGst && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.businessGst.message}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Business Address *
                  </label>
                  <textarea
                    {...register('businessAddress', { required: 'Business address is required' })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                    placeholder="123 Business Street&#10;City, State - 123456"
                  />
                  {errors.businessAddress && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.businessAddress.message}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      {...register('businessPhone')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      {...register('businessEmail')}
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                      placeholder="business@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border dark:border-slate-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                  <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span>Customer Information</span>
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Customer Name *
                    </label>
                    <input
                      {...register('customerName', { required: 'Customer name is required' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                      placeholder="Customer Name"
                    />
                    {errors.customerName && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.customerName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Customer GST Number
                    </label>
                    <input
                      {...register('customerGst')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                      placeholder="22BBBBB0000B1Z5 (Optional)"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Customer Address *
                  </label>
                  <textarea
                    {...register('customerAddress', { required: 'Customer address is required' })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                    placeholder="456 Customer Street&#10;City, State - 654321"
                  />
                  {errors.customerAddress && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.customerAddress.message}</p>
                  )}
                </div>
              </div>

              {/* Invoice Details */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border dark:border-slate-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span>Invoice Details</span>
                </h2>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Invoice Number *
                    </label>
                    <input
                      {...register('invoiceNumber', { required: 'Invoice number is required' })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                      placeholder="INV-001"
                    />
                    {errors.invoiceNumber && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.invoiceNumber.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Invoice Date *
                    </label>
                    <input
                      {...register('invoiceDate', { required: 'Invoice date is required' })}
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                    />
                    {errors.invoiceDate && (
                      <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.invoiceDate.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Due Date
                    </label>
                    <input
                      {...register('dueDate')}
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Place of Supply *
                  </label>
                  <select
                    {...register('placeOfSupply', { required: 'Place of supply is required' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                  >
                    <option value="">Select State</option>
                    {indianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  {errors.placeOfSupply && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.placeOfSupply.message}</p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span>Invoice Items</span>
                  </h2>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Item {index + 1}</h3>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid md:grid-cols-5 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description *
                          </label>
                          <input
                            {...register(`items.${index}.description` as const, { required: 'Description is required' })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                            placeholder="Item description"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Quantity *
                          </label>
                          <input
                            {...register(`items.${index}.quantity` as const, { 
                              required: 'Quantity is required',
                              valueAsNumber: true,
                              min: { value: 0.01, message: 'Quantity must be greater than 0' }
                            })}
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                            placeholder="1"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Rate (₹) *
                          </label>
                          <input
                            {...register(`items.${index}.rate` as const, { 
                              required: 'Rate is required',
                              valueAsNumber: true,
                              min: { value: 0, message: 'Rate must be non-negative' }
                            })}
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                            placeholder="100.00"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            GST (%) *
                          </label>
                          <select
                            {...register(`items.${index}.gstRate` as const, { 
                              required: 'GST rate is required',
                              valueAsNumber: true
                            })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                          >
                            <option value="">Select</option>
                            {gstRates.map((rate) => (
                              <option key={rate} value={rate}>
                                {rate}%
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Total: ₹{((watch(`items.${index}.quantity`) || 0) * (watch(`items.${index}.rate`) || 0) * (1 + (watch(`items.${index}.gstRate`) || 0) / 100)).toFixed(2)}</strong>
                          <span className="ml-4">
                            (Amount: ₹{((watch(`items.${index}.quantity`) || 0) * (watch(`items.${index}.rate`) || 0)).toFixed(2)} + 
                            GST: ₹{((watch(`items.${index}.quantity`) || 0) * (watch(`items.${index}.rate`) || 0) * (watch(`items.${index}.gstRate`) || 0) / 100).toFixed(2)})
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border dark:border-slate-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span>Additional Information</span>
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                      placeholder="Thank you for your business!"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Terms & Conditions
                    </label>
                    <textarea
                      {...register('terms')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                      placeholder="Payment due within 30 days. Late payments may incur charges."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border dark:border-slate-700 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span>Invoice Summary</span>
                </h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total GST:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">₹{totals.totalGst.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-slate-600 pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Grand Total:</span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">₹{totals.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Template Selection */}
                <div className="mt-8">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Template Style
                  </label>
                  <select
                    {...register('template')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                  >
                    {templates.map((template) => (
                      <option key={template.value} value={template.value}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 space-y-3">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Preview Invoice</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={exportToPDF}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export PDF</span>
                  </button>
                </div>

                {/* Tips */}
                <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 dark:text-green-200 mb-2">💡 Tips:</h3>
                  <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                    <li>• GST number format: 22AAAAA0000A1Z5</li>
                    <li>• All required fields must be filled</li>
                    <li>• Check totals before generating PDF</li>
                    <li>• Use preview to verify layout</li>
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