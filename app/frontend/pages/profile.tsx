import React, { useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  useToast,
  useColorModeValue,
  Container,
  Divider,
  HStack,
  Avatar,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Switch,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import DataConnections from '../components/DataConnections';

// Protected route wrapper
import { withAuth } from '../components/withAuth';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { authFetch, loading, error, setError } = useApi();
  const toast = useToast();
  const router = useRouter();
  
  // Form state for profile edit
  const [profile, setProfile] = useState({
    username: user?.username || '',
    email: user?.email || '',
    full_name: user?.full_name || '',
  });
  
  // Form state for password change
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Validation errors
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  
  // Loading states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Password change modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Handle profile form change
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle password form change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Validate profile form
  const validateProfileForm = () => {
    const errors: Record<string, string> = {};
    
    if (!profile.username) errors.username = 'Username is required';
    if (!profile.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(profile.email)) 
      errors.email = 'Email is invalid';
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Validate password form
  const validatePasswordForm = () => {
    const errors: Record<string, string> = {};
    
    if (!passwordData.oldPassword) 
      errors.oldPassword = 'Current password is required';
    
    if (!passwordData.newPassword) 
      errors.newPassword = 'New password is required';
    else if (passwordData.newPassword.length < 8)
      errors.newPassword = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(passwordData.newPassword))
      errors.newPassword = 'Password must contain at least one uppercase letter';
    else if (!/[0-9]/.test(passwordData.newPassword))
      errors.newPassword = 'Password must contain at least one number';
    
    if (passwordData.newPassword !== passwordData.confirmPassword)
      errors.confirmPassword = 'Passwords do not match';
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Update profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) return;
    
    setIsUpdatingProfile(true);
    
    try {
      const updatedUser = await authFetch('/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });
      
      toast({
        title: 'Profile updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      // Error is handled by the useApi hook
      let errorMessage = 'Failed to update profile';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };
  
  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    setIsChangingPassword(true);
    
    try {
      await authFetch('/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          old_password: passwordData.oldPassword,
          new_password: passwordData.newPassword,
        }),
      });
      
      // Clear password fields
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Close modal
      onClose();
      
      toast({
        title: 'Password changed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      // Error is handled by the useApi hook
      let errorMessage = 'Failed to change password';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  if (!user) {
    return <Box>Loading...</Box>;
  }
  
  return (
    <Container maxW="container.lg" py={8}>
      <Box
        borderWidth={1}
        borderRadius="lg"
        overflow="hidden"
        bg={bgColor}
        borderColor={borderColor}
        boxShadow="lg"
      >
        <Flex p={6} direction={{ base: 'column', md: 'row' }} align="center">
          <Avatar 
            size="xl" 
            name={user.full_name || user.username} 
            src="" 
            mr={{ base: 0, md: 6 }}
            mb={{ base: 4, md: 0 }}
          />
          <Box>
            <Heading size="lg">{user.full_name || user.username}</Heading>
            <Text color="gray.500">{user.email}</Text>
            <Text fontSize="sm" mt={2}>
              Member since: {new Date(user.created_at).toLocaleDateString()}
            </Text>
          </Box>
          <Button 
            colorScheme="red" 
            variant="outline" 
            ml="auto" 
            onClick={logout}
          >
            Logout
          </Button>
        </Flex>
        
        <Divider />
        
        <Box p={6}>
          <Tabs variant="enclosed">
            <TabList>
              <Tab>Profile Information</Tab>
              <Tab>Security</Tab>
              <Tab>Data Connections</Tab>
            </TabList>
            
            <TabPanels>
              {/* Profile Information Tab */}
              <TabPanel>
                <form onSubmit={handleUpdateProfile}>
                  <VStack spacing={4} align="start">
                    <FormControl isInvalid={!!profileErrors.username}>
                      <FormLabel>Username</FormLabel>
                      <Input
                        name="username"
                        value={profile.username}
                        onChange={handleProfileChange}
                      />
                      <FormErrorMessage>{profileErrors.username}</FormErrorMessage>
                    </FormControl>
                    
                    <FormControl isInvalid={!!profileErrors.email}>
                      <FormLabel>Email Address</FormLabel>
                      <Input
                        name="email"
                        type="email"
                        value={profile.email}
                        onChange={handleProfileChange}
                      />
                      <FormErrorMessage>{profileErrors.email}</FormErrorMessage>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Full Name</FormLabel>
                      <Input
                        name="full_name"
                        value={profile.full_name || ''}
                        onChange={handleProfileChange}
                      />
                    </FormControl>
                    
                    <Button
                      colorScheme="blue"
                      isLoading={isUpdatingProfile}
                      type="submit"
                      mt={4}
                    >
                      Update Profile
                    </Button>
                  </VStack>
                </form>
              </TabPanel>
              
              {/* Security Tab */}
              <TabPanel>
                <VStack spacing={4} align="start">
                  <Box width="100%">
                    <Heading size="md" mb={4}>Password</Heading>
                    <Text mb={4}>
                      Secure your account with a strong password that you don't use elsewhere.
                    </Text>
                    <Button colorScheme="blue" onClick={onOpen}>
                      Change Password
                    </Button>
                  </Box>
                  
                  <Divider my={4} />
                  
                  <Box width="100%">
                    <Heading size="md" mb={4}>Two-Factor Authentication</Heading>
                    <Text mb={4}>
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </Text>
                    <HStack>
                      <Switch id="2fa" colorScheme="blue" />
                      <FormLabel htmlFor="2fa" mb={0}>
                        Enable Two-Factor Authentication
                      </FormLabel>
                    </HStack>
                    <Text fontSize="sm" color="gray.500" mt={2}>
                      (Feature coming soon)
                    </Text>
                  </Box>
                </VStack>
              </TabPanel>
              
              {/* Data Connections Tab */}
              <TabPanel>
                <DataConnections />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
      
      {/* Password Change Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Password</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleChangePassword}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isInvalid={!!passwordErrors.oldPassword}>
                  <FormLabel>Current Password</FormLabel>
                  <Input
                    name="oldPassword"
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                  />
                  <FormErrorMessage>{passwordErrors.oldPassword}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={!!passwordErrors.newPassword}>
                  <FormLabel>New Password</FormLabel>
                  <Input
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                  <FormErrorMessage>{passwordErrors.newPassword}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={!!passwordErrors.confirmPassword}>
                  <FormLabel>Confirm New Password</FormLabel>
                  <Input
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                  <FormErrorMessage>{passwordErrors.confirmPassword}</FormErrorMessage>
                </FormControl>
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                isLoading={isChangingPassword}
                type="submit"
              >
                Change Password
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

// Wrap component with auth protection
export default withAuth(ProfilePage); 