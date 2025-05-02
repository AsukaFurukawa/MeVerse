import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { 
  Box, 
  Container, 
  Flex, 
  Heading, 
  Text, 
  Button, 
  useColorMode, 
  Icon,
  Spacer,
  Grid,
  GridItem,
  useBreakpointValue,
  Divider,
  Code,
  HStack,
  Tag,
  VStack
} from '@chakra-ui/react';
import { 
  FaMoon, 
  FaSun, 
  FaRobot, 
  FaUser, 
  FaChartLine, 
  FaCalendarAlt, 
  FaArrowRight, 
  FaCode,
  FaBookOpen,
  FaBrain
} from 'react-icons/fa';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// Import our components
import AvatarDisplay from '../components/AvatarDisplay';
import ChatInterface from '../components/ChatInterface';

// Create motion components from Chakra components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionContainer = motion(Container);
const MotionButton = motion(Button);

export default function Home() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [showChat, setShowChat] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cursorStyle, setCursorStyle] = useState({ scale: 1 });
  const cursorRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.15
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
    }
  };
  
  const featureVariants = {
    initial: {
      opacity: 0,
      y: 50,
    },
    inView: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, 0.05, -0.01, 0.9],
      },
    },
  };

  // Parallax scroll effects
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  
  // Custom cursor effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleButtonHover = () => {
      setCursorStyle({ scale: 1.5 });
    };
    
    const handleButtonLeave = () => {
      setCursorStyle({ scale: 1 });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    const buttons = document.querySelectorAll('button, a');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', handleButtonHover);
      button.addEventListener('mouseleave', handleButtonLeave);
    });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      buttons.forEach(button => {
        button.removeEventListener('mouseenter', handleButtonHover);
        button.removeEventListener('mouseleave', handleButtonLeave);
      });
    };
  }, []);
  
  useEffect(() => {
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${cursorPosition.x - 10}px, ${cursorPosition.y - 10}px) scale(${cursorStyle.scale})`;
    }
  }, [cursorPosition, cursorStyle]);
  
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <>
      {!isMobile && <Box ref={cursorRef} className="cursor-follower" />}
      
      <Head>
        <title>MeVerse - Your Digital Twin</title>
        <meta name="description" content="MeVerse - A digital twin that learns from your behavior and provides guidance" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box as="main" minH="100vh" bg={colorMode === 'dark' ? 'dark.200' : 'gray.50'} position="relative" overflow="hidden">
        {/* Dynamic background */}
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
            <Icon as={FaRobot} w={8} h={8} mr={3} color="brand.500" />
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

        <Container maxW="container.xl" position="relative" zIndex="1">
          {!showChat ? (
            <AnimatePresence>
              <MotionFlex
                ref={heroRef}
                direction="column" 
                align="center" 
                textAlign="center" 
                py={20}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <MotionHeading 
                  as="h2" 
                  fontSize={{ base: "4xl", md: "6xl" }} 
                  fontWeight="bold" 
                  mb={4}
                  bgGradient="linear(to-r, accent.blue, brand.500, accent.purple)"
                  bgClip="text"
                  variants={itemVariants}
                >
                  Your Digital Twin
                </MotionHeading>
                
                <MotionText 
                  fontSize={{ base: "lg", md: "2xl" }} 
                  mb={8} 
                  maxW="container.md"
                  variants={itemVariants}
                >
                  MeVerse learns from your behavior, habits, moods, and preferences to create a digital version of you that can predict how you would respond and provide guidance.
                </MotionText>
                
                <MotionBox variants={itemVariants}>
                  <MotionButton 
                    size="lg" 
                    rightIcon={<Icon as={FaArrowRight} />}
                    onClick={() => setShowChat(true)}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: '0 0 20px rgba(106, 38, 255, 0.6)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Talk to Your Twin
                  </MotionButton>
                </MotionBox>
                
                <MotionBox 
                  w="100%" 
                  h="1px" 
                  bg="gray.200" 
                  my={20} 
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 0.5, scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                />
                
                <MotionHeading 
                  as="h3" 
                  size="lg" 
                  mb={12}
                  fontFamily="heading"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                >
                  Discover how MeVerse can transform your life
                </MotionHeading>

                <Grid 
                  templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
                  gap={8}
                  width="100%"
                >
                  {[
                    { 
                      title: 'Personality Profile', 
                      icon: FaUser,
                      description: 'Discover insights about your personality traits and behaviors.',
                      color: 'accent.blue' 
                    },
                    { 
                      title: 'Future Simulations', 
                      icon: FaRobot,
                      description: 'Explore "what if" scenarios and get guidance on decisions.',
                      color: 'accent.purple' 
                    },
                    { 
                      title: 'Growth Tracking', 
                      icon: FaChartLine,
                      description: 'Visualize your evolution over time and track progress.',
                      color: 'accent.pink' 
                    },
                    { 
                      title: 'Habit Management', 
                      icon: FaCalendarAlt,
                      description: 'Log and analyze your daily habits and activities.',
                      color: 'accent.green' 
                    }
                  ].map((feature, index) => (
                    <MotionBox 
                      key={index}
                      p={6}
                      borderRadius="xl"
                      boxShadow="card"
                      bg={colorMode === 'dark' ? 'dark.100' : 'white'}
                      height="100%"
                      display="flex"
                      flexDirection="column"
                      justifyContent="flex-start"
                      position="relative"
                      overflow="hidden"
                      variants={featureVariants}
                      initial="initial"
                      whileInView="inView"
                      viewport={{ once: true, amount: 0.3 }}
                      whileHover={{ 
                        y: -5,
                        boxShadow: colorMode === 'dark' ? 'neon' : 'card',
                        transition: { duration: 0.2 }
                      }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Box 
                        position="absolute" 
                        top="0" 
                        right="0" 
                        width="150px" 
                        height="150px" 
                        opacity="0.05"
                        borderRadius="full"
                        bg={feature.color}
                        transform="translate(30%, -30%)"
                      />
                      
                      <Flex align="center" mb={4}>
                        <Flex
                          align="center"
                          justify="center" 
                          w="50px" 
                          h="50px" 
                          borderRadius="lg" 
                          bg={colorMode === 'dark' ? `${feature.color}25` : `${feature.color}15`}
                          color={feature.color}
                          mr={4}
                        >
                          <Icon as={feature.icon} w={6} h={6} />
                        </Flex>
                        <Heading as="h4" size="md" fontWeight="semibold">{feature.title}</Heading>
                      </Flex>
                      <Text fontSize="md" mt={2} color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
                        {feature.description}
                      </Text>
                      <Spacer />
                      <Button 
                        variant="ghost" 
                        colorScheme="purple" 
                        size="sm" 
                        alignSelf="flex-start" 
                        mt={4}
                        rightIcon={<Icon as={FaArrowRight} />}
                      >
                        Learn more
                      </Button>
                    </MotionBox>
                  ))}
                </Grid>
                
                {/* Code snippet section */}
                <MotionBox 
                  mt={20} 
                  py={16} 
                  width="100%"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <Heading as="h3" size="lg" mb={6} textAlign="center">Powered by Advanced AI Technology</Heading>
                  <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8} alignItems="center">
                    <GridItem>
                      <VStack align="flex-start" spacing={4}>
                        <Heading as="h4" size="md" color="accent.blue">
                          <Icon as={FaCode} mr={2} />
                          Modern Tech Stack
                        </Heading>
                        <Text>
                          Built with React, Next.js, and FastAPI, MeVerse leverages the latest technologies to provide a seamless experience.
                        </Text>
                        
                        <Heading as="h4" size="md" color="accent.purple" mt={4}>
                          <Icon as={FaBrain} mr={2} />
                          Advanced AI Models
                        </Heading>
                        <Text>
                          Our personality engine uses sophisticated machine learning algorithms to understand your unique traits and preferences.
                        </Text>
                        
                        <Heading as="h4" size="md" color="accent.pink" mt={4}>
                          <Icon as={FaBookOpen} mr={2} />
                          Constant Learning
                        </Heading>
                        <Text>
                          Your digital twin evolves over time, continuously learning from your interactions and improving its predictions.
                        </Text>
                      </VStack>
                    </GridItem>
                    
                    <GridItem>
                      <Box 
                        bg={colorMode === 'dark' ? 'dark.300' : 'gray.50'} 
                        p={4} 
                        borderRadius="md" 
                        boxShadow="card"
                        position="relative"
                        overflow="hidden"
                      >
                        <Box 
                          position="absolute" 
                          top="10px" 
                          left="10px" 
                          right="10px" 
                          height="30px" 
                          bg={colorMode === 'dark' ? 'dark.100' : 'white'} 
                          borderRadius="md"
                          display="flex"
                          alignItems="center"
                          px={4}
                        >
                          <Box w="12px" h="12px" borderRadius="full" bg="red.400" mr={2} />
                          <Box w="12px" h="12px" borderRadius="full" bg="yellow.400" mr={2} />
                          <Box w="12px" h="12px" borderRadius="full" bg="green.400" mr={2} />
                          <Text fontSize="xs" color="gray.500">personality_engine.py</Text>
                        </Box>
                        
                        <Code mt={10} p={4} display="block" whiteSpace="pre" overflowX="auto" fontFamily="mono" fontSize="sm" bg="transparent">
{`# Example AI code snippet
import numpy as np
from sklearn.cluster import KMeans
from tensorflow import keras

class PersonalityEngine:
    def __init__(self):
        self.traits = {
            "openness": 0.0,
            "conscientiousness": 0.0,
            "extraversion": 0.0,
            "agreeableness": 0.0,
            "neuroticism": 0.0
        }
        self.model = self._build_model()
    
    def _build_model(self):
        model = keras.Sequential([
            keras.layers.Dense(64, activation='relu'),
            keras.layers.Dense(32, activation='relu'),
            keras.layers.Dense(5, activation='sigmoid')
        ])
        model.compile(
            optimizer='adam',
            loss='mse'
        )
        return model
        
    def analyze_behavior(self, data):
        # Process user data
        features = self._extract_features(data)
        predictions = self.model.predict(features)
        
        # Update personality traits
        self._update_traits(predictions)
        
        return self.traits`}
                        </Code>
                      </Box>
                    </GridItem>
                  </Grid>
                </MotionBox>
                
                {/* Avatar preview with subtle animations */}
                <Flex justify="center" my={20} width="100%">
                  <MotionBox
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    viewport={{ once: true }}
                  >
                    <VStack spacing={8}>
                      <Heading as="h3" size="lg">Meet Your Digital Twin</Heading>
                      <AvatarDisplay 
                        size="xl" 
                        interactive={true} 
                        mood="neutral"
                      />
                      <Tag size="lg" colorScheme="purple">Customizable Appearance</Tag>
                    </VStack>
                  </MotionBox>
                </Flex>
                
                {/* Call to action */}
                <MotionBox
                  py={20}
                  width="100%"
                  textAlign="center"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <Heading as="h2" size="xl" mb={6}>Ready to meet your digital twin?</Heading>
                  <Text fontSize="xl" mb={8} maxW="container.md" mx="auto">
                    Start your journey with MeVerse today and discover a new way to understand yourself.
                  </Text>
                  <MotionButton
                    size="lg"
                    fontSize="xl"
                    height="70px"
                    px={8}
                    colorScheme="purple"
                    onClick={() => setShowChat(true)}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: '0 0 30px rgba(106, 38, 255, 0.8)'
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Begin Your Experience
                  </MotionButton>
                </MotionBox>
              </MotionFlex>
            </AnimatePresence>
          ) : (
            <Flex h="80vh" direction="column" pt={6}>
              <MotionButton 
                alignSelf="flex-start" 
                mb={4} 
                onClick={() => setShowChat(false)}
                leftIcon={<Icon as={FaArrowRight} transform="rotate(180deg)" />}
                variant="ghost"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                Back to Home
              </MotionButton>
              <MotionBox 
                flex="1" 
                borderRadius="xl" 
                boxShadow="card" 
                bg={colorMode === 'dark' ? 'dark.100' : 'white'}
                overflow="hidden"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <ChatInterface userName="You" />
              </MotionBox>
            </Flex>
          )}
        </Container>

        <Box 
          as="footer" 
          py={8} 
          textAlign="center" 
          mt={20} 
          bg={colorMode === 'dark' ? 'rgba(15, 15, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)'}
          backdropFilter="blur(10px)"
          borderTop="1px solid"
          borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
          color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}
        >
          <Text>MeVerse © {new Date().getFullYear()} - Your Digital Twin</Text>
        </Box>
      </Box>
    </>
  );
} 