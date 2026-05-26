module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    name = 'Sin nombre', phone = '', email = '', date = '', time = '', people = '', notes = '', id
  } = req.body || {};

  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const TO_EMAIL = process.env.RESERVATION_TO_EMAIL;
  const FROM_EMAIL = process.env.SEND_FROM_EMAIL || `no-reply@${(process.env.VERCEL_URL || 'example.com').replace(/^https?:\/\//, '')}`;

  if (!SENDGRID_API_KEY || !TO_EMAIL) {
    return res.status(500).json({ error: 'Email service not configured. Set SENDGRID_API_KEY and RESERVATION_TO_EMAIL in environment.' });
  }

  const subject = `Nueva reserva - ${name}`;
  const body = `Nueva solicitud de reserva\n\nNombre: ${name}\nTeléfono: ${phone}\nEmail: ${email}\nFecha: ${date}\nHora: ${time}\nPersonas: ${people}\nNotas: ${notes}\nID: ${id || Date.now()}`;

  const payload = {
    personalizations: [{ to: [{ email: TO_EMAIL }] }],
    from: { email: FROM_EMAIL, name: 'Gourmet Express' },
    subject: subject,
    content: [{ type: 'text/plain', value: body }]
  };

  try {
    const r = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const text = await r.text();
      console.error('SendGrid error', r.status, text);
      return res.status(502).json({ error: 'Failed to send email', details: text });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
