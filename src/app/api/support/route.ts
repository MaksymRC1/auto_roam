import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, message, type, rating, articleId } = data;
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      let text = '';
      if (type === 'rating') {
        text = `⭐ *Новий відгук про статтю!*\n\n*ID статті:* \`${articleId}\`\n*Оцінка:* *${rating}*`;
      } else {
        text = `📩 *Нове запитання з сайту AutoRoam!*\n\n*Ім'я:* ${name}\n*Email:* ${email}\n*Повідомлення:* ${message}`;
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
