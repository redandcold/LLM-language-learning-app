import nodemailer from 'nodemailer'

export async function sendVerificationEmail({
  to,
  url,
}: {
  to: string
  url: string
}) {
  console.log(`\n📧 ${to}로 로그인 링크를 전송 중...`)
  
  // Gmail SMTP 설정 확인
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Gmail 이메일 설정이 필요합니다!')
    console.log('💡 .env.local 파일에 다음 설정을 추가하세요:')
    console.log('EMAIL_USER=본인이메일@gmail.com')
    console.log('EMAIL_PASS=16자리앱비밀번호')
    throw new Error('Gmail 이메일 설정이 없습니다')
  }

  // Gmail SMTP transporter 생성
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // TLS 사용
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  try {
    const info = await transporter.sendMail({
      from: `"언어학습 앱" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: to,
      subject: '🔐 언어학습 앱 로그인 링크',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">언어학습 앱 로그인</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #374151;">안녕하세요!</p>
          <p style="font-size: 16px; line-height: 1.5; color: #374151; margin-bottom: 30px;">
            아래 버튼을 클릭하여 로그인하세요:
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${url}" 
               style="background: #3b82f6; 
                      color: white; 
                      padding: 16px 32px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block; 
                      font-weight: 600;
                      font-size: 16px;">
              🔐 로그인하기
            </a>
          </div>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 14px; color: #6b7280; margin: 8px 0;">
              💡 이 링크는 1시간 후 만료됩니다.
            </p>
            <p style="font-size: 14px; color: #6b7280; margin: 8px 0;">
              ⚠️ 로그인을 요청하지 않았다면 이 이메일을 무시하세요.
            </p>
          </div>
        </div>
      `,
      text: `언어학습 앱 로그인

안녕하세요!

다음 링크를 클릭하여 로그인하세요:
${url}

💡 이 링크는 1시간 후 만료됩니다.
⚠️ 로그인을 요청하지 않았다면 이 이메일을 무시하세요.`,
    })

    console.log(`✅ ${to}로 로그인 링크를 성공적으로 전송했습니다!`)
    console.log(`📧 메시지 ID: ${info.messageId}`)

  } catch (error) {
    console.error('❌ Gmail SMTP 이메일 전송 실패:', error)
    throw error
  }
}