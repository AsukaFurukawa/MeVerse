import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  IconButton,
  useColorModeValue,
  useToast,
  Tooltip,
  VStack,
  HStack,
  Spacer,
  Badge,
  Collapse,
  List,
  ListItem,
  ListIcon,
  Divider,
  Switch,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeUp,
  FaVolumeMute,
  FaCog,
  FaQuestionCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaHeadset,
  FaListUl,
  FaCheck,
} from 'react-icons/fa';

// Motion components
const MotionBox = motion.div;
const MotionFlex = motion.div;
const MotionIconButton = motion.button;

interface VoiceInterfaceProps {
  onVoiceCommand?: (command: string) => void;
  onVoiceInput?: (text: string) => void;
  showTutorial?: boolean;
  voiceEnabled?: boolean;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  onVoiceCommand,
  onVoiceInput,
  showTutorial = false,
  voiceEnabled = true,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supportsSpeech, setSupportsSpeech] = useState(true);
  const [confidence, setConfidence] = useState(0);
  const [speechHistory, setSpeechHistory] = useState<string[]>([]);
  const [processingVoice, setProcessingVoice] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synth = useRef<SpeechSynthesis | null>(null);
  const { isOpen: isSettingsOpen, onToggle: toggleSettings } = useDisclosure();
  const { isOpen: isCommandsOpen, onOpen: onCommandsOpen, onClose: onCommandsClose } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Example voice commands that the system can recognize
  const availableCommands = [
    { command: "show dashboard", description: "Navigate to the dashboard view" },
    { command: "log mood", description: "Open the mood tracking interface" },
    { command: "show data visualization", description: "Display data visualizations" },
    { command: "start journal entry", description: "Begin a new journal entry" },
    { command: "what's my progress", description: "Show growth and progress metrics" },
    { command: "help", description: "Display available voice commands" },
  ];

  // Initialize speech recognition and synthesis on component mount
  useEffect(() => {
    if (!voiceEnabled) return;
    
    // Check browser compatibility
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupportsSpeech(false);
      toast({
        title: "Voice Interface Not Available",
        description: "Your browser doesn't support the Web Speech API",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Initialize speech synthesis
    synth.current = window.speechSynthesis;
    
    // Initialize speech recognition
    // @ts-ignore - TypeScript doesn't know about SpeechRecognition API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      let maxConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          // Get the confidence score from the best result
          maxConfidence = Math.max(maxConfidence, event.results[i][0].confidence);
        } else {
          interimTranscript += transcript;
        }
      }

      // Update state with final or interim transcripts
      if (finalTranscript) {
        setTranscript(finalTranscript);
        setConfidence(maxConfidence);
        processVoiceCommand(finalTranscript);
        setSpeechHistory(prev => [finalTranscript, ...prev].slice(0, 5));
      } else if (interimTranscript) {
        setTranscript(interimTranscript);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use voice features",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    // Show tutorial toast if enabled
    if (showTutorial) {
      toast({
        title: "Voice Interface Enabled",
        description: "Click the microphone icon to start voice commands",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    }

    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [voiceEnabled, toast, showTutorial]);

  // Process voice commands
  const processVoiceCommand = (text: string) => {
    if (!text.trim()) return;
    
    setProcessingVoice(true);
    
    const lowercaseText = text.toLowerCase().trim();
    
    // Check for specific commands
    let commandRecognized = false;
    
    if (lowercaseText.includes('show dashboard') || lowercaseText.includes('go to dashboard')) {
      speakResponse('Opening dashboard');
      if (onVoiceCommand) onVoiceCommand('dashboard');
      commandRecognized = true;
    } 
    else if (lowercaseText.includes('log mood') || lowercaseText.includes('track mood')) {
      speakResponse('Opening mood tracker');
      if (onVoiceCommand) onVoiceCommand('mood');
      commandRecognized = true;
    }
    else if (lowercaseText.includes('show data') || lowercaseText.includes('visualization')) {
      speakResponse('Showing data visualizations');
      if (onVoiceCommand) onVoiceCommand('data');
      commandRecognized = true;
    }
    else if (lowercaseText.includes('journal') || lowercaseText.includes('diary')) {
      speakResponse('Opening journal');
      if (onVoiceCommand) onVoiceCommand('journal');
      commandRecognized = true;
    }
    else if (lowercaseText.includes('progress') || lowercaseText.includes('growth')) {
      speakResponse('Showing your progress');
      if (onVoiceCommand) onVoiceCommand('growth');
      commandRecognized = true;
    }
    else if (lowercaseText.includes('help') || lowercaseText.includes('commands')) {
      speakResponse('Here are the available commands');
      onCommandsOpen();
      commandRecognized = true;
    }
    
    // If no command recognized, pass as input
    if (!commandRecognized && onVoiceInput) {
      onVoiceInput(text);
    }
    
    setTimeout(() => {
      setProcessingVoice(false);
    }, 1000);
  };

  // Toggle speech recognition
  const toggleListening = () => {
    if (!supportsSpeech) {
      toast({
        title: "Speech Recognition Unavailable",
        description: "Your browser doesn't support speech recognition",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
        setTranscript('');
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast({
          title: "Error Starting Voice Input",
          description: "There was an error activating the microphone",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // Toggle audio output
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (isMuted) {
      speakResponse("Audio output enabled");
    }
  };

  // Speak response using speech synthesis
  const speakResponse = (text: string) => {
    if (isMuted || !synth.current) return;
    
    // Stop any ongoing speech
    synth.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;
    
    synth.current.speak(utterance);
  };

  return (
    <Box>
      <Flex
        direction="column"
        bg={bgColor}
        borderRadius="lg"
        borderWidth={1}
        borderColor={borderColor}
        overflow="hidden"
        boxShadow="md"
        position="relative"
      >
        {/* Header */}
        <Flex 
          justify="space-between" 
          align="center" 
          p={4} 
          borderBottomWidth={1}
          borderBottomColor={borderColor}
        >
          <Heading size="md" display="flex" alignItems="center">
            <Box as={FaHeadset} mr={2} color={accentColor} />
            Voice Interface
          </Heading>
          
          <HStack spacing={2}>
            {/* Settings button */}
            <Tooltip label="Voice Settings">
              <IconButton
                aria-label="Voice settings"
                icon={<FaCog />}
                size="sm"
                variant="ghost"
                onClick={toggleSettings}
              />
            </Tooltip>
            
            {/* Help button */}
            <Tooltip label="Voice Commands">
              <IconButton
                aria-label="Voice commands"
                icon={<FaListUl />}
                size="sm"
                variant="ghost"
                onClick={onCommandsOpen}
              />
            </Tooltip>
            
            {/* Mute/Unmute button */}
            <Tooltip label={isMuted ? "Enable voice responses" : "Mute voice responses"}>
              <IconButton
                aria-label={isMuted ? "Unmute" : "Mute"}
                icon={isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                size="sm"
                colorScheme={isMuted ? "gray" : "blue"}
                variant="ghost"
                onClick={toggleMute}
              />
            </Tooltip>
          </HStack>
        </Flex>
        
        {/* Settings panel */}
        <Collapse in={isSettingsOpen} animateOpacity>
          <Box p={4} bg={useColorModeValue('gray.50', 'gray.700')}>
            <VStack align="stretch" spacing={4}>
              <Flex align="center" justify="space-between">
                <Text fontWeight="medium">Enable Voice Interface</Text>
                <Switch isChecked={voiceEnabled} isReadOnly />
              </Flex>
              
              <Flex align="center" justify="space-between">
                <Text fontWeight="medium">Voice Responses</Text>
                <Switch isChecked={!isMuted} onChange={toggleMute} />
              </Flex>
              
              <Text fontSize="sm" color={textColor}>
                Voice recognition works best in a quiet environment and with clear speech.
              </Text>
            </VStack>
          </Box>
        </Collapse>
        
        {/* Main voice interaction area */}
        <Flex direction="column" align="center" justify="center" p={6} position="relative">
          {!supportsSpeech ? (
            <VStack spacing={3} p={4} textAlign="center">
              <Box as={FaExclamationCircle} fontSize="3xl" color="orange.500" />
              <Text>Voice features are not supported in your browser.</Text>
              <Text fontSize="sm" color={textColor}>
                Try using Chrome, Edge, or Safari for the best experience.
              </Text>
            </VStack>
          ) : (
            <>
              {/* Microphone button with animation */}
              <MotionBox
                animate={
                  isListening 
                    ? { 
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          "0 0 0 rgba(66, 153, 225, 0)",
                          "0 0 20px rgba(66, 153, 225, 0.5)",
                          "0 0 0 rgba(66, 153, 225, 0)",
                        ]
                      } 
                    : {}
                }
                transition={{
                  repeat: isListening ? Infinity : 0,
                  duration: 1.5,
                }}
                mb={4}
              >
                <Tooltip label={isListening ? "Stop listening" : "Start voice input"}>
                  <MotionIconButton
                    aria-label={isListening ? "Stop listening" : "Start voice input"}
                    icon={isListening ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    colorScheme={isListening ? "blue" : "gray"}
                    size="lg"
                    isRound
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleListening}
                  />
                </Tooltip>
              </MotionBox>
              
              {/* Transcript display */}
              <Box 
                mt={2} 
                p={4} 
                borderRadius="md" 
                bg={useColorModeValue('gray.50', 'gray.700')}
                minH="60px"
                w="100%"
                position="relative"
              >
                {isListening && !transcript && (
                  <Text color={textColor} textAlign="center">Listening...</Text>
                )}
                
                {transcript && (
                  <VStack spacing={1} align="stretch">
                    <Text fontWeight={processingVoice ? "bold" : "normal"}>
                      {transcript}
                    </Text>
                    {confidence > 0 && (
                      <Flex align="center" justify="flex-end">
                        <Text fontSize="xs" color={textColor}>
                          Confidence: {Math.round(confidence * 100)}%
                        </Text>
                      </Flex>
                    )}
                  </VStack>
                )}
                
                {!isListening && !transcript && (
                  <Text color={textColor} textAlign="center">
                    Click the microphone to start voice commands
                  </Text>
                )}
              </Box>
              
              {/* Recent history */}
              {speechHistory.length > 0 && (
                <Box mt={4} w="100%">
                  <Text fontSize="sm" color={textColor} mb={2}>Recent Commands:</Text>
                  <List spacing={1}>
                    {speechHistory.map((item, index) => (
                      <ListItem key={index} fontSize="sm" color={textColor}>
                        <ListIcon as={FaCheck} color="green.500" />
                        {item}
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </>
          )}
        </Flex>
        
        {/* Voice command suggestions */}
        <Box p={4} borderTopWidth={1} borderTopColor={borderColor}>
          <Text fontSize="sm" fontWeight="medium" mb={2}>
            Try saying:
          </Text>
          <Flex wrap="wrap" gap={2}>
            <Badge colorScheme="blue" p={1} borderRadius="md">
              "Show dashboard"
            </Badge>
            <Badge colorScheme="green" p={1} borderRadius="md">
              "Log my mood"
            </Badge>
            <Badge colorScheme="purple" p={1} borderRadius="md">
              "Start journal entry"
            </Badge>
            <Badge colorScheme="orange" p={1} borderRadius="md">
              "Help"
            </Badge>
          </Flex>
        </Box>
      </Flex>
      
      {/* Commands modal */}
      <Modal isOpen={isCommandsOpen} onClose={onCommandsClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader display="flex" alignItems="center">
            <Box as={FaListUl} mr={2} />
            Available Voice Commands
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <List spacing={3}>
              {availableCommands.map((cmd, idx) => (
                <ListItem key={idx} pb={2} borderBottomWidth={idx < availableCommands.length - 1 ? 1 : 0} borderBottomColor={borderColor}>
                  <Text fontWeight="bold">"{cmd.command}"</Text>
                  <Text fontSize="sm" color={textColor}>{cmd.description}</Text>
                </ListItem>
              ))}
            </List>
          </ModalBody>
          
          <ModalFooter>
            <Button colorScheme="blue" onClick={onCommandsClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default VoiceInterface; 