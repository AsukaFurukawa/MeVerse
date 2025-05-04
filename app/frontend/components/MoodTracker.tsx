import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  IconButton,
  useColorModeValue,
  useToast,
  Grid,
  GridItem,
  Flex,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Textarea,
  Tag,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FaSmile,
  FaMeh,
  FaFrown,
  FaGrinStars,
  FaAngry,
  FaTired,
  FaHeartbeat,
  FaNotesMedical,
  FaBoltLightning,
  FaBullseye,
  FaCalendarCheck,
  FaChartLine,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

// Motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// Mood options with icons and colors
const moodOptions = [
  { value: 'excited', icon: FaGrinStars, color: '#FFD700', label: 'Excited' },
  { value: 'happy', icon: FaSmile, color: '#4CAF50', label: 'Happy' },
  { value: 'neutral', icon: FaMeh, color: '#9E9E9E', label: 'Neutral' },
  { value: 'sad', icon: FaFrown, color: '#2196F3', label: 'Sad' },
  { value: 'angry', icon: FaAngry, color: '#F44336', label: 'Angry' },
  { value: 'tired', icon: FaTired, color: '#9C27B0', label: 'Tired' },
];

// Factors that might affect mood
const moodFactors = [
  'Sleep Quality',
  'Exercise',
  'Nutrition',
  'Social Interaction',
  'Stress Level',
  'Work/Productivity',
  'Weather',
  'Health',
  'Personal Achievement',
];

interface MoodTrackerProps {
  onMoodUpdate?: (moodData: any) => void;
  showHistory?: boolean;
}

interface MoodData {
  date: string;
  mood: string;
  energy: number;
  notes: string;
  factors: string[];
}

