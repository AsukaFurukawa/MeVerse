import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  Box, 
  Container, 
  Flex, 
  Heading, 
  Text, 
  Button, 
  useColorMode, 
  Icon,
  HStack
} from '@chakra-ui/react';
import { 
  FaMoon, 
  FaSun, 
  FaRobot,
  FaHome,
  FaArrowLeft
} from 'react-icons/fa';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// Import our components
import AvatarDisplay from '../components/AvatarDisplay';
import ChatInterface from '../components/ChatInterface';

// Create motion components from Chakra components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionButton = motion(Button);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

// Custom cursor component
const CursorFollower = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveringButton, setHoveringButton] = useState(false);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    const handleMouseEnter = () => setHoveringButton(true);
    const handleMouseLeave = () => setHoveringButton(false);
    
    const buttons = document.querySelectorAll('button:not([disabled]), a:not([disabled])');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', handleMouseEnter);
      button.addEventListener('mouseleave', handleMouseLeave);
    });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      buttons.forEach(button => {
        button.removeEventListener('mouseenter', handleMouseEnter);
        button.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);
  
  return (
    <motion.div
      className="cursor-follower"
      animate={{
        x: mousePosition.x - 10,
        y: mousePosition.y - 10,
        scale: hoveringButton ? 1.5 : 1,
      }}
      transition={{
        type: "spring",
        damping: 30,
        stiffness: 200,
        mass: 0.5
      }}
    />
  );
};

