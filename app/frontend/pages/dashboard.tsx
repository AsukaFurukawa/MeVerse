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
  Spacer,
  Grid,
  GridItem,
  useBreakpointValue,
  HStack,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast
} from '@chakra-ui/react';
import { 
  FaMoon, 
  FaSun, 
  FaRobot, 
  FaUser, 
  FaChartLine, 
  FaArrowRight, 
  FaBrain,
  FaClock,
  FaDatabase,
  FaBook,
  FaHome,
  FaMicrophone
} from 'react-icons/fa';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { BsGraphUp, BsClock, BsPerson, BsDatabase, BsJournalText } from 'react-icons/bs';

// Import our components
import AvatarDisplay from '../components/AvatarDisplay';
import ChatInterface from '../components/ChatInterface';
import GrowthTracker from '../components/GrowthTracker';
import FutureSimulation from '../components/FutureSimulation';
import PersonalityEngine from '../components/PersonalityEngine';
import DataIngestion from '../components/DataIngestion';
import Journal from '../components/Journal';
import MoodTracker from '../components/MoodTracker';
import DataVisualization from '../components/DataVisualization';
import VoiceInterface from '../components/VoiceInterface';

// Create motion components from Chakra components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionButton = motion(Button);
const MotionTabs = motion(Tabs);

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

