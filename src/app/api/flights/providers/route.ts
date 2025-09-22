import { NextRequest, NextResponse } from 'next/server';
import { checkProviderHealth, getProviderStats } from '@/lib/flightProviders';

// Get provider health status and statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'health';

    switch (action) {
      case 'health':
        const healthStatus = await checkProviderHealth();
        
        return NextResponse.json({
          success: true,
          timestamp: new Date().toISOString(),
          providers: healthStatus,
          overall: Object.values(healthStatus).some(status => status) ? 'operational' : 'degraded'
        });

      case 'stats':
        const stats = getProviderStats();
        
        return NextResponse.json({
          success: true,
          timestamp: new Date().toISOString(),
          statistics: stats
        });

      case 'full':
        const [health, statistics] = await Promise.all([
          checkProviderHealth(),
          Promise.resolve(getProviderStats())
        ]);
        
        return NextResponse.json({
          success: true,
          timestamp: new Date().toISOString(),
          health,
          statistics,
          overall: Object.values(health).some(status => status) ? 'operational' : 'degraded'
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use ?action=health, ?action=stats, or ?action=full'
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Provider status API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to get provider status',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Enable CORS for health checks
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}