export default function ChatPage() {
  const { colorMode, toggleColorMode } = useColorMode();
  const router = useRouter();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        duration: 0.3 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15 
      }
    },
    exit: { 
      y: -20, 
      opacity: 0,
      transition: { 
        duration: 0.2 
      }
    }
  };

  // Parallax scroll effects
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  
  const navigateToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <>
      <CursorFollower />
      
      <Head>
        <title>Chat | MeVerse - Your Digital Twin</title>
        <meta name="description" content="Chat with your MeVerse digital twin" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AnimatePresence mode="wait">
        <MotionBox 
          as="main" 
          minH="100vh" 
          bg={colorMode === 'dark' ? 'dark.200' : 'gray.50'} 
          position="relative" 
          overflow="hidden"
          key="chat-page"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
        >
          {/* Dynamic background with animation effects */}
          <MotionBox
            position="absolute"
            top="0"
            left="0"
            right="0"
            height="100vh"
            zIndex="0"
            style={{ y: backgroundY }}
            opacity={0.15}
            bgGradient={colorMode === 'dark' 
              ? 'radial-gradient(circle at top right, accent.purple, transparent 60%), radial-gradient(circle at bottom left, accent.blue, transparent 60%)' 
              : 'radial-gradient(circle at top right, brand.300, transparent 60%), radial-gradient(circle at bottom left, accent.blue, transparent 60%)'
            }
          />
          
          {/* Floating elements for aesthetic */}
          <MotionBox
            position="absolute"
            width="300px"
            height="300px"
            borderRadius="full"
            bg={colorMode === 'dark' ? 'rgba(106, 38, 255, 0.03)' : 'rgba(106, 38, 255, 0.05)'}
            filter="blur(60px)"
            top="10%"
            right="-150px"
            zIndex="0"
            animate={{ 
              y: [0, -10, 0], 
              transition: { 
                repeat: Infinity, 
                repeatType: "mirror", 
                duration: 3, 
                ease: "easeInOut" 
              } 
            }}
          />
          
          <MotionBox
            position="absolute"
            width="250px"
            height="250px"
            borderRadius="full"
            bg={colorMode === 'dark' ? 'rgba(54, 214, 255, 0.03)' : 'rgba(54, 214, 255, 0.05)'}
            filter="blur(50px)"
            bottom="10%"
            left="-100px"
            zIndex="0"
            animate={{ 
              scale: [1, 1.03, 1], 
              opacity: [0.8, 1, 0.8], 
              transition: { 
                repeat: Infinity, 
                repeatType: "mirror", 
                duration: 2, 
                ease: "easeInOut" 
              } 
            }}
          />
          
          <Flex 
            as="nav" 
            align="center" 
            justify="space-between" 
            wrap="wrap" 
            padding="1.5rem" 
            backdropFilter="blur(10px)"
            bg={colorMode === 'dark' ? 'rgba(22, 23, 43, 0.8)' : 'rgba(255, 255, 255, 0.8)'}
            color={colorMode === 'dark' ? 'white' : 'gray.800'}
            boxShadow="sm"
            position="sticky"
            top="0"
            zIndex="sticky"
            transition="all 0.3s ease"
          >
            <MotionFlex 
              align="center" 
              mr={5}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <MotionBox
                as={Flex}
                borderRadius="full"
                p={1}
                mr={2}
                alignItems="center"
                animate={{ 
                  boxShadow: [
                    "0 0 0 rgba(106, 38, 255, 0.4)",
                    "0 0 15px rgba(106, 38, 255, 0.6)",
                    "0 0 0 rgba(106, 38, 255, 0.4)"
                  ]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "mirror"
                }}
                onClick={() => router.push('/')}
                cursor="pointer"
              >
                <Icon as={FaRobot} w={8} h={8} color="brand.500" />
              </MotionBox>
              <Heading as="h1" size="lg" letterSpacing="tight" fontFamily="heading">
                MeVerse
              </Heading>
            </MotionFlex>

            <HStack spacing={3}>
              <MotionButton 
                colorScheme="brand"
                variant="outline"
                size="sm"
                leftIcon={<FaHome />}
                onClick={navigateToDashboard}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Dashboard
              </MotionButton>
              <MotionButton 
                colorScheme="gray" 
                variant="ghost" 
                size="sm"
                onClick={toggleColorMode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon as={colorMode === 'dark' ? FaSun : FaMoon} />
              </MotionButton>
            </HStack>
          </Flex>

          <Container maxW="container.xl" position="relative" zIndex="1" py={{ base: 4, md: 8 }}>
            {/* Chat layout */}
            <MotionFlex
              h="calc(100vh - 160px)"
              direction={{ base: "column", lg: "row" }} 
              borderRadius="xl" 
              boxShadow="2xl"
              bg={colorMode === 'dark' ? 'gray.800' : 'white'}
              overflow="hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring",
                damping: 20,
                stiffness: 100
              }}
            >
              <Box 
                w={{ base: "100%", lg: "35%" }} 
                h={{ base: "40%", lg: "100%" }}
                bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}
                borderRight={{ base: "none", lg: "1px solid" }}
                borderBottom={{ base: "1px solid", lg: "none" }}
                borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                p={4}
                position="relative"
                overflow="hidden"
              >
                {/* Background effect */}
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  right="0"
                  bottom="0"
                  bgGradient={colorMode === 'dark' 
                    ? "linear(to-b, gray.900, rgba(23, 25, 35, 0.8))" 
                    : "linear(to-b, gray.50, rgba(247, 250, 252, 0.8))"}
                  opacity={0.8}
                  zIndex={0}
                />
                
                {/* Floating background orbs */}
                <MotionBox
                  position="absolute"
                  width="200px"
                  height="200px"
                  borderRadius="full"
                  bg={colorMode === 'dark' ? 'rgba(106, 38, 255, 0.03)' : 'rgba(106, 38, 255, 0.04)'}
                  filter="blur(40px)"
                  top="20%"
                  left="-100px"
                  zIndex={0}
                  animate={{
                    x: [0, 30, 0],
                    y: [0, -20, 0],
                    transition: {
                      repeat: Infinity,
                      duration: 15,
                      ease: "easeInOut"
                    }
                  }}
                />
                
                <MotionBox
                  position="absolute"
                  width="180px"
                  height="180px"
                  borderRadius="full"
                  bg={colorMode === 'dark' ? 'rgba(54, 214, 255, 0.03)' : 'rgba(54, 214, 255, 0.04)'}
                  filter="blur(30px)"
                  bottom="10%"
                  right="-60px"
                  zIndex={0}
                  animate={{
                    x: [0, -20, 0],
                    y: [0, 40, 0],
                    transition: {
                      repeat: Infinity,
                      duration: 18,
                      ease: "easeInOut"
                    }
                  }}
                />
                
                <MotionBox
                  position="relative"
                  zIndex={1}
                  animate={{
                    y: [0, -10, 0],
                    transition: {
                      repeat: Infinity,
                      duration: 4,
                      ease: "easeInOut"
                    }
                  }}
                >
                  <AvatarDisplay 
                    size="lg" 
                    mood="neutral" 
                    interactive={true} 
                  />
                </MotionBox>
                
                <MotionHeading
                  as="h2"
                  size="md"
                  mt={6}
                  textAlign="center"
                  position="relative"
                  zIndex={1}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Your Digital Twin
                </MotionHeading>
                
                <MotionText
                  fontSize="sm"
                  color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}
                  textAlign="center"
                  mt={2}
                  maxW="80%"
                  position="relative"
                  zIndex={1}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  Ask anything. Your twin knows you better than you know yourself.
                </MotionText>
              </Box>
              
              <Box 
                w={{ base: "100%", lg: "65%" }} 
                h={{ base: "60%", lg: "100%" }}
              >
                <ChatInterface 
                  onClose={navigateToDashboard} 
                  onNavigateTab={(tabIndex) => {
                    router.push('/dashboard');
                  }}
                />
              </Box>
            </MotionFlex>
          </Container>

          <Box 
            as="footer" 
            py={4} 
            textAlign="center" 
            borderTop="1px solid"
            borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
            mt={4}
            bg={colorMode === 'dark' ? 'rgba(22, 23, 43, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
            backdropFilter="blur(10px)"
          >
            <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
              © 2023 MeVerse. Your Digital Twin.
            </Text>
          </Box>
        </MotionBox>
      </AnimatePresence>
    </>
  );
} 