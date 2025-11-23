'use client';

import Link from 'next/link';
import Button from '../ui/Button';
import { usePrivy } from '@privy-io/react-auth';

export default function Hero() {
    const { login } = usePrivy();

    return (
        <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

            <div className="relative z-10 max-w-5xl mx-auto text-center">
                {/* Badge */}
                <div className="inline-flex items-center px-3 py-1 mb-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                    <span className="flex h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                    <span className="text-sm text-gray-300">Live on Sepolia Testnet</span>
                </div>

                {/* Headline */}
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">
                    <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                        Unlock Your
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x">
                        Travel Capital
                    </span>
                </h1>

                {/* Subheadline */}
                <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Don't let your flight ticket be dead money.
                    <span className="text-white font-medium"> Stake</span> it for yield,
                    <span className="text-white font-medium"> Borrow</span> against it, or
                    <span className="text-white font-medium"> Sell</span> it instantly.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        variant="primary"
                        className="h-14 px-8 text-lg w-full sm:w-auto shadow-blue-500/25 shadow-xl"
                        onClick={login}
                    >
                        Launch App 🚀
                    </Button>
                    <Link href="#features">
                        <Button
                            variant="secondary"
                            className="h-14 px-8 text-lg w-full sm:w-auto"
                        >
                            How it Works
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Floating Ticket Graphic (CSS Animation) */}
            <div className="absolute -right-20 top-1/3 w-64 h-96 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl rotate-12 animate-float hidden lg:flex flex-col p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <div className="w-8 h-8 rounded-full bg-blue-500/50" />
                    <div className="text-xs text-gray-400 font-mono">NBO ✈️ LHR</div>
                </div>
                <div className="space-y-4">
                    <div className="h-2 w-3/4 bg-white/10 rounded" />
                    <div className="h-2 w-1/2 bg-white/10 rounded" />
                </div>
                <div className="mt-auto pt-6 border-t border-white/10">
                    <div className="text-2xl font-bold text-white">$1,240</div>
                    <div className="text-xs text-green-400">▲ 14% APY</div>
                </div>
            </div>
        </section>
    );
}
