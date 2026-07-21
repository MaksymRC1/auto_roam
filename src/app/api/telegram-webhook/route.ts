import { NextResponse } from 'next/server';

/** Escape special characters for Telegram MarkdownV1 */
function escapeTelegramMarkdown(text: string): string {
  return text.replace(/[_*`\[]/g, '\\$&');
}

export async function POST(request: Request) {
  try {
    // Verify webhook secret to prevent unauthorized access
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (webhookSecret) {
      const secretHeader = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
      if (secretHeader !== webhookSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

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
      const firstName = escapeTelegramMarkdown(from.first_name || '');
      const lastName = escapeTelegramMarkdown(from.last_name || '');
      const username = from.username ? `@${escapeTelegramMarkdown(from.username)}` : 'немає нікнейму';

      // Don't forward messages sent by the owner to prevent loops
      if (String(userId) === String(ownerChatId)) {
        return NextResponse.json({ ok: true });
      }

      // Format message for the owner
      const messageToOwner = `💬 *Нове повідомлення у боті!*\n\n` +
        `*Від:* ${firstName} ${lastName} (${username})\n` +
        `*ID користувача:* \`${userId}\`\n` +
        `*Профіль:* [Посилання на чат](tg://user?id=${userId})\n\n` +
        `*Текст:* ${escapeTelegramMarkdown(text)}`;

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
