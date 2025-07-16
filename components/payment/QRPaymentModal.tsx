import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { X, CircleCheck as CheckCircle, CircleAlert as AlertCircle, RefreshCw, Layers } from 'lucide-react-native';
import { DeployedObject } from '@/types/database';
import QRCode from './QRCode';

interface QRPaymentModalProps {
  visible: boolean;
  agent: DeployedObject;
  onClose: () => void;
  onPaymentComplete: (success: boolean) => void;
}

// Payment states
type PaymentState = 'generating' | 'ready' | 'processing' | 'success' | 'failed';

export default function QRPaymentModal({ 
  visible, 
  agent, 
  onClose,
  onPaymentComplete
}: QRPaymentModalProps) {
  const [paymentState, setPaymentState] = useState<PaymentState>('generating');
  const [qrData, setQrData] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(300); // 5 minutes in seconds
  const [error, setError] = useState<string | null>(null);

  // Generate QR code data when modal opens
  useEffect(() => {
    if (visible) {
      generateQRCode();
    } else {
      // Reset state when modal closes
      setPaymentState('generating');
      setQrData(null);
      setTimeRemaining(300);
      setError(null);
    }
  }, [visible]);

  // Countdown timer
  useEffect(() => {
    if (paymentState !== 'ready' || !visible) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentState('failed');
          setError('Payment session expired. Please try again.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentState, visible]);

  // Format time remaining as MM:SS
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Generate QR code data
  const generateQRCode = async () => {
    setPaymentState('generating');
    setError(null);
    
    try {
      // In a real implementation, this would call your backend API
      // to generate a dynamic QR code for this specific transaction
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // Get payment amount from agent
      const amount = agent.interaction_fee_usdfc || 1.0;
      setPaymentAmount(amount);
      
      // Generate a mock payment URL with transaction details
      // In production, this would be a real blockchain transaction URL
      const mockTransactionData = {
        to: "0x6533fe2Ebb66CcE28FDdBA9663Fe433A308137e9", // BDAG token contract
        amount: amount,
        agentId: agent.id,
        timestamp: Date.now(),
        nonce: Math.floor(Math.random() * 1000000)
      };
      
      // Create QR code data
      const qrCodeData = `blockdag://pay/${JSON.stringify(mockTransactionData)}`;
      setQrData(qrCodeData);
      setPaymentState('ready');
      
      // Simulate payment status checking
      simulatePaymentCheck();
      
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      setError(error.message || 'Failed to generate payment QR code');
      setPaymentState('failed');
    }
  };
  
  // Simulate payment status checking
  const simulatePaymentCheck = () => {
    // In a real implementation, this would poll your backend API
    // to check if the payment has been completed
    
    // For demo purposes, we'll simulate a successful payment after a random time
    const checkTime = 5000 + Math.random() * 10000; // 5-15 seconds
    
    setTimeout(() => {
      // 80% chance of success for demo purposes
      const success = Math.random() < 0.8;
      
      if (success) {
        setPaymentState('success');
        // Notify parent component after a brief delay to show success state
        setTimeout(() => onPaymentComplete(true), 2000);
      } else {
        setPaymentState('failed');
        setError('Payment verification failed. Please try again.');
      }
    }, checkTime);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Layers size={24} color="#6366f1" strokeWidth={2} />
              <Text style={styles.headerTitle}>AR Pay</Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
              disabled={paymentState === 'processing'}
            >
              <X size={20} color="#374151" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          
          {/* Content */}
          <View style={styles.content}>
            {/* Agent Info */}
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{agent.name}</Text>
              <Text style={styles.agentType}>{agent.object_type}</Text>
            </View>
            
            {/* Payment Amount */}
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Payment Amount</Text>
              <Text style={styles.amountValue}>{paymentAmount.toFixed(2)} BDAG</Text>
              <Text style={styles.amountDescription}>
                One-time fee to interact with this agent
              </Text>
            </View>
            
            {/* QR Code */}
            <View style={styles.qrContainer}>
              {paymentState === 'generating' && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#6366f1" />
                  <Text style={styles.loadingText}>Generating payment QR code...</Text>
                </View>
              )}
              
              {paymentState === 'ready' && qrData && (
                <>
                  <QRCode value={qrData} size={200} />
                  <Text style={styles.qrInstructions}>
                    Scan with your BlockDAG wallet app
                  </Text>
                  <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>
                      Expires in {formatTimeRemaining()}
                    </Text>
                  </View>
                </>
              )}
              
              {paymentState === 'processing' && (
                <View style={styles.processingContainer}>
                  <ActivityIndicator size="large" color="#6366f1" />
                  <Text style={styles.processingText}>
                    Verifying payment...
                  </Text>
                </View>
              )}
              
              {paymentState === 'success' && (
                <View style={styles.successContainer}>
                  <CheckCircle size={64} color="#10b981" strokeWidth={2} />
                  <Text style={styles.successText}>Payment Successful!</Text>
                  <Text style={styles.successSubtext}>
                    You can now interact with this agent
                  </Text>
                </View>
              )}
              
              {paymentState === 'failed' && (
                <View style={styles.failedContainer}>
                  <AlertCircle size={64} color="#ef4444" strokeWidth={2} />
                  <Text style={styles.failedText}>Payment Failed</Text>
                  {error && (
                    <Text style={styles.errorText}>{error}</Text>
                  )}
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={generateQRCode}
                  >
                    <RefreshCw size={16} color="#ffffff" strokeWidth={2} />
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          
          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Powered by BlockDAG • Secure Payments
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Content
  content: {
    padding: 20,
  },
  agentInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  agentName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  agentType: {
    fontSize: 14,
    color: '#6b7280',
  },
  
  // Amount
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366f1',
    marginBottom: 4,
  },
  amountDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  
  // QR Code
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
  },
  qrInstructions: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  timerContainer: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#b91c1c',
  },
  
  // Loading
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
  
  // Processing
  processingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  processingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
  
  // Success
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10b981',
    marginTop: 16,
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  
  // Failed
  failedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  failedText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  // Footer
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});