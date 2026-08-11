import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

type TemplateType = 'english';

interface PressContact {
  name: string;
  email: string;
  outlet: string;
  templateType?: TemplateType;
  note?: string;
  active: boolean;
}

const CONFIG = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.ukr.net',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE === 'true' || true,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },
  senderName: process.env.SMTP_SENDER_NAME || 'Maksym Otroshko',
  senderEmail: process.env.SMTP_USER || 'maksymotroshko@ukr.net',
  contactsPath: process.env.TEST_CONTACTS_PATH || path.join(process.cwd(), 'src/data/press-contacts-en.json'),
  attachmentPath: path.join(process.cwd(), 'public/press-release-en.pdf'), // optional
  delayBetweenEmailsMs: 4000,
};

const getEnglishTemplate = (contact: PressContact) => {
  const subject = `New Tool: AutoRoam – Eliminating the headache of European toll roads & vignettes`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; color: #1a1a1a; line-height: 1.6;">
      <p>Hi <strong>${contact.name}</strong>,</p>
      
      <p>I’m Maksym, a solo developer from Ukraine. I recently launched <strong>AutoRoam</strong> (<a href="https://autoroam.com.ua">autoroam.com.ua</a>) — a free, smart road trip planner specifically built for navigating Europe’s fragmented toll and vignette systems.</p>
      
      <p><strong>The problem:</strong> Driving across multiple European countries usually means checking 5 different websites for fuel prices and figuring out where and how to buy e-vignettes to avoid hefty fines.</p>
      
      <p><strong>The solution:</strong> AutoRoam does it all instantly. You simply enter your route, and it calculates the exact driving distance, estimated fuel costs based on current local prices, and provides direct links to official vignette providers for all transit countries.</p>

      <p>We just launched on Product Hunt and saw a great response. Please note that while the current interface and screenshots are in Ukrainian, the visual calculator is highly intuitive for anyone to use, and a full English localization is on our roadmap.</p>

      <p>I thought your readers who are interested in travel-tech and European startups might find this tool useful for their next road trip. I’ve included a short press kit below if you’d like to cover our launch.</p>

      <p><strong>🔗 Press Kit & Materials:</strong></p>
      <ul>
        <li>Live App: <a href="https://autoroam.com.ua">autoroam.com.ua</a></li>
        <li>Press Kit (Screenshots & Logo): <a href="https://drive.google.com/drive/folders/1onuQQhDvfrJCHMBhIM3FJd2JKS70wLnI">Google Drive</a></li>
      </ul>
      
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />
      <p style="font-size: 14px; color: #666;">Best regards,<br/><strong>Maksym Otroshko</strong><br/>Founder of AutoRoam | <a href="https://www.linkedin.com/in/maxotroshko">LinkedIn</a></p>
    </div>
  `;

  const text = `Hi ${contact.name},

I’m Maksym, a solo developer from Ukraine. I recently launched AutoRoam (https://autoroam.com.ua) — a free, smart road trip planner specifically built for navigating Europe’s fragmented toll and vignette systems.

The problem: Driving across multiple European countries usually means checking 5 different websites for fuel prices and figuring out where and how to buy e-vignettes to avoid hefty fines.

The solution: AutoRoam does it all instantly. You simply enter your route, and it calculates the exact driving distance, estimated fuel costs based on current local prices, and provides direct links to official vignette providers for all transit countries.

We just launched on Product Hunt and saw a great response. Please note that while the current interface and screenshots are in Ukrainian, the visual calculator is highly intuitive for anyone to use, and a full English localization is on our roadmap.

I thought your readers who are interested in travel-tech and European startups might find this tool useful for their next road trip. I’ve included a short press kit below if you’d like to cover our launch.

🔗 Press Kit & Materials:
- Live App: https://autoroam.com.ua
- Press Kit (Screenshots & Logo): https://drive.google.com/drive/folders/1onuQQhDvfrJCHMBhIM3FJd2JKS70wLnI

---
Best regards, Maksym Otroshko
Founder of AutoRoam | https://www.linkedin.com/in/maxotroshko`;

  return { subject, html, text };
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const isDryRun = process.argv.includes('--dry-run');

  console.log(`\n📢 --- AutoRoam English Press Release Script ---`);
  if (isDryRun) {
    console.log(`⚠️  DRY-RUN MODE: Emails will NOT be sent physically.\n`);
  }

  if (!fs.existsSync(CONFIG.contactsPath)) {
    console.error(`❌ Error: Contacts file not found at ${CONFIG.contactsPath}`);
    process.exit(1);
  }

  const rawContacts = fs.readFileSync(CONFIG.contactsPath, 'utf-8');
  const contacts: PressContact[] = JSON.parse(rawContacts);
  const activeContacts = contacts.filter((c) => c.active);

  console.log(`👥 Found ${contacts.length} contacts (Active for sending: ${activeContacts.length})\n`);

  if (activeContacts.length === 0) {
    console.log('ℹ️ No active contacts found. Exiting.');
    return;
  }

  let transporter: any = null;
  if (!isDryRun) {
    try {
      const nodemailer = await import('nodemailer');
      if (!CONFIG.smtp.auth.user || !CONFIG.smtp.auth.pass) {
        console.error(`❌ Error: Please specify SMTP_USER and SMTP_PASS in .env.local!`);
        process.exit(1);
      }
      transporter = nodemailer.createTransport(CONFIG.smtp);
      await transporter.verify();
      console.log('✅ SMTP connection successful!\n');
    } catch (err: any) {
      console.error('❌ Error connecting to SMTP server:', err.message || err);
      process.exit(1);
    }
  }

  let successCount = 0;
  let failCount = 0;
  const report: any[] = [];

  for (let i = 0; i < activeContacts.length; i++) {
    const contact = activeContacts[i];
    const { subject, html, text } = getEnglishTemplate(contact);

    console.log(`[${i + 1}/${activeContacts.length}] Preparing email for: ${contact.name} (${contact.outlet}) -> <${contact.email}>`);

    if (isDryRun) {
      console.log(`   🔹 Subject: ${subject}`);
      console.log(`   🔸 Status: [DRY-RUN] Successfully generated\n`);
      successCount++;
      report.push({ email: contact.email, outlet: contact.outlet, status: 'DRY_RUN_SUCCESS' });
    } else {
      try {
        const mailOptions: any = {
          from: `"${CONFIG.senderName}" <${CONFIG.senderEmail}>`,
          to: contact.email,
          subject: subject,
          text: text,
          html: html,
        };

        if (fs.existsSync(CONFIG.attachmentPath)) {
          mailOptions.attachments = [
            {
              filename: 'AutoRoam_Press_Release_EN.pdf',
              path: CONFIG.attachmentPath,
            },
          ];
        }

        await transporter.sendMail(mailOptions);
        console.log(`   ✅ Successfully sent to <${contact.email}>!\n`);
        successCount++;
        report.push({ email: contact.email, outlet: contact.outlet, status: 'SUCCESS', timestamp: new Date().toISOString() });
      } catch (err: any) {
        console.error(`   ❌ Failed to send to <${contact.email}>:`, err.message || err);
        failCount++;
        report.push({ email: contact.email, outlet: contact.outlet, status: 'FAILED', error: err.message || String(err), timestamp: new Date().toISOString() });
      }

      if (i < activeContacts.length - 1) {
        console.log(`⏳ Waiting ${CONFIG.delayBetweenEmailsMs / 1000}s before next email...`);
        await sleep(CONFIG.delayBetweenEmailsMs);
      }
    }
  }

  const reportPath = path.join(process.cwd(), 'press-release-en-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({ summary: { total: activeContacts.length, success: successCount, failed: failCount, isDryRun }, details: report }, null, 2));

  console.log(`\n🎉 --- Sending Summary ---`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📄 Detailed report saved to: ${reportPath}\n`);
}

main().catch((err) => {
  console.error('❌ Unexpected script error:', err);
  process.exit(1);
});
