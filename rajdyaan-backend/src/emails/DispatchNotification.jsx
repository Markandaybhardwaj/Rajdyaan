import React from 'react';
import { Html, Head, Body, Container, Text, Heading, Button, Section } from '@react-email/components';

export default function DispatchNotification({ order, user }) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', padding: '20px 0' }}>
        <Container style={{ backgroundColor: '#ffffff', border: '1px solid #eaeaea', borderRadius: '5px', padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
          <Heading style={{ color: '#5C4033', borderBottom: '2px solid #5C4033', paddingBottom: '10px' }}>RajDyaan</Heading>
          <Text style={{ fontSize: '18px', color: '#333' }}>Hi {user?.name || 'Customer'},</Text>
          <Text style={{ fontSize: '16px', color: '#555' }}>Great news! Your order has been dispatched.</Text>
          
          <Section style={{ backgroundColor: '#f4f4f4', padding: '15px', borderRadius: '4px', margin: '20px 0' }}>
            <Heading as="h3" style={{ margin: '0 0 10px', fontSize: '16px', color: '#333' }}>Tracking Information</Heading>
            <Text style={{ margin: '5px 0', color: '#555' }}><strong>Courier:</strong> {order?.courierName || 'Partner'}</Text>
            <Text style={{ margin: '5px 0', color: '#555' }}><strong>AWB Code:</strong> {order?.awbCode}</Text>
          </Section>

          <Section style={{ textAlign: 'center', marginTop: '30px' }}>
            <Button 
              href={`https://shiprocket.co/tracking/${order?.awbCode}`} 
              style={{ backgroundColor: '#FFD700', color: '#5C4033', padding: '12px 20px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}
            >
              Track Shipment
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
