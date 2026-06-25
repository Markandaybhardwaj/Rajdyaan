import React from 'react';
import { Html, Head, Body, Container, Text, Heading, Section } from '@react-email/components';

export default function OTPEmail({ otp }) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', padding: '20px 0' }}>
        <Container style={{ backgroundColor: '#ffffff', border: '1px solid #eaeaea', borderRadius: '5px', padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <Heading style={{ color: '#5C4033', borderBottom: '2px solid #5C4033', paddingBottom: '10px', textAlign: 'left' }}>RajDyaan</Heading>
          <Text style={{ fontSize: '18px', color: '#333' }}>Password Reset Request</Text>
          <Text style={{ fontSize: '16px', color: '#555' }}>Use the OTP below to reset your password.</Text>
          
          <Section style={{ backgroundColor: '#f4f4f4', padding: '20px', borderRadius: '4px', margin: '20px 0' }}>
            <Text style={{ fontSize: '32px', fontWeight: 'bold', color: '#5C4033', letterSpacing: '5px', margin: '0' }}>{otp}</Text>
          </Section>

          <Text style={{ fontSize: '14px', color: '#888', marginTop: '20px' }}>This OTP is valid for 10 minutes. Do not share it with anyone.</Text>
        </Container>
      </Body>
    </Html>
  );
}
