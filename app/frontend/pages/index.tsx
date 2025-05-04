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
  VStack,
  HStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { 
  FaMoon, 
  FaSun, 
  FaRobot, 
  FaArrowRight 
} from 'react-icons/fa';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// Create motion components from Chakra components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionButton = motion(Button);

// Custom cursor component
const CursorFollower = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveringButton, setHoveringButton] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  useEffect(() => {
    if (isMobile) return;
    
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
  }, [isMobile]);
  
  if (isMobile) return null;
  
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

// Floating animated particles
const FloatingParticles = () => {
  const [particles, setParticles] = useState<React.ReactNode[]>([]);
  
  useEffect(() => {
    const generatedParticles = [];
    const count = 20;
    
    for (let i = 0; i < count; i++) {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = Math.random() * 15 + 5;
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * 5;
      
      generatedParticles.push(
        <MotionBox
          key={i}
          position="absolute"
          left={`${x}%`}
          top={`${y}%`}
          width={`${size}px`}
          height={`${size}px`}
          borderRadius="full"
          bg="rgba(106, 38, 255, 0.2)"
          filter="blur(8px)"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.5, 0],
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            delay: delay,
            ease: "easeInOut"
          }}
        />
      );
    }
    
    setParticles(generatedParticles);
  }, []);
  
  return <>{particles}</>;
};