export default function Dashboard() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const toast = useToast();
  
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

  // Parallax scroll effects
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  
  const navigateTo = (path: string) => {
    router.push(path);
  };

  // Handle voice commands from VoiceInterface
  const handleVoiceCommand = (command: string) => {
    toast({
      title: "Voice Command Received",
      description: `Executing: ${command}`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });
    
    // Navigate or change views based on voice command
    switch(command) {
      case 'dashboard':
        router.push('/dashboard');
        break;
      case 'mood':
        // Just scroll to mood tracker which is on this page
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'data':
        router.push('/data');
        break;
      case 'journal':
        router.push('/journal');
        break;
      case 'growth':
        setActiveTab(0);
        break;
      case 'simulation':
        setActiveTab(1);
        break;
      case 'personality':
        setActiveTab(2);
        break;
      default:
        // No specific action
        break;
    }
  };
  
  // Handle free-form voice input
  const handleVoiceInput = (text: string) => {
    toast({
      title: "Voice Input Received",
      description: text,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
    
    // Here you could potentially pass this to a chatbot/AI system
  };

  const DashboardView = () => (
    <MotionBox
      w="100%"
      pt={8}
      pb={16}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <MotionHeading
        as="h2"
        fontSize="3xl"
        textAlign="center"
        mb={8}
        variants={itemVariants}
        bgGradient={colorMode === 'dark' 
          ? "linear(to-r, brand.400, accent.purple, accent.blue)" 
          : "linear(to-r, brand.500, accent.purple, accent.blue)"}
        bgClip="text"
      >
        Your Digital Twin Dashboard
      </MotionHeading>
      
      {/* Voice Interface Toggle */}
      <Flex justify="center" mb={6}>
        <MotionButton
          leftIcon={<FaMicrophone />}
          colorScheme="purple"
          size="sm"
          onClick={() => setShowVoiceInterface(!showVoiceInterface)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showVoiceInterface ? "Hide Voice Controls" : "Enable Voice Controls"}
        </MotionButton>
      </Flex>

      {/* Voice Interface (conditionally shown) */}
      <AnimatePresence>
        {showVoiceInterface && (
          <MotionBox
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            mb={6}
            overflow="hidden"
          >
            <VoiceInterface 
              onVoiceCommand={handleVoiceCommand}
              onVoiceInput={handleVoiceInput}
              showTutorial={true}
            />
          </MotionBox>
        )}
      </AnimatePresence>
      
      {/* Mood Tracker and Data Visualization */}
      <Grid
        templateColumns={{ base: "1fr", lg: "1fr 2fr" }}
        gap={6}
        mb={8}
        px={{ base: 4, md: 0 }}
      >
        <GridItem>
          <MotionBox variants={itemVariants}>
            <MoodTracker 
              onMoodUpdate={(moodData) => {
                // In a real application, this data would update the avatar and other components
                console.log('Mood updated:', moodData);
              }}
            />
          </MotionBox>
        </GridItem>
        
        <GridItem>
          <MotionBox variants={itemVariants}>
            <DataVisualization timeRange="week" />
          </MotionBox>
        </GridItem>
      </Grid>
      
      <Box 
        as="nav" 
        position="relative" 
        zIndex={1}
        mb={8}
        mt={4}
        py={2}
        px={4}
        borderRadius="xl"
        bg={colorMode === 'dark' ? 'gray.800' : 'white'}
        boxShadow="md"
        display="flex"
        justifyContent="center"
        overflow="auto"
        mx="auto"
        maxW="fit-content"
        backdropFilter="blur(10px)"
      >
        <Flex direction="row" gap={4}>
          <MotionButton
            variant={activeTab === 0 ? "solid" : "ghost"}
            colorScheme="brand"
            size="md"
            leftIcon={<Icon as={BsGraphUp} />}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(0)}
          >
            Growth
          </MotionButton>
          
          <MotionButton
            variant={activeTab === 1 ? "solid" : "ghost"}
            colorScheme="brand"
            size="md"
            leftIcon={<Icon as={BsClock} />}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(1)}
          >
            Simulation
          </MotionButton>
          
          <MotionButton
            variant={activeTab === 2 ? "solid" : "ghost"}
            colorScheme="brand"
            size="md"
            leftIcon={<Icon as={BsPerson} />}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(2)}
          >
            Personality
          </MotionButton>
          
          <MotionButton
            variant={activeTab === 3 ? "solid" : "ghost"}
            colorScheme="brand"
            size="md"
            leftIcon={<Icon as={BsDatabase} />}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(3)}
          >
            Data
          </MotionButton>
          
          <MotionButton
            variant={activeTab === 4 ? "solid" : "ghost"}
            colorScheme="brand"
            size="md"
            leftIcon={<Icon as={BsJournalText} />}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(4)}
          >
            Journal
          </MotionButton>
        </Flex>
      </Box>
      
      <Box mt={6}>
        {activeTab === 0 && <GrowthTracker />}
        {activeTab === 1 && <FutureSimulation />}
        {activeTab === 2 && <PersonalityEngine />}
        {activeTab === 3 && <DataIngestion />}
        {activeTab === 4 && <Journal />}
      </Box>
      
      <MotionBox 
        borderRadius="xl" 
        p={{ base: 4, md: 8 }} 
        bg={colorMode === 'dark' ? 'gray.800' : 'white'} 
        boxShadow="xl"
        mt={10}
        variants={itemVariants}
        position="relative"
        overflow="hidden"
        _before={{
          content: '""',
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '200px',
          height: '200px',
          bgGradient: 'radial(circle, accent.purple, transparent 70%)',
          opacity: 0.1,
          borderRadius: 'full',
          filter: 'blur(40px)'
        }}
      >
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="md" display="flex" alignItems="center">
            <Box as={FaRobot} mr={3} color={colorMode === 'dark' ? 'pink.400' : 'pink.500'} />
            Talk to Your Digital Twin
          </Heading>
          <MotionButton
            colorScheme="pink"
            size="sm"
            leftIcon={<FaRobot />}
            onClick={() => navigateTo('/chat')}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 15px rgba(237, 100, 166, 0.6)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            Open Chat
          </MotionButton>
        </Flex>
        
        <Flex alignItems="center" justify="center" p={4} minH="100px">
          <Text textAlign="center" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>
            Your digital twin is ready to assist you. Start a conversation to receive personalized insights and guidance.
          </Text>
        </Flex>
      </MotionBox>
    </MotionBox>
  );

  return (
    <>
      <CursorFollower />
      
      <Head>
        <title>Dashboard | MeVerse - Your Digital Twin</title>
        <meta name="description" content="MeVerse Dashboard - Access all features of your digital twin" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box as="main" minH="100vh" bg={colorMode === 'dark' ? 'dark.200' : 'gray.50'} position="relative" overflow="hidden">
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
              borderRadius="full"
              p={1}
              mr={2}
              animate={{ 
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
          <DashboardView />
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
      </Box>
    </>
  );
} 