import React from 'react';
import { Html, Head, Body, Container, Text, Heading, Button, Section } from '@react-email/components';

export default function OrderConfirmation({ order, user }) {
  const total = order?.totalAmount || 0;
  const address = order?.shippingAddress || {};
  
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', padding: '20px 0' }}>
        <Container style={{ backgroundColor: '#ffffff', border: '1px solid #eaeaea', borderRadius: '5px', padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
          <Heading style={{ color: '#5C4033', borderBottom: '2px solid #5C4033', paddingBottom: '10px' }}>RajDyaan</Heading>
          <Text style={{ fontSize: '18px', color: '#333' }}>Hi {user?.name || 'Customer'},</Text>
          <Text style={{ fontSize: '16px', color: '#555' }}>Thank you for your order! We've received it and will process it shortly.</Text>
          
          <Section style={{ backgroundColor: '#f4f4f4', padding: '15px', borderRadius: '4px', margin: '20px 0' }}>
            <Heading as="h3" style={{ margin: '0 0 10px', fontSize: '16px', color: '#333' }}>Order Summary</Heading>
            <Text style={{ margin: '5px 0', color: '#555' }}><strong>Order ID:</strong> {order?._id}</Text>
            <Text style={{ margin: '5px 0', color: '#555' }}><strong>Total:</strong> ₹{total}</Text>
          </Section>

          <Section style={{ backgroundColor: '#f4f4f4', padding: '15px', borderRadius: '4px', margin: '20px 0' }}>
            <Heading as="h3" style={{ margin: '0 0 10px', fontSize: '16px', color: '#333' }}>Shipping Address</Heading>
            <Text style={{ margin: '5px 0', color: '#555' }}>
              {address.addressLine1} {address.addressLine2}<br />
              {address.city}, {address.state} {address.pincode}
            </Text>
          </Section>

          <Section style={{ textAlign: 'center', marginTop: '30px' }}>
            <Button 
              href="https://rajdyaan.com/profile" 
              style={{ backgroundColor: '#FFD700', color: '#5C4033', padding: '12px 20px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}
            >
              Track Order
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
