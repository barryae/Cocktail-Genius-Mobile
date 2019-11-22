import React from 'react';
import { Text } from 'react-native';
import styled from 'styled-components'

const Container = styled.View`
align-items: center;
background: white;
flex: 1;
justify-content: center;
`

export default function App() {
  return (
    <Container>
      <Text>This is a cocktail app</Text>
    </Container>
  );
}