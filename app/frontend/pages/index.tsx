import { useState } from 'react';
import Head from 'next/head';
import { Box, Container, Flex, Heading, Text, Button, useColorMode, Icon } from '@chakra-ui/react';
import { FaMoon, FaSun, FaRobot, FaUser, FaChartLine, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Import our components
import AvatarDisplay from '../components/AvatarDisplay';
import ChatInterface from '../components/ChatInterface';

export default function Home() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <Head>
        <title>MeVerse - Your Digital Twin</title>
        <meta name="description" content="MeVerse - A digital twin that learns from your behavior and provides guidance" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box as="main" minH="100vh" bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}>
        <Flex 
          as="nav" 
          align="center" 
          justify="space-between" 
          wrap="wrap" 
          padding="1.5rem" 
          bg={colorMode === 'dark' ? 'gray.900' : 'white'}
          color={colorMode === 'dark' ? 'white' : 'gray.800'}
          boxShadow="sm"
        >
          <Flex align="center" mr={5}>
            <Icon as={FaRobot} w={8} h={8} mr={3} color="purple.500" />
            <Heading as="h1" size="lg" letterSpacing="tight">
              MeVerse
            </Heading>
          </Flex>

          <Flex>
            <Button mr={4} onClick={toggleColorMode}>
              <Icon as={colorMode === 'dark' ? FaSun : FaMoon} />
            </Button>
            <Button colorScheme="purple">
              Login
            </Button>
          </Flex>
        </Flex>

        <Container maxW="container.xl" pt={10}>
          {!showChat ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Flex direction="column" align="center" textAlign="center" mb={10}>
                <Heading as="h2" size="2xl" mb={4}>
                  Welcome to Your Digital Twin
                </Heading>
                <Text fontSize="xl" mb={8} maxW="container.md">
                  MeVerse learns from your behavior, habits, moods, and preferences to create a digital version of you that can predict how you would respond and provide guidance.
                </Text>
                <Button 
                  size="lg" 
                  colorScheme="purple" 
                  onClick={() => setShowChat(true)}
                  rightIcon={<Icon as={FaUser} />}
                >
                  Talk to Your Twin
                </Button>
              </Flex>

              <Flex 
                wrap="wrap" 
                justify="space-between" 
                mt={16} 
                gap={5}
              >
                {[
                  { 
                    title: 'Personality Profile', 
                    icon: FaUser,
                    description: 'Discover insights about your personality traits and behaviors.' 
                  },
                  { 
                    title: 'Future Simulations', 
                    icon: FaRobot,
                    description: 'Explore "what if" scenarios and get guidance on decisions.' 
                  },
                  { 
                    title: 'Growth Tracking', 
                    icon: FaChartLine,
                    description: 'Visualize your evolution over time and track progress.' 
                  },
                  { 
                    title: 'Habit Management', 
                    icon: FaCalendarAlt,
                    description: 'Log and analyze your daily habits and activities.' 
                  }
                ].map((feature, index) => (
                  <Box 
                    key={index}
                    p={5}
                    flex="1"
                    minW={['100%', '45%', '22%']}
                    borderRadius="lg"
                    boxShadow="md"
                    bg={colorMode === 'dark' ? 'gray.700' : 'white'}
                    _hover={{ transform: 'translateY(-5px)', transition: 'all 0.3s ease' }}
                  >
                    <Icon as={feature.icon} w={10} h={10} color="purple.500" mb={4} />
                    <Heading as="h3" size="md" mb={3}>
                      {feature.title}
                    </Heading>
                    <Text>{feature.description}</Text>
                  </Box>
                ))}
              </Flex>

              {/* Place for avatar display preview */}
              <Flex justify="center" my={20}>
                <AvatarDisplay 
                  size="lg" 
                  interactive={true} 
                  mood="neutral"
                />
              </Flex>
            </motion.div>
          ) : (
            <Flex h="70vh" direction="column">
              <Button alignSelf="flex-start" mb={4} onClick={() => setShowChat(false)}>
                Back
              </Button>
              <Box 
                flex="1" 
                borderRadius="lg" 
                boxShadow="lg" 
                bg={colorMode === 'dark' ? 'gray.700' : 'white'}
                overflow="hidden"
              >
                <ChatInterface userName="You" />
              </Box>
            </Flex>
          )}
        </Container>

        <Box 
          as="footer" 
          py={4} 
          textAlign="center" 
          mt={20} 
          bg={colorMode === 'dark' ? 'gray.900' : 'white'}
          color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}
        >
          <Text>MeVerse © {new Date().getFullYear()} - Your Digital Twin</Text>
        </Box>
      </Box>
    </>
  );
} 