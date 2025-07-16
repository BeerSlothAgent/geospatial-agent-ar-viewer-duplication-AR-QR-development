import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';
import { DeployedObject } from '@/types/database';
import QRCode from '@/components/payment/QRCode';

interface QRPPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  agent: DeployedObject;
  onPaymentComplete: () => void;
}

export default function QRPPaymentModal({ 
  visible, 
  onClose, 
  agent, 
  onPaymentComplete 
}: QRPPaymentModalProps) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  useEffect(() => {
    if (!visible) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, onClose]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePaymentVerification = () => {
    // Simulate payment verification
    setPaymentStatus('success');
    setTimeout(() => {
      onPaymentComplete();
      onClose();
    }, 1500);
  };

  const paymentData = {
    amount: agent.interaction_fee_usdfc || 0.50,
    currency: agent.currency_type || 'USDFC',
    recipient: agent.agent_wallet_address || 'bdag1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    agentId: agent.id,
    agentName: agent.name || 'AI Agent'
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Payment Required</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.agentName}>{paymentData.agentName}</Text>
            <Text style={styles.amount}>
              {paymentData.amount} {paymentData.currency}
            </Text>
            
            <Text style={styles.instruction}>
              Scan this QR code with your BlockDAG wallet to interact with this agent
            </Text>

            <View style={styles.qrContainer}>
              <QRCode
                value={JSON.stringify(paymentData)}
                size={200}
                backgroundColor="white"
                color="black"
              />
            </View>

            <Text style={styles.timer}>
              Time remaining: {formatTime(timeLeft)}
            </Text>

            {paymentStatus === 'success' && (
              <Text style={styles.successText}>Payment successful!</Text>
            )}

            <TouchableOpacity 
              style={styles.verifyButton}
              onPress={handlePaymentVerification}
            >
              <Text style={styles.verifyButtonText}>Verify Payment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: Math.min(width - 40, 350),
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 16,
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 20,
  },
  timer: {
    fontSize: 14,
    color: '#ff6b6b',
    marginBottom: 20,
  },
  successText: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '600',
    marginBottom: 10,
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});