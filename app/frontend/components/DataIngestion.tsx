import { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Grid,
  GridItem,
  Stack,
  HStack,
  VStack,
  Icon,
  useColorMode,
  Badge,
  Tag,
  Skeleton,
  Progress,
  Switch,
  FormControl,
  FormLabel,
  Divider,
  useToast
} from '@chakra-ui/react';
import {
  FaDatabase,
  FaGoogle,
  FaCalendarAlt,
  FaGithub,
  FaSpotify,
  FaApple,
  FaRunning,
  FaHeart,
  FaCloudUploadAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaClock,
  FaChartLine,
  FaPlus
} from 'react-icons/fa';
import { motion } from 'framer-motion';

// Create motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionText = motion(Text);
const MotionProgress = motion(Progress);
const MotionHeading = motion(Heading);

interface DataIngestionProps {
  userId?: string;
}

interface DataSource {
  id: string;
  name: string;
  icon: React.ComponentType;
  connected: boolean;
  lastSync?: string;
  dataPoints?: number;
  description: string;
}

interface InsightSource {
  category: string;
  name: string;
  count: number;
  color: string;
  active: boolean;
}

// Mock data - Replace with API calls
const mockDataSources: DataSource[] = [
  {
    id: "google_calendar",
    name: "Google Calendar",
    icon: FaGoogle,
    connected: true,
    lastSync: "Today at 9:32 AM",
    dataPoints: 342,
    description: "Calendar events, meetings, and appointments"
  },
  {
    id: "github",
    name: "GitHub",
    icon: FaGithub,
    connected: true,
    lastSync: "Yesterday at 6:15 PM",
    dataPoints: 1204,
    description: "Coding activity, commits, and project work"
  },
  {
    id: "spotify",
    name: "Spotify",
    icon: FaSpotify,
    connected: false,
    description: "Music preferences and listening habits"
  },
  {
    id: "apple_health",
    name: "Apple Health",
    icon: FaApple,
    connected: true,
    lastSync: "Today at 8:45 AM",
    dataPoints: 8765,
    description: "Health metrics, activity, and sleep data"
  },
  {
    id: "fitbit",
    name: "Fitbit",
    icon: FaRunning,
    connected: false,
    description: "Exercise, steps, and physical activity tracking"
  }
];

const mockInsightSources: InsightSource[] = [
  { category: "health", name: "Sleep Patterns", count: 187, color: "purple", active: true },
  { category: "productivity", name: "Deep Work Sessions", count: 42, color: "blue", active: true },
  { category: "social", name: "Social Interactions", count: 96, color: "pink", active: true },
  { category: "mood", name: "Mood Tracking", count: 124, color: "yellow", active: true },
  { category: "leisure", name: "Entertainment", count: 53, color: "green", active: false },
  { category: "learning", name: "Learning Activities", count: 78, color: "cyan", active: true },
];

