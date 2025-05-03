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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Badge
} from '@chakra-ui/react';
import { 
  FaMoon, 
  FaSun, 
  FaRobot,
  FaHome,
  FaDatabase,
  FaSpotify,
  FaRunning,
  FaCalendarAlt,
  FaBook,
  FaTwitter,
  FaEnvelope
} from 'react-icons/fa';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// Create motion components from Chakra components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionButton = motion(Button);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);

// Define color hex values to replace named colors for animations
const COLORS = {
  teal: "#38B2AC",
  green: "#38A169",
  blue: "#3182CE",
  purple: "#805AD5",
  cyan: "#00B5D8",
  pink: "#D53F8C",
  brand: "#6A26FF"
};

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

// Define data source card component
const DataSourceCard = ({ 
  title, 
  icon, 
  description, 
  isConnected, 
  lastSync, 
  dataPoints, 
  bgColor, 
  onClick 
}) => {
  const { colorMode } = useColorMode();
  
  return (
    <MotionBox
      p={5}
      borderRadius="xl"
      bg={colorMode === 'dark' ? 'gray.800' : 'white'}
      boxShadow="0px 4px 10px rgba(0, 0, 0, 0.1)"
      height="100%"
      position="relative"
      overflow="hidden"
      whileHover={{ 
        scale: 1.03, 
        boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.15)",
        borderColor: bgColor
      }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 15
      }}
      cursor="pointer"
      onClick={onClick}
    >
      {/* Colored accent */}
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="7px"
        bg={bgColor}
      />
      
      <Flex align="center" mb={3}>
        <Box
          p={2}
          borderRadius="lg"
          bg={`${bgColor}33`}
          color={bgColor}
          mr={3}
        >
          <Icon as={icon} boxSize={6} />
        </Box>
        <Heading size="md">{title}</Heading>
        <Badge 
          ml="auto" 
          colorScheme={isConnected ? "green" : "gray"}
          variant={isConnected ? "solid" : "outline"}
        >
          {isConnected ? "Connected" : "Not Connected"}
        </Badge>
      </Flex>
      
      <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'} mb={4}>
        {description}
      </Text>
      
      {isConnected && (
        <HStack justify="space-between" mt={3}>
          <Stat size="sm">
            <StatLabel fontSize="xs">Last Sync</StatLabel>
            <StatNumber fontSize="sm">{lastSync}</StatNumber>
          </Stat>
          
          <Stat size="sm" textAlign="right">
            <StatLabel fontSize="xs">Data Points</StatLabel>
            <StatNumber fontSize="sm">{dataPoints.toLocaleString()}</StatNumber>
          </Stat>
        </HStack>
      )}
      
      {!isConnected && (
        <MotionButton
          mt={3}
          size="sm"
          colorScheme="brand"
          width="100%"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Connect
        </MotionButton>
      )}
    </MotionBox>
  );
};

