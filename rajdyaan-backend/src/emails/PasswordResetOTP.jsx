import React from 'react';
import { Html, Head, Body, Container, Text, Heading, Section, Hr } from '@react-email/components';

export default function PasswordResetOTP({ otp, userName }) {
  return (
    <Html>
      <Head />
      <Body style={{
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        backgroundColor: '#FAF6EE',
        padding: '40px 0',
        margin: 0,
      }}>
        <Container style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E8DCC8',
          borderRadius: '12px',
          padding: '0',
          maxWidth: '600px',
          margin: '0 auto',
          overflow: 'hidden',
        }}>
          {/* Header Banner */}
          <Section style={{
            backgroundColor: '#3D1C02',
            padding: '28px 32px',
            textAlign: 'center',
          }}>
            <Heading style={{
              color: '#FAF6EE',
              fontSize: '28px',
              fontWeight: '700',
              margin: '0',
              letterSpacing: '2px',
              fontFamily: "'Playfair Display', 'Georgia', serif",
            }}>
              🌿 Rajdhyaan
            </Heading>
            <Text style={{
              color: '#D4B896',
              fontSize: '12px',
              margin: '6px 0 0 0',
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}>
              Pure • Organic • Natural
            </Text>
          </Section>

          {/* Body Content */}
          <Section style={{ padding: '32px 32px 20px' }}>
            <Heading style={{
              color: '#3D1C02',
              fontSize: '22px',
              fontWeight: '600',
              margin: '0 0 8px 0',
            }}>
              Password Reset Request
            </Heading>

            <Text style={{
              fontSize: '15px',
              color: '#5C4033',
              lineHeight: '1.6',
              margin: '0 0 24px 0',
            }}>
              Hi{userName ? ` ${userName}` : ''},<br />
              We received a request to reset your password. Use the verification
              code below to proceed. If you didn't request this, you can safely
              ignore this email.
            </Text>

            {/* OTP Box */}
            <Section style={{
              backgroundColor: '#FBF7F0',
              border: '2px dashed #D4B896',
              borderRadius: '10px',
              padding: '24px',
              textAlign: 'center',
              margin: '0 0 24px 0',
            }}>
              <Text style={{
                fontSize: '13px',
                color: '#8B7355',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                fontWeight: '600',
              }}>
                Your Verification Code
              </Text>
              <Text style={{
                fontSize: '40px',
                fontWeight: '800',
                color: '#3D1C02',
                letterSpacing: '10px',
                margin: '0',
                fontFamily: "'Courier New', monospace",
              }}>
                {otp}
              </Text>
            </Section>

            {/* Expiry Warning */}
            <Section style={{
              backgroundColor: '#FFF8E1',
              border: '1px solid #FFE082',
              borderRadius: '8px',
              padding: '12px 16px',
              margin: '0 0 24px 0',
            }}>
              <Text style={{
                fontSize: '13px',
                color: '#8B6914',
                margin: '0',
                textAlign: 'center',
              }}>
                ⏳ This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
              </Text>
            </Section>
          </Section>

          <Hr style={{ borderColor: '#E8DCC8', margin: '0' }} />

          {/* Footer */}
          <Section style={{
            padding: '20px 32px',
            textAlign: 'center',
            backgroundColor: '#FDFBF7',
          }}>
            <Text style={{
              fontSize: '12px',
              color: '#A89278',
              margin: '0 0 4px 0',
            }}>
              If you didn't request a password reset, please ignore this email
              or contact our support team.
            </Text>
            <Text style={{
              fontSize: '11px',
              color: '#C4B49A',
              margin: '0',
            }}>
              © {new Date().getFullYear()} Rajdhyaan — Premium Organic Foods | India
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
