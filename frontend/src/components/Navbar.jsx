'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import Button from './ui/Button';
import { useState, useEffect } from 'react';
import WorldIDVerification from './WorldIDVerification';

export default function Navbar() {
  const { login, authenticated, user, logout } = usePrivy();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isWorldIdVerified, setIsWorldIdVerified] = useState(false);

  const isActive = (path) => pathname === path;

  // Check WorldID verification status
  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      checkWorldIdStatus();
    }
  }, [authenticated, user?.wallet?.address]);

  const checkWorldIdStatus = async () => {
    try {
      const { api } = await import('@/lib/api');
      const data = await api.getWorldIdStatus(user.wallet.address);
      setIsWorldIdVerified(data.isWorldIdVerified || false);
    } catch (err) {
      console.error('Error checking WorldID status:', err);
    }
  };

  const handleWorldIdVerified = () => {
    setIsWorldIdVerified(true);
    setIsDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6 max-w-7xl mx-auto">
        {/* Left: Logo */}
        <Link href="/" className="text-xl font-bold tracking-tighter bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          FlightStakeFi ✈️
        </Link>

        {/* Center: Navigation (Only visible if authenticated or on landing) */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
          <Link href="/dashboard">
            <button className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${isActive('/dashboard') ? 'bg-white/10 text-white shadow-lg shadow-blue-500/10' : 'text-gray-400 hover:text-white'}`}>
              Dashboard
            </button>
          </Link>
          <Link href="/market">
            <button className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${isActive('/market') ? 'bg-white/10 text-white shadow-lg shadow-blue-500/10' : 'text-gray-400 hover:text-white'}`}>
              Marketplace
            </button>
          </Link>
        </div>

        {/* Right: Identity Pill */}
        <div className="flex items-center gap-4">
          {authenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
              >
                {/* Status Dot */}
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>

                <div className="flex flex-col items-start text-xs">
                  <span className="text-gray-300 font-medium group-hover:text-white transition-colors">
                    {user?.email?.address || user?.wallet?.address?.slice(0, 6) + '...'}
                  </span>
                </div>
              </button>

              {/* Dropdown */}
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-gray-900 border border-white/10 shadow-xl z-50 overflow-hidden py-2">
                    {/* WorldID Status */}
                    <div className="px-4 py-2 border-b border-white/10">
                      {isWorldIdVerified ? (
                        <div className="flex items-center gap-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-green-400 font-medium">World ID Verified</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-400">Verify your identity</p>
                          <WorldIDVerification onVerified={handleWorldIdVerified} />
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(user?.wallet?.address);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      Copy Address
                    </button>
                    <a
                      href={`https://sepolia.etherscan.io/address/${user?.wallet?.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      View on Etherscan
                    </a>
                    <div className="h-px bg-white/10 my-1" />
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Log Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Button onClick={login} variant="primary" className="shadow-blue-500/20 shadow-lg">
              Connect
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}