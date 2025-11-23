# FlightStakeFi ✈️

**The world's first DeFi protocol for air travel.** Transform your flight tickets into liquid assets,stake for yield, borrow against them, or trade instantly on our marketplace.

---

## 🎯 What It Does

FlightStakeFi tokenizes flight tickets as NFTs, unlocking three powerful DeFi primitives:

- **📈 Stake** - Earn yield by staking your flight tickets
- **💰 Borrow** - Get instant USDC loans using tickets as collateral
- **🛒 Trade** - Buy and sell tickets on a decentralized marketplace

Don't let your flight ticket be dead money. Make it work for you.

---

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 16** - React framework with App Router
- **Tailwind CSS** - Modern UI styling
- **Privy** - Web3 authentication & embedded wallets
- **Wagmi + Viem** - Ethereum interaction layer
- **WorldID** - Proof of personhood verification

### **Backend**
- **Node.js + Express** - RESTful API server
- **Prisma + PostgreSQL** - Database & ORM
- **Ethers.js** - Blockchain interaction
- **Event Indexer** - Real-time on-chain event monitoring

### **Smart Contracts**
- **Hardhat 3** - Development framework
- **Solidity 0.8.28** - Smart contract language
- **Chainlink Functions** - Decentralized price oracle
- **OpenZeppelin** - Security-tested contract libraries

---

## 🔧 Key Integrations

### **1. WorldID** 🌍
**Implementation:** Proof of personhood verification for Sybil resistance

- **Frontend:** IDKit Widget integrated in Navbar dropdown
- **Backend:** Cloud proof verification endpoint (`/api/auth/worldid/verify`)
- **Database:** `isWorldIdVerified` flag on User model
- **Flow:** Users verify once, status persists across sessions

**Files:**
- `frontend/src/components/WorldIDVerification.jsx`
- `backend/src/api/auth.routes.js`

---

### **2. Chainlink Functions** 🔗
**Implementation:** Decentralized price oracle for real-time flight ticket valuation

- **Contract:** `PricingOracle.sol` extends Chainlink FunctionsClient
- **Flow:** 
  1. Contract requests price update via Chainlink Functions
  2. JavaScript source code fetches flight data from APIs
  3. Price calculated with risk factors (departure time, route, etc.)
  4. Callback updates on-chain price mapping
- **Features:** Automatic price updates, error handling, request tracking

**Files:**
- `contracts/contracts/PricingOracle.sol`
- `mock-api/pricingEngine.js` (mock pricing logic)

---

### **3. Privy** 🔐
**Implementation:** Seamless Web3 authentication with embedded wallets

- **Provider:** Wraps app in `PrivyProvider` with email/Google login
- **Features:**
  - Auto-creates embedded wallets for non-crypto users
  - Email/Google OAuth (no wallet required)
  - Integrated with Wagmi for transaction signing
  - Dark mode UI with custom branding
- **Chain:** Sepolia testnet

**Files:**
- `frontend/src/app/providers.jsx`
- `frontend/src/components/Navbar.jsx`

---

### **4. Hardhat 3** ⚙️
**Implementation:** Modern smart contract development & deployment

- **Config:** TypeScript-based configuration
- **Contracts:** 
  - `TicketNFT.sol` - ERC721 tokenization
  - `LendingPool.sol` - Collateralized lending
  - `StakingVault.sol` - Yield staking
  - `Marketplace.sol` - P2P trading
  - `PricingOracle.sol` - Chainlink integration
  - `LiquidationEngine.sol` - Automated liquidations
- **Scripts:** Deployment, configuration, and testing utilities

**Files:**
- `contracts/hardhat.config.ts`
- `contracts/scripts/deployAll.js`

---

## 🗺️ User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLYLIQUID USER JOURNEY                        │
└─────────────────────────────────────────────────────────────────┘

1. LANDING PAGE
   └─> User discovers FlightStakeFi
       └─> Clicks "Launch App"

2. AUTHENTICATION (Privy)
   └─> User logs in with Email/Google
       └─> Privy auto-creates embedded wallet
           └─> User redirected to Dashboard

3. WORLDID VERIFICATION (Optional)
   └─> User opens Navbar dropdown
       └─> Clicks "Verify with World ID"
           └─> Completes Orb scan/device verification
               └─> Status updated: ✅ World ID Verified

