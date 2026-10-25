

export const welcomeTemplate = (name) => {
  const subject = "Welcome to Chatter";
  const text = `Hello ${name}, Welcome to Chatter`
  const html = `
    <!DOCTYPE html>
<html>
<head>
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: #f5f7fa;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    padding: 20px 40px;
  }
  .header {
    background-color: #4f46e5;
    color: white;
    padding: 40px;
    text-align: center;
    border-radius: 8px 8px 0 0;
  }
  .header h1 {
    margin: 0;
    font-size: 28px;
  }
  .content {
    padding: 40px 0;
    text-align: center;
  }
  .content p {
    font-size: 18px;
    line-height: 1.6;
    color: #333;
    margin: 15px 0;
  }
  .cta-button {
    display: inline-block;
    background-color: #4f46e5;
    color: white;
    padding: 14px 32px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    margin-top: 20px;
    transition: background-color 0.3s;
  }
  .cta-button:hover {
    background-color: #4338ca;
  }
  .footer {
    padding: 20px 40px;
    text-align: center;
    font-size: 14px;
    color: #6b7280;
    border-top: 1px solid #e5e7eb;
  }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>Welcome to Chatter!</h1>
  </div>
  <div class="content">
    <p>Hi <strong>${name}</strong>,</p>
    <p>Welcome aboard! We're excited to have you with us.</p>
    <p>You now have full access to all our features. Start exploring and enjoy the experience!</p>
    <a href="${process.env.CLIENT_URL || "http://localhost:5173"}" class="cta-button">Start Exploring</a>
  </div>
  <div class="footer">
    <p>&copy; 2024 Urvit Gehlot. All rights reserved.</p>
    <p>If you didn't create this account, please ignore this email.</p>
  </div>
</div>
</body>
</html>
    `
  return { subject, text, html };
}


export const otpTemplate = ({ email, otp }) => {
  const subject = "OTP for your account";
  const text = `Your OTP is ${otp}`
  const html = `
    <!DOCTYPE html>
<html>

<head>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f5f7fa;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px 40px;
        }

        .header {
            background-color: #4f46e5;
            color: white;
            padding: 40px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }

        .header h1 {
            margin: 0;
            font-size: 28px;
        }

        .content {
            padding: 40px 0;
            text-align: center;
        }

        .content p {
            font-size: 18px;
            line-height: 1.6;
            color: #333;
            margin: 15px 0;
        }

        .otp-box {
            display: inline-block;
            background-color: #f3f4f6;
            padding: 20px 40px;
            border-radius: 8px;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 8px;
            margin: 20px 0;
        }

        .footer {
            padding: 20px 40px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>OTP Verification</h1>
        </div>
        <div class="content">
            <p>Hi <strong>${email}</strong>,</p>
            <p>Thank you for choosing Chatter. Please use the One-Time Password (OTP) below to verify your account.</p>
            <div class="otp-box">
                ${otp}
            </div>
            <p>This OTP will expire in <strong>10 minutes</strong>.</p>
            <p>If you didn't create this account or received this email by mistake, please ignore it.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Urvit Gehlot. All rights reserved.</p>
        </div>
    </div>
</body>

</html>
    `;
  return { subject, text, html };
}