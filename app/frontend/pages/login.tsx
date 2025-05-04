import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  Text,
  VStack,
  FormErrorMessage,
  useColorModeValue,
  useToast,
  Container,
  Divider,
  HStack,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { FaGithub } from 'react-icons/fa';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [oauthError, setOauthError] = useState<string | null>(null);
  
  const { login, loginWithGithub } = useAuth();
  const router = useRouter();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Check for OAuth error parameters
  useEffect(() => {
    if (!router.isReady) return;
    
    const { error, message } = router.query;
    if (error) {
      let errorMessage = 'Authentication failed';
      
      if (message) {
        errorMessage = String(message);
      } else {
        // Map error codes to user-friendly messages
        switch (String(error)) {
          case 'oauth_not_configured':
            errorMessage = 'GitHub login is not configured on the server.';
            break;
          case 'github_auth_failed':
            errorMessage = 'GitHub authentication failed. Please try again.';
            break;
          case 'no_email_found':
            errorMessage = 'No email address found on your GitHub account.';
            break;
          case 'token_exchange_failed':
            errorMessage = 'Failed to authenticate with GitHub.';
            break;
          default:
            errorMessage = `Authentication error: ${error}`;
        }
      }
      
      setOauthError(errorMessage);
      
      // Remove error parameters from URL
      const { pathname } = router;
      router.replace(pathname, undefined, { shallow: true });
    }
  }, [router.isReady, router.query, router]);
  
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!username) newErrors.username = 'Username or email is required';
    if (!password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      await login(username, password);
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      let errorMessage = 'Login failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Login failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGithubLogin = async () => {
    setIsGithubLoading(true);
    
    try {
      loginWithGithub();
      // Note: This function redirects, so there's no need for additional code here
    } catch (error) {
      toast({
        title: 'GitHub Login Failed',
        description: 'Could not initiate GitHub login',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsGithubLoading(false);
    }
  };
  
  return (
    <Container maxW="container.md" py={12}>
      <Flex direction="column" align="center" justify="center">
        <Box
          p={8}
          width="100%"
          maxWidth="500px"
          borderRadius="lg"
          bg={bgColor}
          boxShadow="lg"
          borderWidth={1}
          borderColor={borderColor}
        >
          <VStack spacing={6} align="stretch">
            <Heading as="h1" size="xl" textAlign="center">
              Welcome to MeVerse
            </Heading>
            <Text textAlign="center" color="gray.500">
              Your Digital Twin awaits
            </Text>
            
            {oauthError && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <Box flex="1">
                  <AlertTitle>Authentication Error</AlertTitle>
                  <AlertDescription display="block">
                    {oauthError}
                  </AlertDescription>
                </Box>
                <CloseButton position="absolute" right="8px" top="8px" onClick={() => setOauthError(null)} />
              </Alert>
            )}
            
            <Button
              width="100%"
              colorScheme="gray"
              variant="outline"
              leftIcon={<Icon as={FaGithub} />}
              onClick={handleGithubLogin}
              isLoading={isGithubLoading}
              size="lg"
            >
              Continue with GitHub
            </Button>
            
            <Flex align="center" my={4}>
              <Divider />
              <Text mx={4} color="gray.500" fontSize="sm">
                OR
              </Text>
              <Divider />
            </Flex>
            
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.username}>
                  <FormLabel>Username or Email</FormLabel>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username or email"
                  />
                  <FormErrorMessage>{errors.username}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={!!errors.password}>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>
                
                <Flex justify="flex-end" w="100%">
                  <Link href="/forgot-password">
                    <Text color="blue.500" fontSize="sm">
                      Forgot password?
                    </Text>
                  </Link>
                </Flex>
                
                <Button
                  width="100%"
                  colorScheme="blue"
                  isLoading={isSubmitting}
                  type="submit"
                  size="lg"
                  mt={2}
                >
                  Log In
                </Button>
                
                <Flex direction="column" align="center" w="100%" pt={4}>
                  <Text>
                    Don't have an account?{' '}
                    <Link href="/register">
                      <Text as="span" color="blue.500" textDecoration="underline">
                        Sign Up
                      </Text>
                    </Link>
                  </Text>
                </Flex>
              </VStack>
            </form>
          </VStack>
        </Box>
      </Flex>
    </Container>
  );
};

export default LoginPage; 