export default function LandingPage() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [isLoading, setIsLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Parallax scroll effects
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      transition: {
        ease: "easeOut",
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
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
      opacity: 0
    }
  };
  
  const logoVariants = {
    hidden: { scale: 0, opacity: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      rotate: 0,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 20,
        delay: 0.5
      }
    }
  };
  
  const titleVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.8
      }
    }
  };
  
  const subtitleVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 1.2
      }
    }
  };
  
  const ctaVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 1.6
      }
    }
  };
  
  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 0 20px rgba(106, 38, 255, 0.7)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.95
    }
  };
  
  const glowCircleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.5,
        duration: 1.5,
        ease: "easeOut"
      }
    }
  };
  
  const handleEnter = () => {
    router.push('/dashboard');
  };

  return (
    <>
      <CursorFollower />
      <Head>
        <title>MeVerse - Your Digital Twin</title>
        <meta name="description" content="MeVerse - A digital twin that learns from your behavior and provides guidance" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AnimatePresence>
        <MotionBox 
          as="main" 
          minH="100vh" 
          bg={colorMode === 'dark' ? 'dark.200' : 'gray.50'} 
          position="relative" 
          overflow="hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Dynamic background */}
          <MotionBox
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            zIndex="0"
            style={{ y: backgroundY }}
            bgGradient={colorMode === 'dark' 
              ? 'radial-gradient(circle at top right, accent.purple, transparent 60%), radial-gradient(circle at bottom left, accent.blue, transparent 60%)' 
              : 'radial-gradient(circle at top right, brand.300, transparent 60%), radial-gradient(circle at bottom left, accent.blue, transparent 60%)'
            }
            opacity={0.2}
          />
          
          {/* Animated particles background */}
          <Box position="absolute" width="100%" height="100%" overflow="hidden" zIndex="0">
            <FloatingParticles />
          </Box>
          
          {/* Large glowing circle */}
          <MotionBox
            position="absolute"
            width="80vh"
            height="80vh"
            borderRadius="full"
            bg={colorMode === 'dark' ? 'rgba(106, 38, 255, 0.03)' : 'rgba(106, 38, 255, 0.05)'}
            filter="blur(100px)"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            zIndex="0"
            variants={glowCircleVariants}
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
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  boxShadow: [
                    "0 0 0 rgba(106, 38, 255, 0.4)",
                    "0 0 20px rgba(106, 38, 255, 0.6)",
                    "0 0 0 rgba(106, 38, 255, 0.4)"
                  ]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "mirror"
                }}
              >
                <Icon as={FaRobot} w={8} h={8} color="brand.500" />
              </MotionBox>
              <Heading as="h1" size="lg" letterSpacing="tight" fontFamily="heading">
                MeVerse
              </Heading>
            </MotionFlex>

            <HStack spacing={3}>
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
              <MotionButton
                bg="brand.500"
                color="white"
                size="sm"
                _hover={{ bg: "brand.600" }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 0 15px rgba(106, 38, 255, 0.5)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </MotionButton>
            </HStack>
          </Flex>

          {/* Hero Section */}
          <Container maxW="container.xl" position="relative" zIndex="1">
            <Flex 
              direction="column" 
              align="center" 
              justify="center" 
              py={{ base: 20, md: 32 }}
              minH="80vh"
              textAlign="center"
              ref={heroRef}
            >
              {/* Logo Animation */}
              <MotionBox
                variants={logoVariants}
                mb={8}
                p={4}
                borderRadius="full"
                bg={colorMode === 'dark' ? 'rgba(106, 38, 255, 0.1)' : 'rgba(106, 38, 255, 0.05)'}
                boxShadow="0 0 40px rgba(106, 38, 255, 0.3)"
              >
                <Icon 
                  as={FaRobot} 
                  w={{ base: 16, md: 24 }} 
                  h={{ base: 16, md: 24 }} 
                  color="brand.500" 
                />
              </MotionBox>
              
              {/* Main Title */}
              <MotionHeading
                variants={titleVariants}
                as="h2" 
                fontSize={{ base: "4xl", md: "6xl" }}
                fontWeight="bold"
                mb={4}
                bgGradient={colorMode === 'dark' 
                  ? "linear(to-r, brand.400, accent.purple, accent.blue)" 
                  : "linear(to-r, brand.500, accent.purple, accent.blue)"}
                bgClip="text"
                letterSpacing="tight"
              >
                Your Digital Twin
              </MotionHeading>
              
              {/* Subtitle */}
              <MotionText
                variants={subtitleVariants}
                fontSize={{ base: "lg", md: "xl" }}
                maxW="container.md"
                mb={10}
                color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
              >
                MeVerse learns from your behavior, predicts your future actions, and helps guide your growth.
                Your personal AI that knows you better than you know yourself.
              </MotionText>
              
              {/* CTA Button */}
              <MotionBox variants={ctaVariants}>
                <MotionButton
                  colorScheme="brand"
                  size="lg"
                  rightIcon={<FaArrowRight />}
                  px={8}
                  py={7}
                  fontSize="lg"
                  fontWeight="bold"
                  onClick={handleEnter}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  _hover={{}}
                  bgGradient="linear(to-r, brand.500, accent.purple)"
                  _active={{
                    bgGradient: "linear(to-r, brand.600, accent.purple)"
                  }}
                >
                  Enter MeVerse
                </MotionButton>
              </MotionBox>
              
              {/* Features preview */}
              <MotionBox
                variants={itemVariants}
                mt={16}
                w="100%"
              >
                <Flex 
                  direction={{ base: "column", md: "row" }}
                  justify="center"
                  align="center"
                  wrap="wrap"
                  gap={6}
                >
                  {[
                    { title: "Digital Twin", description: "AI that learns your personality" },
                    { title: "Growth Tracking", description: "Monitor your patterns and progress" },
                    { title: "Future Simulation", description: "Predict possible outcomes" },
                  ].map((feature, idx) => (
                    <MotionBox
                      key={idx}
                      p={6}
                      bg={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)'}
                      backdropFilter="blur(10px)"
                      borderRadius="xl"
                      boxShadow="lg"
                      flex="1"
                      minW={{ base: "100%", md: "250px" }}
                      maxW={{ base: "100%", md: "300px" }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        transition: { delay: 1.8 + idx * 0.2 }
                      }}
                      whileHover={{
                        y: -5,
                        boxShadow: "xl",
                        transition: { duration: 0.2 }
                      }}
                    >
                      <Heading size="md" mb={2} color={colorMode === 'dark' ? 'white' : 'gray.700'}>
                        {feature.title}
                      </Heading>
                      <Text color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                        {feature.description}
                      </Text>
                    </MotionBox>
                  ))}
                </Flex>
              </MotionBox>
            </Flex>
          </Container>

          <Box 
            as="footer" 
            py={6} 
            textAlign="center" 
            borderTop="1px solid"
            borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
            mt={8}
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