export default function MoodTracker({ onMoodUpdate, showHistory = true }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [energyLevel, setEnergyLevel] = useState<number>(5);
  const [showEnergyValue, setShowEnergyValue] = useState(false);
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [moodHistory, setMoodHistory] = useState<MoodData[]>([]);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Load mood history from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedHistory = localStorage.getItem('moodHistory');
      if (storedHistory) {
        setMoodHistory(JSON.parse(storedHistory));
      }
      
      const storedLastCheckIn = localStorage.getItem('lastMoodCheckIn');
      if (storedLastCheckIn) {
        setLastCheckIn(storedLastCheckIn);
      }
    }
  }, []);
  
  // Check if user already checked in today
  const hasCheckedInToday = (): boolean => {
    if (!lastCheckIn) return false;
    
    const today = new Date().toISOString().split('T')[0];
    return lastCheckIn === today;
  };
  
  // Handle mood selection
  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
  };
  
  // Handle factor selection
  const handleFactorSelect = (factor: string) => {
    if (selectedFactors.includes(factor)) {
      setSelectedFactors(selectedFactors.filter(f => f !== factor));
    } else {
      setSelectedFactors([...selectedFactors, factor]);
    }
  };
  
  // Save mood data
  const saveMoodData = () => {
    if (!selectedMood) {
      toast({
        title: 'Please select a mood',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Create mood data entry
    const moodData: MoodData = {
      date: today,
      mood: selectedMood,
      energy: energyLevel,
      notes: notes,
      factors: selectedFactors,
    };
    
    // Update mood history
    const updatedHistory = [moodData, ...moodHistory].slice(0, 30); // Keep last 30 days
    setMoodHistory(updatedHistory);
    
    // Save to localStorage
    localStorage.setItem('moodHistory', JSON.stringify(updatedHistory));
    localStorage.setItem('lastMoodCheckIn', today);
    
    // Update last check-in date
    setLastCheckIn(today);
    
    // Notify parent component
    if (onMoodUpdate) {
      onMoodUpdate(moodData);
    }
    
    // Show success message
    toast({
      title: 'Mood check-in recorded',
      description: 'Your mood has been saved successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    // Reset form
    setSelectedMood('');
    setEnergyLevel(5);
    setSelectedFactors([]);
    setNotes('');
    
    // Close modal if open
    onClose();
  };
  
  // Get color for energy level
  const getEnergyColor = (level: number): string => {
    if (level <= 2) return 'red.500';
    if (level <= 4) return 'orange.500';
    if (level <= 6) return 'yellow.500';
    if (level <= 8) return 'green.500';
    return 'blue.500';
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <Box>
      {/* Daily check-in section */}
      <VStack 
        spacing={4} 
        align="stretch" 
        bg={bgColor} 
        p={6} 
        borderRadius="lg" 
        borderWidth={1}
        borderColor={borderColor}
        boxShadow="md"
      >
        <Flex justify="space-between" align="center">
          <Heading size="md">
            <Flex align="center">
              <Box as={FaHeartbeat} mr={2} color="red.500" />
              Mood & Energy Check-in
            </Flex>
          </Heading>
          
          {hasCheckedInToday() ? (
            <Tag colorScheme="green" size="md">
              <Box as={FaCalendarCheck} mr={2} />
              Completed Today
            </Tag>
          ) : (
            <Button 
              leftIcon={<FaNotesMedical />} 
              colorScheme="blue"
              size="sm"
              onClick={onOpen}
            >
              Check In Now
            </Button>
          )}
        </Flex>
        
        {lastCheckIn && (
          <Text color="gray.500" fontSize="sm">
            Last check-in: {formatDate(lastCheckIn)}
          </Text>
        )}
        
        {/* If already checked in today, show summary */}
        {hasCheckedInToday() && moodHistory.length > 0 && (
          <MotionBox
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            p={4}
            borderRadius="md"
            bg={useColorModeValue('gray.50', 'gray.700')}
          >
            <HStack spacing={6}>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.500">Today's Mood</Text>
                <Flex align="center">
                  {moodOptions.find(m => m.value === moodHistory[0].mood) && (
                    <Box 
                      as={moodOptions.find(m => m.value === moodHistory[0].mood)?.icon} 
                      color={moodOptions.find(m => m.value === moodHistory[0].mood)?.color}
                      mr={2}
                      fontSize="2xl"
                    />
                  )}
                  <Text fontWeight="bold" textTransform="capitalize">
                    {moodHistory[0].mood}
                  </Text>
                </Flex>
              </VStack>
              
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.500">Energy Level</Text>
                <Flex align="center">
                  <Box 
                    as={FaBoltLightning} 
                    color={getEnergyColor(moodHistory[0].energy)}
                    mr={2}
                  />
                  <Text fontWeight="bold">{moodHistory[0].energy}/10</Text>
                </Flex>
              </VStack>
              
              {moodHistory[0].factors.length > 0 && (
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.500">Top Factors</Text>
                  <Flex>
                    {moodHistory[0].factors.slice(0, 2).map((factor, idx) => (
                      <Tag size="sm" mr={1} key={idx} colorScheme="purple">
                        {factor}
                      </Tag>
                    ))}
                    {moodHistory[0].factors.length > 2 && (
                      <Tag size="sm" colorScheme="purple">
                        +{moodHistory[0].factors.length - 2}
                      </Tag>
                    )}
                  </Flex>
                </VStack>
              )}
            </HStack>
          </MotionBox>
        )}
        
        {/* Mood history section */}
        {showHistory && moodHistory.length > 1 && (
          <VStack align="stretch" spacing={3} mt={4}>
            <Flex justify="space-between" align="center">
              <Text fontWeight="medium" color="gray.500">
                <Flex align="center">
                  <Box as={FaChartLine} mr={2} />
                  Recent History
                </Flex>
              </Text>
              
              <Button 
                variant="link" 
                size="sm" 
                colorScheme="blue"
                onClick={() => {/* View detailed history */}}
              >
                View All
              </Button>
            </Flex>
            
            {/* Brief mood history chart */}
            <Flex h="60px" align="flex-end" mt={2}>
              {moodHistory.slice(0, 7).reverse().map((entry, idx) => {
                const moodOption = moodOptions.find(m => m.value === entry.mood);
                return (
                  <Tooltip 
                    key={idx} 
                    label={`${formatDate(entry.date)}: ${entry.mood}, Energy: ${entry.energy}/10`}
                    placement="top"
                  >
                    <VStack spacing={1} mx={1} w="100%">
                      <Box 
                        as={moodOption?.icon} 
                        color={moodOption?.color}
                        fontSize="lg"
                      />
                      <Box 
                        h={`${entry.energy * 5}px`} 
                        w="12px" 
                        bg={getEnergyColor(entry.energy)}
                        borderRadius="sm"
                      />
                    </VStack>
                  </Tooltip>
                );
              })}
            </Flex>
          </VStack>
        )}
      </VStack>
      
      {/* Mood check-in modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Daily Mood & Energy Check-in</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody pb={6}>
            <VStack spacing={6} align="stretch">
              {/* Mood selection */}
              <Box>
                <Text fontWeight="medium" mb={2}>How are you feeling today?</Text>
                <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                  {moodOptions.map((mood) => (
                    <GridItem key={mood.value}>
                      <MotionBox
                        as={Button}
                        variant={selectedMood === mood.value ? "solid" : "outline"}
                        colorScheme={selectedMood === mood.value ? "blue" : "gray"}
                        w="100%"
                        h="80px"
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                        onClick={() => handleMoodSelect(mood.value)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Box 
                          as={mood.icon} 
                          fontSize="2xl" 
                          color={selectedMood === mood.value ? "white" : mood.color}
                          mb={2}
                        />
                        <Text fontSize="sm">{mood.label}</Text>
                      </MotionBox>
                    </GridItem>
                  ))}
                </Grid>
              </Box>
              
              {/* Energy level */}
              <Box>
                <Text fontWeight="medium" mb={4}>Energy Level</Text>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={energyLevel}
                  onChange={setEnergyLevel}
                  onMouseEnter={() => setShowEnergyValue(true)}
                  onMouseLeave={() => setShowEnergyValue(false)}
                >
                  <SliderMark value={1} mt={2} ml={-2} fontSize="xs">
                    Low
                  </SliderMark>
                  <SliderMark value={5} mt={2} ml={-2} fontSize="xs">
                    Medium
                  </SliderMark>
                  <SliderMark value={10} mt={2} ml={-2} fontSize="xs">
                    High
                  </SliderMark>
                  <SliderMark
                    value={energyLevel}
                    textAlign='center'
                    bg='blue.500'
                    color='white'
                    mt='-10'
                    ml='-5'
                    w='12'
                    borderRadius="md"
                    opacity={showEnergyValue ? 1 : 0}
                    transition="opacity 0.2s"
                  >
                    {energyLevel}
                  </SliderMark>
                  <SliderTrack bg="gray.200">
                    <SliderFilledTrack bg={getEnergyColor(energyLevel)} />
                  </SliderTrack>
                  <SliderThumb boxSize={6}>
                    <Box as={FaBoltLightning} color={getEnergyColor(energyLevel)} />
                  </SliderThumb>
                </Slider>
              </Box>
              
              {/* Factors */}
              <Box>
                <Text fontWeight="medium" mb={3}>What factors affected your mood today?</Text>
                <Flex wrap="wrap" gap={2}>
                  {moodFactors.map((factor) => (
                    <Tag
                      key={factor}
                      size="md"
                      borderRadius="full"
                      variant={selectedFactors.includes(factor) ? "solid" : "outline"}
                      colorScheme={selectedFactors.includes(factor) ? "purple" : "gray"}
                      cursor="pointer"
                      onClick={() => handleFactorSelect(factor)}
                      _hover={{ opacity: 0.8 }}
                    >
                      {factor}
                    </Tag>
                  ))}
                </Flex>
              </Box>
              
              {/* Notes */}
              <Box>
                <Text fontWeight="medium" mb={2}>Additional Notes (optional)</Text>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything else you'd like to add about your day..."
                  size="md"
                  resize="vertical"
                  rows={3}
                />
              </Box>
              
              {/* Save button */}
              <Button colorScheme="blue" onClick={saveMoodData} leftIcon={<FaBullseye />}>
                Save Check-in
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
} 