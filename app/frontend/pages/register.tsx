import React, { useState } from 'react';
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
  Checkbox,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    agreeToTerms: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const { register } = useAuth();
  const router = useRouter();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.username) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) 
      newErrors.username = 'Username must be at least 3 characters';
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) 
      newErrors.email = 'Email is invalid';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(formData.password))
      newErrors.password = 'Password must contain at least one uppercase letter';
    else if (!/[0-9]/.test(formData.password))
      newErrors.password = 'Password must contain at least one number';
    
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    
    if (!formData.agreeToTerms)
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      // Remove confirmPassword and agreeToTerms from data sent to API
      const { confirmPassword, agreeToTerms, ...userData } = formData;
      
      await register(userData);
      toast({
        title: 'Registration successful',
        description: 'Your account has been created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      let errorMessage = 'Registration failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Registration failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
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
              Create Your Digital Twin
            </Heading>
            <Text textAlign="center" color="gray.500">
              Join MeVerse to create your own AI version of yourself
            </Text>
            
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.username}>
                  <FormLabel>Username</FormLabel>
                  <Input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose a unique username"
                  />
                  <FormErrorMessage>{errors.username}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>Email Address</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                  />
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Full Name (Optional)</FormLabel>
                  <Input
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                </FormControl>
                
                <FormControl isInvalid={!!errors.password}>
                  <FormLabel>Password</FormLabel>
                  <Input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                  />
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={!!errors.confirmPassword}>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                  />
                  <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={!!errors.agreeToTerms}>
                  <Checkbox
                    name="agreeToTerms"
                    isChecked={formData.agreeToTerms}
                    onChange={handleChange}
                  >
                    I agree to the Terms of Service and Privacy Policy
                  </Checkbox>
                  <FormErrorMessage>{errors.agreeToTerms}</FormErrorMessage>
                </FormControl>
                
                <Button
                  width="100%"
                  colorScheme="blue"
                  isLoading={isSubmitting}
                  type="submit"
                  size="lg"
                  mt={4}
                >
                  Create Account
                </Button>
                
                <Flex direction="column" align="center" w="100%" pt={4}>
                  <Text>
                    Already have an account?{' '}
                    <Link href="/login">
                      <Text as="span" color="blue.500" textDecoration="underline">
                        Login
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

export default RegisterPage; 