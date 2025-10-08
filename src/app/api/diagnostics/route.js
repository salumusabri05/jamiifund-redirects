import { NextResponse } from 'next/server';

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasClickPesaClientId: !!process.env.CLICKPESA_CLIENT_ID,
      hasClickPesaApiKey: !!process.env.CLICKPESA_API_KEY,
    },
    status: 'healthy'
  };

  // Check if all required variables are present
  const missingVars = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!process.env.CLICKPESA_CLIENT_ID) missingVars.push('CLICKPESA_CLIENT_ID');
  if (!process.env.CLICKPESA_API_KEY) missingVars.push('CLICKPESA_API_KEY');

  if (missingVars.length > 0) {
    diagnostics.status = 'missing_config';
    diagnostics.missingVariables = missingVars;
  }

  return NextResponse.json(diagnostics);
}
