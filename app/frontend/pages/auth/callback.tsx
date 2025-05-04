import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { Box, Flex, Spinner, Text, useToast } from '@chakra-ui/react';

export default function AuthCallback() {
  const router = useRouter();
  const { token, refresh_token } = router.query;
  const toast = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!router.isReady) return;

    if (token && refresh_token && typeof token === 'string' && typeof refresh_token === 'string') {
      // Store tokens in localStorage
      localStorage.setItem('meverse_tokens', JSON.stringify({
        access_token: token,
        refresh_token: refresh_token
      }));

      // Show success toast
      toast({
        title: 'Login Successful',
        description: 'You have been successfully logged in.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Redirect to dashboard - this will be picked up by AuthContext
      // and it will fetch the user profile using the stored token
      router.push('/dashboard');
    } else {
      // If no token is present, show error and redirect to login
      toast({
        title: 'Authentication Failed',
        description: 'Could not complete authentication. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      router.push('/login');
    }
  }, [router.isReady, token, refresh_token, router, toast]);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <Flex height="100vh" alignItems="center" justifyContent="center">
      <Box textAlign="center">
        <Spinner size="xl" color="brand.500" thickness="4px" speed="0.65s" mb={4} />
        <Text fontSize="lg">Completing authentication, please wait...</Text>
      </Box>
    </Flex>
  );
} 