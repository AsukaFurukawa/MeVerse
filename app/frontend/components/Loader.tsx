import React, { useEffect } from 'react';
import { Box, Flex, Text, useColorMode } from '@chakra-ui/react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);
const MotionText = motion(Text);
const MotionFlex = motion(Flex);

interface LoaderProps {
  isLoading: boolean;
  onLoadingComplete?: () => void;
  text?: string;
}

export default function Loader({ isLoading, onLoadingComplete, text = "MeVerse" }: LoaderProps) {
  const { colorMode } = useColorMode();
  const controls = useAnimation();
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const animateIn = async () => {
      // Start the animation sequence
      await controls.start({
        width: "100%",
        transition: { duration: 2, ease: [0.76, 0, 0.24, 1] }
      });
      
      // When animation completes, trigger the callback
      if (onLoadingComplete) {
        timeout = setTimeout(() => {
          onLoadingComplete();
        }, 300);
      }
    };
    
    if (isLoading) {
      animateIn();
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoading, controls, onLoadingComplete]);
  
  // If not loading, don't render anything
  if (!isLoading) return null;
  
  // Create the letters for the text animation
  const letters = text.split('');
  
  return (
    <AnimatePresence>
      {isLoading && (
        <MotionFlex
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          zIndex="9999"
          bg={colorMode === 'dark' ? 'dark.300' : 'white'}
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          {/* Logo Animation */}
          <MotionBox
            width="80px"
            height="80px"
            borderRadius="20px"
            bg="brand.500"
            mb={6}
            initial={{ scale: 0, rotate: -45 }}
            animate={{ 
              scale: [0, 1, 1.2, 1],
              rotate: [-45, 0, 10, 0],
              boxShadow: [
                "0 0 0 rgba(106, 38, 255, 0)",
                "0 0 0 rgba(106, 38, 255, 0)",
                "0 0 40px rgba(106, 38, 255, 0.5)",
                "0 0 20px rgba(106, 38, 255, 0.3)"
              ]
            }}
            transition={{ 
              duration: 1.5, 
              ease: "easeOut",
              times: [0, 0.5, 0.8, 1] 
            }}
          >
            <Flex 
              height="100%" 
              alignItems="center" 
              justifyContent="center"
              color="white"
              fontSize="3xl"
              fontWeight="bold"
            >
              M
            </Flex>
          </MotionBox>
          
          {/* Animated Text */}
          <MotionFlex initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            {letters.map((letter, index) => (
              <MotionText
                key={index}
                fontWeight="bold"
                fontSize="2xl"
                color={colorMode === 'dark' ? 'white' : 'gray.800'}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                  delay: 0.8 + index * 0.05,
                  duration: 0.6,
                  ease: [0.215, 0.61, 0.355, 1] 
                }}
              >
                {letter}
              </MotionText>
            ))}
          </MotionFlex>
          
          {/* Progress Bar */}
          <Box 
            mt={6}
            width="200px"
            height="2px"
            bg={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
            borderRadius="full"
            overflow="hidden"
          >
            <MotionBox 
              height="100%" 
              width="0%" 
              bg="brand.500" 
              animate={controls}
            />
          </Box>
          
          {/* Animated Dots */}
          <MotionFlex 
            mt={4}
            alignItems="center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <MotionText 
              fontSize="sm" 
              color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}
            >
              Loading your digital twin
            </MotionText>
            {[0, 1, 2].map((dot) => (
              <MotionBox
                key={dot}
                width="4px"
                height="4px"
                borderRadius="full"
                bg={colorMode === 'dark' ? 'gray.400' : 'gray.500'}
                ml={1}
                animate={{
                  opacity: [0, 1, 0],
                  y: [0, -5, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop",
                  delay: dot * 0.2
                }}
              />
            ))}
          </MotionFlex>
        </MotionFlex>
      )}
    </AnimatePresence>
  );
} 