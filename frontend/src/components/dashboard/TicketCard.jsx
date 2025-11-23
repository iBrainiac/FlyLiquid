import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export default function TicketCard({ ticket, status = 'IDLE' }) {
    // Status-based styles
    const statusStyles = {
        IDLE: 'border-white/10 hover:border-blue-500/30',
        STAKED: 'border-green-500/20 bg-green-500/5 hover:border-green-500/40',
        LOANED: 'border-orange-500/20 bg-orange-500/5 hover:border-orange-500/40',
    };

    return (
        <Card className={`p-0 overflow-hidden group transition-all duration-300 hover:-translate-y-1 ${statusStyles[status]}`}>
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-white/5 backdrop-blur-sm flex justify-between items-start">
                <div>
                    <div className="text-2xl font-black text-white tracking-tight">
                        NBO <span className="text-gray-500 mx-1">✈</span> LHR
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                        Delta Airlines • Dec 25th
                    </div>
                </div>
                <Badge status={status} />
            </div>

            {/* Body (Illustration Placeholder) */}
            <div className="h-32 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                <div className="text-6xl opacity-20 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500">
                    ✈️
                </div>
            </div>

            {/* Footer (Actions) */}
            <div className="p-6 border-t border-white/5 bg-black/20">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Current Value</div>
                    <div className="text-xl font-bold text-white">$450.00</div>
                </div>

                {status === 'IDLE' && (
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="primary" className="w-full text-sm">Stake</Button>
                        <Button variant="secondary" className="w-full text-sm">Borrow</Button>
                    </div>
                )}

                {status === 'STAKED' && (
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-green-400">Rewards Earned</span>
                            <span className="text-white font-mono">0.045 USDC</span>
                        </div>
                        <Button variant="secondary" className="w-full text-sm border-green-500/30 text-green-400 hover:bg-green-500/10">
                            Unstake
                        </Button>
                    </div>
                )}

                {status === 'LOANED' && (
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-red-400">Debt</span>
                            <span className="text-white font-mono">200.00 USDC</span>
                        </div>
                        <Button variant="secondary" className="w-full text-sm border-red-500/30 text-red-400 hover:bg-red-500/10">
                            Repay Loan
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
}
