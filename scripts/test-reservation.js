#!/usr/bin/env node
// Script de prueba para enviar una reserva al endpoint
const endpoint = process.env.ENDPOINT || process.argv[2] || 'http://localhost:3000/api/send-reservation';

const payload = {
  id: Date.now(),
  name: 'Prueba automática',
  phone: '3001234567',
  email: 'cliente@correo.com',
  date: new Date().toISOString().slice(0,10),
  time: '19:00',
  people: '2',
  notes: 'Prueba de integración (vercel dev)'
};

console.log('Enviando prueba a:', endpoint);
console.log('Payload:', payload);

(async () => {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    console.log('Status:', res.status);
    try { console.log('Respuesta JSON:', JSON.parse(text)); }
    catch (e) { console.log('Respuesta:', text); }
    process.exit(res.ok ? 0 : 1);
  } catch (err) {
    console.error('Error al llamar al endpoint:', err);
    process.exit(1);
  }
})();
