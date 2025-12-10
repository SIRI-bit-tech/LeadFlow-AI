import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({
  to,
  subject,
  template,
  data,
  from = 'noreply@leadflow.ai'
}: {
  to: string;
  subject?: string;
  template?: EmailTemplate;
  data?: Record<string, any>;
  from?: string;
}) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured, email not sent');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const emailTemplate = template || { subject: subject!, html: '', text: '' };
    
    // Replace template variables with data if provided
    let htmlContent = emailTemplate.html;
    if (data) {
      Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        htmlContent = htmlContent.replace(regex, data[key] || '');
      });
    }
    
    await sgMail.send({
      to,
      from,
      subject: subject || emailTemplate.subject,
      html: htmlContent,
      text: emailTemplate.text || htmlContent.replace(/<[^>]*>/g, ''),
    });

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

export const emailTemplates = {
  welcome: (name: string): EmailTemplate => ({
    subject: 'Welcome to LeadFlow AI!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0A4D68 0%, #1e7ba8 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to LeadFlow AI!</h1>
        </div>
        <div style="padding: 40px 20px; background: #f8f9fa;">
          <h2 style="color: #0A4D68;">Hi ${name},</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #2C3E50;">
            Thank you for joining LeadFlow AI! We're excited to help you transform your lead qualification process with AI-powered conversations.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #2C3E50;">
            Here's what you can do next:
          </p>
          <ul style="font-size: 16px; line-height: 1.6; color: #2C3E50;">
            <li>Complete your workspace setup</li>
            <li>Invite your team members</li>
            <li>Configure your qualification criteria</li>
            <li>Install the chat widget on your website</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/onboarding" 
               style="background: #FF6B6B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Complete Setup
            </a>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Need help? Reply to this email or visit our help center.
          </p>
        </div>
      </div>
    `,
  }),

  leadQualified: (leadName: string, score: number, summary: string): EmailTemplate => ({
    subject: `🔥 New Qualified Lead: ${leadName} (Score: ${score})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10B981; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">New Qualified Lead!</h1>
        </div>
        <div style="padding: 30px 20px; background: white;">
          <h2 style="color: #0A4D68;">${leadName}</h2>
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #0A4D68;">Lead Score: ${score}/100</p>
          </div>
          <h3 style="color: #2C3E50;">Conversation Summary:</h3>
          <p style="font-size: 16px; line-height: 1.6; color: #2C3E50;">${summary}</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/leads" 
               style="background: #FF6B6B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Lead Details
            </a>
          </div>
        </div>
      </div>
    `,
  }),



  followUp: (leadName: string, painPoints: string[], nextSteps: string): EmailTemplate => ({
    subject: `Following up on our conversation`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="padding: 30px 20px; background: white;">
          <h2 style="color: #0A4D68;">Hi ${leadName},</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #2C3E50;">
            Thank you for taking the time to chat with us. Based on our conversation, I understand you're facing challenges with:
          </p>
          <ul style="font-size: 16px; line-height: 1.6; color: #2C3E50;">
            ${painPoints.map(point => `<li>${point}</li>`).join('')}
          </ul>
          <p style="font-size: 16px; line-height: 1.6; color: #2C3E50;">
            ${nextSteps}
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #2C3E50;">
            I'd love to continue our conversation and show you exactly how we can help. Would you be available for a quick 15-minute call this week?
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/schedule" 
               style="background: #FF6B6B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Schedule a Call
            </a>
          </div>
          <p style="font-size: 16px; line-height: 1.6; color: #2C3E50;">
            Best regards,<br>
            The LeadFlow AI Team
          </p>
        </div>
      </div>
    `,
  }),

  meetingScheduled: {
    subject: 'Meeting Scheduled',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10B981; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Meeting Scheduled</h1>
        </div>
        <div style="padding: 30px 20px; background: white;">
          <h2 style="color: #0A4D68;">Hi {{leadName}},</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #2C3E50;">
            Great news! Your meeting has been scheduled successfully.
          </p>
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #0A4D68;">Meeting: {{meetingTitle}}</p>
            <p style="margin: 5px 0 0 0; color: #0A4D68;">Date & Time: {{scheduledAt}}</p>
            <p style="margin: 5px 0 0 0; color: #0A4D68;">Duration: {{duration}} minutes</p>
            {{#if meetingUrl}}<p style="margin: 10px 0 0 0;"><a href="{{meetingUrl}}" style="color: #FF6B6B;">Join Meeting</a></p>{{/if}}
          </div>
          {{#if notes}}<p style="font-size: 16px; line-height: 1.6; color: #2C3E50;">{{notes}}</p>{{/if}}
          <p style="font-size: 16px; line-height: 1.6; color: #2C3E50;">
            We look forward to speaking with you!
          </p>
        </div>
      </div>
    `,
  },

  meetingRescheduled: {
    subject: 'Meeting Rescheduled',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #F59E0B; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Meeting Rescheduled</h1>
        </div>
        <div style="padding: 30px 20px; background: white;">
          <h2 style="color: #0A4D68;">Hi {{leadName}},</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #2C3E50;">
            Your meeting has been rescheduled to a new time.
          </p>
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #92400e;">Meeting: {{meetingTitle}}</p>
            <p style="margin: 5px 0 0 0; color: #92400e; text-decoration: line-through;">Old Time: {{oldDate}}</p>
            <p style="margin: 5px 0 0 0; color: #92400e; font-weight: bold;">New Time: {{newDate}}</p>
            <p style="margin: 5px 0 0 0; color: #92400e;">Duration: {{duration}} minutes</p>
            {{#if meetingUrl}}<p style="margin: 10px 0 0 0;"><a href="{{meetingUrl}}" style="color: #FF6B6B;">Join Meeting</a></p>{{/if}}
          </div>
          {{#if reason}}<p style="font-size: 16px; line-height: 1.6; color: #2C3E50;"><strong>Reason:</strong> {{reason}}</p>{{/if}}
          <p style="font-size: 16px; line-height: 1.6; color: #2C3E50;">
            We apologize for any inconvenience and look forward to speaking with you at the new time.
          </p>
        </div>
      </div>
    `,
  },

  meetingCancelled: {
    subject: 'Meeting Cancelled',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #EF4444; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Meeting Cancelled</h1>
        </div>
        <div style="padding: 30px 20px; background: white;">
          <h2 style="color: #0A4D68;">Hi {{leadName}},</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #2C3E50;">
            We regret to inform you that your scheduled meeting has been cancelled.
          </p>
          <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #dc2626;">Meeting: {{meetingTitle}}</p>
            <p style="margin: 5px 0 0 0; color: #dc2626;">Scheduled Time: {{scheduledAt}}</p>
          </div>
          <p style="font-size: 16px; line-height: 1.6; color: #2C3E50;">
            If you'd like to reschedule, please don't hesitate to reach out to us.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/schedule" 
               style="background: #FF6B6B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Schedule New Meeting
            </a>
          </div>
        </div>
      </div>
    `,
  },
};