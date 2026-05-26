import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, customer_id, customer_email, customer_phone, order_id, return_url } = await req.json()

    // Get Cashfree credentials from Edge Function secrets
    const appId = Deno.env.get('CASHFREE_APP_ID')
    const secretKey = Deno.env.get('CASHFREE_SECRET_KEY')
    const environment = Deno.env.get('CASHFREE_ENVIRONMENT') || 'SANDBOX' // or 'PRODUCTION'

    if (!appId || !secretKey) {
      throw new Error("Missing Cashfree credentials")
    }

    const baseUrl = environment === 'PRODUCTION' 
      ? 'https://api.cashfree.com/pg/orders'
      : 'https://sandbox.cashfree.com/pg/orders'

    const payload = {
      order_id: order_id || `ORDER_${crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: customer_id || "GUEST",
        customer_email: customer_email || "guest@example.com",
        customer_phone: customer_phone || "9999999999"
      },
      order_meta: {
        return_url: return_url || "https://utkarshlanjewar.com/profile?order_id={order_id}"
      }
    }

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Cashfree API Error:", data)
      throw new Error(data.message || "Failed to create Cashfree order")
    }

    return new Response(
      JSON.stringify({ 
        payment_session_id: data.payment_session_id,
        order_id: data.order_id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
