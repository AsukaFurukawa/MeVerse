import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  Select, 
  Button, 
  Grid, 
  GridItem, 
  useColorMode,
  IconButton,
  Tag,
  Skeleton,
  HStack,
  VStack,
  Tooltip
} from '@chakra-ui/react';
import { 
  FaChartLine, 
  FaChartBar, 
  FaChartPie, 
  FaCalendarAlt, 
  FaArrowUp, 
  FaArrowDown, 
  FaBrain, 
  FaRunning, 
  FaHeart, 
  FaBookReader, 
  FaLightbulb
} from 'react-icons/fa';
import { motion } from 'framer-motion';

// Create motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionText = motion(Text);
const MotionHeading = motion(Heading);

interface GrowthTrackerProps {
  userId?: string;
}

interface VisualizationData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
  insights: string[];
}

// Mock data - Replace with API calls
const mockData: Record<string, VisualizationData> = {
  mood: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Average Mood',
        data: [7.2, 6.8, 7.5, 8.1, 7.9, 8.4],
        color: '#6366f1'
      }
    ],
    insights: [
      'Your mood has improved 15% over 6 months',
      'Peak mood days correlate with exercise',
      'Lower mood is often preceded by poor sleep'
    ]
  },
  productivity: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Productivity Score',
        data: [65, 72, 68, 79, 82, 89],
        color: '#ec4899'
      }
    ],
    insights: [
      'Productivity increased by 24% since tracking began',
      'Morning focused work sessions show highest output',
      'Task completion rate improved significantly in May'
    ]
  },
  habits: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Habit Consistency',
        data: [52, 58, 67, 72, 78, 82],
        color: '#14b8a6'
      }
    ],
    insights: [
      'Meditation streak is your longest at 42 days',
      'Weekend habits are 34% less consistent',
      'Reading habit has shown most improvement'
    ]
  },
  focus: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Focus Duration (hrs)',
        data: [3.2, 3.8, 4.1, 4.5, 4.7, 5.2],
        color: '#f59e0b'
      }
    ],
    insights: [
      'Deep focus sessions increased by 62%',
      'Average focus session now lasts 48 minutes',
      'Distractions have decreased significantly'
    ]
  }
};

const trajectoryData = {
  career: { current: 68, projected: 82, change: 14 },
  health: { current: 72, projected: 85, change: 13 },
  relationships: { current: 65, projected: 73, change: 8 },
  learning: { current: 79, projected: 89, change: 10 },
  creativity: { current: 58, projected: 77, change: 19 }
};

