import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Wallet, Layers, ExternalLink, RefreshCw, CircleAlert as AlertCircle } from 'lucide-react-native';
import { MetaMaskProvider, useMetaMask } from '@metamask/sdk-react';
import { ethers } from 'ethers';

// BDAG Token contract details
const BDAG_TOKEN_ADDRESS = '0x6533fe2Ebb66CcE28FDdBA9663Fe433A308137e9';
const BDAG_TOKEN_ABI = [
  // ERC-20 standard functions
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

// Primordial Testnet details
const BLOCKDAG_CHAIN_ID = '0x1b59'; // 7001 in decimal
const BLOCKDAG_NETWORK = {
  chainId: '0x1b59',
  chainName: 'BlockDAG Primordial Testnet',
  nativeCurrency: {
    name: 'BDAG',
    symbol: 'BDAG',
    decimals: 18
  },
  rpcUrls: ['https://rpc-testnet.blockdag.network'],
  blockExplorerUrls: ['https://explorer-testnet.blockdag.network']
};

// MetaMask SDK configuration
const sdkOptions = {
  dappMetadata: {
    name: "AR Viewer",
    url: window.location.href,
  }
};

// Wallet connection component
function WalletConnection() {
  const { status, connect, account, provider, chainId } = useMetaMask();
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = status === 'connected' && !!account;
  const isCorrectNetwork = chainId === BLOCKDAG_CHAIN_ID;

  // Fetch BDAG balance when connected
  useEffect(() => {
    if (isConnected && isCorrectNetwork && provider) {
      fetchBDAGBalance();
    } else {
      setBalance(null);
    }
  }, [isConnected, isCorrectNetwork, account, provider]);

  // Fetch BDAG balance
  const fetchBDAGBalance = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!provider || !account) {
        throw new Error('Wallet not connected');
      }

      const ethersProvider = new ethers.BrowserProvider(provider);
      const tokenContract = new ethers.Contract(
        BDAG_TOKEN_ADDRESS,
        BDAG_TOKEN_ABI,
        ethersProvider
      );

      // Get token details
      const decimals = await tokenContract.decimals();
      const symbol = await tokenContract.symbol();
      
      // Get balance
      const rawBalance = await tokenContract.balanceOf(account);
      const formattedBalance = ethers.formatUnits(rawBalance, decimals);
      
      setBalance(`${parseFloat(formattedBalance).toFixed(4)} ${symbol}`);
    } catch (err: any) {
      console.error('Error fetching BDAG balance:', err);
      setError(err.message || 'Failed to fetch BDAG balance');
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to BlockDAG network
  const switchToBlockDAG = async () => {
    try {
      if (!provider) return;
      
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [BLOCKDAG_NETWORK],
      });
    } catch (err: any) {
      console.error('Error switching network:', err);
      Alert.alert('Network Switch Failed', err.message || 'Failed to switch to BlockDAG network');
    }
  };

  // Handle connect wallet
  const handleConnectWallet = async () => {
    try {
      await connect();
    } catch (err: any) {
      console.error('Connection error:', err);
      Alert.alert('Connection Failed', err.message || 'Failed to connect wallet');
    }
  };

  // Open BlockDAG explorer
  const openExplorer = () => {
    if (account) {
      Linking.openURL(`${BLOCKDAG_NETWORK.blockExplorerUrls[0]}/address/${account}`);
    }
  };

  return (
    <View style={styles.walletContainer}>
      {/* Wallet Status */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Layers size={24} color="#6366f1" strokeWidth={2} />
          <Text style={styles.statusTitle}>BlockDAG Wallet</Text>
        </View>
        
        <View style={styles.statusContent}>
          {isConnected ? (
            <>
              <View style={styles.accountInfo}>
                <Text style={styles.accountLabel}>Connected Account</Text>
                <Text style={styles.accountAddress}>
                  {account.substring(0, 6)}...{account.substring(account.length - 4)}
                </Text>
              </View>
              
              <View style={styles.networkInfo}>
                <View style={[
                  styles.networkBadge,
                  isCorrectNetwork ? styles.networkCorrect : styles.networkIncorrect
                ]}>
                  <Text style={styles.networkText}>
                    {isCorrectNetwork ? 'BlockDAG Primordial Testnet' : 'Wrong Network'}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.disconnectedText}>
              Connect your wallet to interact with the BlockDAG network
            </Text>
          )}
        </View>
        
        <View style={styles.statusActions}>
          {!isConnected ? (
            <TouchableOpacity 
              style={styles.connectButton}
              onPress={handleConnectWallet}
            >
              <Wallet size={20} color="#ffffff" strokeWidth={2} />
              <Text style={styles.connectButtonText}>Connect MetaMask</Text>
            </TouchableOpacity>
          ) : !isCorrectNetwork ? (
            <TouchableOpacity 
              style={styles.switchNetworkButton}
              onPress={switchToBlockDAG}
            >
              <Text style={styles.switchNetworkText}>Switch to BlockDAG Network</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.explorerButton}
              onPress={openExplorer}
            >
              <ExternalLink size={16} color="#6366f1" strokeWidth={2} />
              <Text style={styles.explorerButtonText}>View on Explorer</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* BDAG Balance */}
      {isConnected && isCorrectNetwork && (
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceTitle}>BDAG Token Balance</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={fetchBDAGBalance}
              disabled={isLoading}
            >
              <RefreshCw size={16} color="#6366f1" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Fetching balance...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color="#ef4444" strokeWidth={2} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceAmount}>{balance || '0 BDAG'}</Text>
              <Text style={styles.balanceSubtext}>on BlockDAG Primordial Testnet</Text>
            </View>
          )}
          
          <View style={styles.tokenInfo}>
            <Text style={styles.tokenInfoText}>
              Token Contract: {BDAG_TOKEN_ADDRESS.substring(0, 6)}...{BDAG_TOKEN_ADDRESS.substring(BDAG_TOKEN_ADDRESS.length - 4)}
            </Text>
          </View>
        </View>
      )}

      {/* Information Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>About BlockDAG Integration</Text>
        <Text style={styles.infoText}>
          This AR Viewer is integrated with the BlockDAG Primordial Testnet, allowing you to interact with agents using BDAG tokens. Connect your MetaMask wallet to view your balance and prepare for future AR Pay functionality.
        </Text>
        
        <View style={styles.infoFeatures}>
          <View style={styles.infoFeature}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>View BDAG token balance</Text>
          </View>
          <View style={styles.infoFeature}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Interact with AR agents</Text>
          </View>
          <View style={styles.infoFeature}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Prepare for AR Pay transactions</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// Main wallet screen component
export default function WalletScreen() {
  return (
    <MetaMaskProvider sdkOptions={sdkOptions}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Layers size={24} color="#6366f1" strokeWidth={2} />
          </View>
          <Text style={styles.headerTitle}>BlockDAG Wallet Connection</Text>
          <Text style={styles.headerSubtitle}>
            Connect your wallet to interact with the AR ecosystem
          </Text>
        </View>

        {/* Wallet Connection */}
        <View style={styles.walletSection}>
          <WalletConnection />
        </View>
      </ScrollView>
    </MetaMaskProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  
  // Header
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6366f1',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Wallet Section
  walletSection: {
    flex: 1,
    padding: 20,
  },
  
  // Wallet Container
  walletContainer: {
    gap: 20,
  },
  
  // Status Card
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  statusContent: {
    marginBottom: 20,
  },
  accountInfo: {
    marginBottom: 12,
  },
  accountLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  accountAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'monospace',
  },
  networkInfo: {
    marginBottom: 8,
  },
  networkBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  networkCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  networkIncorrect: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  networkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10b981',
  },
  disconnectedText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  statusActions: {
    alignItems: 'center',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  switchNetworkButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  switchNetworkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  explorerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  explorerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366f1',
  },
  
  // Balance Card
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    flex: 1,
  },
  balanceContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  tokenInfo: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  tokenInfoText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  
  // Info Card
  infoCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#3b82f6',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoFeatures: {
    gap: 8,
  },
  infoFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
  },
  featureText: {
    fontSize: 14,
    color: '#1e40af',
  },
});