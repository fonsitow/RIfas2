// /api/generar-link-pago.js

import { NextResponse } from 'next/server';

export async function POST(req) {
  const { cantidad } = await req.json();
  const montoBs = cantidad * 500000; // Ejemplo: Bs. 500.000 por boleto

  // Llamada a la API del Banco de Venezuela para generar el link de pago
  const response = await fetch('https://api.bancodevenezuela.com/v1/pagos', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer TU_TOKEN',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      monto: montoBs,
      concepto: 'Compra de boletos de rifa',
      email: 'usuario@ejemplo.com'
    })
  });

  const data = await response.json();

  if (data.success) {
    return NextResponse.json({ link: data.link_pago });
  } else {
    return NextResponse.json({ error: 'Error al generar el link de pago' }, { status: 500 });
  }
}
