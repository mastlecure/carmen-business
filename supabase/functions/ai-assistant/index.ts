import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { question } = await req.json()
    if (!question?.trim()) {
      return new Response(JSON.stringify({ error: 'Pregunta vacía' }), { status: 400, headers: corsHeaders })
    }

    // Cliente con service role para leer todos los datos
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Fecha local Nicaragua (UTC-6)
    const nowNic = new Date(Date.now() - 6 * 60 * 60 * 1000)
    const today  = nowNic.toISOString().split('T')[0]
    const sevenDaysAgo = new Date(nowNic)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    const startDate = sevenDaysAgo.toISOString().split('T')[0]

    // Consultar datos en paralelo
    const [
      { data: cashToday },
      { data: cashWeek },
      { data: lowStock },
      { data: apptToday },
      { data: topItems },
      { data: clients },
    ] = await Promise.all([
      supabase.from('cash_register').select('business, total_sales').eq('register_date', today),
      supabase.from('cash_register').select('register_date, business, total_sales').gte('register_date', startDate).order('register_date'),
      supabase.from('products').select('name, stock, low_stock_alert, business').lte('stock', 3),
      supabase.from('appointments').select('client_name, service_name, service_price, appointment_time, status').eq('appointment_date', today).order('appointment_time'),
      supabase.from('sale_items').select('product_name, quantity, unit_price').limit(200),
      supabase.from('clients').select('name', { count: 'exact', head: true }),
    ])

    // Totales hoy
    const ventasHoy = (cashToday ?? []).reduce((s, r) => s + (r.total_sales ?? 0), 0)
    const ventasVariedades = (cashToday ?? []).find(r => r.business === 'variedades')?.total_sales ?? 0
    const ventasSalon = (cashToday ?? []).find(r => r.business === 'salon')?.total_sales ?? 0

    // Totales semana
    const semanaVariedades = (cashWeek ?? []).filter(r => r.business === 'variedades').reduce((s, r) => s + r.total_sales, 0)
    const semanaSalon = (cashWeek ?? []).filter(r => r.business === 'salon').reduce((s, r) => s + r.total_sales, 0)

    // Top productos
    const productMap: Record<string, number> = {}
    ;(topItems ?? []).forEach(i => {
      productMap[i.product_name] = (productMap[i.product_name] ?? 0) + i.quantity * i.unit_price
    })
    const topProductos = Object.entries(productMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, rev]) => `${name} (C$${rev.toFixed(0)})`)

    // Citas hoy
    const citasHoy = (apptToday ?? [])
    const citasDone = citasHoy.filter(c => c.status === 'done').length
    const citasPending = citasHoy.filter(c => c.status === 'pending' || c.status === 'confirmed').length
    const ingresosCitasHoy = citasHoy.filter(c => c.status === 'done').reduce((s, c) => s + c.service_price, 0)

    // Productos con poco stock
    const stockBajo = (lowStock ?? []).map(p => `${p.name} (${p.stock} unidades)`).slice(0, 8)

    const contexto = `
FECHA HOY: ${today} (hora Nicaragua, UTC-6)

=== VENTAS HOY ===
- Total general: C$${ventasHoy.toFixed(2)}
- Variedades: C$${ventasVariedades.toFixed(2)}
- Salón (citas completadas): C$${ingresosCitasHoy.toFixed(2)}

=== ESTA SEMANA (últimos 7 días) ===
- Variedades: C$${semanaVariedades.toFixed(2)}
- Salón: C$${semanaSalon.toFixed(2)}
- Total semana: C$${(semanaVariedades + semanaSalon).toFixed(2)}

=== CITAS HOY ===
- Pendientes/confirmadas: ${citasPending}
- Completadas: ${citasDone}
${citasHoy.length === 0 ? '- No hay citas hoy' : citasHoy.map(c => `- ${c.appointment_time?.slice(0,5)} | ${c.client_name} → ${c.service_name} (${c.status})`).join('\n')}

=== STOCK BAJO (≤3 unidades) ===
${stockBajo.length === 0 ? '- Todo el inventario tiene stock suficiente' : stockBajo.map(p => `- ${p}`).join('\n')}

=== PRODUCTOS MÁS VENDIDOS (histórico) ===
${topProductos.length === 0 ? '- Sin ventas registradas aún' : topProductos.map((p, i) => `${i + 1}. ${p}`).join('\n')}

=== CLIENTES REGISTRADOS EN SALÓN ===
- Total: ${clients ?? 0} clientes
`.trim()

    // Llamar a OpenAI
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 250,
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content: `Eres la asistente personal de Carmen, dueña de dos negocios en Nicaragua: "Variedades" (ropa, zapatos, accesorios) y "Salón de Belleza Carmen".
Responde SIEMPRE en español latinoamericano, de forma cálida, breve y directa. Eres como una empleada de confianza que le explica los números del negocio.
Usa los datos reales que te proporciono. Si el dato no está disponible, dilo con amabilidad.
Nunca inventes cifras. Respuestas máximo 3-4 oraciones.`,
          },
          {
            role: 'user',
            content: `${contexto}\n\nPregunta de Carmen: ${question}`,
          },
        ],
      }),
    })

    if (!openaiRes.ok) {
      const err = await openaiRes.text()
      throw new Error(`OpenAI error: ${err}`)
    }

    const openaiData = await openaiRes.json()
    const answer = openaiData.choices?.[0]?.message?.content ?? 'No pude obtener una respuesta.'

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error(err)
    return new Response(
      JSON.stringify({ error: 'Hubo un error. Intenta de nuevo.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
