"use client";
import React, { useState } from 'react';
import { Check, Star, Zap, Target, Trophy, CreditCard, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/app/provider';

function Billing() {
  const user = useUser();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const creditPacks = [
    {
      id: 'starter',
      name: 'Starter Pack',
      credits: 5,
      price: 99,
      originalPrice: 149,
      bestFor: 'Casual prep',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      popular: false
    },
    {
      id: 'growth',
      name: 'Growth Pack',
      credits: 15,
      price: 249,
      originalPrice: 399,
      bestFor: 'Serious interview rounds',
      icon: <Target className="w-6 h-6" />,
      color: 'bg-green-50 border-green-200 text-green-700',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro Pack',
      credits: 30,
      price: 449,
      originalPrice: 749,
      bestFor: 'Intensive practice + review',
      icon: <Trophy className="w-6 h-6" />,
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      popular: false
    },
    {
      id: 'unlimited',
      name: 'Unlimited Plan',
      credits: '∞',
      price: 699,
      originalPrice: null,
      bestFor: 'Daily interviews, no limits',
      icon: <Star className="w-6 h-6" />,
      color: 'bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-200 text-orange-700',
      buttonColor: 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700',
      popular: false,
      isMonthly: true
    }
  ];

  const features = [
    'AI-powered interview questions',
    'Real-time voice interaction',
    'Instant detailed feedback',
    'Performance analytics',
    'Interview history tracking',
    'Multiple job role support'
  ];

  const handlePurchase = async (pack) => {
    setSelectedPlan(pack.id);
    setIsProcessing(true);
    
    try {
      // Here you would integrate with your payment gateway
      console.log('Purchasing:', pack);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // After successful payment, redirect or show success
      alert(`Successfully purchased ${pack.name}!`);
      
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4 mr-2" />
            Credit-Based System
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Practice makes perfect!
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            NexPrep uses a credit-based system to give you AI-powered interview experiences.
          </p>

          {/* Current Credits Display */}
          {user?.user && (
            <div className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 rounded-xl shadow-sm">
              <CreditCard className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-gray-700">Current Credits: </span>
              <span className="font-bold text-blue-600 ml-1">{user.user.credits || 0}</span>
            </div>
          )}
        </div>

        {/* How it Works */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Free Start</h3>
            <p className="text-gray-600">Every new user gets <strong>3 free interviews</strong></p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Buy More</h3>
            <p className="text-gray-600">Once they're used, you can <strong>buy more credits</strong></p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Pay Per Use</h3>
            <p className="text-gray-600">Pay only for what you use — <strong>no hidden charges</strong></p>
          </div>
        </div>

        {/* Credit Packs Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">💼 Choose a Credit Pack</h2>
            <p className="text-gray-600">Select the perfect plan for your interview preparation journey</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {creditPacks.map((pack) => (
              <div 
                key={pack.id}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${pack.color} ${
                  pack.popular ? 'ring-2 ring-green-400 ring-offset-2' : ''
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    {pack.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{pack.name}</h3>
                  
                  <div className="mb-4">
                    <div className="text-3xl font-bold">
                      ₹{pack.price}
                      {pack.isMonthly && <span className="text-sm font-normal">/mo</span>}
                    </div>
                    {pack.originalPrice && (
                      <div className="text-sm text-gray-500 line-through">₹{pack.originalPrice}</div>
                    )}
                  </div>

                  <div className="text-2xl font-bold mb-2">
                    {pack.credits} Credits
                  </div>
                  
                  <p className="text-sm mb-6">{pack.bestFor}</p>

                  <Button
                    onClick={() => handlePurchase(pack)}
                    disabled={isProcessing && selectedPlan === pack.id}
                    className={`w-full ${pack.buttonColor} text-white font-medium py-3 rounded-xl transition-all duration-200 flex items-center justify-center`}
                  >
                    {isProcessing && selectedPlan === pack.id ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Choose Plan
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">What You Get With Credits</h3>
            <p className="text-gray-600">Use credits to start a new mock interview with voice, AI questions, and instant feedback.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ or Support Section */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@nexprep.com" className="text-blue-600 hover:underline">
              support@nexprep.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Billing;