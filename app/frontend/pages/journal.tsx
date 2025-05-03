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
  Input,
  Textarea,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Tag
} from '@chakra-ui/react';
import { 
  FaMoon, 
  FaSun, 
  FaRobot,
  FaHome,
  FaBook,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCalendarAlt
} from 'react-icons/fa';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// Create motion components from Chakra components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionButton = motion(Button);
const MotionHeading = motion(Heading);
const MotionText = motion(Text);
const MotionIconButton = motion(IconButton);

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

// Journal Entry component
const JournalEntry = ({ entry, onEdit, onDelete }) => {
  const { colorMode } = useColorMode();
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <MotionBox
      p={5}
      borderRadius="xl"
      bg={colorMode === 'dark' ? 'gray.800' : 'white'}
      boxShadow="0px 4px 10px rgba(0, 0, 0, 0.1)"
      mb={4}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        y: -3,
        boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
        transition: { duration: 0.2 }
      }}
    >
      <Flex justify="space-between" align="flex-start" mb={2}>
        <Heading size="md" fontWeight="bold">{entry.title}</Heading>
        <HStack>
          <MotionIconButton
            icon={<FaEdit />}
            aria-label="Edit journal entry"
            size="sm"
            variant="ghost"
            colorScheme="brand"
            onClick={() => onEdit(entry)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          />
          <MotionIconButton
            icon={<FaTrash />}
            aria-label="Delete journal entry"
            size="sm"
            variant="ghost"
            colorScheme="red"
            onClick={() => onDelete(entry.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          />
        </HStack>
      </Flex>
      
      <Flex align="center" mb={3}>
        <Icon as={FaCalendarAlt} mr={2} color="gray.500" />
        <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>
          {formatDate(entry.date)}
        </Text>
        
        {entry.mood && (
          <Tag 
            size="sm" 
            colorScheme={
              entry.mood === 'happy' ? "green" : 
              entry.mood === 'sad' ? "blue" :
              entry.mood === 'angry' ? "red" :
              entry.mood === 'anxious' ? "orange" : "purple"
            }
            ml={2}
          >
            {entry.mood}
          </Tag>
        )}
      </Flex>
      
      <Text mt={2} color={colorMode === 'dark' ? 'gray.300' : 'gray.700'}>
        {entry.content}
      </Text>
    </MotionBox>
  );
};

export default function JournalPage() {
  const { colorMode, toggleColorMode } = useColorMode();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Journal state
  const [entries, setEntries] = useState([
    {
      id: 1,
      title: "First day with MeVerse",
      content: "I started using MeVerse today and it's been an interesting experience. The idea of having a digital twin that understands me is both exciting and a bit unnerving. I'm curious to see how well it learns my patterns over time.",
      date: "2023-05-10T14:30:00",
      mood: "curious"
    },
    {
      id: 2,
      title: "Work breakthrough",
      content: "Had a major breakthrough at work today on the project I've been stuck on for weeks. MeVerse suggested a different approach yesterday that I initially dismissed, but decided to try today - and it worked! Maybe there's something to this AI guidance after all.",
      date: "2023-05-15T18:45:00",
      mood: "happy"
    },
    {
      id: 3,
      title: "Feeling stressed",
      content: "Work pressure is mounting and I'm feeling overwhelmed with deadlines. MeVerse suggested some breathing exercises and reminded me of my past success with similar situations. It helped a bit, but I still feel anxious about everything I need to complete.",
      date: "2023-05-20T21:15:00",
      mood: "anxious"
    }
  ]);
  
  const [currentEntry, setCurrentEntry] = useState({
    id: null,
    title: "",
    content: "",
    date: new Date().toISOString(),
    mood: "neutral"
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
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
  
  // Journal functions
  const handleAddEntry = () => {
    setCurrentEntry({
      id: null,
      title: "",
      content: "",
      date: new Date().toISOString(),
      mood: "neutral"
    });
    setIsEditing(false);
    onOpen();
  };
  
  const handleEditEntry = (entry) => {
    setCurrentEntry({...entry});
    setIsEditing(true);
    onOpen();
  };
  
  const handleDeleteEntry = (id) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };
  
  const handleSaveEntry = () => {
    if (isEditing) {
      // Update existing entry
      setEntries(entries.map(entry => 
        entry.id === currentEntry.id ? currentEntry : entry
      ));
    } else {
      // Add new entry
      const newEntry = {
        ...currentEntry,
        id: Date.now(),
        date: new Date().toISOString()
      };
      setEntries([newEntry, ...entries]);
    }
    onClose();
  };

  // Define color hex values instead of using named colors for animation
  const moodColorMap = {
    happy: "#38A169", // green
    sad: "#3182CE",   // blue
    angry: "#E53E3E", // red
    anxious: "#DD6B20", // orange
    curious: "#805AD5", // purple
    neutral: "#718096" // gray
  };

  return (
    <>
      <CursorFollower />
      
      <Head>
        <title>Journal | MeVerse - Your Digital Twin</title>
        <meta name="description" content="Keep track of your thoughts and ideas in your MeVerse journal" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AnimatePresence mode="wait">
        <MotionBox 
          as="main" 
          minH="100vh" 
          bg={colorMode === 'dark' ? 'dark.200' : 'gray.50'} 
          position="relative" 
          overflow="hidden"
          key="journal-page"
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
              ? 'radial-gradient(circle at top right, #F6E05E, transparent 60%), radial-gradient(circle at bottom left, #ED8936, transparent 60%)' 
              : 'radial-gradient(circle at top right, #FBD38D, transparent 60%), radial-gradient(circle at bottom left, #FEEBC8, transparent 60%)'
            }
          />
          
          {/* Floating elements for aesthetic */}
          <MotionBox
            position="absolute"
            width="300px"
            height="300px"
            borderRadius="full"
            bg={colorMode === 'dark' ? 'rgba(236, 201, 75, 0.03)' : 'rgba(236, 201, 75, 0.05)'}
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
            bg={colorMode === 'dark' ? 'rgba(237, 137, 54, 0.03)' : 'rgba(237, 137, 54, 0.05)'}
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
                <Icon as={FaRobot} w={8} h={8} color="#805AD5" />
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
                bg={colorMode === 'dark' ? 'rgba(236, 201, 75, 0.1)' : 'rgba(236, 201, 75, 0.05)'}
                boxShadow="0 0 20px rgba(236, 201, 75, 0.3)"
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 0 20px rgba(236, 201, 75, 0.3)",
                    "0 0 30px rgba(236, 201, 75, 0.5)",
                    "0 0 20px rgba(236, 201, 75, 0.3)"
                  ]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 3 
                }}
              >
                <Icon as={FaBook} w={10} h={10} color="#ECC94B" />
              </MotionBox>
              
              <MotionHeading
                as="h2"
                size="xl"
                textAlign="center"
                bgGradient="linear(to-r, #F6E05E, #ED8936)"
                bgClip="text"
                variants={itemVariants}
              >
                Journal
              </MotionHeading>
              
              <MotionText
                fontSize="lg"
                textAlign="center"
                maxW="container.md"
                mt={2}
                color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
                variants={itemVariants}
              >
                Capture your thoughts, feelings, and experiences
              </MotionText>
            </MotionFlex>

            {/* Journal controls */}
            <Flex justify="flex-end" mb={6}>
              <MotionButton
                leftIcon={<FaPlus />}
                colorScheme="brand"
                onClick={handleAddEntry}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                New Entry
              </MotionButton>
            </Flex>

            {/* Journal entries */}
            <VStack spacing={4} align="stretch">
              {entries.length === 0 ? (
                <Box 
                  p={8} 
                  textAlign="center" 
                  bg={colorMode === 'dark' ? 'gray.800' : 'white'} 
                  borderRadius="xl"
                  boxShadow="md"
                >
                  <Icon as={FaBook} w={12} h={12} color="gray.400" mb={4} />
                  <Heading size="md" mb={2}>No journal entries yet</Heading>
                  <Text color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>
                    Add your first entry to start journaling
                  </Text>
                </Box>
              ) : (
                entries.map(entry => (
                  <JournalEntry 
                    key={entry.id} 
                    entry={entry} 
                    onEdit={handleEditEntry}
                    onDelete={handleDeleteEntry}
                  />
                ))
              )}
            </VStack>
          </Container>
          
          {/* Add/Edit Entry Modal */}
          <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay backdropFilter="blur(10px)" />
            <ModalContent bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
              <ModalHeader>
                {isEditing ? "Edit Journal Entry" : "New Journal Entry"}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <VStack spacing={4}>
                  <Input 
                    placeholder="Title"
                    value={currentEntry.title}
                    onChange={(e) => setCurrentEntry({...currentEntry, title: e.target.value})}
                  />
                  
                  <Flex width="100%" justify="space-between">
                    <Box width="100%">
                      <Text mb={1} fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}>
                        Mood
                      </Text>
                      <HStack wrap="wrap" spacing={2}>
                        {Object.entries(moodColorMap).map(([mood, color]) => (
                          <Tag 
                            key={mood}
                            bg={currentEntry.mood === mood ? color : "transparent"}
                            color={currentEntry.mood === mood ? "white" : colorMode === 'dark' ? "white" : "gray.800"}
                            border="1px solid"
                            borderColor={color}
                            cursor="pointer"
                            p={2}
                            onClick={() => setCurrentEntry({...currentEntry, mood})}
                          >
                            {mood}
                          </Tag>
                        ))}
                      </HStack>
                    </Box>
                  </Flex>
                  
                  <Textarea 
                    placeholder="What's on your mind?"
                    rows={10}
                    resize="vertical"
                    value={currentEntry.content}
                    onChange={(e) => setCurrentEntry({...currentEntry, content: e.target.value})}
                  />
                </VStack>
              </ModalBody>

              <ModalFooter>
                <Button onClick={onClose} mr={3}>Cancel</Button>
                <Button 
                  colorScheme="brand" 
                  onClick={handleSaveEntry}
                  isDisabled={!currentEntry.title || !currentEntry.content}
                >
                  Save
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

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