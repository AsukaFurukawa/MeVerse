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
  MenuDivider
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
  FaUserAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import AvatarDisplay from './AvatarDisplay';

// Motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionText = motion(Text);

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'twin';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  isThinking?: boolean;
}

interface ChatInterfaceProps {
  userName?: string;
  userAvatar?: string;
}

export default function ChatInterface({ 
  userName = 'You',
  userAvatar
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Sample suggestion prompts
  const suggestionPrompts = [
    "How will I handle stress next week?",
    "What habit should I develop?",
    "Predict my reaction to this situation...",
    "Help me plan my next month"
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
    const lowerCaseMessage = userMessage.toLowerCase();
    
    // Simple pattern matching for demo purposes
    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
      response = `Hello ${userName}! How's your day going?`;
    } else if (lowerCaseMessage.includes('how are you')) {
      response = "As your digital twin, I reflect your current state. Based on your recent data, you seem to be doing fairly well, though your sleep patterns suggest you might be a bit tired.";
    } else if (lowerCaseMessage.includes('future') || lowerCaseMessage.includes('predict')) {
      response = "Based on your past behaviors and current trajectory, I predict you'll likely focus more on your personal projects in the coming weeks. Would you like me to suggest an optimal path toward your goals?";
    } else if (lowerCaseMessage.includes('goal') || lowerCaseMessage.includes('achievement')) {
      response = "I notice you've been working toward improving your health habits. At your current pace, you'll reach your initial fitness goal in approximately 3 weeks. Would you like me to suggest adjustments to optimize your progress?";
    } else if (lowerCaseMessage.includes('stressed') || lowerCaseMessage.includes('stress') || lowerCaseMessage.includes('anxious')) {
      response = "I've noticed patterns in your data that suggest you typically handle stress through creative outlets. Based on your calendar, you might benefit from scheduling some creative time this weekend. Your past data shows this significantly reduces your stress levels.";
    } else {
      response = "Based on my analysis of your patterns, I think you might be interested in exploring this further. Would you like me to simulate a few potential outcomes based on different approaches you could take?";
    }
    
    // Add the twin's response to messages
    setMessages((prevMessages) => [
      ...prevMessages, 
      { 
        id: Date.now().toString(), 
        text: response, 
        sender: 'twin', 
        timestamp: new Date() 
      }
    ]);
    
    // Reset twin mood after a short period
    setTimeout(() => {
      setTwinMood('neutral');
    }, 5000);
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
    animate: { 
      y: [0, -10, 0],
      transition: { 
        repeat: Infinity, 
        duration: 0.8, 
        ease: "easeInOut",
        repeatType: "loop" 
      }
    }
  };

  return (
    <Flex 
      direction="column" 
      h="100%" 
      bg={colorMode === 'dark' ? 'dark.200' : 'white'}
      position="relative"
      overflow="hidden"
    >
      {/* Chat Header */}
      <Flex 
        align="center" 
        p={4} 
        bg={colorMode === 'dark' ? 'dark.100' : 'gray.50'}
        borderBottomWidth="1px"
        borderBottomColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
        position="relative"
        zIndex="3"
      >
        <Flex align="center" flex="1">
          <MotionBox
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            mr={3}
          >
            <Box w="50px" h="50px">
              <AvatarDisplay size="sm" mood={twinMood} interactive={false} />
            </Box>
          </MotionBox>
          <Box>
            <MotionText 
              fontWeight="bold"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Your Digital Twin
            </MotionText>
            <HStack spacing={1}>
              <MotionBox
                width="8px" 
                height="8px" 
                borderRadius="full" 
                bg="green.400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              />
              <MotionText 
                fontSize="xs" 
                color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Always syncing
              </MotionText>
            </HStack>
          </Box>
        </Flex>
        
        <HStack spacing={2}>
          <Tooltip label={voiceEnabled ? "Disable voice responses" : "Enable voice responses"}>
            <IconButton
              aria-label="Toggle voice"
              icon={<Icon as={voiceEnabled ? FaVolumeUp : FaVolumeMute} />}
              variant="ghost"
              size="sm"
              onClick={toggleVoiceOutput}
            />
          </Tooltip>
          
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<Icon as={FaEllipsisH} />}
              variant="ghost"
              size="sm"
            />
            <MenuList bg={colorMode === 'dark' ? 'dark.100' : 'white'}>
              <MenuItem icon={<Icon as={FaHistory} />}>View conversation history</MenuItem>
              <MenuItem icon={<Icon as={FaSearch} />}>Search conversations</MenuItem>
              <MenuDivider />
              <MenuItem icon={<Icon as={FaInfoCircle} />}>About your digital twin</MenuItem>
              <MenuItem icon={<Icon as={FaUserAlt} />}>Settings</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
      
      {/* Messages Area */}
      <MotionBox 
        flex="1" 
        overflowY="auto" 
        p={4} 
        css={{
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            width: '10px',
            background: colorMode === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            borderRadius: '24px',
          },
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <VStack spacing={4} align="stretch">
          <AnimatePresence>
            {messages.map((message) => (
              <MotionFlex
                key={message.id}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={messageVariants}
                transition={{ type: "spring", duration: 0.5 }}
                mb={2}
                justify={message.sender === 'user' ? 'flex-end' : 'flex-start'}
              >
                {message.isThinking ? (
                  // Thinking indicator
                  <MotionFlex
                    p={3}
                    borderRadius="lg"
                    bg={colorMode === 'dark' ? 'dark.100' : 'gray.100'}
                    align="center"
                    maxW="80%"
                  >
                    <Box position="relative" height="30px" width="60px">
                      {[0, 1, 2].map((i) => (
                        <MotionBox
                          key={i}
                          position="absolute"
                          left={`${i * 20 + 10}px`}
                          bottom="10px"
                          width="10px"
                          height="10px"
                          borderRadius="full"
                          bg={colorMode === 'dark' ? 'gray.400' : 'gray.500'}
                          variants={dotVariants}
                          initial="initial"
                          animate="animate"
                          custom={i * 0.2}
                          style={{ originY: 0.7 }}
                        />
                      ))}
                    </Box>
                  </MotionFlex>
                ) : (
                  // Normal message
                  <MotionFlex
                    direction="column"
                    p={3}
                    borderRadius="lg"
                    bg={message.sender === 'user' 
                      ? colorMode === 'dark' ? 'brand.600' : 'brand.500'
                      : colorMode === 'dark' ? 'dark.100' : 'gray.100'
                    }
                    color={message.sender === 'user' ? 'white' : 'inherit'}
                    maxW="80%"
                    boxShadow="sm"
                    position="relative"
                    _after={message.sender === 'user' ? {
                      content: '""',
                      position: 'absolute',
                      right: '-8px',
                      bottom: '15px',
                      borderWidth: '8px',
                      borderStyle: 'solid',
                      borderColor: `transparent transparent transparent ${colorMode === 'dark' ? 'var(--chakra-colors-brand-600)' : 'var(--chakra-colors-brand-500)'}`
                    } : {
                      content: '""',
                      position: 'absolute',
                      left: '-8px',
                      bottom: '15px',
                      borderWidth: '8px',
                      borderStyle: 'solid',
                      borderColor: `transparent ${colorMode === 'dark' ? 'var(--chakra-colors-dark-100)' : 'var(--chakra-colors-gray-100)'} transparent transparent`
                    }}
                  >
                    <Text>{message.text}</Text>
                    <Text 
                      fontSize="xs" 
                      opacity={0.7} 
                      alignSelf={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                      mt={1}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {message.sender === 'user' && message.status && (
                        <Text as="span" ml={1} fontSize="2xs">
                          {message.status === 'sending' ? 'sending...' : 
                           message.status === 'sent' ? 'sent' : 
                           message.status === 'delivered' ? 'delivered' :
                           'read'}
                        </Text>
                      )}
                    </Text>
                  </MotionFlex>
                )}
              </MotionFlex>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </VStack>
      </MotionBox>
      
      {/* Suggested Prompts */}
      <Flex 
        px={4} 
        py={2} 
        overflowX="auto" 
        borderTopWidth="1px"
        borderTopColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
        css={{
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          'scrollbarWidth': 'none'
        }}
      >
        <AnimatePresence>
          <HStack spacing={2}>
            {suggestionPrompts.map((prompt, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button 
                  size="sm" 
                  variant="outline" 
                  borderRadius="full" 
                  onClick={() => handleSuggestionClick(prompt)}
                  borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.300'}
                  _hover={{
                    bg: colorMode === 'dark' ? 'dark.100' : 'gray.50',
                    borderColor: 'brand.400'
                  }}
                >
                  {prompt}
                </Button>
              </MotionBox>
            ))}
          </HStack>
        </AnimatePresence>
      </Flex>
      
      {/* Input Area */}
      <Flex 
        p={4} 
        borderTopWidth="1px"
        borderTopColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
        bg={colorMode === 'dark' ? 'dark.100' : 'gray.50'}
        position="relative"
        zIndex="3"
      >
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          flex="1"
          position="relative"
        >
          <Input
            placeholder="Type a message..."
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            borderRadius="full"
            bg={colorMode === 'dark' ? 'dark.200' : 'white'}
            px={4}
            pr={12}
            h="50px"
            border="1px solid"
            borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.300'}
            _focus={{
              borderColor: 'brand.500',
              boxShadow: colorMode === 'dark' ? '0 0 0 1px var(--chakra-colors-brand-500)' : '0 0 0 1px var(--chakra-colors-brand-500)'
            }}
            ref={inputRef}
          />
          
          <HStack position="absolute" right="4" top="50%" transform="translateY(-50%)" spacing={2}>
            <Tooltip label="Add emoji">
              <IconButton
                aria-label="Add emoji"
                icon={<Icon as={FaSmile} />}
                variant="ghost"
                size="sm"
                color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}
                _hover={{ color: 'brand.500' }}
              />
            </Tooltip>
            
            <Tooltip label="Attach file">
              <IconButton
                aria-label="Attach file"
                icon={<Icon as={FaPaperclip} />}
                variant="ghost"
                size="sm"
                color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}
                _hover={{ color: 'brand.500' }}
              />
            </Tooltip>
          </HStack>
        </MotionBox>
        
        <MotionBox
          ml={3}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          {inputMessage.trim() ? (
            <IconButton
              colorScheme="brand"
              aria-label="Send message"
              icon={<Icon as={FaPaperPlane} />}
              onClick={handleSendMessage}
              borderRadius="full"
              size="lg"
              bg="brand.500"
              _hover={{ bg: 'brand.600' }}
              _active={{ bg: 'brand.700' }}
            />
          ) : (
            <IconButton
              aria-label="Voice message"
              icon={isRecording ? <Spinner size="sm" /> : <Icon as={FaMicrophone} />}
              onClick={startVoiceInput}
              borderRadius="full"
              size="lg"
              bg={colorMode === 'dark' ? 'brand.600' : 'brand.500'}
              color="white"
              _hover={{ bg: 'brand.600' }}
              _active={{ bg: 'brand.700' }}
            />
          )}
        </MotionBox>
      </Flex>
    </Flex>
  );
} 