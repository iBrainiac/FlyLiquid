export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black/50 backdrop-blur-xl py-12 px-4">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex flex-col items-center md:items-start">
                    <div className="text-xl font-bold tracking-tighter text-blue-500 mb-2">
                        FlightStakeFi ✈️
                    </div>
                    <p className="text-sm text-gray-500">
                        The world's first DeFi protocol for air travel.
                    </p>
                </div>

                <div className="flex gap-8 text-sm text-gray-400">
                    <a href="#" className="hover:text-white transition-colors">Documentation</a>
                    <a href="#" className="hover:text-white transition-colors">Twitter</a>
                    <a href="#" className="hover:text-white transition-colors">Discord</a>
                </div>

                <div className="text-xs text-gray-600">
                    © 2025 FlightStakeFi. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
