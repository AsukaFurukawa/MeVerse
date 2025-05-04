import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { Box, Center, Spinner, Text, VStack } from '@chakra-ui/react';

// Higher-Order Component for protected routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const AuthenticatedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    // We need this to avoid hydration issues
    useEffect(() => {
      setIsClient(true);
    }, []);

    // Redirect effect
    useEffect(() => {
      // Only run this effect on the client side and after auth state is loaded
      if (isClient && !isLoading && !isAuthenticated) {
        router.replace({
          pathname: '/login',
          query: { redirect: router.asPath },
        });
      }
    }, [isClient, isLoading, isAuthenticated, router]);

    // Loading state
    if (isLoading || !isClient) {
      return (
        <Center height="100vh">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text>Loading...</Text>
          </VStack>
        </Center>
      );
    }

    // If not authenticated, don't render the component
    if (!isAuthenticated) {
      return (
        <Center height="100vh">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text>Redirecting to login...</Text>
          </VStack>
        </Center>
      );
    }

    // If authenticated, render the wrapped component
    return <Component {...props} />;
  };

  // Copy displayName for better debugging
  AuthenticatedComponent.displayName = `withAuth(${
    Component.displayName || Component.name || 'Component'
  })`;

  return AuthenticatedComponent;
}; 