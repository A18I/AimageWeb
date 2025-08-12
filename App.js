import React from 'react';
import { AuthProvider } from './AuthContext';
import Navigation from './Navigation'; 

const App = () => {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
};

export default App;
