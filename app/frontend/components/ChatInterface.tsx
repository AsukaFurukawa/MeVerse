import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  Input, 
  Button, 
  Text, 
  VStack, 
  HStack, 
  Avatar, 
  useColorMode,
  Icon,
  Spinner
} from '@chakra-ui/react';
import { FaPaperPlane, FaMicrophone, FaRobot } from 'react-icons/fa';
import { motion } from 'framer-motion';
import AvatarDisplay from './AvatarDisplay';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'twin';
  timestamp: Date;
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
      text: "Hello! I'm your digital twin. How can I help you today?",
      sender: 'twin',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mood state for the twin's avatar
  const [twinMood, setTwinMood] = useState('neutral');
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsTyping(true);
    
    // In a real app, this would call the backend API
    // Simulate API call with setTimeout
    setTimeout(() => {
      const responseText = generateMockResponse(inputText);
      const responseMood = detectMood(responseText);
      
      const newTwinMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'twin',
        timestamp: new Date()
      };
      
      setTwinMood(responseMood);
      setMessages(prev => [...prev, newTwinMessage]);
      setIsTyping(false);
    }, 1500);
  };
  
  // Mock response generator - would be replaced with actual API call
  const generateMockResponse = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('hello') || lowerText.includes('hi')) {
      return "Hello! It's great to chat with you. How are you feeling today?";
    }
    
    if (lowerText.includes('how are you')) {
      return "As your digital twin, I'm always ready to help! I'm learning more about you with every interaction.";
    }
    
    if (lowerText.includes('what if') || lowerText.includes('predict')) {
      return "That's an interesting scenario to consider. Based on your past preferences and behavior patterns, I'd predict this outcome would be moderately successful for you. Would you like me to analyze this further?";
    }
    
    if (lowerText.includes('personality') || lowerText.includes('who am i')) {
      return "Based on our interactions, you tend to exhibit strong openness to new experiences and conscientiousness. You're thoughtful about your decisions and value innovation.";
    }
    
    if (lowerText.includes('help') || lowerText.includes('what can you do')) {
      return "I can predict how you might respond to different scenarios, provide guidance on decisions, track your growth over time, and offer insights about your personality traits. What would you like to explore?";
    }
    
    // Default response
    return "That's interesting! As I learn more about you, I'll be able to provide more personalized responses. Would you like to explore a 'what if' scenario, check your personality profile, or track your growth?";
  };
  
  // Simple mood detection - would be more sophisticated in production
  const detectMood = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('great') || lowerText.includes('happy') || lowerText.includes('excellent')) {
      return 'happy';
    }
    
    if (lowerText.includes('interesting') || lowerText.includes('exciting')) {
      return 'excited';
    }
    
    if (lowerText.includes('sorry') || lowerText.includes('unfortunately')) {
      return 'sad';
    }
    
    return 'neutral';
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  return (
    <Flex direction="column" h="100%" bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}>
      <Flex 
        align="center" 
        p={4} 
        bg={colorMode === 'dark' ? 'gray.700' : 'white'} 
        borderBottom="1px solid"
        borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
      >
        <Box mr={4}>
          <AvatarDisplay size="sm" interactive={false} mood={twinMood} />
        </Box>
        <Box>
          <Text fontWeight="bold">Your Digital Twin</Text>
          <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>
            Online - Learning from your data
          </Text>
        </Box>
      </Flex>
      
      <Box 
        flex="1" 
        overflowY="auto" 
        p={4} 
        css={{
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            width: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: colorMode === 'dark' ? '#4A5568' : '#CBD5E0',
            borderRadius: '24px',
          },
        }}
      >
        <VStack spacing={4} align="stretch">
          {messages.map((message) => (
            <Flex 
              key={message.id} 
              justifyContent={message.sender === 'user' ? 'flex-end' : 'flex-start'}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ maxWidth: '70%' }}
              >
                <HStack alignItems="flex-start" spacing={2}>
                  {message.sender === 'twin' && (
                    <Box mt={1}>
                      <AvatarDisplay size="sm" interactive={false} mood={twinMood} />
                    </Box>
                  )}
                  
                  <Box
                    bg={message.sender === 'user' 
                      ? colorMode === 'dark' ? 'purple.700' : 'purple.500' 
                      : colorMode === 'dark' ? 'gray.700' : 'white'
                    }
                    color={message.sender === 'user' ? 'white' : undefined}
                    p={3}
                    borderRadius="lg"
                    boxShadow="sm"
                  >
                    <Text>{message.text}</Text>
                    <Text 
                      fontSize="xs" 
                      color={message.sender === 'user' 
                        ? 'whiteAlpha.700' 
                        : colorMode === 'dark' ? 'gray.400' : 'gray.500'
                      }
                      textAlign="right"
                      mt={1}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </Box>
                  
                  {message.sender === 'user' && userAvatar && (
                    <Avatar size="sm" src={userAvatar} mt={1} />
                  )}
                  
                  {message.sender === 'user' && !userAvatar && (
                    <Avatar size="sm" bg="purple.500" color="white" name={userName} mt={1} />
                  )}
                </HStack>
              </motion.div>
            </Flex>
          ))}
          
          {isTyping && (
            <Flex justify="flex-start">
              <Box
                bg={colorMode === 'dark' ? 'gray.700' : 'white'}
                p={3}
                borderRadius="lg"
                boxShadow="sm"
                width="70px"
              >
                <Flex align="center">
                  <Text mr={2}>Typing</Text>
                  <Spinner size="xs" />
                </Flex>
              </Box>
            </Flex>
          )}
          
          <Box ref={messagesEndRef} />
        </VStack>
      </Box>
      
      <HStack 
        p={4} 
        bg={colorMode === 'dark' ? 'gray.700' : 'white'} 
        borderTop="1px solid"
        borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
        spacing={2}
      >
        <Input 
          placeholder="Type a message..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          bg={colorMode === 'dark' ? 'gray.800' : 'gray.100'}
          border="none"
          flex="1"
        />
        <Button 
          colorScheme="purple" 
          onClick={handleSendMessage}
          isDisabled={!inputText.trim()}
        >
          <Icon as={FaPaperPlane} />
        </Button>
        <Button colorScheme="gray">
          <Icon as={FaMicrophone} />
        </Button>
      </HStack>
    </Flex>
  );
} 