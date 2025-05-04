import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  Input, 
  IconButton, 
  Text, 
  VStack, 
  HStack, 
  Avatar, 
  useColorMode,
  Icon,
  Spinner,
  Button,
  Divider,
  Tooltip,
  useDisclosure,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useToast,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Heading
} from '@chakra-ui/react';
import { 
  FaPaperPlane, 
  FaMicrophone, 
  FaRobot, 
  FaEllipsisH,
  FaSmile,
  FaImage,
  FaPaperclip,
  FaVolumeUp,
  FaVolumeMute,
  FaHistory,
  FaInfoCircle,
  FaSearch,
  FaUserAlt,
  FaChartLine,
  FaClock,
  FaBrain,
  FaDatabase,
  FaCheck,
  FaCheckDouble,
  FaMicrophoneSlash
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import AvatarDisplay from './AvatarDisplay';
import VoiceInterface from './VoiceInterface';

// Motion components
const MotionBox = motion.div;
const MotionFlex = motion.div;
const MotionText = motion.p;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'twin';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  isThinking?: boolean;
  actions?: MessageAction[];
}

interface MessageAction {
  label: string;
  icon: React.ComponentType;
  action: () => void;
  type: 'primary' | 'secondary';
}

interface ChatInterfaceProps {
  userName?: string;
  userAvatar?: string;
  onClose?: () => void;
  onNavigateTab?: (tabIndex: number) => void;
}

