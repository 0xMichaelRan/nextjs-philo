# Remote Access Configuration

This guide explains how to access the frontend from remote machines (other devices on your network).

## Quick Setup

### 1. Update Package.json (Already Done)
The `dev` script has been updated to bind to all interfaces:
```json
"dev": "next dev --turbopack -H 0.0.0.0"
```

### 2. Configure API URL for Remote Access

#### Option A: Update .env.local
1. Find your machine's IP address:
   - **macOS/Linux**: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - **Windows**: `ipconfig | findstr "IPv4"`

2. Update `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://YOUR_MACHINE_IP:8000
   ```
   Replace `YOUR_MACHINE_IP` with your actual IP address (e.g., `192.168.1.100`)

#### Option B: Use Environment File Template
1. Copy `.env.remote.example` to `.env.local`
2. Update the IP address in the copied file

### 3. Ensure Backend Accessibility
Make sure your FastAPI backend is also accessible from remote machines:
1. Check if the backend is running with `--host 0.0.0.0`
2. Verify firewall allows connections on port 8000

### 4. Start Development Server
```bash
npm run dev
```

### 5. Access from Remote Device
- Frontend: `http://YOUR_MACHINE_IP:3000`
- Backend API: `http://YOUR_MACHINE_IP:8000`

## Troubleshooting

### Common Issues:

1. **Connection Refused**
   - Check firewall settings
   - Ensure ports 3000 and 8000 are open
   - Verify the IP address is correct

2. **API Calls Failing**
   - Make sure `NEXT_PUBLIC_API_URL` points to your machine's IP, not localhost
   - Verify backend is accessible from remote machines

3. **CORS Issues**
   - Backend might need CORS configuration for remote origins
   - Check FastAPI CORS middleware settings

### Network Requirements:
- All devices must be on the same network
- Firewall must allow incoming connections on ports 3000 and 8000
- Router must not block inter-device communication

## Security Note
This configuration is for development only. For production, use proper domain names and SSL certificates.
