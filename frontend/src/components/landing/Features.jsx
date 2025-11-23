import Card from '../ui/Card';

export default function Features() {
    const features = [
        {
            title: 'Instant Liquidity',
            description: 'Sell your non-refundable ticket instantly on our secondary marketplace. No more wasted money.',
            icon: '💸',
            gradient: 'from-green-400/20 to-emerald-400/20',
        },
        {
            title: 'Borrow Against It',
            description: 'Need cash but want to keep your flight? Collateralize your ticket and borrow USDC instantly.',
            icon: '🏦',
            gradient: 'from-blue-400/20 to-indigo-400/20',
        },
        {
            title: 'Earn Yield',
            description: 'Stake your ticket in the vault while you wait for your flight. Earn rewards from platform fees.',
            icon: '📈',
            gradient: 'from-purple-400/20 to-pink-400/20',
        },
    ];

    return (
        <section id="features" className="py-32 px-4 relative">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        The Financial Layer for <br />
                        <span className="text-blue-500">Air Travel</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        We turn static flight tickets into dynamic financial assets.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="p-8 group hover:-translate-y-2 transition-transform duration-300"
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
