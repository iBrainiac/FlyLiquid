import Card from '../ui/Card';

export default function NetWorthRibbon({ portfolio }) {
    // Mock calculations for now (replace with real logic later)
    const totalValue = portfolio?.tickets?.reduce((acc, t) => acc + 450, 0) || 0; // Mock $450 per ticket
    const activeYield = portfolio?.stakes?.length > 0 ? 5.2 : 0;
    const healthFactor = 2.5; // Mock safe health factor

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Card 1: Total Asset Value */}
            <Card className="p-6 flex flex-col justify-between bg-gradient-to-br from-white/5 to-transparent">
                <div className="text-sm text-gray-400 font-medium uppercase tracking-wider">Total Asset Value</div>
                <div className="text-3xl font-bold text-white mt-2">
                    ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
            </Card>

            {/* Card 2: Active Yield */}
            <Card className="p-6 flex flex-col justify-between bg-gradient-to-br from-green-500/5 to-transparent border-green-500/10">
                <div className="text-sm text-green-400/80 font-medium uppercase tracking-wider">Active Yield</div>
                <div className="flex items-end gap-2 mt-2">
                    <div className="text-3xl font-bold text-green-400">+{activeYield}%</div>
                    <div className="text-sm text-green-500/60 mb-1">APY</div>
                </div>
            </Card>

            {/* Card 3: Liquidity Health */}
            <Card className="p-6 flex flex-col justify-between bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/10">
                <div className="text-sm text-blue-400/80 font-medium uppercase tracking-wider">Liquidity Health</div>
                <div className="flex items-center gap-4 mt-2">
                    <div className="text-3xl font-bold text-blue-400">{healthFactor}</div>

                    {/* Simple Speedometer Visual */}
                    <div className="h-2 flex-1 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${healthFactor > 2 ? 'bg-green-500' : healthFactor > 1.1 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min((healthFactor / 3) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
}