export default function DataIngestion({ userId }: DataIngestionProps) {
  const { colorMode } = useColorMode();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [insightSources, setInsightSources] = useState<InsightSource[]>([]);
  const [syncInProgress, setSyncInProgress] = useState<boolean>(false);
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const toast = useToast();
  
  const isDark = colorMode === 'dark';
  const bgColor = isDark ? 'gray.800' : 'white';
  const textColor = isDark ? 'white' : 'gray.800';
  const accentColor = isDark ? 'green.400' : 'green.500';
  const subtleColor = isDark ? 'whiteAlpha.100' : 'blackAlpha.50';

  useEffect(() => {
    loadDataSources();
  }, []);
  
  const loadDataSources = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setDataSources(mockDataSources);
      setInsightSources(mockInsightSources);
      setIsLoading(false);
    }, 1000);
  };
  
  const toggleConnection = (sourceId: string) => {
    // For demo purposes, simulate OAuth flow
    if (!dataSources.find(s => s.id === sourceId)?.connected) {
      // If connecting, open a simulated OAuth window
      const source = dataSources.find(s => s.id === sourceId);
      
      toast({
        title: `Connecting to ${source?.name}`,
        description: "Redirecting to authentication page...",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
      
      // Simulate OAuth process
      setTimeout(() => {
        setDataSources(prev => 
          prev.map(source => 
            source.id === sourceId 
              ? { 
                  ...source, 
                  connected: true,
                  lastSync: "Just now",
                  dataPoints: Math.floor(Math.random() * 1000) + 100
                } 
              : source
          )
        );
        
        toast({
          title: "Connection Successful",
          description: `${dataSources.find(s => s.id === sourceId)?.name} has been connected successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }, 2000);
    } else {
      // If disconnecting, just update the state
      setDataSources(prev => 
        prev.map(source => 
          source.id === sourceId 
            ? { 
                ...source, 
                connected: false,
                lastSync: undefined,
                dataPoints: undefined
              } 
            : source
        )
      );
      
      const source = dataSources.find(s => s.id === sourceId);
      
      toast({
        title: "Disconnected",
        description: `${source?.name} has been disconnected successfully.`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const toggleInsightSource = (idx: number) => {
    setInsightSources(prev => 
      prev.map((source, i) => 
        i === idx ? { ...source, active: !source.active } : source
      )
    );
  };
  
  const syncAllData = () => {
    setSyncInProgress(true);
    setSyncProgress(0);
    
    // Simulate sync progress
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSyncInProgress(false);
          
          // Update last sync time for all connected sources
          setDataSources(prev => 
            prev.map(source => 
              source.connected
                ? { 
                    ...source, 
                    lastSync: "Just now",
                    dataPoints: source.dataPoints ? source.dataPoints + Math.floor(Math.random() * 50) : Math.floor(Math.random() * 1000)
                  } 
                : source
            )
          );
          
          toast({
            title: "Sync Complete",
            description: "All data sources have been synchronized successfully.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const gradientBg = isDark
    ? 'linear-gradient(180deg, rgba(52, 211, 153, 0.05) 0%, rgba(56, 189, 248, 0.05) 100%)'
    : 'linear-gradient(180deg, rgba(52, 211, 153, 0.05) 0%, rgba(56, 189, 248, 0.05) 100%)';

  const totalConnectedSources = dataSources.filter(s => s.connected).length;
  const totalActiveSources = insightSources.filter(s => s.active).length;
  const totalDataPoints = dataSources.reduce((sum, source) => sum + (source.dataPoints || 0), 0);

  return (
    <MotionBox
      as="section"
      bg={bgColor}
      borderRadius="xl"
      p={6}
      boxShadow="xl"
      backdropFilter="blur(10px)"
      bgGradient={gradientBg}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      w="100%"
      position="relative"
      overflow="hidden"
    >
      {/* Floating gradient accent */}
      <Box 
        position="absolute" 
        w="300px" 
        h="300px" 
        borderRadius="full" 
        bg={isDark ? "green.500" : "green.400"} 
        opacity="0.1" 
        filter="blur(80px)" 
        bottom="-150px" 
        left="-100px" 
        zIndex="0" 
      />
      
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={2}>
        <MotionHeading
          as="h2"
          fontSize="2xl"
          variants={itemVariants}
          display="flex"
          alignItems="center"
        >
          <Box as={FaDatabase} mr={3} color={accentColor} />
          Data Ingestion
        </MotionHeading>
        
        <MotionFlex variants={itemVariants} align="center" gap={4}>
          <FormControl display="flex" alignItems="center" width="auto">
            <FormLabel htmlFor="auto-sync" mb="0" fontSize="sm">
              Auto-sync
            </FormLabel>
            <Switch 
              id="auto-sync" 
              colorScheme="green" 
              isChecked={autoSync} 
              onChange={() => setAutoSync(!autoSync)} 
            />
          </FormControl>
          
          <Button
            colorScheme="green"
            size="sm"
            leftIcon={<FaCloudUploadAlt />}
            onClick={syncAllData}
            isLoading={syncInProgress}
            loadingText={`${syncProgress}%`}
            isDisabled={totalConnectedSources === 0}
          >
            Sync Now
          </Button>
        </MotionFlex>
      </Flex>
      
      {syncInProgress && (
        <MotionBox mb={6} variants={itemVariants}>
          <Text fontSize="sm" mb={1}>Syncing {totalConnectedSources} data sources...</Text>
          <Progress 
            size="sm" 
            value={syncProgress} 
            colorScheme="green" 
            borderRadius="full" 
            hasStripe 
            isAnimated 
          />
        </MotionBox>
      )}
      
      <MotionFlex mb={8} gap={4} flexWrap="wrap" variants={itemVariants}>
        <Flex 
          p={4} 
          bg={subtleColor} 
          borderRadius="lg" 
          align="center" 
          minW="200px"
          flex="1"
        >
          <Box 
            as={FaDatabase} 
            mr={3} 
            fontSize="xl" 
            color={accentColor} 
          />
          <Box>
            <Text fontSize="sm" color={isDark ? "gray.400" : "gray.500"}>Connected Sources</Text>
            {isLoading ? (
              <Skeleton height="1em" width="3em" />
            ) : (
              <Text fontSize="xl" fontWeight="bold">
                {`${totalConnectedSources}/${dataSources.length}`}
              </Text>
            )}
          </Box>
        </Flex>
        
        <Flex 
          p={4} 
          bg={subtleColor} 
          borderRadius="lg" 
          align="center"
          minW="200px"
          flex="1"
        >
          <Box 
            as={FaChartLine} 
            mr={3} 
            fontSize="xl" 
            color="blue.400" 
          />
          <Box>
            <Text fontSize="sm" color={isDark ? "gray.400" : "gray.500"}>Data Points</Text>
            {isLoading ? (
              <Skeleton height="1em" width="4em" />
            ) : (
              <Text fontSize="xl" fontWeight="bold">
                {totalDataPoints.toLocaleString()}
              </Text>
            )}
          </Box>
        </Flex>
        
        <Flex 
          p={4} 
          bg={subtleColor} 
          borderRadius="lg" 
          align="center"
          minW="200px"
          flex="1"
        >
          <Box 
            as={FaHeart} 
            mr={3} 
            fontSize="xl" 
            color="pink.400" 
          />
          <Box>
            <Text fontSize="sm" color={isDark ? "gray.400" : "gray.500"}>Active Insights</Text>
            {isLoading ? (
              <Skeleton height="1em" width="3em" />
            ) : (
              <Text fontSize="xl" fontWeight="bold">
                {`${totalActiveSources}/${insightSources.length}`}
              </Text>
            )}
          </Box>
        </Flex>
      </MotionFlex>
      
      <Grid templateColumns={{ base: "1fr", lg: "3fr 2fr" }} gap={8}>
        <GridItem>
          <MotionBox variants={itemVariants}>
            <Heading size="md" mb={4}>Data Sources</Heading>
            
            <VStack spacing={4} align="stretch">
              {isLoading ? (
                [...Array(5)].map((_, idx) => (
                  <Skeleton key={idx} height="80px" width="100%" borderRadius="lg" />
                ))
              ) : (
                dataSources.map((source) => (
                  <Flex 
                    key={source.id}
                    p={4}
                    borderRadius="lg"
                    bg={subtleColor}
                    justify="space-between"
                    align="center"
                    position="relative"
                    overflow="hidden"
                  >
                    {source.connected && (
                      <Box 
                        position="absolute" 
                        top={0} 
                        left={0} 
                        w="4px" 
                        h="100%" 
                        bg={accentColor} 
                      />
                    )}
                    
                    <Flex align="center">
                      <Box 
                        as={source.icon} 
                        fontSize="2xl" 
                        color={source.connected ? accentColor : isDark ? "gray.500" : "gray.400"} 
                        mr={4} 
                      />
                      <Box>
                        <Flex align="center">
                          <Text fontWeight="medium">{source.name}</Text>
                          {source.connected && (
                            <Badge ml={2} colorScheme="green" borderRadius="full" px={2} fontSize="xs">
                              Connected
                            </Badge>
                          )}
                        </Flex>
                        <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
                          {source.description}
                        </Text>
                        {source.connected && source.lastSync && (
                          <Flex align="center" mt={1} fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
                            <Box as={FaClock} mr={1} fontSize="10px" />
                            Last sync: {source.lastSync}
                            {source.dataPoints && (
                              <>
                                <Box as="span" mx={1}>•</Box>
                                <Box as={FaDatabase} mr={1} fontSize="10px" />
                                {source.dataPoints.toLocaleString()} data points
                              </>
                            )}
                          </Flex>
                        )}
                      </Box>
                    </Flex>
                    
                    <Button
                      size="sm"
                      colorScheme={source.connected ? "gray" : "green"}
                      variant={source.connected ? "outline" : "solid"}
                      onClick={() => toggleConnection(source.id)}
                      leftIcon={source.connected ? <FaTimesCircle /> : <FaPlus />}
                      minW="120px"
                    >
                      {source.connected ? "Disconnect" : "Connect"}
                    </Button>
                  </Flex>
                ))
              )}
            </VStack>
          </MotionBox>
        </GridItem>
        
        <GridItem>
          <MotionBox variants={itemVariants}>
            <Heading size="md" mb={4}>Insight Sources</Heading>
            
            <VStack spacing={3} align="stretch">
              {isLoading ? (
                [...Array(6)].map((_, idx) => (
                  <Skeleton key={idx} height="36px" width="100%" borderRadius="md" />
                ))
              ) : (
                insightSources.map((source, idx) => (
                  <Flex 
                    key={idx}
                    p={3}
                    borderRadius="md"
                    bg={subtleColor}
                    justify="space-between"
                    align="center"
                  >
                    <Flex align="center">
                      <Box 
                        w="12px" 
                        h="12px" 
                        borderRadius="full" 
                        bg={`${source.color}.400`} 
                        mr={3} 
                      />
                      <Box>
                        <Text fontSize="sm" fontWeight="medium">{source.name}</Text>
                        <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>
                          {source.count.toLocaleString()} data points
                        </Text>
                      </Box>
                    </Flex>
                    
                    <Switch 
                      colorScheme={source.color}
                      size="sm"
                      isChecked={source.active}
                      onChange={() => toggleInsightSource(idx)}
                    />
                  </Flex>
                ))
              )}
            </VStack>
            
            <Button
              mt={4}
              size="sm"
              colorScheme="blue"
              variant="ghost"
              leftIcon={<FaPlus />}
              w="100%"
            >
              Add Custom Source
            </Button>
          </MotionBox>
        </GridItem>
      </Grid>
    </MotionBox>
  );
}