export default function Stats() {
    const stats = [
        { label: 'Total Value Locked', value: '$2.4M', change: '+12%' },
        { label: 'Average APY', value: '14.2%', change: 'Stable' },
        { label: 'Tickets Traded', value: '8,942', change: '+54%' },
    ];

    return (
        <section className="relative z-20 -mt-20 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-black/40 p-8 flex flex-col items-center justify-center hover:bg-black/30 transition-colors"
                        >
                            <div className="text-sm text-gray-400 mb-2 font-medium uppercase tracking-wider">
                                {stat.label}
                            </div>
                            <div className="text-4xl font-bold text-white mb-1">
                                {stat.value}
                            </div>
                            <div className="text-xs font-mono text-green-400">
                                {stat.change}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
