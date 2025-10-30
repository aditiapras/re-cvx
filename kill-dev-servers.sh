#!/bin/bash

echo "🔍 Checking for processes to kill..."

# Kill processes on port 3000
echo "📍 Killing processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Killed processes on port 3000"
else
    echo "ℹ️  No processes found on port 3000"
fi

# Kill Next.js processes
echo "⚡ Killing Next.js processes..."
pkill -f "next" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Killed Next.js processes"
else
    echo "ℹ️  No Next.js processes found"
fi

# Kill Convex processes
echo "🔄 Killing Convex processes..."
pkill -f "convex" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Killed Convex processes"
else
    echo "ℹ️  No Convex processes found"
fi

# Kill any node processes that might be development servers
echo "🟢 Killing Node.js development server processes..."
pkill -f "node.*dev" 2>/dev/null
pkill -f "npm.*dev" 2>/dev/null
pkill -f "yarn.*dev" 2>/dev/null
pkill -f "pnpm.*dev" 2>/dev/null

echo "🎉 Done! All development servers should be stopped."
echo "💡 You can now restart your development servers with:"
echo "   npm run dev (for Next.js)"
echo "   npx convex dev (for Convex)"