4. TICKET MINTING
   └─> User provides PNR (Booking Reference)
       └─> Backend verifies PNR
           └─> Smart contract mints TicketNFT
               └─> Ticket appears in Dashboard

5. PRICING (Chainlink)
   └─> System requests price from Chainlink Functions
       └─> Oracle fetches flight data & calculates price
           └─> Price updated on-chain
               └─> Dashboard displays current value

6. USER ACTIONS (Choose One):

   A. STAKE TICKET
      └─> User selects ticket → "Stake"
          └─> Ticket transferred to StakingVault
              └─> User earns yield over time
                  └─> Can unstake anytime

   B. BORROW AGAINST TICKET
      └─> User selects ticket → "Borrow"
          └─> Ticket used as collateral
              └─> User receives USDC loan (up to LTV)
                  └─> Health factor monitored
                      └─> Can repay or get liquidated

   C. LIST ON MARKETPLACE
      └─> User selects ticket → "Sell"
          └─> Sets asking price in USDC
              └─> Ticket listed on Marketplace
                  └─> Other users can buy instantly

7. ONGOING MONITORING
   └─> Backend indexer listens to on-chain events
       └─> Database syncs in real-time
           └─> Dashboard updates automatically
               └─> Price history tracked

┌─────────────────────────────────────────────────────────────────┐
│  STATE MACHINE: IDLE → STAKED | COLLATERALIZED | LISTED         │
│  (Each ticket can only be in ONE state at a time)                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
FlyLiquid/
├── frontend/          # Next.js app (UI + Web3 integration)
│   ├── src/
│   │   ├── app/      # Pages & layouts
│   │   ├── components/  # React components
│   │   └── lib/      # API client, wagmi config
│   └── package.json
│
├── backend/          # Express API + Event Indexer
│   ├── src/
│   │   ├── api/      # REST endpoints
│   │   ├── indexer/  # On-chain event listener
│   │   └── db/       # Prisma client
│   ├── prisma/       # Database schema & migrations
│   └── package.json
│
├── contracts/        # Hardhat 3 project
│   ├── contracts/    # Solidity smart contracts
│   ├── scripts/      # Deployment scripts
│   └── hardhat.config.ts
│
└── mock-api/         # Mock pricing engine (for testing)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- MetaMask or Privy embedded wallet
- WorldID App ID (for verification)
- Chainlink Functions subscription

### Setup

1. **Install dependencies**
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   cd ../contracts && npm install
   ```

2. **Configure environment variables**
   - `frontend/.env.local`: `NEXT_PUBLIC_PRIVY_APP_ID`, `NEXT_PUBLIC_WORLD_ID_APP_ID`
   - `backend/.env`: `DATABASE_URL`, `WORLD_ID_APP_ID`, `SEPOLIA_RPC_URL`

3. **Deploy contracts**
   ```bash
   cd contracts
   npx hardhat run scripts/deployAll.js --network sepolia
   ```

4. **Start services**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

---

## 🎯 Key Features

- ✅ **NFT Tokenization** - Flight tickets as ERC721 tokens
- ✅ **Dynamic Pricing** - Chainlink Functions for real-time valuation
- ✅ **Yield Staking** - Earn rewards by staking tickets
- ✅ **Collateralized Lending** - Borrow USDC against ticket value
- ✅ **P2P Marketplace** - Instant ticket trading
- ✅ **Automated Liquidations** - Risk management for loans
- ✅ **WorldID Integration** - Sybil-resistant verification
- ✅ **Privy Auth** - Email/Google login with embedded wallets
- ✅ **Real-time Indexing** - On-chain event monitoring
- ✅ **State Management** - Tickets can only be in one state (mutually exclusive)

---

## 📊 Architecture Highlights

- **Modular Smart Contracts** - Separate contracts for each DeFi primitive
- **Event-Driven Backend** - WebSocket listener syncs on-chain events to database
- **Type-Safe Database** - Prisma schema enforces data integrity
- **Responsive UI** - Modern dark theme with Tailwind CSS
- **Security First** - OpenZeppelin contracts, reentrancy guards, access controls

---

## 🔐 Security

- Smart contracts use OpenZeppelin's battle-tested libraries
- ReentrancyGuard on all state-changing functions
- Role-based access control (admin, protocol contracts only)
- WorldID prevents Sybil attacks
- Chainlink Functions for tamper-proof pricing

---

## 📝 License

MIT

---

**Built with ❤️ for the future of travel finance**

