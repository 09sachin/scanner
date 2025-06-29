'use client';

import Link from 'next/link';
import { BarChart3, FileText, Scan, Sparkles, Zap, Shield, Download } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-navy-950 dark:via-slate-900 dark:to-navy-900 transition-colors duration-500">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 dark:opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 transform rotate-45 translate-x-1/2 translate-y-1/2 scale-150"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-navy-800 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium mb-8 animate-bounce-soft">
              <Sparkles className="w-4 h-4 mr-2" />
              Professional Barcode & Invoice Solutions
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8 animate-fade-in">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
                BarCode Pro
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-up">
              Transform your business with professional barcode generation, intelligent scanning, and GST-compliant invoicing. 
              <span className="font-semibold text-gray-800 dark:text-gray-200"> All in one powerful platform.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up">
              <Link 
                href="/barcode-generator" 
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Creating
                <Zap className="inline ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              </Link>
              <Link 
                href="/scanner" 
                className="px-8 py-4 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-slate-600 rounded-xl hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                Try Scanner
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Powerful Tools for
              <span className="text-blue-600 dark:text-blue-400"> Modern Business</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to streamline your barcode and invoice workflow
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Barcode Generator Card */}
            <Link href="/barcode-generator" className="group">
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 transition-all duration-500 hover:shadow-2xl hover:scale-105 border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full transform translate-x-16 -translate-y-16"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Barcode & QR Generator
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    Create professional barcodes and QR codes with advanced templates including Gmail, app stores, and WiFi networks. Export in multiple formats.
                  </p>
                  
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Generate Codes
                    <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Scanner Card */}
            <Link href="/scanner" className="group">
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 transition-all duration-500 hover:shadow-2xl hover:scale-105 border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full transform translate-x-16 -translate-y-16"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Scan className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Smart Code Scanner
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    Advanced scanning with camera and upload support. Automatic detection, result history, and instant recognition of multiple barcode formats.
                  </p>
                  
                  <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Scan Codes
                    <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Invoice Generator Card */}
            <Link href="/invoice-generator" className="group">
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 transition-all duration-500 hover:shadow-2xl hover:scale-105 border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full transform translate-x-16 -translate-y-16"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    GST Invoice Generator
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    Create professional GST-compliant invoices with automatic calculations, customizable templates, and instant PDF export for Indian businesses.
                  </p>
                  
                  <div className="flex items-center text-green-600 dark:text-green-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    Create Invoice
                    <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
              Why Choose
              <span className="text-blue-600 dark:text-blue-400"> BarCode Pro?</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: BarChart3,
                  title: "Multiple Formats",
                  description: "Support for CODE128, EAN13, QR codes, and more barcode formats with customizable styling"
                },
                {
                  icon: Scan,
                  title: "Advanced Scanning",
                  description: "Camera and upload scanning with automatic detection and comprehensive result history"
                },
                {
                  icon: Shield,
                  title: "GST Compliance",
                  description: "Generate invoices that meet Indian GST requirements and business regulations"
                },
                {
                  icon: Download,
                  title: "Export Options",
                  description: "Download as PNG, JPEG, or PDF formats with high-quality output for any use case"
                }
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-4 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-navy-800 dark:to-slate-800"></div>
        <div className="absolute inset-0 bg-black/10 dark:bg-black/30"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-blue-100 dark:text-gray-300 mb-12 leading-relaxed">
              Join thousands of businesses using BarCode Pro for their barcode, scanning, and invoicing needs. 
              Start creating professional solutions in minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/barcode-generator" 
                className="px-10 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-colors font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 duration-300"
              >
                Start Generating
              </Link>
              <Link 
                href="/scanner" 
                className="px-10 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300 font-bold text-lg"
              >
                Try Scanner
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
