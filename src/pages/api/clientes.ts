import type { APIRoute } from 'astro';
import { clientes } from '@lib/clientes';

export const GET: APIRoute = async () => {
  try {
    return new Response(JSON.stringify(clientes), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al obtener clientes' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
