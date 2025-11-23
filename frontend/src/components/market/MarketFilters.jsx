import Button from '../ui/Button';

export default function MarketFilters({ filters, setFilters }) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 mb-8 backdrop-blur-sm">
            <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                {/* Destination Filter */}
                <div className="relative">
                    <select
                        className="bg-black/50 border border-white/20 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 appearance-none pr-8"
                        value={filters.destination}
                        onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                    >
                        <option value="ALL">All Destinations</option>
                        <option value="LHR">London (LHR)</option>
                        <option value="JFK">New York (JFK)</option>
                        <option value="CDG">Paris (CDG)</option>
                        <option value="DXB">Dubai (DXB)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                        ▼
                    </div>
                </div>

                {/* Max Price Slider (Mock UI) */}
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">Max Price:</span>
                    <input
                        type="range"
                        min="0"
                        max="1000"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                        className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-sm font-mono text-white">${filters.maxPrice}</span>
                </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-4">
                <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" />
                    <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ms-3 text-sm font-medium text-gray-300">Low Risk Only</span>
                </label>
            </div>
        </div>
    );
}
