import React from 'react';
import { AuthProvider } from './AuthContext';
import Navigation from './Navigation'; // Replace with your navigation component

const App = () => {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
};

export default App;