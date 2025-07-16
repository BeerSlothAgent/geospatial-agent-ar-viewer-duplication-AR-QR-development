import React from 'react';
import { View, Text, StyleSheet, Alert, Linking } from 'react-native';
import { Layers, ExternalLink } from 'lucide-react-native';
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

function WalletConnect() {
  const { status, connect, account, provider, chainId } = useMetaMask();
  const [balance, setBalance] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isConnected = status === 'connected' && !!account;
  const isCorrectNetwork = chainId === BLOCKDAG_CHAIN_ID;

  // Fetch BDAG balance when connected
  React.useEffect(() => {
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
    <View style={styles.container}>
      <View style={styles.infoCard}>
        <Layers size={24} color="#6366f1" strokeWidth={2} />
        <Text style={styles.infoTitle}>Connect Your Wallet</Text>
        <Text style={styles.infoText}>
          Connect your MetaMask wallet to interact with the AR ecosystem using BlockDAG.
        </Text>
      </View>
      
      <View style={styles.walletCard}>
        {!isConnected ? (
          <View style={styles.connectSection}>
            <Text style={styles.connectTitle}>Connect to BlockDAG</Text>
            <Text style={styles.connectSubtitle}>
              Use MetaMask to connect to the BlockDAG Primordial Testnet
            </Text>
            <View style={styles.buttonContainer}>
              <View style={styles.connectButton} onTouchEnd={handleConnectWallet}>
                <Text style={styles.connectButtonText}>Connect MetaMask</Text>
              </View>
            </View>
          </View>
        ) : !isCorrectNetwork ? (
          <View style={styles.networkSection}>
            <Text style={styles.networkTitle}>Wrong Network</Text>
            <Text style={styles.networkSubtitle}>
              Please switch to the BlockDAG Primordial Testnet
            </Text>
            <View style={styles.buttonContainer}>
              <View style={styles.networkButton} onTouchEnd={switchToBlockDAG}>
                <Text style={styles.networkButtonText}>Switch Network</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.connectedSection}>
            <Text style={styles.connectedTitle}>Wallet Connected</Text>
            <View style={styles.accountContainer}>
              <Text style={styles.accountLabel}>Account:</Text>
              <Text style={styles.accountAddress}>
                {account.substring(0, 6)}...{account.substring(account.length - 4)}
              </Text>
            </View>
            
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>BDAG Balance:</Text>
              <Text style={styles.balanceValue}>
                {isLoading ? 'Loading...' : balance || '0 BDAG'}
              </Text>
            </View>
            
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            <View style={styles.buttonContainer}>
              <View style={styles.explorerButton} onTouchEnd={openExplorer}>
                <ExternalLink size={16} color="#6366f1" />
                <Text style={styles.explorerButtonText}>View on Explorer</Text>
              </View>
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>BlockDAG Features</Text>
        
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>BlockDAG Primordial Testnet integration</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>BDAG token support for agent interactions</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Fast transactions with BlockDAG network</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>Secure wallet authentication</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>AR Pay for agent interactions</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function ThirdwebWalletConnect() {
  return (
    <MetaMaskProvider sdkOptions={sdkOptions}>
      <WalletConnect />
    </MetaMaskProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
    padding: 20,
  },
  
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: '100%',
  },
  
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  
  infoText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  walletCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  connectSection: {
    alignItems: 'center',
    padding: 20,
  },
  
  connectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  
  connectSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  buttonContainer: {
    marginTop: 16,
    width: '100%',
  },
  
  connectButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  connectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  networkSection: {
    alignItems: 'center',
    padding: 20,
  },
  
  networkTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f59e0b',
    marginBottom: 8,
  },
  
  networkSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  networkButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  networkButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  connectedSection: {
    padding: 20,
  },
  
  connectedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  accountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  accountLabel: {
    fontSize: 14,
    color: '#64748b',
    width: 80,
  },
  
  accountAddress: {
    fontSize: 14,
    color: '#1e293b',
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  balanceLabel: {
    fontSize: 14,
    color: '#64748b',
    width: 80,
  },
  
  balanceValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  
  errorText: {
    fontSize: 14,
    color: '#ef4444',
  },
  
  explorerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  
  explorerButtonText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  
  featuresSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  
  featuresList: {
    gap: 12,
  },
  
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366f1',
    marginTop: 6,
  },
  
  featureText: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
    lineHeight: 20,
  }
});