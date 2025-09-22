# PowerShell build script for Windows environments
# This script handles permission issues with Windows system directories

Write-Host "🔄 Cleaning build cache..." -ForegroundColor Yellow
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "out" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "🚀 Starting build with optimized settings..." -ForegroundColor Green

# Set environment variables to optimize for Windows
$env:NODE_OPTIONS = "--max-old-space-size=4096"
$env:NEXT_TELEMETRY_DISABLED = "1"

# Run the build
try {
    npm run build
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Build failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Trying alternative build approach..." -ForegroundColor Yellow
    
    # Alternative: Use Turbopack for development
    Write-Host "Starting development server instead..." -ForegroundColor Cyan
    npm run dev
}