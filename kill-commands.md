# Kill Development Servers Commands

## Kill processes on port 3000
```bash
lsof -ti:3000 | xargs kill -9
```

## Kill Next.js processes
```bash
pkill -f "next"
```

## Kill Convex processes
```bash
pkill -f "convex"
```

## Kill all Node.js development processes
```bash
pkill -f "node.*dev"
pkill -f "npm.*dev" 
pkill -f "yarn.*dev"
pkill -f "pnpm.*dev"
```

## Alternative: Kill all Node.js processes (use with caution)
```bash
pkill node
```

## Check what's running on port 3000
```bash
lsof -i:3000
```

## Check all Node.js processes
```bash
ps aux | grep node
```

## Restart development servers
```bash
# Start Next.js
npm run dev

# Start Convex (in another terminal)
npx convex dev
```