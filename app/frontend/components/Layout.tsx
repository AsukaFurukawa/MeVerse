import React from 'react';
import { Box } from '@chakra-ui/react';
import Navbar from './Navbar';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box minH="100vh">
      <Navbar />
      <Box as="main" pt={4}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 