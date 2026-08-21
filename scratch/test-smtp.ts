import { createTransport } from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testReport() {
  const transporter = createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  const successfulEmails = 5;
  const UKR_REPORT_EMAIL = 'maksymotroshko@ukr.net';

  const reportHTML = `
    <h2>Звіт про розсилку</h2>
    <p>Привіт!</p>
    <p>Ваш ШІ-Агент успішно пропрацював нічну зміну.</p>
    <ul>
      <li>Відправлено листів: <strong>${successfulEmails}</strong></li>
      <li>Помилок: <strong>0</strong></li>
    </ul>
    <p>Перевірте файл <code>pr-contacted-history.json</code> у репозиторії, щоб побачити нові контакти.</p>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_SENDER_NAME}" <${process.env.SMTP_USER}>`,
      to: UKR_REPORT_EMAIL,
      subject: `🤖 Звіт про розсилку прес-релізу: Відправлено ${successfulEmails} листів`,
      html: reportHTML,
    });
    console.log('✅ Report sent! Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ Failed:', err);
  }
}

testReport();
