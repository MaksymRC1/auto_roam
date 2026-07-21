import { NextResponse } from 'next/server';

/** Escape special characters for Telegram MarkdownV1 */
function escapeTelegramMarkdown(text: string): string {
  return text.replace(/[_*`\[]/g, '\\$&');
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, message, type, rating, articleId } = data;
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      let text = '';
      if (type === 'rating') {
        text = `⭐ *Новий відгук про статтю!*\n\n*ID статті:* \`${escapeTelegramMarkdown(String(articleId))}\`\n*Оцінка:* *${escapeTelegramMarkdown(String(rating))}*`;
      } else {
        text = `📩 *Нове запитання з сайту AutoRoam!*\n\n*Ім'я:* ${escapeTelegramMarkdown(String(name || ''))}\n*Email:* ${escapeTelegramMarkdown(String(email || ''))}\n*Повідомлення:* ${escapeTelegramMarkdown(String(message || ''))}`;
      }

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'Markdown',
        }),
      });
    } else {
      console.log('Received support request (Telegram config missing):', data);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in support API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
