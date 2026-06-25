import 'dotenv/config';
import nodemailer from 'nodemailer';

const pass = process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.replace(/\s+/g, '') : '';
const emailsToTest = [
  'lakshthakur289@gmail.com',
  'rajdyaan5@gmail.com',
  'rajdyaan@gmail.com',
  'rajdhyaan@gmail.com',
  'rajdhaan@gmail.com'
];

console.log('Testing App Password with multiple possible emails...\n');

for (const email of emailsToTest) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: email, pass },
  });
  
  try {
    process.stdout.write(`Testing ${email}... `);
    await transporter.verify();
    console.log('✅ SUCCESS! This is the right email.');
    process.exit(0);
  } catch (err) {
    console.log('❌ Failed.');
  }
}

console.log('\nNone of the emails worked. The App Password does not match any of these accounts.');
process.exit(0);
