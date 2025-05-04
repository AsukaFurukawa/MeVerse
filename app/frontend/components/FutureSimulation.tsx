import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  Button, 
  Grid, 
  GridItem, 
  useColorMode,
  Input,
  Textarea,
  FormLabel,
  FormControl,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tag,
  Badge,
  HStack,
  VStack,
  Skeleton,
  useToast
} from '@chakra-ui/react';
import { 
  FaClock, 
  FaArrowRight, 
  FaLightbulb, 
  FaExclamationTriangle, 
  FaStar, 
  FaQuestion 
} from 'react-icons/fa';
import { motion } from 'framer-motion';

// Create motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionText = motion(Text);
const MotionHeading = motion(Heading);
const MotionGrid = motion(Grid);

interface FutureSimulationProps {
  userId?: string;
}

interface SimulationResult {
  scenario: string;
  probability: number;
  outcomes: {
    positive: string[];
    negative: string[];
  };
  recommendations: string[];
  timeframe: string;
}

// Mock data - Replace with API calls
const mockScenarios = [
  "What if I change careers?",
  "What if I move to a new city?",
  "What if I learn a new skill?",
  "What if I start a side business?",
  "What if I make a major investment?",
  "What if I change my daily habits?",
];

export default function FutureSimulation({ userId }: FutureSimulationProps) {
  const { colorMode } = useColorMode();
  const [scenarioInput, setScenarioInput] = useState<string>("");
  const [timeHorizon, setTimeHorizon] = useState<string>("6 months");
  const [confidenceLevel, setConfidenceLevel] = useState<number>(50);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);
  const toast = useToast();
  const scenarioInputRef = useRef<HTMLTextAreaElement>(null);
  
  const isDark = colorMode === 'dark';
  const bgColor = isDark ? 'gray.800' : 'white';
  const textColor = isDark ? 'white' : 'gray.800';
  const accentColor = isDark ? 'cyan.400' : 'cyan.500';
  const secondaryAccentColor = isDark ? 'purple.400' : 'purple.500';
  const subtleColor = isDark ? 'gray.600' : 'gray.100';

  useEffect(() => {
    // Reset simulation when scenario changes
    if (simulationResult && scenarioInput !== simulationResult.scenario) {
      setSimulationResult(null);
    }
  }, [scenarioInput]);

  const handleScenarioSelect = (scenario: string) => {
    setScenarioInput(scenario);
    if (scenarioInputRef.current) {
      scenarioInputRef.current.focus();
    }
  };

  const runSimulation = () => {
    if (!scenarioInput) {
      toast({
        title: "Enter a scenario",
        description: "Please enter a 'What if' scenario to simulate",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSimulating(true);
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockResult: SimulationResult = {
        scenario: scenarioInput,
        probability: Math.floor(Math.random() * 40) + 30, // 30-70%
        outcomes: {
          positive: [
            "Increased personal satisfaction and fulfillment",
            "Development of valuable new skills",
            "Expanded social and professional network",
          ],
          negative: [
            "Initial period of uncertainty and adjustment",
            "Potential temporary reduction in income",
            "Need to invest time in learning and adaptation",
          ],
        },
        recommendations: [
          "Start with small steps to test the waters",
          "Develop a detailed transition plan with milestones",
          "Build a support network for guidance and encouragement",
          "Set aside emergency funds for unexpected challenges",
        ],
        timeframe: timeHorizon,
      };
      
      setSimulationResult(mockResult);
      setIsLoading(false);
    }, 2500);
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
    ? 'linear-gradient(180deg, rgba(6, 182, 212, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)'
    : 'linear-gradient(180deg, rgba(6, 182, 212, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)';

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
        bg={isDark ? "cyan.500" : "cyan.400"} 
        opacity="0.1" 
        filter="blur(80px)" 
        bottom="-150px" 
        left="-100px" 
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
        <Box as={FaClock} mr={3} color={accentColor} />
        Future Simulation
        <Tag ml={3} size="sm" colorScheme="cyan" borderRadius="full">Experimental</Tag>
      </MotionHeading>
      
      <MotionGrid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8} variants={itemVariants}>
        <GridItem>
          <VStack spacing={6} align="stretch">
            <FormControl>
              <FormLabel display="flex" alignItems="center">
                <Box as={FaQuestion} mr={2} color={accentColor} />
                What if scenario
              </FormLabel>
              <Textarea
                ref={scenarioInputRef}
                value={scenarioInput}
                onChange={(e) => setScenarioInput(e.target.value)}
                placeholder="What if I..."
                bg={subtleColor}
                borderRadius="md"
                rows={3}
                _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
              />
              
              <Text fontSize="sm" mt={2} color={isDark ? "gray.400" : "gray.500"}>
                Popular scenarios:
              </Text>
              <Flex mt={2} flexWrap="wrap" gap={2}>
                {mockScenarios.map((scenario, idx) => (
                  <Tag 
                    key={idx} 
                    size="sm" 
                    borderRadius="full" 
                    variant="outline" 
                    colorScheme="cyan"
                    cursor="pointer"
                    onClick={() => handleScenarioSelect(scenario)}
                    _hover={{ bg: isDark ? "cyan.900" : "cyan.50" }}
                  >
                    {scenario}
                  </Tag>
                ))}
              </Flex>
            </FormControl>
            
            <HStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm">Time Horizon</FormLabel>
                <Select 
                  value={timeHorizon} 
                  onChange={(e) => setTimeHorizon(e.target.value)}
                  bg={subtleColor}
                  borderRadius="md"
                  size="sm"
                  _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                >
                  <option value="1 month">1 Month</option>
                  <option value="3 months">3 Months</option>
                  <option value="6 months">6 Months</option>
                  <option value="1 year">1 Year</option>
                  <option value="3 years">3 Years</option>
                  <option value="5 years">5 Years</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel fontSize="sm">Confidence Level</FormLabel>
                <Slider 
                  value={confidenceLevel} 
                  onChange={(val) => setConfidenceLevel(val)}
                  min={0}
                  max={100}
                  step={5}
                  colorScheme="cyan"
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={4} />
                </Slider>
                <Text fontSize="xs" textAlign="right" mt={1}>
                  {confidenceLevel}%
                </Text>
              </FormControl>
            </HStack>
            
            <Button
              colorScheme="cyan"
              isLoading={isLoading}
              onClick={runSimulation}
              leftIcon={<FaArrowRight />}
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
              transition="all 0.2s"
            >
              Run Simulation
            </Button>
          </VStack>
        </GridItem>
        
        <GridItem>
          {!simulating ? (
            <MotionFlex 
              h="100%" 
              minH="200px" 
              justify="center" 
              align="center" 
              direction="column"
              variants={itemVariants}
            >
              <Box 
                as={FaClock} 
                fontSize="5xl" 
                mb={4} 
                color={isDark ? "gray.600" : "gray.300"} 
              />
              <Text color={isDark ? "gray.400" : "gray.500"} textAlign="center">
                Enter a scenario and run the simulation to see potential outcomes and recommendations
              </Text>
            </MotionFlex>
          ) : isLoading ? (
            <VStack spacing={6} align="stretch">
              <Skeleton height="20px" />
              <Skeleton height="100px" />
              <Skeleton height="100px" />
              <Skeleton height="80px" />
            </VStack>
          ) : simulationResult ? (
            <MotionBox variants={itemVariants}>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md" color={accentColor}>Simulation Results</Heading>
                <Tag size="md" colorScheme={simulationResult.probability > 60 ? "green" : simulationResult.probability > 40 ? "yellow" : "red"}>
                  {simulationResult.probability}% Probability
                </Tag>
              </Flex>
              
              <Box mb={4}>
                <Heading size="sm" mb={2} display="flex" alignItems="center">
                  <Box as={FaStar} mr={2} color="green.400" />
                  Positive Outcomes
                </Heading>
                <VStack align="stretch" spacing={2}>
                  {simulationResult.outcomes.positive.map((outcome, idx) => (
                    <Flex key={idx} align="center">
                      <Box 
                        w={1} 
                        h={1} 
                        borderRadius="full" 
                        bg="green.400" 
                        mr={2} 
                      />
                      <Text fontSize="sm">{outcome}</Text>
                    </Flex>
                  ))}
                </VStack>
              </Box>
              
              <Box mb={4}>
                <Heading size="sm" mb={2} display="flex" alignItems="center">
                  <Box as={FaExclamationTriangle} mr={2} color="orange.400" />
                  Challenges
                </Heading>
                <VStack align="stretch" spacing={2}>
                  {simulationResult.outcomes.negative.map((outcome, idx) => (
                    <Flex key={idx} align="center">
                      <Box 
                        w={1} 
                        h={1} 
                        borderRadius="full" 
                        bg="orange.400" 
                        mr={2} 
                      />
                      <Text fontSize="sm">{outcome}</Text>
                    </Flex>
                  ))}
                </VStack>
              </Box>
              
              <Box>
                <Heading size="sm" mb={2} display="flex" alignItems="center">
                  <Box as={FaLightbulb} mr={2} color={secondaryAccentColor} />
                  Recommendations
                </Heading>
                <VStack align="stretch" spacing={2}>
                  {simulationResult.recommendations.map((rec, idx) => (
                    <HStack key={idx} align="flex-start" spacing={2}>
                      <Box 
                        w={6}
                        h={6}
                        borderRadius="full"
                        bg={isDark ? "whiteAlpha.100" : "blackAlpha.50"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="xs"
                        fontWeight="bold"
                      >
                        {idx + 1}
                      </Box>
                      <Text fontSize="sm">{rec}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </MotionBox>
          ) : null}
        </GridItem>
      </MotionGrid>
    </MotionBox>
  );
} 