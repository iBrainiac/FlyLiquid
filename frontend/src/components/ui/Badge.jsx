export default function Badge({ status }) {
    const styles = {
        IDLE: 'bg-green-500/10 text-green-400 border-green-500/20',
        STAKED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        LISTED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        COLLATERALIZED: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        SOLD: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };

    const defaultStyle = 'bg-gray-500/10 text-gray-400 border-gray-500/20';

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || defaultStyle
                }`}
        >
            {status}
        </span>
    );
}
