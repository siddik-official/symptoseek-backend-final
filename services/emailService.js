const nodemailer = require('nodemailer');

// The transporter uses the credentials from your .env file
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports like 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // This should be your Google App Password
  },
});

/**
 * Generic email sending function
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 */
const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: to,
    subject: subject,
    html: html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw error;
  }
};

/**
 * Send appointment confirmation email to user
 * @param {string} userEmail - User's email address
 * @param {object} appointmentData - Appointment details
 */
const sendAppointmentConfirmation = async (userEmail, appointmentData) => {
  const { user, doctor, appointment, appointmentDate } = appointmentData;

  const subject = `Appointment Booking Confirmation - SymptoSeek`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">SymptoSeek</h1>
        <p style="color: white; margin: 5px 0;">Your Health Companion</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-bottom: 20px;">Appointment Booking Confirmation</h2>
        
        <p>Dear ${user.name},</p>
        
        <p>Your appointment request has been successfully submitted and is pending admin approval.</p>
        
        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #667eea; margin-top: 0;">Appointment Details:</h3>
          <p><strong>Doctor:</strong> Dr. ${doctor.name}</p>
          <p><strong>Speciality:</strong> ${doctor.speciality}</p>
          <p><strong>Hospital:</strong> ${doctor.hospital_name}</p>
          <p><strong>Date:</strong> ${appointmentDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          <p><strong>Time:</strong> ${appointmentDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })}</p>
          <p><strong>Type:</strong> ${appointment.appointmentType || 'Consultation'}</p>
          <p><strong>Reason:</strong> ${appointment.reason || 'General consultation'}</p>
          <p><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">Pending Approval</span></p>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="color: #856404; margin-top: 0;">📋 What happens next?</h4>
          <ul style="color: #856404;">
            <li>Our admin team will review your appointment request</li>
            <li>You will receive an email notification once your appointment is approved or if any changes are needed</li>
            <li>Please keep this confirmation for your records</li>
          </ul>
        </div>
        
        <p>If you need to cancel or modify your appointment, please contact us or log into your account.</p>
        
        <p>Thank you for choosing SymptoSeek!</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/appointments" 
             style="background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View My Appointments
          </a>
        </div>
      </div>
      
      <div style="background: #333; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0;">© 2024 SymptoSeek. All rights reserved.</p>
        <p style="margin: 5px 0; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    </div>
  `;

  return await sendEmail(userEmail, subject, html);
};

/**
 * Send appointment approval notification to user
 * @param {string} userEmail - User's email address
 * @param {object} appointmentData - Appointment details
 */
const sendAppointmentApproval = async (userEmail, appointmentData) => {
  const { user, doctor, appointment, appointmentDate } = appointmentData;

  const subject = `✅ Appointment Approved - SymptoSeek`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">✅ Appointment Approved!</h1>
        <p style="color: white; margin: 5px 0;">SymptoSeek</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-bottom: 20px;">Great News! Your Appointment is Confirmed</h2>
        
        <p>Dear ${user.name},</p>
        
        <p>We're pleased to inform you that your appointment request has been <strong style="color: #10b981;">APPROVED</strong>!</p>
        
        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #10b981;">
          <h3 style="color: #10b981; margin-top: 0;">📅 Confirmed Appointment Details:</h3>
          <p><strong>Doctor:</strong> Dr. ${doctor.name}</p>
          <p><strong>Speciality:</strong> ${doctor.speciality}</p>
          <p><strong>Hospital:</strong> ${doctor.hospital_name}</p>
          <p><strong>Address:</strong> ${doctor.address}</p>
          <p><strong>Date:</strong> ${appointmentDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          <p><strong>Time:</strong> ${appointmentDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })}</p>
          <p><strong>Type:</strong> ${appointment.appointmentType || 'Consultation'}</p>
          <p><strong>Contact:</strong> ${doctor.number}</p>
        </div>
        
        <div style="background: #dcfce7; border: 1px solid #bbf7d0; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="color: #166534; margin-top: 0;">📋 Important Reminders:</h4>
          <ul style="color: #166534;">
            <li>Please arrive 15 minutes before your scheduled time</li>
            <li>Bring a valid ID and any relevant medical documents</li>
            <li>Contact the hospital if you need to reschedule</li>
            <li>Follow any pre-appointment instructions from your doctor</li>
          </ul>
        </div>
        
        <p>We look forward to seeing you at your appointment!</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/appointments" 
             style="background: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View My Appointments
          </a>
        </div>
      </div>
      
      <div style="background: #333; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0;">© 2024 SymptoSeek. All rights reserved.</p>
        <p style="margin: 5px 0; font-size: 12px;">This is an automated message, please do not reply.</p>
      </div>
    </div>
  `;

  return await sendEmail(userEmail, subject, html);
};

/**
 * Sends a pre-formatted reminder email.
 * @param {string} userEmail - The recipient's email address.
 * @param {object} reminder - The reminder object (title, description, time, type).
 */
const sendReminderEmail = async (userEmail, reminder) => {
  const isAdvanceNotice = reminder.time.includes('in') && reminder.time.includes('minutes');
  const urgencyClass = isAdvanceNotice ? 'advance-notice' : 'immediate';
  const urgencyColor = isAdvanceNotice ? '#f59e0b' : '#10b981';
  const urgencyText = isAdvanceNotice ? 'Upcoming Reminder' : 'Time for Action';

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: isAdvanceNotice ? `⏰ Upcoming: ${reminder.title}` : `🔔 Reminder: ${reminder.title}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #9333ea, #7c3aed); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🏥 SymptoSeek</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Your Health Companion</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <div style="background: ${urgencyColor}; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
            <h2 style="margin: 0; font-size: 18px;">${urgencyText}</h2>
          </div>
          
          <div style="border-left: 4px solid ${urgencyColor}; padding-left: 20px; margin: 25px 0;">
            <h3 style="margin: 0 0 10px 0; color: #2d3748; font-size: 20px;">${reminder.title}</h3>
            <div style="background: #f7fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 0; font-size: 16px; color: #4a5568;"><strong>⏰ Time:</strong> ${reminder.time}</p>
              <p style="margin: 10px 0 0 0; font-size: 16px; color: #4a5568;"><strong>📋 Type:</strong> ${reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1)}</p>
            </div>
            ${reminder.description ? `
              <div style="background: #edf2f7; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <p style="margin: 0; font-size: 14px; color: #2d3748;"><strong>📝 Details:</strong></p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #4a5568;">${reminder.description}</p>
              </div>
            ` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/notifications" 
               style="display: inline-block; background: linear-gradient(135deg, #9333ea, #7c3aed); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; transition: transform 0.2s;">
              View All Notifications
            </a>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #a0aec0;">
              You received this reminder because you scheduled it in SymptoSeek.<br>
              To manage your notifications, visit the app or contact support.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${userEmail} for "${reminder.title}"`);
  } catch (error) {
    console.error(`Error sending email to ${userEmail}:`, error);
  }
};

module.exports = {
  sendEmail,
  sendAppointmentConfirmation,
  sendAppointmentApproval,
  sendReminderEmail
};
