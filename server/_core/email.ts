import { Resend } from "resend";

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactEmailParams {
  inquiryType: string;
  name: string;
  organization?: string;
  email: string;
  subject: string;
  message: string;
}

const inquiryTypeLabels: Record<string, string> = {
  "professional-beta-interest": "Professional Plan Beta Interest",
  "artist-creator": "Artist / Creator",
  "producer-studio": "Producer / Studio",
  "record-label": "Record Label / Publisher",
  "distributor-platform": "Distributor / Platform",
  "streaming-service": "Streaming Service",
  "association-institution": "Association / Institution",
  "research-academic": "Research / Academic Inquiry",
  "other-professional": "Other Professional Inquiry",
};

/**
 * Send contact form submission to support@detectx.app
 */
export async function sendContactEmail(params: ContactEmailParams): Promise<{ success: boolean; error?: string }> {
  const { inquiryType, name, organization, email, subject, message } = params;
  
  if (!process.env.RESEND_API_KEY) {
    console.error("[Email] RESEND_API_KEY not configured");
    return { success: false, error: "Email service not configured" };
  }

  const inquiryLabel = inquiryTypeLabels[inquiryType] || inquiryType;
  
  try {
    // Send email to support
    const { error } = await resend.emails.send({
      from: "DetectX Contact <noreply@detectx.app>",
      to: ["support@detectx.app"],
      replyTo: email,
      subject: `[Contact] ${subject}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1a1a1a; border-bottom: 2px solid #0891b2; padding-bottom: 10px;">New Contact Inquiry</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5; font-weight: 600; width: 140px;">Inquiry Type</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5;">${inquiryLabel}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Name</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5;">${name}</td>
            </tr>
            ${organization ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Organization</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5;">${organization}</td>
            </tr>
            ` : ""}
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Email</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5;"><a href="mailto:${email}" style="color: #0891b2;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Subject</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5;">${subject}</td>
            </tr>
          </table>
          
          <h3 style="color: #1a1a1a; margin-top: 30px;">Message</h3>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; white-space: pre-wrap; line-height: 1.6;">
${message}
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
            This email was sent from the DetectX contact form. Reply directly to respond to ${name}.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("[Email] Failed to send contact email:", error);
      return { success: false, error: error.message };
    }

    console.log(`[Email] Contact email sent successfully to support@detectx.app from ${email}`);
    return { success: true };
  } catch (err) {
    console.error("[Email] Exception sending contact email:", err);
    return { success: false, error: "Failed to send email" };
  }
}
