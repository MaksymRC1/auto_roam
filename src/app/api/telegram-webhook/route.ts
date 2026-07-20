import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const ownerChatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !ownerChatId) {
      console.warn('Telegram webhook received but token or owner chat ID is not configured');
      return NextResponse.json({ error: 'Config missing' }, { status: 500 });
    }

    const payload = await request.json();

    // Check if update has a message
    if (payload.message && payload.message.text) {
      const { from, text } = payload.message;
      const userId = from.id;
      const firstName = from.first_name || '';
      const lastName = from.last_name || '';
      const username = from.username ? `@${from.username}` : 'немає нікнейму';

      // Don't forward messages sent by the owner to prevent loops
      if (String(userId) === String(ownerChatId)) {
        return NextResponse.json({ ok: true });
      }

      // Format message for the owner
      const messageToOwner = `💬 *Нове повідомлення у боті!*\n\n` +
        `*Від:* ${firstName} ${lastName} (${username})\n` +
        `*ID користувача:* \`${userId}\`\n` +
        `*Профіль:* [Посилання на чат](tg://user?id=${userId})\n\n` +
        `*Текст:* ${text}`;

      // Send to owner
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ownerChatId,
          text: messageToOwner,
          parse_mode: 'Markdown',
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in Telegram webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