export default function DataPage() {
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

  // Sample data sources
  const dataSources = [
    {
      title: "Fitness Tracking",
      icon: FaRunning,
      description: "Physical activity, workout data, and health metrics from your fitness devices.",
      isConnected: true,
      lastSync: "Today",
      dataPoints: 12453,
      bgColor: COLORS.teal
    },
    {
      title: "Spotify",
      icon: FaSpotify,
      description: "Music preferences, listening habits, and favorite artists.",
      isConnected: true,
      lastSync: "Yesterday",
      dataPoints: 8721,
      bgColor: COLORS.green
    },
    {
      title: "Calendar",
      icon: FaCalendarAlt,
      description: "Schedule, appointments, events, and time management patterns.",
      isConnected: true,
      lastSync: "Today",
      dataPoints: 642,
      bgColor: COLORS.blue
    },
    {
      title: "Reading History",
      icon: FaBook,
      description: "Books read, reading habits, topics of interest, and knowledge areas.",
      isConnected: true, 
      lastSync: "3 days ago",
      dataPoints: 294,
      bgColor: COLORS.purple
    },
    {
      title: "Twitter",
      icon: FaTwitter,
      description: "Social interactions, interests, and communication patterns from Twitter.",
      isConnected: false,
      lastSync: "Never",
      dataPoints: 0,
      bgColor: COLORS.cyan
    },
    {
      title: "Email",
      icon: FaEnvelope,
      description: "Communication patterns, important contacts, and time management insights.",
      isConnected: false,
      lastSync: "Never", 
      dataPoints: 0,
      bgColor: COLORS.pink
    }
  ];

  return (
    <>
      <CursorFollower />
      
      <Head>
        <title>Data Ingestion | MeVerse - Your Digital Twin</title>
        <meta name="description" content="Connect your data sources to MeVerse" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AnimatePresence mode="wait">
        <MotionBox 
          as="main" 
          minH="100vh" 
          bg={colorMode === 'dark' ? 'dark.200' : 'gray.50'} 
          position="relative" 
          overflow="hidden"
          key="data-page"
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
              ? `radial-gradient(circle at top right, ${COLORS.green}, transparent 60%), radial-gradient(circle at bottom left, ${COLORS.blue}, transparent 60%)` 
              : `radial-gradient(circle at top right, #9AE6B4, transparent 60%), radial-gradient(circle at bottom left, #90CDF4, transparent 60%)`
            }
          />
          
          {/* Floating elements for aesthetic */}
          <MotionBox
            position="absolute"
            width="300px"
            height="300px"
            borderRadius="full"
            bg={colorMode === 'dark' ? 'rgba(56, 178, 172, 0.03)' : 'rgba(56, 178, 172, 0.05)'}
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
                <Icon as={FaRobot} w={8} h={8} color={COLORS.brand} />
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
                bg={colorMode === 'dark' ? 'rgba(56, 178, 172, 0.1)' : 'rgba(56, 178, 172, 0.05)'}
                boxShadow="0 0 20px rgba(56, 178, 172, 0.3)"
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 0 20px rgba(56, 178, 172, 0.3)",
                    "0 0 30px rgba(56, 178, 172, 0.5)",
                    "0 0 20px rgba(56, 178, 172, 0.3)"
                  ]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3 
                }}
              >
                <Icon as={FaDatabase} w={10} h={10} color={COLORS.teal} />
              </MotionBox>
              
              <MotionHeading
                as="h2"
                size="xl"
                textAlign="center"
                bgGradient={`linear(to-r, ${COLORS.teal}, ${COLORS.blue})`}
                bgClip="text"
                variants={itemVariants}
              >
                Data Ingestion Engine
              </MotionHeading>
              
              <MotionText
                fontSize="lg"
                textAlign="center"
                maxW="container.md"
                mt={2}
                color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
                variants={itemVariants}
              >
                Connect your digital life to improve your MeVerse experience
              </MotionText>
            </MotionFlex>

            {/* Summary Stats */}
            <MotionFlex 
              justify="center" 
              mb={8}
              variants={itemVariants}
            >
              <SimpleGrid 
                columns={{ base: 1, md: 3 }} 
                spacing={8} 
                width="100%" 
                maxW="container.md"
              >
                <MotionBox
                  p={5}
                  borderRadius="xl"
                  bg={colorMode === 'dark' ? 'gray.800' : 'white'}
                  boxShadow="0px 4px 10px rgba(0, 0, 0, 0.1)"
                  textAlign="center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: 0.2 }
                  }}
                >
                  <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>Connected Sources</Text>
                  <Heading size="xl" mt={2} color={COLORS.teal}>4</Heading>
                </MotionBox>
                
                <MotionBox
                  p={5}
                  borderRadius="xl"
                  bg={colorMode === 'dark' ? 'gray.800' : 'white'}
                  boxShadow="0px 4px 10px rgba(0, 0, 0, 0.1)"
                  textAlign="center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: 0.3 }
                  }}
                >
                  <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>Total Data Points</Text>
                  <Heading size="xl" mt={2} color={COLORS.blue}>22,110</Heading>
                </MotionBox>
                
                <MotionBox
                  p={5}
                  borderRadius="xl"
                  bg={colorMode === 'dark' ? 'gray.800' : 'white'}
                  boxShadow="0px 4px 10px rgba(0, 0, 0, 0.1)"
                  textAlign="center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: 0.4 }
                  }}
                >
                  <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>Last Updated</Text>
                  <Heading size="xl" mt={2} color={COLORS.purple}>Today</Heading>
                </MotionBox>
              </SimpleGrid>
            </MotionFlex>

            {/* Data Sources Grid */}
            <MotionBox
              variants={itemVariants}
              mt={8}
            >
              <Heading size="md" mb={4}>Your Data Sources</Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {dataSources.map((source, index) => (
                  <MotionBox
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: 0.3 + index * 0.1 }
                    }}
                  >
                    <DataSourceCard
                      title={source.title}
                      icon={source.icon}
                      description={source.description}
                      isConnected={source.isConnected}
                      lastSync={source.lastSync}
                      dataPoints={source.dataPoints}
                      bgColor={source.bgColor}
                      onClick={() => {}}
                    />
                  </MotionBox>
                ))}
              </SimpleGrid>
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