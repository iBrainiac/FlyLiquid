import Card from '../ui/Card';
import Button from '../ui/Button';

export default function MarketCard({ listing }) {
    const { ticket, price, seller } = listing;

    // Parse values (assuming backend sends strings/BigInts)
    const listingPrice = parseFloat(price) / 1e6; // Assuming USDC 6 decimals
    const oraclePrice = parseFloat(ticket.currentPrice) / 1e6;

    // Arbitrage Calc
    const spread = oraclePrice - listingPrice;
    const discountPercent = spread > 0 ? Math.round((spread / oraclePrice) * 100) : 0;
    const isDeal = discountPercent > 0;

    return (
        <Card className="p-0 overflow-hidden group hover:-translate-y-1 transition-all duration-300 border-white/10 hover:border-blue-500/50">
            {/* Header */}
            <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-start">
                <div>
                    <div className="text-xl font-black text-white tracking-tight">
                        {ticket.route.split('-')[0]} ✈ {ticket.route.split('-')[1]}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-[10px]">🔺</div>
                        <span className="text-xs text-gray-400">Delta Airlines</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-500 font-mono mb-1">Dec 25th</div>
                    {isDeal && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/20 animate-pulse">
                            {discountPercent}% OFF
                        </span>
                    )}
                </div>
            </div>

            {/* The Arbitrage Box */}
            <div className="p-5 bg-gradient-to-b from-transparent to-black/20">
                <div className="flex justify-between items-end mb-2">
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Oracle Value</div>
                    <div className="text-sm text-gray-400 line-through decoration-red-500/50">
                        ${oraclePrice.toFixed(2)}
                    </div>
                </div>
                <div className="flex justify-between items-end mb-6">
                    <div className="text-xs text-green-500 uppercase tracking-wider font-bold">Listing Price</div>
                    <div className="text-2xl font-bold text-white">
                        ${listingPrice.toFixed(2)} <span className="text-sm text-gray-500 font-normal">USDC</span>
                    </div>
                </div>

                {/* Action */}
                <Button variant="primary" className="w-full shadow-lg shadow-blue-500/10 group-hover:shadow-blue-500/20">
                    BUY NOW ⚡
                </Button>

                <div className="mt-3 text-center text-[10px] text-gray-600 font-mono">
                    Seller: {seller.walletAddress.slice(0, 6)}...{seller.walletAddress.slice(-4)}
                </div>
            </div>
        </Card>
    );
}
