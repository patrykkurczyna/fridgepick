# Scripts Setup

This directory contains utility scripts for development. All credentials are now securely configured via environment variables.

## Setup

1. **Copy environment template**:
   ```bash
   # The actual credentials go in .env.local (not committed to git)
   # Add your real credentials there:
   ```

2. **Add your credentials to `.env.local`**:
   ```bash
   # Add these lines to .env.local
   SUPABASE_EMAIL=your-email@example.com
   SUPABASE_PASSWORD=your-password-here
   ```

## Available Scripts

- `get-jwt.sh` - Get JWT token for API testing
- `get-refresh-token.sh` - Get JWT token with refresh token
- `update-jwt-env.sh` - Update .env.local with fresh JWT token

## Usage

All scripts now read credentials from environment variables instead of having them hardcoded. This makes them safe to commit to version control.

```bash
# Get a JWT token
./scripts/get-jwt.sh

# Update your .env.local with a fresh token
./scripts/update-jwt-env.sh
```

## Security

- ✅ No hardcoded credentials in scripts
- ✅ Credentials stored in `.env.local` (gitignored)
- ✅ Scripts are safe to commit to version control
- ✅ Environment variables with validation