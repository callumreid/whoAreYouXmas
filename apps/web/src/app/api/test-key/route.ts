import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  
  const debug = {
    keyExists: !!apiKey,
    keyLength: apiKey?.length || 0,
    keyStartsWithSk: apiKey?.startsWith('sk-') || false,
    keyFirst12: apiKey?.substring(0, 12) || 'N/A',
    keyLast8: apiKey?.substring(Math.max(0, (apiKey?.length || 0) - 8)) || 'N/A',
    hasWhitespace: apiKey !== apiKey?.trim(),
    hasNewlines: apiKey?.includes('\n') || apiKey?.includes('\r') || false,
    hasQuotes: apiKey?.includes('"') || apiKey?.includes("'") || false,
    formatValid: apiKey ? (apiKey.startsWith('sk-') && apiKey.length > 40 && apiKey.length < 200) : false,
  };

  // Try a simple API call to test the key
  let apiTest: { success: boolean; error?: string; status?: number; rawKeyPreview?: string } = { success: false };
  
  if (apiKey) {
    // Show a safe preview of the key to help debug
    const keyPreview = `${apiKey.substring(0, 20)}...${apiKey.substring(Math.max(0, apiKey.length - 20))}`;
    apiTest.rawKeyPreview = keyPreview;
    
    try {
      // Test with a simple chat completion call (what we actually use)
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Say "test"' }],
          max_tokens: 5,
        }),
      });
      
      const responseText = await response.text();
      apiTest = {
        success: response.ok,
        status: response.status,
        error: response.ok ? undefined : responseText,
        rawKeyPreview: keyPreview,
      };
    } catch (error) {
      apiTest = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        rawKeyPreview: keyPreview,
      };
    }
  }

  return NextResponse.json({
    debug,
    apiTest,
    message: apiTest.success 
      ? 'API key is valid and working!' 
      : apiTest.error 
        ? `API key test failed: ${apiTest.error}` 
        : 'API key not found or invalid format',
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}