export default function GrowthTracker({ userId }: GrowthTrackerProps) {
  const { colorMode } = useColorMode();
  const [selectedMetric, setSelectedMetric] = useState<string>('mood');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('6 months');
  const [visualizationType, setVisualizationType] = useState<string>('line');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<VisualizationData | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isDark = colorMode === 'dark';
  const bgColor = isDark ? 'gray.800' : 'white';
  const textColor = isDark ? 'white' : 'gray.800';
  const accentColor = isDark ? 'pink.400' : 'pink.500';
  const subtleColor = isDark ? 'gray.600' : 'gray.100';
  const chartBgColor = isDark ? 'rgba(30, 30, 46, 0.8)' : 'rgba(255, 255, 255, 0.8)';

  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setData(mockData[selectedMetric]);
      setIsLoading(false);
      
      if (canvasRef.current) {
        drawChart();
      }
    }, 1000);
  }, [selectedMetric, selectedTimeRange, visualizationType]);

  const drawChart = () => {
    if (!canvasRef.current || !data) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Set dimensions
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const padding = 40;
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    // Draw background
    ctx.fillStyle = chartBgColor;
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 0.5;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + ((chartHeight / 5) * i);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    
    // Draw axes labels
    ctx.fillStyle = textColor;
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    
    // X-axis labels
    data.labels.forEach((label, i) => {
      const x = padding + ((chartWidth / (data.labels.length - 1)) * i);
      ctx.fillText(label, x, height - padding + 20);
    });
    
    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const y = height - padding - ((chartHeight / 5) * i);
      const value = i * 20;
      ctx.fillText(value.toString(), padding - 20, y + 5);
    }
    
    // Draw data line
    if (visualizationType === 'line') {
      data.datasets.forEach((dataset) => {
        ctx.strokeStyle = dataset.color || accentColor;
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        
        dataset.data.forEach((value, i) => {
          const x = padding + ((chartWidth / (dataset.data.length - 1)) * i);
          const y = height - padding - ((value / 100) * chartHeight);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        
        ctx.stroke();
        
        // Draw data points
        ctx.fillStyle = dataset.color || accentColor;
        dataset.data.forEach((value, i) => {
          const x = padding + ((chartWidth / (dataset.data.length - 1)) * i);
          const y = height - padding - ((value / 100) * chartHeight);
          
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw value above point
          ctx.fillStyle = textColor;
          ctx.fillText(value.toString(), x, y - 15);
          ctx.fillStyle = dataset.color || accentColor;
        });
      });
    } else if (visualizationType === 'bar') {
      // Bar chart implementation
      const barWidth = (chartWidth / (data.labels.length * 2));
      
      data.datasets.forEach((dataset) => {
        ctx.fillStyle = dataset.color || accentColor;
        
        dataset.data.forEach((value, i) => {
          const x = padding + ((chartWidth / (dataset.data.length)) * i) + (barWidth / 2);
          const y = height - padding - ((value / 100) * chartHeight);
          const barHeight = ((value / 100) * chartHeight);
          
          ctx.fillRect(x, y, barWidth, barHeight);
          
          // Draw value above bar
          ctx.fillStyle = textColor;
          ctx.fillText(value.toString(), x + (barWidth / 2), y - 10);
          ctx.fillStyle = dataset.color || accentColor;
        });
      });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
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
    ? 'linear-gradient(180deg, rgba(76, 29, 149, 0.05) 0%, rgba(219, 39, 119, 0.05) 100%)'
    : 'linear-gradient(180deg, rgba(219, 39, 119, 0.05) 0%, rgba(76, 29, 149, 0.05) 100%)';

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
      overflow="hidden"
      position="relative"
    >
      {/* Floating gradient accent */}
      <Box 
        position="absolute" 
        w="300px" 
        h="300px" 
        borderRadius="full" 
        bg={isDark ? "purple.500" : "pink.500"} 
        opacity="0.1" 
        filter="blur(80px)" 
        top="-100px" 
        right="-100px" 
        zIndex="0" 
      />
      
      <MotionHeading
        as="h2"
        fontSize="2xl"
        mb={6}
        variants={itemVariants}
        display="flex"
        alignItems="center"
      >
        <Box as={FaChartLine} mr={3} color={accentColor} />
        Growth Tracker
        <Tag ml={3} size="sm" colorScheme="purple" borderRadius="full">Beta</Tag>
      </MotionHeading>
      
      <MotionFlex 
        justify="space-between" 
        mb={6} 
        wrap="wrap"
        gap={4}
        variants={itemVariants}
      >
        <Select 
          value={selectedMetric} 
          onChange={(e) => setSelectedMetric(e.target.value)}
          maxW="200px"
          bg={subtleColor}
          borderRadius="md"
          _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
        >
          <option value="mood">Mood</option>
          <option value="productivity">Productivity</option>
          <option value="habits">Habits</option>
          <option value="focus">Focus</option>
        </Select>
        
        <HStack spacing={2}>
          <Select 
            value={selectedTimeRange} 
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            width="140px"
            bg={subtleColor}
            borderRadius="md"
            _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
          >
            <option value="1 month">1 Month</option>
            <option value="3 months">3 Months</option>
            <option value="6 months">6 Months</option>
            <option value="1 year">1 Year</option>
          </Select>
          
          <HStack>
            <Tooltip label="Line chart">
              <IconButton
                aria-label="Line chart"
                icon={<FaChartLine />}
                onClick={() => setVisualizationType('line')}
                colorScheme={visualizationType === 'line' ? 'purple' : 'gray'}
                variant={visualizationType === 'line' ? 'solid' : 'outline'}
                size="sm"
              />
            </Tooltip>
            <Tooltip label="Bar chart">
              <IconButton
                aria-label="Bar chart"
                icon={<FaChartBar />}
                onClick={() => setVisualizationType('bar')}
                colorScheme={visualizationType === 'bar' ? 'purple' : 'gray'}
                variant={visualizationType === 'bar' ? 'solid' : 'outline'}
                size="sm"
              />
            </Tooltip>
          </HStack>
        </HStack>
      </MotionFlex>
      
      <Grid templateColumns={{ base: "1fr", md: "3fr 1fr" }} gap={6}>
        <GridItem>
          <MotionBox
            borderRadius="lg"
            height="300px"
            position="relative"
            overflow="hidden"
            variants={itemVariants}
          >
            {isLoading ? (
              <Skeleton height="100%" width="100%" borderRadius="lg" startColor={isDark ? "gray.700" : "gray.100"} endColor={isDark ? "gray.600" : "gray.300"} />
            ) : (
              <Box position="relative" width="100%" height="100%">
                <canvas 
                  ref={canvasRef} 
                  width={800} 
                  height={300} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    borderRadius: '0.5rem',
                  }} 
                />
              </Box>
            )}
          </MotionBox>
        </GridItem>
        
        <GridItem>
          <MotionBox variants={itemVariants}>
            <Heading size="sm" mb={3} display="flex" alignItems="center">
              <Box as={FaLightbulb} mr={2} color={accentColor} />
              Insights
            </Heading>
            
            {isLoading ? (
              <VStack spacing={2} align="stretch">
                <Skeleton height="20px" />
                <Skeleton height="20px" />
                <Skeleton height="20px" />
              </VStack>
            ) : (
              <VStack spacing={3} align="stretch">
                {data?.insights.map((insight, idx) => (
                  <Box 
                    key={idx} 
                    p={3} 
                    borderRadius="md" 
                    bg={isDark ? "whiteAlpha.100" : "blackAlpha.50"}
                    borderLeft="3px solid"
                    borderLeftColor={accentColor}
                  >
                    <Text fontSize="sm">{insight}</Text>
                  </Box>
                ))}
              </VStack>
            )}
          </MotionBox>
        </GridItem>
      </Grid>
      
      <MotionBox mt={10} variants={itemVariants}>
        <Heading size="md" mb={4} display="flex" alignItems="center">
          <Box as={FaBrain} mr={2} color={accentColor} />
          Future Trajectory
        </Heading>
        
        <Grid 
          templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(5, 1fr)" }} 
          gap={4}
        >
          {Object.entries(trajectoryData).map(([area, data]) => (
            <MotionBox
              key={area}
              borderRadius="lg"
              p={4}
              bg={isDark ? "whiteAlpha.50" : "blackAlpha.50"}
              textAlign="center"
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Box 
                fontSize="xl" 
                mb={2} 
                color={accentColor}
                as={
                  area === 'career' ? FaLightbulb :
                  area === 'health' ? FaRunning :
                  area === 'relationships' ? FaHeart :
                  area === 'learning' ? FaBookReader :
                  FaBrain
                }
                mx="auto"
              />
              <Text fontWeight="bold" textTransform="capitalize" mb={1}>
                {area}
              </Text>
              <HStack justify="center" spacing={1}>
                <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>Now:</Text>
                <Text fontSize="md" fontWeight="bold">{data.current}</Text>
              </HStack>
              <HStack justify="center" spacing={1}>
                <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"}>Projected:</Text>
                <Text fontSize="md" fontWeight="bold">{data.projected}</Text>
              </HStack>
              <Tag 
                mt={2} 
                colorScheme="green" 
                size="sm" 
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Box as={FaArrowUp} mr={1} fontSize="10px" />
                {data.change}%
              </Tag>
            </MotionBox>
          ))}
        </Grid>
      </MotionBox>
    </MotionBox>
  );
} 