export default function ChatInterface({ 
  userName = 'You',
  userAvatar,
  onClose,
  onNavigateTab
}: ChatInterfaceProps) {
  const { colorMode } = useColorMode();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your digital twin. I learn from your habits, preferences, and behaviors to help guide you. How can I assist you today?",
      sender: 'twin',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [twinMood, setTwinMood] = useState<string>('neutral');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const { isOpen, onOpen, onClose: onPopoverClose } = useDisclosure();
  const toast = useToast();
  const [voiceMode, setVoiceMode] = useState(false);
  
  // Sample suggestion prompts
  const suggestionPrompts = [
    "How will I handle stress next week?",
    "What habit should I develop?",
    "Predict my reaction to this situation...",
    "Help me plan my next month",
    "Show me my mood patterns"
  ];

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;
    
    // Generate a unique ID for the message
    const newId = Date.now().toString();
    
    // Add user message
    const userMessage: Message = {
      id: newId,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage('');
    
    // Update status to sent after a short delay
    setTimeout(() => {
      setMessages((prevMessages) => 
        prevMessages.map((msg) => 
          msg.id === newId ? { ...msg, status: 'sent' } : msg
        )
      );
    }, 500);
    
    // Add twin "thinking" indicator
    setTimeout(() => {
      const thinkingId = `thinking-${Date.now()}`;
      setMessages((prevMessages) => [
        ...prevMessages, 
        { 
          id: thinkingId, 
          text: '', 
          sender: 'twin', 
          timestamp: new Date(),
          isThinking: true
        }
      ]);
      
      // Determine twin mood based on message content
      const lowerCaseMessage = inputMessage.toLowerCase();
      if (lowerCaseMessage.includes('happy') || lowerCaseMessage.includes('great') || lowerCaseMessage.includes('awesome')) {
        setTwinMood('happy');
      } else if (lowerCaseMessage.includes('sad') || lowerCaseMessage.includes('depressed') || lowerCaseMessage.includes('unhappy')) {
        setTwinMood('sad');
      } else if (lowerCaseMessage.includes('excited') || lowerCaseMessage.includes('can\'t wait')) {
        setTwinMood('excited');
      } else if (lowerCaseMessage.includes('angry') || lowerCaseMessage.includes('mad') || lowerCaseMessage.includes('frustrated')) {
        setTwinMood('angry');
      }
      
      // Twin response after "thinking"
      setTimeout(() => {
        // Remove thinking message
        setMessages((prevMessages) => 
          prevMessages.filter((msg) => msg.id !== thinkingId)
        );
        
        // Add actual response
        generateTwinResponse(inputMessage);
      }, 1500);
    }, 1000);
  };

  const generateTwinResponse = (userMessage: string) => {
    // In a real app, this would call an API to get response from a model
    let response: string;
    let actions: MessageAction[] = [];
    const lowerCaseMessage = userMessage.toLowerCase();
    
    // Simple pattern matching for demo purposes
    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
      response = `Hello ${userName}! How's your day going?`;
    } else if (lowerCaseMessage.includes('how are you')) {
      response = "As your digital twin, I reflect your current state. Based on your recent data, you seem to be doing fairly well, though your sleep patterns suggest you might be a bit tired.";
      actions = [
        {
          label: 'View Sleep Data',
          icon: FaChartLine,
          action: () => navigateToTab(0), // Growth Tracker tab
          type: 'primary'
        }
      ];
    } else if (lowerCaseMessage.includes('future') || lowerCaseMessage.includes('predict')) {
      response = "Based on your past behaviors and current trajectory, I predict you'll likely focus more on your personal projects in the coming weeks. Would you like me to suggest an optimal path toward your goals?";
      actions = [
        {
          label: 'Run Simulation',
          icon: FaClock,
          action: () => navigateToTab(1), // Simulation tab
          type: 'primary'
        }
      ];
    } else if (lowerCaseMessage.includes('goal') || lowerCaseMessage.includes('achievement')) {
      response = "I notice you've been working toward improving your health habits. At your current pace, you'll reach your initial fitness goal in approximately 3 weeks. Would you like me to suggest adjustments to optimize your progress?";
      actions = [
        {
          label: 'View Progress',
          icon: FaChartLine,
          action: () => navigateToTab(0), // Growth Tracker tab
          type: 'primary'
        },
        {
          label: 'Optimize Plan',
          icon: FaBrain,
          action: () => navigateToTab(2), // Personality Engine tab
          type: 'secondary'
        }
      ];
    } else if (lowerCaseMessage.includes('journal') || lowerCaseMessage.includes('write') || lowerCaseMessage.includes('diary')) {
      response = "I've created a new journal entry for you. Would you like to open it and start writing?";
      actions = [
        {
          label: 'Open Journal',
          icon: FaDatabase,
          action: () => {
            toast({
              title: "Journal Feature Coming Soon",
              description: "We're working on implementing the journaling feature. Stay tuned!",
              status: "info",
              duration: 3000,
              isClosable: true,
            });
          },
          type: 'primary'
        }
      ];
    } else if (lowerCaseMessage.includes('stressed') || lowerCaseMessage.includes('stress') || lowerCaseMessage.includes('anxious')) {
      response = "I've noticed patterns in your data that suggest you typically handle stress through creative outlets. Based on your calendar, you might benefit from scheduling some creative time this weekend. Your past data shows this significantly reduces your stress levels.";
      actions = [
        {
          label: 'View Stress Patterns',
          icon: FaChartLine,
          action: () => navigateToTab(0), // Growth Tracker tab
          type: 'primary'
        }
      ];
    } else if (lowerCaseMessage.includes('connect') || lowerCaseMessage.includes('data') || lowerCaseMessage.includes('github') || lowerCaseMessage.includes('calendar')) {
      response = "I can help you connect various data sources to enhance your digital twin. This will help me provide more accurate insights and predictions.";
      actions = [
        {
          label: 'Connect Data Sources',
          icon: FaDatabase,
          action: () => navigateToTab(3), // Data Ingestion tab
          type: 'primary'
        }
      ];
    } else {
      response = "Based on my analysis of your patterns, I think you might be interested in exploring this further. Would you like me to simulate a few potential outcomes based on different approaches you could take?";
      actions = [
        {
          label: 'Run Simulation',
          icon: FaClock,
          action: () => navigateToTab(1), // Simulation tab
          type: 'primary'
        }
      ];
    }
    
    // Add the twin's response to messages
    setMessages((prevMessages) => [
      ...prevMessages, 
      { 
        id: Date.now().toString(), 
        text: response, 
        sender: 'twin', 
        timestamp: new Date(),
        actions: actions
      }
    ]);
    
    // Reset twin mood after a short period
    setTimeout(() => {
      setTwinMood('neutral');
    }, 5000);
  };

  const navigateToTab = (tabIndex: number) => {
    if (onNavigateTab) {
      onNavigateTab(tabIndex);
    }
    
    if (onClose) {
      onClose();
    }
    
    toast({
      title: "Navigating to Dashboard",
      description: "Opening the selected feature for you.",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };
  
  const startVoiceInput = () => {
    // In a real implementation, this would use the Web Speech API
    setIsRecording(true);
    
    // Simulate recording for demo purposes
    setTimeout(() => {
      setIsRecording(false);
      setInputMessage('Voice input simulation message');
    }, 2000);
  };
  
  const toggleVoiceOutput = () => {
    setVoiceEnabled(!voiceEnabled);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  // Message animation variants
  const messageVariants = {
    initial: { opacity: 0, scale: 0.8, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: -20 }
  };
  
  // Thinking dots animation variants
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: [0, -5, 0] }
  };

  const isDark = colorMode === 'dark';
  const bgColor = isDark ? 'gray.800' : 'white';
  const textColor = isDark ? 'white' : 'gray.800';
  const userBubbleColor = isDark ? 'brand.500' : 'brand.400';
  const twinBubbleColor = isDark ? 'gray.700' : 'gray.100';
  
  // Handle voice commands
  const handleVoiceCommand = (command: string) => {
    if (command === 'send') {
      handleSendMessage();
    } else {
      // Add the voice command as a message
      setInputMessage(command);
    }
  };
  
  // Handle voice input
  const handleVoiceInput = (text: string) => {
    setInputMessage(text);
    // Auto-send if it appears to be a question
    if (text.trim().endsWith('?')) {
      setTimeout(() => {
        handleSendMessage();
      }, 500);
    }
  };

  return (
    <Box>
      <Flex
        direction="column"
        bg={bgColor}
        borderRadius="lg"
        borderWidth={1}
        borderColor={isDark ? 'gray.700' : 'gray.200'}
        overflow="hidden"
        boxShadow="md"
        height="600px"
      >
        {/* Chat Header */}
        <Flex 
          justify="space-between" 
          align="center" 
          p={4} 
          borderBottomWidth={1}
          borderBottomColor={isDark ? 'gray.700' : 'gray.200'}
        >
          <Heading size="md" display="flex" alignItems="center">
            <Box as={FaRobot} mr={2} color={isDark ? 'brand.500' : 'brand.400'} />
            Chat with Your Digital Twin
          </Heading>
          
          <HStack spacing={2}>
            <Tooltip label={voiceMode ? "Disable voice mode" : "Enable voice mode"}>
              <IconButton
                aria-label={voiceMode ? "Disable voice mode" : "Enable voice mode"}
                icon={voiceMode ? <FaMicrophone /> : <FaMicrophoneSlash />}
                size="sm"
                colorScheme={voiceMode ? "green" : "gray"}
                onClick={() => {
                  setVoiceMode(!voiceMode);
                  if (!voiceMode) {
                    onOpen(); // Open the voice drawer when enabling voice mode
                  }
                }}
              />
            </Tooltip>
            <Tooltip label="View info">
              <IconButton
                aria-label="Info"
                icon={<FaInfoCircle />}
                variant="ghost"
                size="sm"
                onClick={onOpen}
              />
            </Tooltip>
            {onClose && (
              <Tooltip label="Close chat">
                <IconButton
                  aria-label="Close"
                  icon={<Icon as={FaSearch} transform="rotate(45deg)" />}
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                />
              </Tooltip>
            )}
          </HStack>
        </Flex>
        
        {/* Chat Messages */}
        <Box 
          flex={1} 
          p={4} 
          overflowY="auto" 
          bgGradient={isDark 
            ? "linear(to-b, gray.800, gray.900)" 
            : "linear(to-b, white, gray.50)"
          }
          css={{
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              width: '10px',
              background: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              borderRadius: '24px',
            },
          }}
        >
          <VStack spacing={6} align="stretch">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <MotionBox
                  key={message.id}
                  variants={messageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ type: "spring", damping: 25, stiffness: 500 }}
                >
                  {message.isThinking ? (
                    // Thinking indicator
                    <Flex justify="flex-start" mb={2}>
                      <Box 
                        px={4} 
                        py={2} 
                        borderRadius="lg" 
                        maxW="80%" 
                        bg={twinBubbleColor}
                        display="flex"
                        alignItems="center"
                      >
                        <MotionFlex>
                          {[0, 1, 2].map((i) => (
                            <MotionBox
                              key={i}
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "full",
                                background: isDark ? "gray.400" : "gray.500",
                                marginLeft: "2px",
                                marginRight: "2px"
                              }}
                              variants={dotVariants}
                              animate="animate"
                              transition={{
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: 0.6,
                                delay: i * 0.1
                              }}
                            />
                          ))}
                        </MotionFlex>
                      </Box>
                    </Flex>
                  ) : (
                    // Regular message
                    <Flex 
                      justify={message.sender === 'user' ? 'flex-end' : 'flex-start'} 
                      mb={2}
                    >
                      {message.sender === 'twin' && (
                        <Box mr={2} alignSelf="flex-end" mb={1}>
                          <AvatarDisplay size="sm" mood={twinMood} interactive={false} />
                        </Box>
                      )}
                      <VStack spacing={1} align={message.sender === 'user' ? 'flex-end' : 'flex-start'} maxW="80%">
                        <Box 
                          px={4} 
                          py={3} 
                          borderRadius={message.sender === 'user' ? "2xl 2xl 0 2xl" : "2xl 2xl 2xl 0"} 
                          bg={message.sender === 'user' ? 
                            isDark ? 'brand.500' : 'brand.400' : 
                            isDark ? 'gray.700' : 'gray.100'
                          }
                          color={message.sender === 'user' ? 'white' : textColor}
                          boxShadow={`0 2px 8px ${message.sender === 'user' ? 
                            isDark ? 'rgba(106, 38, 255, 0.3)' : 'rgba(106, 38, 255, 0.2)' : 
                            isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'
                          }`}
                          position="relative"
                          _hover={{
                            bg: message.sender === 'user' ? 
                              isDark ? 'brand.600' : 'brand.500' : 
                              isDark ? 'gray.800' : 'gray.200',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Text fontSize="md" lineHeight="1.6">{message.text}</Text>
                        </Box>
                        
                        {/* Message metadata */}
                        <Flex 
                          justify={message.sender === 'user' ? 'flex-end' : 'flex-start'} 
                          align="center"
                          px={2}
                        >
                          <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                          {message.sender === 'user' && message.status && (
                            <Box ml={1}>
                              {message.status === 'sending' && <Spinner size="xs" color="gray.400" />}
                              {message.status === 'sent' && <Icon as={FaCheck} color="gray.400" fontSize="xs" />}
                              {message.status === 'delivered' && (
                                <Icon as={FaCheckDouble} color="gray.400" fontSize="xs" />
                              )}
                              {message.status === 'read' && (
                                <Icon as={FaCheckDouble} color="blue.400" fontSize="xs" />
                              )}
                            </Box>
                          )}
                        </Flex>
                        
                        {/* Message actions */}
                        {message.actions && message.actions.length > 0 && (
                          <HStack spacing={2} mt={2}>
                            {message.actions.map((action, index) => (
                              <Button
                                key={index}
                                size="xs"
                                leftIcon={<Icon as={action.icon} />}
                                onClick={action.action}
                                colorScheme={action.type === 'primary' ? 'brand' : 'gray'}
                                variant={action.type === 'primary' ? 'solid' : 'outline'}
                                borderRadius="full"
                                boxShadow="sm"
                                _hover={{
                                  transform: 'translateY(-2px)',
                                  boxShadow: 'md'
                                }}
                                transition="all 0.2s ease"
                              >
                                {action.label}
                              </Button>
                            ))}
                          </HStack>
                        )}
                      </VStack>
                      
                      {message.sender === 'user' && (
                        <Avatar 
                          size="xs" 
                          ml={2} 
                          alignSelf="flex-end"
                          mb={1} 
                          src={userAvatar} 
                          bg="gray.300"
                          icon={<Icon as={FaUserAlt} fontSize="xs" />}
                          boxShadow="sm"
                        />
                      )}
                    </Flex>
                  )}
                </MotionBox>
              ))}
            </AnimatePresence>
          </VStack>
          <div ref={messagesEndRef} />
        </Box>
        
        {/* Suggested prompts */}
        <Box 
          px={4} 
          py={2} 
          bg={isDark ? 'gray.700' : 'gray.50'} 
          borderTop="1px solid" 
          borderColor={isDark ? 'gray.600' : 'gray.200'}
          overflowX="auto"
          css={{
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              display: 'none'
            }
          }}
        >
          <Flex gap={2} wrap="nowrap">
            {suggestionPrompts.map((prompt, index) => (
              <Button 
                key={index}
                size="xs"
                variant="outline"
                colorScheme="gray"
                whiteSpace="nowrap"
                flexShrink={0}
                onClick={() => handleSuggestionClick(prompt)}
                _hover={{ bg: isDark ? 'gray.600' : 'gray.100' }}
              >
                {prompt}
              </Button>
            ))}
          </Flex>
        </Box>
        
        {/* Input Area */}
        <Flex p={4} borderTopWidth={1} borderTopColor={isDark ? 'gray.700' : 'gray.200'}>
          <Input
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            mr={2}
          />
          <Button 
            colorScheme="blue"
            isLoading={isRecording}
            onClick={handleSendMessage}
          >
            Send
          </Button>
          
          {/* Voice input button */}
          <Tooltip label={voiceMode ? "Voice mode enabled" : "Enable voice input"}>
            <IconButton
              aria-label="Voice input"
              icon={voiceMode ? <FaMicrophone /> : <FaMicrophoneSlash />}
              colorScheme={voiceMode ? "green" : "gray"}
              ml={2}
              size="sm"
              onClick={() => {
                setVoiceMode(!voiceMode);
                if (!voiceMode) {
                  onOpen(); // Open the voice drawer when enabling voice mode
                }
              }}
            />
          </Tooltip>
        </Flex>
      </Flex>
      
      {/* Voice Interface Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={() => {
          onClose();
          if (voiceMode) {
            setVoiceMode(false);
          }
        }}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Voice Commands</DrawerHeader>
          
          <DrawerBody>
            <VoiceInterface 
              onVoiceCommand={handleVoiceCommand}
              onVoiceInput={handleVoiceInput}
              showTutorial={true}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
} 