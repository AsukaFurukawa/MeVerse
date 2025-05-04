import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Text,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  useColorMode,
  Avatar,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Modified NavLink to prevent a-tag nesting
const NavLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
  const router = useRouter();
  const isActive = router.pathname === href;
  
  return (
    <Box
      as={Link}
      href={href}
      px={2}
      py={1}
      rounded={'md'}
      fontWeight={isActive ? 'bold' : 'normal'}
      color={isActive ? 'brand.500' : 'inherit'}
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('gray.200', 'gray.700'),
      }}
    >
      {children}
    </Box>
  );
};

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  
  return (
    <Box bg={useColorModeValue('white', 'gray.900')} px={4} boxShadow="sm">
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <IconButton
          size={'md'}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={'Open Menu'}
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems={'center'}>
          <Box fontWeight="bold" fontSize="xl">
            <Box
              as={Link}
              href="/"
              color="brand.500"
              _hover={{ textDecoration: 'none' }}
            >
              MeVerse
            </Box>
          </Box>
          <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
            <NavLink href="/">Home</NavLink>
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/journal">Journal</NavLink>
            <NavLink href="/growth">Growth</NavLink>
            <NavLink href="/simulation">Simulation</NavLink>
          </HStack>
        </HStack>
        <Flex alignItems={'center'}>
          <Button onClick={toggleColorMode} mr={4}>
            {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          </Button>
          
          {isAuthenticated ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}
              >
                <Avatar
                  size={'sm'}
                  name={user?.full_name || user?.username}
                />
              </MenuButton>
              <MenuList>
                <MenuItem as={Link} href="/profile">
                  Profile
                </MenuItem>
                <MenuItem as={Link} href="/data">
                  My Data
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={logout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <HStack spacing={4}>
              <Button
                as={Link}
                href="/login"
                variant="ghost"
              >
                Login
              </Button>
              <Button
                as={Link}
                href="/register"
                colorScheme="brand"
                display={{ base: 'none', md: 'inline-flex' }}
              >
                Sign Up
              </Button>
            </HStack>
          )}
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as={'nav'} spacing={4}>
            <NavLink href="/">Home</NavLink>
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/journal">Journal</NavLink>
            <NavLink href="/growth">Growth</NavLink>
            <NavLink href="/simulation">Simulation</NavLink>
            {!isAuthenticated && (
              <>
                <NavLink href="/login">Login</NavLink>
                <NavLink href="/register">Sign Up</NavLink>
              </>
            )}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
} 