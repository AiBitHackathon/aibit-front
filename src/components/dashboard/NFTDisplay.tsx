import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const NFT_CONTRACT_ADDRESS = '0xa0b125B1078A625C433C8Bb39c70EBD8f3729b73';
const RPC_URL = import.meta.env.RPC_URL || 'https://arbitrum-sepolia-rpc.publicnode.com';

// Match the backend ABI exactly
const NFT_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "string", "name": "_image", "type": "string"},
      {"internalType": "string", "name": "_level", "type": "string"}
    ],
    "name": "safeMint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

interface NFTMetadata {
  name: string;
  image: string;
  level: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

const NFTDisplay: React.FC<{ walletAddress: string }> = ({ walletAddress }) => {
  const [nftData, setNftData] = useState<NFTMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTData = async () => {
      try {
        if (!walletAddress) {
          console.log('No wallet address provided');
          setLoading(false);
          return;
        }
        
        console.log('Fetching NFT data for wallet:', walletAddress);
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        console.log('Provider initialized with RPC URL:', RPC_URL);
        
        const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, provider);
        console.log('Contract initialized');
        
        try {
          const checksumAddress = ethers.getAddress(walletAddress);
          console.log('Using checksum address:', checksumAddress);
          
          const balance = await contract.balanceOf(checksumAddress);
          console.log('NFT balance:', balance.toString());

          if (balance === 0n) {
            console.log('User has no NFTs');
            setLoading(false);
            setError('No NFTs found for this wallet');
            return;
          }

          // Since we know the NFTs are minted sequentially, start checking from 1
          try {
            let found = false;
            for (let i = 1; i <= 10; i++) {
              try {
                const owner = await contract.ownerOf(i);
                console.log(`Checking token ${i}, owned by:`, owner);
                
                if (owner.toLowerCase() === checksumAddress.toLowerCase()) {
                  console.log(`Found user's NFT with ID: ${i}`);
                  const tokenURI = await contract.tokenURI(i);
                  console.log('Token URI:', tokenURI);
                  
                  if (!tokenURI || !tokenURI.startsWith('data:application/json;base64,')) {
                    console.log('Invalid token URI format:', tokenURI);
                    continue;
                  }
                  
                  const base64Data = tokenURI.split(',')[1];
                  const jsonString = atob(base64Data);
                  const metadata: NFTMetadata = JSON.parse(jsonString);
                  console.log('Parsed metadata:', metadata);
                  
                  setNftData(metadata);
                  found = true;
                  break;
                }
              } catch (e) {
                console.log(`No token at ID ${i} or error:`, e);
              }
            }

            if (!found) {
              setError('Could not find NFT data');
            }
          } catch (tokenError: any) {
            console.error('Error fetching token details:', tokenError);
            setError('Error fetching NFT details: ' + tokenError.message);
          }
        } catch (balanceError: any) {
          console.error('Error fetching NFT balance:', balanceError);
          setError('Error checking NFT balance: ' + balanceError.message);
        }
      } catch (err: any) {
        console.error('Error fetching NFT data:', err);
        setError(err.message || 'Failed to load NFT data');
      } finally {
        setLoading(false);
      }
    };

    fetchNFTData();
  }, [walletAddress]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse">Loading NFT data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 text-center">{error}</div>
      </div>
    );
  }

  if (!nftData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 text-center">No NFT found for this wallet</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
      {nftData && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">{nftData.name}</h2>
          {nftData.image && (
            <img
              src={nftData.image}
              alt={nftData.name}
              className="w-full rounded-lg mb-4"
            />
          )}
          <div className="flex items-center">
            <span className="text-gray-700 font-medium">Level:</span>
            <span className="ml-2 text-blue-600">{nftData.level}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTDisplay;
