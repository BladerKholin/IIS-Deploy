require('dotenv').config();
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');

// Create DB connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendReminders() {
  try {
    const reminderDays = process.env.REMINDER_DAYS_BEFORE || 3;

    const query = `
    SELECT e.id AS event_id, e.title, e.start_date, u.email, u.name AS user_name
    FROM calendarEvents e
    JOIN users u ON e.department_id = u.department_id
    WHERE DATE(e.start_date) = CURDATE() + INTERVAL ${reminderDays} DAY
        AND u.email IS NOT NULL;
    `;

    const [rows] = await pool.query(query);

    if (!rows.length) {
      console.log('No reminders to send.');
      return;
    }

    for (const row of rows) {
      const mailOptions = {
        from: `"Bitácora INFOR Reminders" <${process.env.SMTP_USER}>`,
        to: row.email,
        subject: `Reminder: ${row.title}`,
        text: `Hello ${row.user_name},\n\nThis is a reminder for your event "${row.title}" scheduled on ${new Date(row.start_date).toLocaleString()}.\n\nBest regards,\nBitácora INFOR Team`,
        // Optional HTML version:
        html: `
          <p>Hello ${row.user_name},</p>
          <p>This is a reminder for your event: <strong>${row.title}</strong></p>
          <p>Scheduled for: <strong>${new Date(row.start_date).toLocaleString()}</strong></p>
          <br/>
          <p>Best regards,<br/>Bitácora INFOR Team</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Reminder sent to ${row.email} for event "${row.title}"`);
    }
  } catch (error) {
    console.error('Error sending reminders:', error);
  }
}

module.exports = sendReminders;
