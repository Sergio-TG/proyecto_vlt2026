import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { record, type } = body; 

    if (!record) {
      return NextResponse.json({ error: 'No record found' }, { status: 400 });
    }

    const isNewsletter = type === 'NEWSLETTER';
    const isUpdate = type === 'UPDATE';
    const adminEmail = process.env.ADMIN_EMAIL; 
    if (!adminEmail) {
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;

    // 1. Enviar Email vía Resend
    const emailRes = await resend.emails.send({
      from: 'Viví las Termas <onboarding@resend.dev>',
      to: adminEmail,
      subject: isNewsletter
        ? `📬 Nuevo suscriptor al Newsletter: ${record.email}`
        : `🔔 ${isUpdate ? 'Actualización' : 'Nuevo Registro'} Socio: ${record.nombre_complejo}`,
      html: isNewsletter
        ? `
          <h1>Nuevo suscriptor al Newsletter</h1>
          <p><strong>Email:</strong> ${record.email}</p>
          <p><strong>Source:</strong> ${record.source || 'N/A'}</p>
          <p><strong>Fecha:</strong> ${record.created_at || ''}</p>
        `
        : `
          <h1>${isUpdate ? 'Alojamiento actualizado' : 'Nuevo registro de alojamiento'}</h1>
          <p><strong>Estado:</strong> ${isUpdate ? 'ACTUALIZACIÓN' : 'NUEVO'}</p>
          <p><strong>Complejo:</strong> ${record.nombre_complejo}</p>
          <p><strong>Propietario:</strong> ${record.propietario}</p>
          <p><strong>WhatsApp:</strong> ${record.whatsapp}</p>
          <p><strong>Localidad:</strong> ${record.localidad}</p>
          <p><strong>Link Drive:</strong> <a href="${record.link_drive}">${record.link_drive}</a></p>
          <br>
          <p>Revisa todos los detalles en tu panel de Supabase para aprobar el contenido.</p>
        `,
    });

    // 2. Enviar Notificación a Telegram
    if (telegramBotToken && telegramChatId && !isNewsletter) {
      const message = `🔔 *${isUpdate ? 'ALERTA: ACTUALIZACIÓN' : 'NUEVO SOCIO REGISTRADO'}*\n\n` +
                      `🏠 *Complejo:* ${record.nombre_complejo}\n` +
                      `👤 *Dueño:* ${record.propietario}\n` +
                      `📱 *WhatsApp:* ${record.whatsapp}\n` +
                      `📍 *Localidad:* ${record.localidad}\n\n` +
                      `🔗 *Drive:* ${record.link_drive}`;
      
      await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
    }

    return NextResponse.json({ success: true, emailId: emailRes.data?.id });
  } catch (error: unknown) {
    console.error('Error in notification route:', error);
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
