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
  FaChartLine
} from 'react-icons/fa';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// Import our components
import GrowthTracker from '../components/GrowthTracker';

// Create motion components from Chakra components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionButton = motion(Button);
const MotionHeading = motion(Heading);

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

export default function GrowthPage() {
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
        <title>Growth Tracker | MeVerse - Your Digital Twin</title>
        <meta name="description" content="Track your personal growth patterns with MeVerse" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AnimatePresence mode="wait">
        <MotionBox 
          as="main" 
          minH="100vh" 
          bg={colorMode === 'dark' ? 'dark.200' : 'gray.50'} 
          position="relative" 
          overflow="hidden"
          key="growth-page"
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
              ? 'radial-gradient(circle at top right, pink.600, transparent 60%), radial-gradient(circle at bottom left, pink.400, transparent 60%)' 
              : 'radial-gradient(circle at top right, pink.300, transparent 60%), radial-gradient(circle at bottom left, pink.200, transparent 60%)'
            }
          />
          
          {/* Floating elements for aesthetic */}
          <MotionBox
            position="absolute"
            width="300px"
            height="300px"
            borderRadius="full"
            bg={colorMode === 'dark' ? 'rgba(236, 64, 122, 0.05)' : 'rgba(236, 64, 122, 0.05)'}
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
            bg={colorMode === 'dark' ? 'rgba(236, 64, 122, 0.03)' : 'rgba(236, 64, 122, 0.03)'}
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
                borderRadius="full"
                p={1}
                mr={2}
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
            <MotionBox 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 18, stiffness: 60 }}
              mb={8}
            >
              <Flex align="center" mb={2}>
                <Icon as={FaChartLine} mr={3} color="pink.400" fontSize="2xl" />
                <MotionHeading
                  as="h2"
                  fontSize="3xl"
                  bgGradient={colorMode === 'dark' 
                    ? "linear(to-r, pink.400, purple.400)" 
                    : "linear(to-r, pink.500, purple.500)"}
                  bgClip="text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Growth Tracker
                </MotionHeading>
              </Flex>
              <Text color={colorMode === 'dark' ? 'gray.400' : 'gray.600'} ml={10}>
                Monitor your patterns and track your personal development journey
              </Text>
            </MotionBox>
            
            <MotionBox
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                damping: 20, 
                stiffness: 80,
                delay: 0.2
              }}
            >
              <GrowthTracker />
            </MotionBox>
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