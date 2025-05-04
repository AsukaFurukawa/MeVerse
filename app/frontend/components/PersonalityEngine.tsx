import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  useColorMode,
  Grid, 
  GridItem, 
  HStack,
  VStack,
  Tag,
  Divider,
  Button,
  Skeleton,
  Progress,
  Tooltip,
  Badge
} from '@chakra-ui/react';
import { 
  FaUser, 
  FaBrain, 
  FaStar, 
  FaHandshake, 
  FaLightbulb, 
  FaHeart, 
  FaRunning, 
  FaSyncAlt 
} from 'react-icons/fa';
import { motion } from 'framer-motion';

// Create motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionText = motion(Text);
const MotionHeading = motion(Heading);
const MotionProgress = motion(Progress);

interface PersonalityEngineProps {
  userId?: string;
}

interface PersonalityTrait {
  name: string;
  score: number;
  description: string;
  icon: React.ComponentType;
}

interface Insight {
  text: string;
  category: string;
  icon: React.ComponentType;
}

// Mock data - Replace with API calls
const mockPersonalityTraits: PersonalityTrait[] = [
  {
    name: "Openness",
    score: 82,
    description: "High curiosity and appreciation for art, emotion, adventure, and unusual ideas",
    icon: FaStar
  },
  {
    name: "Conscientiousness",
    score: 75,
    description: "Tendency to be organized, disciplined, and achievement-focused",
    icon: FaRunning
  },
  {
    name: "Extraversion",
    score: 45,
    description: "Energy from social interactions, talkative, and assertive in groups",
    icon: FaHandshake
  },
  {
    name: "Agreeableness",
    score: 68,
    description: "Compassionate, cooperative, and values harmony with others",
    icon: FaHeart
  },
  {
    name: "Neuroticism",
    score: 28,
    description: "Tendency to experience emotional instability and negative emotions",
    icon: FaBrain
  }
];

const mockInsights: Insight[] = [
  {
    text: "You learn best through hands-on experimentation rather than theoretical study",
    category: "Learning Style",
    icon: FaLightbulb
  },
  {
    text: "Your communication style is direct but empathetic, focusing on clarity",
    category: "Communication",
    icon: FaHandshake
  },
  {
    text: "In group settings, you prefer to observe before contributing meaningful insights",
    category: "Social Dynamics",
    icon: FaUser
  },
  {
    text: "Your problem-solving approach is creative with a focus on long-term implications",
    category: "Problem Solving",
    icon: FaBrain
  }
];

