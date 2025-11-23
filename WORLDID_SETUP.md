# WorldID Integration Setup Guide

This project has been integrated with WorldID for proof of personhood verification. Follow these steps to set it up:

## Prerequisites

1. **World Developer Account**: Sign up at [World Developer Portal](https://developer.worldcoin.org/)
2. **App Registration**: Register your application to get an App ID

## Environment Variables

### Frontend (.env.local or .env)

Add the following to your frontend environment file:

```env
NEXT_PUBLIC_WORLD_ID_APP_ID=app_staging_xxxxxxxxxxxxx
```

Replace `app_staging_xxxxxxxxxxxxx` with your actual App ID from the World Developer Portal.

### Backend (.env)

Add the following to your backend environment file:

```env
WORLD_ID_APP_ID=app_staging_xxxxxxxxxxxxx
```

**Note**: Use the same App ID for both frontend and backend.

## How It Works

### Frontend

1. **WorldIDVerification Component** (`frontend/src/components/WorldIDVerification.jsx`)
   - Uses the IDKit Widget from `@worldcoin/idkit`
   - Handles the verification flow
   - Sends proof to backend for verification

2. **Integration Points**:
   - Integrated into the Navbar dropdown menu
   - Shows verification status badge when verified
   - Provides "Verify with World ID" button when not verified

### Backend

1. **Verification Endpoint** (`backend/src/api/auth.routes.js`)
   - `POST /api/auth/worldid/verify` - Verifies WorldID proof and updates user status
   - `GET /api/auth/worldid/status/:address` - Checks verification status

2. **Database**:
   - User model already includes `isWorldIdVerified` field
   - Automatically updated when verification succeeds

## Usage

1. **User Flow**:
   - User logs in with Privy (email/wallet)
   - Opens the user dropdown in the navbar
   - Clicks "Verify with World ID"
   - Completes WorldID verification (Orb scan or device verification)
   - Status updates automatically

2. **Verification Levels**:
   - Currently set to `"orb"` for highest security (biometric verification)
   - Can be changed to `"device"` for device-level verification

## Testing

1. **Development/Staging**:
   - Use staging App ID (starts with `app_staging_`)
   - Test with Worldcoin Simulator

2. **Production**:
   - Register a production App ID
   - Update environment variables
   - Deploy with production credentials

## API Endpoints

### Verify WorldID
```bash
POST /api/auth/worldid/verify
Content-Type: application/json

{
  "walletAddress": "0x...",
  "proof": { ... }
}
```

### Check Status
```bash
GET /api/auth/worldid/status/:address
```

## Troubleshooting

1. **Verification Fails**:
   - Check that App ID is correct in both frontend and backend
   - Ensure action name matches (`flyliquid-verification`)
   - Verify signal (wallet address) is correct

2. **Widget Not Showing**:
   - Check browser console for errors
   - Verify `NEXT_PUBLIC_WORLD_ID_APP_ID` is set
   - Ensure user is authenticated

3. **Backend Verification Errors**:
   - Check `WORLD_ID_APP_ID` environment variable
   - Verify proof structure matches expected format
   - Check backend logs for detailed error messages

## Resources

- [World ID Documentation](https://docs.world.org/world-id)
- [IDKit Widget Guide](https://docs.world.org/world-id/id/web-vanilla)
- [World Developer Portal](https://developer.worldcoin.org/)

