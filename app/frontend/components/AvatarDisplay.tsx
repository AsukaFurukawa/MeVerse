import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  Button, 
  useColorMode, 
  Icon, 
  Select, 
  HStack, 
  VStack, 
  Slider, 
  SliderTrack, 
  SliderFilledTrack, 
  SliderThumb, 
  Heading,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Grid,
  GridItem,
  Tag,
  useBreakpointValue
} from '@chakra-ui/react';
import { 
  FaUser, 
  FaPalette, 
  FaTshirt, 
  FaSmile, 
  FaHatWizard, 
  FaSave,
  FaCog,
  FaRandom
} from 'react-icons/fa';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

// Motion components
const MotionBox = motion.div;
const MotionFlex = motion.div;

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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const controls = useAnimation();
  const avatarRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [blinkTrigger, setBlinkTrigger] = useState(false);
  
  // Map size to actual dimensions
  const sizeMap = {
    sm: { width: '100px', height: '100px' },
    md: { width: '200px', height: '200px' },
    lg: { width: '300px', height: '300px' },
    xl: { width: '400px', height: '400px' },
  };
  
  // Ensure size is valid or fallback to 'md'
  const validSize = (size && size in sizeMap) ? size : 'md';
  
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

  // Avatar animations based on mood
  useEffect(() => {
    if (mood === 'excited') {
      controls.start({
        y: [0, -10, 0],
        transition: {
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut"
        }
      });
    } else if (mood === 'happy') {
      controls.start({
        rotate: [0, 5, 0, -5, 0],
        transition: {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut"
        }
      });
    } else if (mood === 'sad') {
      controls.start({
        scale: [1, 0.95, 1],
        transition: {
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut"
        }
      });
    } else {
      controls.start({
        y: 0,
        rotate: 0,
        scale: 1
      });
    }
  }, [mood, controls]);
  
  // 3D hover effect
  useEffect(() => {
    if (!avatarRef.current || !isHovering) return;
    
    const rect = avatarRef.current.getBoundingClientRect();
    const x = mousePosition.x - rect.left - rect.width / 2;
    const y = mousePosition.y - rect.top - rect.height / 2;
    
    // Calculate rotation based on mouse position
    const rotateX = y / 25;
    const rotateY = -x / 25;
    
    // Apply 3D transform
    if (avatarRef.current) {
      avatarRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
  }, [mousePosition, isHovering]);
  
  // Random blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkTrigger(true);
      setTimeout(() => setBlinkTrigger(false), 200);
    }, Math.random() * 5000 + 3000); // Random blink between 3-8 seconds
    
    return () => clearInterval(blinkInterval);
  }, []);
  
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
    onClose();
  };
  
  const generateRandomCustomization = () => {
    const skinTones = ['light', 'medium', 'tan', 'dark', 'deep'];
    const hairStyles = ['short', 'long', 'curly', 'wavy', 'none'];
    const hairColors = ['black', 'brown', 'blonde', 'red', 'gray', 'blue', 'purple', 'pink'];
    const outfits = ['casual', 'formal', 'sporty', 'professional', 'creative'];
    const accessories = ['none', 'hat', 'glasses', 'headphones', 'earrings'];
    
    setCustomization({
      skinTone: skinTones[Math.floor(Math.random() * skinTones.length)],
      hairStyle: hairStyles[Math.floor(Math.random() * hairStyles.length)],
      hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
      faceShape: 'oval',
      eyeColor: 'brown',
      outfit: outfits[Math.floor(Math.random() * outfits.length)],
      accessory: accessories[Math.floor(Math.random() * accessories.length)]
    });
  };
  
  const colors = getAvatarColors();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  return (
    <Box>
      {interactive && (
        <HStack spacing={3} mb={4} justifyContent="center">
          <Button 
            size="sm" 
            leftIcon={<Icon as={FaPalette} />} 
            onClick={onOpen}
            colorScheme="purple"
            variant="outline"
          >
            Customize
          </Button>
          <Button
            size="sm"
            leftIcon={<Icon as={FaRandom} />}
            onClick={generateRandomCustomization}
            colorScheme="teal"
            variant="outline"
          >
            Randomize
          </Button>
        </HStack>
      )}
      
      <Flex direction="column" align="center">
        {/* Avatar Display with interactive effects */}
        <MotionBox
          animate={controls}
          ref={avatarRef}
          onMouseMove={(e) => {
            if (interactive) {
              setMousePosition({ x: e.clientX, y: e.clientY });
            }
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => {
            setIsHovering(false);
            if (avatarRef.current) {
              avatarRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
            }
          }}
          style={{ 
            transformStyle: 'preserve-3d',
            transition: 'transform 0.1s ease-out'
          }}
        >
          <Box 
            width={sizeMap[validSize].width} 
            height={sizeMap[validSize].height} 
            borderRadius="full" 
            bg={colors.skin} 
            position="relative"
            style={{ boxShadow: colorMode === 'dark' ? 'glow' : 'card' }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
            transition="all 0.3s ease"
            _hover={{ transform: interactive ? 'scale(1.05)' : 'none' }}
          >
            {/* Hair */}
            <AnimatePresence>
              <MotionBox
                key={customization.hairStyle + customization.hairColor}
                style={{
                  position: 'absolute',
                  top: '-10%',
                  left: '15%',
                  right: '15%',
                  height: '40%',
                  background: colors.hair,
                  borderRadius: '100% 100% 0 0',
                  display: customization.hairStyle === 'none' ? 'none' : 'block'
                }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>
            
            {/* Face */}
            <MotionFlex
              style={{
                fontSize: validSize === 'sm' ? '2xl' : validSize === 'md' ? '4xl' : '6xl',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              animate={{
                scale: blinkTrigger ? 0.8 : 1,
                transition: { duration: 0.2 }
              }}
            >
              {moodExpressions[mood] || moodExpressions.neutral}
            </MotionFlex>
            
            {/* Accessory (e.g. hat) displayed conditionally */}
            <AnimatePresence>
              {customization.accessory === 'hat' && (
                <MotionBox
                  style={{
                    position: 'absolute',
                    top: '-20%',
                    width: '60%',
                    height: '30%',
                    background: 'accent.purple',
                    borderRadius: '100% 100% 0 0'
                  }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              
              {customization.accessory === 'glasses' && (
                <MotionBox
                  style={{
                    position: 'absolute',
                    width: '70%',
                    height: '15%'
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Flex alignItems="center" justifyContent="center" height="100%">
                    <Box width="30%" height="100%" borderRadius="full" border="2px solid" borderColor="gray.700" mr="5%" />
                    <Box width="30%" height="100%" borderRadius="full" border="2px solid" borderColor="gray.700" />
                    <Box position="absolute" height="2px" width="20%" bg="gray.700" />
                  </Flex>
                </MotionBox>
              )}
              
              {customization.accessory === 'headphones' && (
                <MotionBox
                  style={{
                    position: 'absolute',
                    top: '-10%',
                    width: '100%',
                    height: '30%'
                  }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box position="absolute" left="10%" width="10%" height="70%" bg="gray.700" borderRadius="full" />
                  <Box position="absolute" right="10%" width="10%" height="70%" bg="gray.700" borderRadius="full" />
                  <Box position="absolute" top="0" left="5%" right="5%" height="20%" bg="gray.700" borderRadius="full" />
                </MotionBox>
              )}
              
              {customization.accessory === 'earrings' && (
                <MotionFlex
                  style={{
                    position: 'absolute',
                    width: '100%',
                    justifyContent: 'space-between',
                    paddingLeft: '15%',
                    paddingRight: '15%'
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box width="10%" height="10%" borderRadius="full" bg="accent.yellow" boxShadow="lg" />
                  <Box width="10%" height="10%" borderRadius="full" bg="accent.yellow" boxShadow="lg" />
                </MotionFlex>
              )}
            </AnimatePresence>
            
            {/* Outfit indicator - subtle color accent at bottom */}
            <AnimatePresence>
              <MotionBox
                key={customization.outfit}
                style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  height: '15%',
                  background: customization.outfit === 'casual' ? 'accent.blue' :
                             customization.outfit === 'formal' ? 'gray.700' :
                             customization.outfit === 'sporty' ? 'accent.green' :
                             customization.outfit === 'professional' ? 'blue.700' :
                             'accent.pink' // creative
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>
          </Box>
        </MotionBox>
        
        {/* Customization Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size={isMobile ? "full" : "xl"}>
          <ModalOverlay backdropFilter="blur(10px)" />
          <ModalContent
            bg={colorMode === 'dark' ? 'dark.100' : 'white'}
            boxShadow="card"
            borderRadius="xl"
          >
            <ModalHeader 
              borderBottom="1px solid" 
              borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
              px={6}
              pt={6}
              pb={4}
            >
              <Flex align="center">
                <Icon as={FaUser} mr={3} color="brand.500" />
                <Heading size="md">Customize Your Avatar</Heading>
              </Flex>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody p={6}>
              <Tabs 
                variant="soft-rounded" 
                colorScheme="purple" 
                isFitted 
                mb={6}
                onChange={(index) => setActiveTab(['appearance', 'outfit', 'accessories'][index])}
              >
                <TabList mb={4}>
                  <Tab _selected={{ bg: 'brand.100', color: 'brand.800' }}>
                    <Icon as={FaUser} mr={2} />
                    <Text>Appearance</Text>
                  </Tab>
                  <Tab _selected={{ bg: 'brand.100', color: 'brand.800' }}>
                    <Icon as={FaTshirt} mr={2} />
                    <Text>Outfit</Text>
                  </Tab>
                  <Tab _selected={{ bg: 'brand.100', color: 'brand.800' }}>
                    <Icon as={FaHatWizard} mr={2} />
                    <Text>Accessories</Text>
                  </Tab>
                </TabList>
                
                <TabPanels>
                  {/* Appearance Tab */}
                  <TabPanel px={0}>
                    <VStack spacing={6} align="stretch">
                      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                        <GridItem>
                          <Text mb={2} fontWeight="medium">Skin Tone</Text>
                          <Select 
                            value={customization.skinTone} 
                            onChange={(e) => handleCustomizationChange('skinTone', e.target.value)}
                            bg={colorMode === 'dark' ? 'dark.200' : 'gray.50'}
                            borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
                          >
                            <option value="light">Light</option>
                            <option value="medium">Medium</option>
                            <option value="tan">Tan</option>
                            <option value="dark">Dark</option>
                            <option value="deep">Deep</option>
                          </Select>
                        </GridItem>
                        
                        <GridItem>
                          <Text mb={2} fontWeight="medium">Hair Style</Text>
                          <Select 
                            value={customization.hairStyle} 
                            onChange={(e) => handleCustomizationChange('hairStyle', e.target.value)}
                            bg={colorMode === 'dark' ? 'dark.200' : 'gray.50'}
                            borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
                          >
                            <option value="short">Short</option>
                            <option value="long">Long</option>
                            <option value="curly">Curly</option>
                            <option value="wavy">Wavy</option>
                            <option value="none">Bald</option>
                          </Select>
                        </GridItem>
                      </Grid>
                      
                      <Box>
                        <Text mb={2} fontWeight="medium">Hair Color</Text>
                        <Grid templateColumns="repeat(4, 1fr)" gap={2}>
                          {['black', 'brown', 'blonde', 'red', 'gray', 'blue', 'purple', 'pink'].map((color) => (
                            <Box 
                              key={color}
                              height="40px"
                              bg={
                                color === 'black' ? '#000000' :
                                color === 'brown' ? '#3B2314' :
                                color === 'blonde' ? '#F0C05A' :
                                color === 'red' ? '#B7472A' :
                                color === 'gray' ? '#AAAAAA' :
                                color === 'blue' ? '#4285f4' :
                                color === 'purple' ? '#9C27B0' :
                                '#FD6C9E' // pink
                              }
                              borderRadius="md"
                              cursor="pointer"
                              onClick={() => handleCustomizationChange('hairColor', color)}
                              position="relative"
                              _hover={{ transform: 'scale(0.95)' }}
                              transition="all 0.2s"
                            >
                              {customization.hairColor === color && (
                                <Box 
                                  position="absolute" 
                                  top="50%" 
                                  left="50%" 
                                  transform="translate(-50%, -50%)" 
                                  width="20px" 
                                  height="20px" 
                                  borderRadius="full" 
                                  bg="white" 
                                  opacity="0.8"
                                />
                              )}
                            </Box>
                          ))}
                        </Grid>
                      </Box>
                    </VStack>
                  </TabPanel>
                  
                  {/* Outfit Tab */}
                  <TabPanel px={0}>
                    <VStack spacing={6} align="stretch">
                      <Text mb={2} fontWeight="medium">Outfit Style</Text>
                      <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                        {[
                          { value: 'casual', label: 'Casual', color: 'blue' },
                          { value: 'formal', label: 'Formal', color: 'gray' },
                          { value: 'sporty', label: 'Sporty', color: 'green' },
                          { value: 'professional', label: 'Professional', color: 'blue' },
                          { value: 'creative', label: 'Creative', color: 'pink' }
                        ].map((outfit) => (
                          <MotionBox
                            key={outfit.value}
                            style={{
                              padding: '12px',
                              borderRadius: 'md',
                              background: customization.outfit === outfit.value ? 
                                `accent.${outfit.color}25` : 
                                colorMode === 'dark' ? 'dark.200' : 'gray.50',
                              cursor: 'pointer',
                              border: '1px solid',
                              borderColor: customization.outfit === outfit.value ? 
                                `accent.${outfit.color}` : 
                                colorMode === 'dark' ? 'dark.300' : 'gray.200'
                            }}
                            onClick={() => handleCustomizationChange('outfit', outfit.value)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Text 
                              fontWeight={customization.outfit === outfit.value ? 'bold' : 'normal'}
                              color={customization.outfit === outfit.value ? 
                                `accent.${outfit.color}` : 
                                'inherit'
                              }
                              textAlign="center"
                            >
                              {outfit.label}
                            </Text>
                          </MotionBox>
                        ))}
                      </Grid>
                    </VStack>
                  </TabPanel>
                  
                  {/* Accessories Tab */}
                  <TabPanel px={0}>
                    <VStack spacing={6} align="stretch">
                      <Text mb={2} fontWeight="medium">Accessory</Text>
                      <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                        {[
                          { value: 'none', label: 'None', icon: FaUser },
                          { value: 'hat', label: 'Hat', icon: FaHatWizard },
                          { value: 'glasses', label: 'Glasses', icon: FaUser },
                          { value: 'headphones', label: 'Headphones', icon: FaUser },
                          { value: 'earrings', label: 'Earrings', icon: FaUser }
                        ].map((accessory) => (
                          <MotionBox
                            key={accessory.value}
                            style={{
                              padding: '12px',
                              borderRadius: 'md',
                              background: customization.accessory === accessory.value ? 
                                'brand.50' : 
                                colorMode === 'dark' ? 'dark.200' : 'gray.50',
                              cursor: 'pointer',
                              border: '1px solid',
                              borderColor: customization.accessory === accessory.value ? 
                                'brand.300' : 
                                colorMode === 'dark' ? 'dark.300' : 'gray.200'
                            }}
                            onClick={() => handleCustomizationChange('accessory', accessory.value)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Text 
                              fontWeight={customization.accessory === accessory.value ? 'bold' : 'normal'}
                              color={customization.accessory === accessory.value ? 
                                'brand.500' : 
                                'inherit'
                              }
                              textAlign="center"
                            >
                              {accessory.label}
                            </Text>
                          </MotionBox>
                        ))}
                      </Grid>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
              
              {/* Preview */}
              <Box 
                mt={6} 
                p={6} 
                borderRadius="md" 
                bg={colorMode === 'dark' ? 'dark.200' : 'gray.50'}
                display="flex" 
                justifyContent="center"
              >
                <AvatarDisplay 
                  size="md" 
                  interactive={false} 
                  mood="happy" 
                  initialCustomization={customization}
                />
              </Box>
              
              <Flex justify="flex-end" mt={6}>
                <Button 
                  variant="ghost" 
                  mr={3} 
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button 
                  colorScheme="purple" 
                  onClick={handleSave}
                  leftIcon={<Icon as={FaSave} />}
                >
                  Save Avatar
                </Button>
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Flex>
    </Box>
  );
} 