'use client';

import { IDKitWidget } from '@worldcoin/idkit';
import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Button from './ui/Button';
import { api } from '@/lib/api';

export default function WorldIDVerification({ onVerified }) {
  const { user, authenticated } = usePrivy();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check verification status on mount
  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      checkVerificationStatus();
    }
  }, [authenticated, user?.wallet?.address]);

  const checkVerificationStatus = async () => {
    try {
      const data = await api.getWorldIdStatus(user.wallet.address);
      setIsVerified(data.isWorldIdVerified || false);
    } catch (err) {
      console.error('Error checking verification status:', err);
    }
  };

  const handleVerify = async (proof) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.verifyWorldId(user.wallet.address, proof);
      
      if (data.success && data.verified) {
        setIsVerified(true);
        if (onVerified) {
          onVerified();
        }
      } else {
        throw new Error(data.error || 'Verification failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to verify World ID');
      console.error('WorldID verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!authenticated) {
    return null;
  }

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
        <div className="h-2 w-2 rounded-full bg-green-500"></div>
        <span className="text-sm text-green-400 font-medium">World ID Verified</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <IDKitWidget
        app_id={process.env.NEXT_PUBLIC_WORLD_ID_APP_ID || 'app_staging_1234567890abcdef'} // Replace with your actual App ID
        action="flyliquid-verification"
        signal={user?.wallet?.address}
        onSuccess={handleVerify}
        verification_level="orb" // or "device" for device-level verification
        autoClose
      >
        {({ open }) => (
          <Button
            onClick={open}
            variant="primary"
            disabled={isLoading}
            className="shadow-blue-500/20 shadow-lg"
          >
            {isLoading ? 'Verifying...' : 'Verify with World ID'}
          </Button>
        )}
      </IDKitWidget>
      {error && (
        <p className="text-sm text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}

