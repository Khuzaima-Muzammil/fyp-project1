const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        let transporter;
        let testAccount = null;

        // Try using the provided credentials
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
        } else {
            throw new Error("No Email Credentials");
        }

        const mailOptions = {
            from: `"Shop Admin" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            html: options.html,
            attachments: options.attachments || []
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log("Email sent successfully: %s", info.messageId);
            return true;
        } catch (err) {
            console.warn("Primary email failed (likely due to Google Less Secure Apps restriction). Falling back to Ethereal Test Email...");
            
            // Fallback to Ethereal (Test Email)
            testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user, // generated ethereal user
                    pass: testAccount.pass, // generated ethereal password
                },
            });

            mailOptions.from = `"Shop Admin (TEST)" <${testAccount.user}>`;
            mailOptions.attachments = options.attachments || []; // Preserve attachments in fallback
            const info = await transporter.sendMail(mailOptions);
            
            console.log("TEST Email sent: %s", info.messageId);
            console.log("==================================================");
            console.log("🌟 CLICK HERE TO VIEW EMAIL: %s", nodemailer.getTestMessageUrl(info));
            console.log("==================================================");
            return true;
        }

    } catch (error) {
        console.error("Error setting up email:", error);
        return false;
    }
};

module.exports = sendEmail;