export default function PersonalityEngine({ userId }: PersonalityEngineProps) {
  const { colorMode } = useColorMode();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [traits, setTraits] = useState<PersonalityTrait[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  
  const isDark = colorMode === 'dark';
  const bgColor = isDark ? 'gray.800' : 'white';
  const textColor = isDark ? 'white' : 'gray.800';
  const accentColor = isDark ? 'purple.400' : 'purple.500';
  const subtleColor = isDark ? 'whiteAlpha.100' : 'blackAlpha.50';

  useEffect(() => {
    loadPersonalityData();
  }, []);
  
  const loadPersonalityData = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setTraits(mockPersonalityTraits);
      setInsights(mockInsights);
      setLastUpdated(new Date().toLocaleDateString());
      setIsLoading(false);
    }, 1200);
  };
  
  const refreshPersonalityData = () => {
    setIsLoading(true);
    
    // Simulate API call with slight variations in data
    setTimeout(() => {
      const updatedTraits = mockPersonalityTraits.map(trait => ({
        ...trait,
        score: Math.min(100, Math.max(0, trait.score + (Math.random() * 10 - 5)))
      }));
      
      setTraits(updatedTraits);
      setLastUpdated(new Date().toLocaleDateString());
      setIsLoading(false);
    }, 2000);
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.15
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

  const progressVariants = {
    hidden: { width: 0 },
    visible: (score: number) => ({
      width: `${score}%`,
      transition: { duration: 1, ease: "easeOut" }
    })
  };

  const gradientBg = isDark
    ? 'linear-gradient(180deg, rgba(124, 58, 237, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)'
    : 'linear-gradient(180deg, rgba(124, 58, 237, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)';

  const getScoreColor = (score: number) => {
    if (score < 30) return "blue";
    if (score < 50) return "teal";
    if (score < 70) return "yellow";
    if (score < 85) return "orange";
    return "pink";
  };

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
        bg={isDark ? "purple.500" : "purple.400"} 
        opacity="0.1" 
        filter="blur(80px)" 
        top="-150px" 
        right="-100px" 
        zIndex="0" 
      />
      
      <Flex justify="space-between" align="center" mb={6}>
        <MotionHeading
          as="h2"
          fontSize="2xl"
          variants={itemVariants}
          display="flex"
          alignItems="center"
        >
          <Box as={FaBrain} mr={3} color={accentColor} />
          Personality Profile
        </MotionHeading>
        
        <MotionFlex variants={itemVariants} align="center">
          <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"} mr={2}>
            Last updated: {lastUpdated || "Never"}
          </Text>
          <Button
            size="sm"
            leftIcon={<FaSyncAlt />}
            variant="ghost"
            colorScheme="purple"
            isLoading={isLoading}
            onClick={refreshPersonalityData}
            _hover={{ transform: 'rotate(180deg)' }}
            transition="transform 0.5s ease"
          >
            Refresh
          </Button>
        </MotionFlex>
      </Flex>
      
      <Grid templateColumns={{ base: "1fr", md: "3fr 2fr" }} gap={8}>
        <GridItem>
          <MotionBox variants={itemVariants}>
            <Heading size="md" mb={4}>Personality Traits</Heading>
            <VStack spacing={6} align="stretch">
              {isLoading ? (
                <>
                  <Skeleton height="24px" width="100%" />
                  <Skeleton height="24px" width="100%" />
                  <Skeleton height="24px" width="100%" />
                  <Skeleton height="24px" width="100%" />
                  <Skeleton height="24px" width="100%" />
                </>
              ) : (
                traits.map((trait, idx) => (
                  <Box key={idx}>
                    <Flex justify="space-between" mb={1}>
                      <HStack>
                        <Box as={trait.icon} color={accentColor} />
                        <Text fontWeight="medium">{trait.name}</Text>
                      </HStack>
                      <Tag size="sm" colorScheme={getScoreColor(trait.score)}>
                        {trait.score}%
                      </Tag>
                    </Flex>
                    <Box
                      h="8px"
                      w="100%"
                      bg={isDark ? "whiteAlpha.100" : "blackAlpha.50"}
                      borderRadius="full"
                      overflow="hidden"
                      position="relative"
                    >
                      <MotionBox
                        h="100%"
                        bg={`${getScoreColor(trait.score)}.400`}
                        borderRadius="full"
                        position="absolute"
                        left={0}
                        custom={trait.score}
                        variants={progressVariants}
                      />
                    </Box>
                    <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"} mt={1}>
                      {trait.description}
                    </Text>
                  </Box>
                ))
              )}
            </VStack>
          </MotionBox>
        </GridItem>
        
        <GridItem>
          <MotionBox variants={itemVariants}>
            <Heading size="md" mb={4}>Key Insights</Heading>
            <VStack spacing={4} align="stretch">
              {isLoading ? (
                <>
                  <Skeleton height="80px" width="100%" />
                  <Skeleton height="80px" width="100%" />
                  <Skeleton height="80px" width="100%" />
                </>
              ) : (
                insights.map((insight, idx) => (
                  <Box
                    key={idx}
                    p={4}
                    borderRadius="lg"
                    bg={subtleColor}
                    position="relative"
                  >
                    <Badge
                      position="absolute"
                      top={2}
                      right={2}
                      colorScheme="purple"
                      borderRadius="full"
                      px={2}
                      fontSize="xs"
                    >
                      {insight.category}
                    </Badge>
                    <Flex align="flex-start">
                      <Box 
                        as={insight.icon} 
                        fontSize="xl" 
                        color={accentColor} 
                        mt={1}
                        mr={3}
                      />
                      <Text fontSize="sm" pt={1}>
                        {insight.text}
                      </Text>
                    </Flex>
                  </Box>
                ))
              )}
            </VStack>
          </MotionBox>
        </GridItem>
      </Grid>
      
      <MotionBox 
        mt={8} 
        pt={4} 
        borderTop="1px solid" 
        borderColor={isDark ? "whiteAlpha.100" : "blackAlpha.100"}
        variants={itemVariants}
      >
        <Flex justify="space-between" align="center">
          <Text fontSize="sm" color={isDark ? "gray.400" : "gray.500"}>
            Personality profile based on {isLoading ? "..." : "42"} days of behavioral data
          </Text>
          <Text fontSize="sm" fontStyle="italic" color={isDark ? "purple.300" : "purple.600"}>
            "Understanding yourself is the beginning of wisdom"
          </Text>
        </Flex>
      </MotionBox>
    </MotionBox>
  );
} 