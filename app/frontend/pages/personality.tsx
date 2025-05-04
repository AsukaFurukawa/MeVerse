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
  HStack,
  VStack,
  Grid,
  GridItem,
  Badge,
  Progress,
  Divider
} from '@chakra-ui/react';
import { 
  FaMoon, 
  FaSun, 
  FaRobot,
  FaHome,
  FaArrowLeft,
  FaBrain
} from 'react-icons/fa';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// Create motion components from Chakra components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionButton = motion(Button);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionProgress = motion(Progress);

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

export default function PersonalityPage() {
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

  // Sample personality data
  const personalityTraits = [
    { trait: "Openness", value: 75, description: "High curiosity and creativity, enjoys new experiences" },
    { trait: "Conscientiousness", value: 82, description: "Disciplined, organized, and achievement-oriented" },
    { trait: "Extraversion", value: 60, description: "Moderately social and energetic in group settings" },
    { trait: "Agreeableness", value: 88, description: "Compassionate, cooperative, and values harmony" },
    { trait: "Neuroticism", value: 35, description: "Generally emotionally stable with occasional stress responses" }
  ];

  const personalityInsights = [
    "You tend to thrive in structured environments while still appreciating creative freedom",
    "Your communication style is direct but considerate of others' feelings",
    "You recharge best through a mix of social interaction and quiet reflection time",
    "Under pressure, you typically seek logical solutions rather than emotional responses",
    "Your decision making usually balances analytical thinking with intuition"
  ];

  return (
    <>
      <CursorFollower />
      
      <Head>
        <title>Personality Engine | MeVerse - Your Digital Twin</title>
        <meta name="description" content="Explore your personality profile in MeVerse" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AnimatePresence mode="wait">
        <MotionBox 
          as="main" 
          minH="100vh" 
          bg={colorMode === 'dark' ? 'dark.200' : 'gray.50'} 
          position="relative" 
          overflow="hidden"
          key="personality-page"
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
              ? 'radial-gradient(circle at top right, purple.400, transparent 60%), radial-gradient(circle at bottom left, blue.400, transparent 60%)' 
              : 'radial-gradient(circle at top right, purple.200, transparent 60%), radial-gradient(circle at bottom left, blue.200, transparent 60%)'
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
            <MotionFlex 
              direction="column" 
              align="center" 
              justify="flex-start" 
              mb={6}
              variants={itemVariants}
            >
              <MotionBox
                mb={4}
                p={3}
                borderRadius="full"
                bg={colorMode === 'dark' ? 'rgba(106, 38, 255, 0.1)' : 'rgba(106, 38, 255, 0.05)'}
                boxShadow="0 0 20px rgba(106, 38, 255, 0.3)"
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 0 20px rgba(106, 38, 255, 0.3)",
                    "0 0 30px rgba(106, 38, 255, 0.5)",
                    "0 0 20px rgba(106, 38, 255, 0.3)"
                  ]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3 
                }}
              >
                <Icon as={FaBrain} w={10} h={10} color="purple.500" />
              </MotionBox>
              
              <MotionHeading
                as="h2"
                size="xl"
                textAlign="center"
                bgGradient="linear(to-r, purple.400, blue.500)"
                bgClip="text"
                variants={itemVariants}
              >
                Personality Engine
              </MotionHeading>
              
              <MotionText
                fontSize="lg"
                textAlign="center"
                maxW="container.md"
                mt={2}
                color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
                variants={itemVariants}
              >
                Discover insights about your personality traits, behaviors, and tendencies
              </MotionText>
            </MotionFlex>

            <Grid 
              templateColumns={{ base: "1fr", lg: "1fr 1fr" }} 
              gap={8}
              mt={8}
            >
              <GridItem>
                <MotionBox
                  bg={colorMode === 'dark' ? 'gray.800' : 'white'}
                  borderRadius="xl"
                  p={6}
                  boxShadow="xl"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  height="100%"
                >
                  <Heading size="md" mb={4} display="flex" alignItems="center">
                    <Icon as={FaBrain} mr={2} color="purple.500" />
                    Personality Traits
                  </Heading>
                  
                  <VStack spacing={6} align="stretch">
                    {personalityTraits.map((trait, index) => (
                      <MotionBox 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          transition: { delay: 0.2 + index * 0.1 }
                        }}
                      >
                        <Flex justify="space-between" align="center" mb={1}>
                          <Text fontWeight="medium">{trait.trait}</Text>
                          <Badge colorScheme={trait.value > 70 ? "green" : trait.value > 40 ? "blue" : "orange"}>
                            {trait.value}%
                          </Badge>
                        </Flex>
                        <MotionProgress 
                          value={trait.value} 
                          colorScheme={trait.value > 70 ? "green" : trait.value > 40 ? "blue" : "orange"}
                          borderRadius="full"
                          height="8px"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                        />
                        <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'} mt={1}>
                          {trait.description}
                        </Text>
                      </MotionBox>
                    ))}
                  </VStack>
                </MotionBox>
              </GridItem>
              
              <GridItem>
                <MotionBox
                  bg={colorMode === 'dark' ? 'gray.800' : 'white'}
                  borderRadius="xl"
                  p={6}
                  boxShadow="xl"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  height="100%"
                >
                  <Heading size="md" mb={4}>Personality Insights</Heading>
                  
                  <VStack spacing={4} align="stretch">
                    {personalityInsights.map((insight, index) => (
                      <MotionBox
                        key={index}
                        p={4}
                        borderRadius="lg"
                        bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ 
                          opacity: 1, 
                          x: 0,
                          transition: { delay: 0.3 + index * 0.1 }
                        }}
                        whileHover={{ 
                          scale: 1.03,
                          boxShadow: "md",
                          transition: { duration: 0.2 }
                        }}
                      >
                        <Text>{insight}</Text>
                      </MotionBox>
                    ))}
                  </VStack>
                  
                  <MotionBox
                    mt={6}
                    p={4}
                    borderRadius="lg"
                    border="1px dashed"
                    borderColor={colorMode === 'dark' ? 'purple.400' : 'purple.200'}
                    bg={colorMode === 'dark' ? 'rgba(128, 90, 213, 0.1)' : 'rgba(128, 90, 213, 0.05)'}
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      transition: { delay: 1 }
                    }}
                  >
                    <Text fontSize="sm" fontStyle="italic">
                      The Personality Engine continually adapts its understanding of you based on your interactions, 
                      communications, and choices within MeVerse.
                    </Text>
                  </MotionBox>
                </MotionBox>
              </GridItem>
            </Grid>
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