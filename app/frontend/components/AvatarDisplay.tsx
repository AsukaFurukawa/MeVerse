import { useState, useEffect } from 'react';
import { Box, Flex, Text, Button, useColorMode, Icon, Select, HStack, VStack, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Heading } from '@chakra-ui/react';
import { FaUser, FaPalette, FaTshirt, FaSmile, FaHatWizard, FaSave } from 'react-icons/fa';
import { motion } from 'framer-motion';

// This is a placeholder for the avatar customization component
// In a real implementation, you would integrate with a 3D model library or use SVG/Canvas

interface AvatarDisplayProps {
  initialCustomization?: AvatarCustomization;
  onSave?: (customization: AvatarCustomization) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  mood?: string;
}

export interface AvatarCustomization {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  faceShape: string;
  eyeColor: string;
  outfit: string;
  accessory: string;
}

const defaultCustomization: AvatarCustomization = {
  skinTone: 'medium',
  hairStyle: 'short',
  hairColor: 'brown',
  faceShape: 'oval',
  eyeColor: 'brown',
  outfit: 'casual',
  accessory: 'none'
};

export default function AvatarDisplay({ 
  initialCustomization = defaultCustomization,
  onSave,
  size = 'md',
  interactive = true,
  mood = 'neutral'
}: AvatarDisplayProps) {
  const { colorMode } = useColorMode();
  const [customization, setCustomization] = useState<AvatarCustomization>(initialCustomization);
  const [activeTab, setActiveTab] = useState<string>('appearance');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Map size to actual dimensions
  const sizeMap = {
    sm: { width: '100px', height: '100px' },
    md: { width: '200px', height: '200px' },
    lg: { width: '300px', height: '300px' },
    xl: { width: '400px', height: '400px' },
  };
  
  // Mood-based expressions
  const moodExpressions: Record<string, string> = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    neutral: '😐',
    excited: '😃',
    relaxed: '😌',
    anxious: '😰',
    tired: '😴'
  };
  
  // Color options based on customization
  const getAvatarColors = () => {
    const skinToneColors = {
      light: '#FFD8B4',
      medium: '#F1C27D',
      tan: '#E0AC69',
      dark: '#C68642',
      deep: '#8D5524',
    };
    
    const hairColors = {
      black: '#000000',
      brown: '#3B2314',
      blonde: '#F0C05A',
      red: '#B7472A',
      gray: '#AAAAAA',
      blue: '#4285f4',
      purple: '#9C27B0',
      pink: '#FD6C9E',
    };
    
    return {
      skin: skinToneColors[customization.skinTone as keyof typeof skinToneColors] || skinToneColors.medium,
      hair: hairColors[customization.hairColor as keyof typeof hairColors] || hairColors.brown,
    };
  };
  
  const handleCustomizationChange = (property: keyof AvatarCustomization, value: string) => {
    setCustomization(prev => ({
      ...prev,
      [property]: value
    }));
  };
  
  const handleSave = () => {
    if (onSave) {
      onSave(customization);
    }
    setIsEditing(false);
  };
  
  const colors = getAvatarColors();
  
  return (
    <Box>
      {interactive && !isEditing && (
        <Button 
          size="sm" 
          leftIcon={<Icon as={FaPalette} />} 
          onClick={() => setIsEditing(true)}
          mb={4}
          colorScheme="purple"
        >
          Customize
        </Button>
      )}
      
      <Flex direction="column" align="center">
        {/* Avatar Display */}
        <motion.div
          animate={{ scale: mood === 'excited' ? [1, 1.05, 1] : 1 }}
          transition={{ repeat: mood === 'excited' ? Infinity : 0, duration: 2 }}
        >
          <Box 
            width={sizeMap[size].width} 
            height={sizeMap[size].height} 
            borderRadius="full" 
            bg={colors.skin} 
            position="relative"
            boxShadow="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            {/* Hair */}
            <Box
              position="absolute"
              top="-10%"
              left="15%"
              right="15%"
              height="40%"
              bg={colors.hair}
              borderRadius="100% 100% 0 0"
              display={customization.hairStyle === 'none' ? 'none' : 'block'}
            />
            
            {/* Face */}
            <Text fontSize={size === 'sm' ? '2xl' : size === 'md' ? '4xl' : '6xl'}>
              {moodExpressions[mood] || moodExpressions.neutral}
            </Text>
            
            {/* Accessory (e.g. hat) displayed conditionally */}
            {customization.accessory === 'hat' && (
              <Box
                position="absolute"
                top="-20%"
                width="60%"
                height="30%"
                bg="gray.700"
                borderRadius="100% 100% 0 0"
              />
            )}
          </Box>
        </motion.div>
        
        {/* Customization UI */}
        {isEditing && (
          <Box mt={6} p={4} borderRadius="md" bg={colorMode === 'dark' ? 'gray.700' : 'white'} boxShadow="md" width="100%">
            <HStack spacing={4} mb={4}>
              <Button 
                size="sm" 
                colorScheme={activeTab === 'appearance' ? 'purple' : 'gray'}
                onClick={() => setActiveTab('appearance')}
                leftIcon={<Icon as={FaUser} />}
              >
                Appearance
              </Button>
              <Button 
                size="sm" 
                colorScheme={activeTab === 'outfit' ? 'purple' : 'gray'}
                onClick={() => setActiveTab('outfit')}
                leftIcon={<Icon as={FaTshirt} />}
              >
                Outfit
              </Button>
              <Button 
                size="sm" 
                colorScheme={activeTab === 'accessories' ? 'purple' : 'gray'}
                onClick={() => setActiveTab('accessories')}
                leftIcon={<Icon as={FaHatWizard} />}
              >
                Accessories
              </Button>
            </HStack>
            
            <VStack spacing={4} align="stretch">
              {activeTab === 'appearance' && (
                <>
                  <Box>
                    <Text mb={1}>Skin Tone</Text>
                    <Select 
                      value={customization.skinTone} 
                      onChange={(e) => handleCustomizationChange('skinTone', e.target.value)}
                    >
                      <option value="light">Light</option>
                      <option value="medium">Medium</option>
                      <option value="tan">Tan</option>
                      <option value="dark">Dark</option>
                      <option value="deep">Deep</option>
                    </Select>
                  </Box>
                  
                  <Box>
                    <Text mb={1}>Hair Style</Text>
                    <Select 
                      value={customization.hairStyle} 
                      onChange={(e) => handleCustomizationChange('hairStyle', e.target.value)}
                    >
                      <option value="short">Short</option>
                      <option value="long">Long</option>
                      <option value="curly">Curly</option>
                      <option value="wavy">Wavy</option>
                      <option value="none">Bald</option>
                    </Select>
                  </Box>
                  
                  <Box>
                    <Text mb={1}>Hair Color</Text>
                    <Select 
                      value={customization.hairColor} 
                      onChange={(e) => handleCustomizationChange('hairColor', e.target.value)}
                    >
                      <option value="black">Black</option>
                      <option value="brown">Brown</option>
                      <option value="blonde">Blonde</option>
                      <option value="red">Red</option>
                      <option value="gray">Gray</option>
                      <option value="blue">Blue</option>
                      <option value="purple">Purple</option>
                      <option value="pink">Pink</option>
                    </Select>
                  </Box>
                </>
              )}
              
              {activeTab === 'outfit' && (
                <Box>
                  <Text mb={1}>Outfit Style</Text>
                  <Select 
                    value={customization.outfit} 
                    onChange={(e) => handleCustomizationChange('outfit', e.target.value)}
                  >
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                    <option value="sporty">Sporty</option>
                    <option value="professional">Professional</option>
                    <option value="creative">Creative</option>
                  </Select>
                </Box>
              )}
              
              {activeTab === 'accessories' && (
                <Box>
                  <Text mb={1}>Accessory</Text>
                  <Select 
                    value={customization.accessory} 
                    onChange={(e) => handleCustomizationChange('accessory', e.target.value)}
                  >
                    <option value="none">None</option>
                    <option value="hat">Hat</option>
                    <option value="glasses">Glasses</option>
                    <option value="headphones">Headphones</option>
                    <option value="earrings">Earrings</option>
                  </Select>
                </Box>
              )}
            </VStack>
            
            <Flex justify="flex-end" mt={6}>
              <Button size="sm" mr={2} onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button 
                size="sm" 
                colorScheme="purple" 
                leftIcon={<Icon as={FaSave} />} 
                onClick={handleSave}
              >
                Save Avatar
              </Button>
            </Flex>
          </Box>
        )}
      </Flex>
    </Box>
  );
} 