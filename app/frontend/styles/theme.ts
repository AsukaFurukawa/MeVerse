import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  fonts: {
    heading: `'Space Grotesk', sans-serif`,
    body: `'Inter', sans-serif`,
  },
  colors: {
    brand: {
      50: '#f0e7ff',
      100: '#d0c0ff',
      200: '#b197fc',
      300: '#916efa',
      400: '#7245f8',
      500: '#6a26ff', // Primary brand color
      600: '#5a1de2',
      700: '#4a14c0',
      800: '#3b0d9e',
      900: '#2c077d',
    },
    accent: {
      purple: '#9c4df4',
      blue: '#36d6ff',
      pink: '#ed64a6',
      green: '#48BB78',
      yellow: '#F6E05E',
    },
    dark: {
      50: '#C5C6D0',
      100: '#A9AABD',
      200: '#16172B', // Dark background
      300: '#121426',
      400: '#0e1021',
      500: '#0a0c1b',
      600: '#060815',
      700: '#030410',
      800: '#01020a',
      900: '#000005',
    },
  },
  styles: {
    global: (props: any) => ({
      body: {
        color: mode('gray.800', 'whiteAlpha.900')(props),
        bg: mode('gray.50', 'dark.200')(props),
        transition: 'background-color 0.3s ease',
      },
      // Add styles for highlighted code blocks
      'pre, code': {
        bg: mode('gray.100', 'gray.800')(props),
        borderRadius: 'md',
        padding: '0.2em 0.4em',
        fontSize: '0.9em',
      },
      // Improve the styling of blockquotes
      'blockquote': {
        borderLeftWidth: '4px',
        borderLeftColor: mode('brand.200', 'brand.500')(props),
        paddingLeft: '1em',
        fontStyle: 'italic',
        color: mode('gray.600', 'gray.400')(props),
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '500',
        borderRadius: 'md',
        _focus: {
          boxShadow: '0 0 0 3px rgba(106, 38, 255, 0.4)',
        },
      },
      variants: {
        solid: (props: any) => ({
          bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
          _hover: {
            bg: props.colorScheme === 'brand' ? 'brand.600' : undefined,
            transform: 'translateY(-2px)',
            boxShadow: 'md',
          },
          _active: {
            transform: 'translateY(0)',
          },
          transition: 'all 0.2s ease',
        }),
        outline: (props: any) => ({
          borderColor: props.colorScheme === 'brand' ? 'brand.500' : undefined,
          color: props.colorScheme === 'brand' ? mode('brand.500', 'brand.300')(props) : undefined,
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: 'md',
            bg: props.colorScheme === 'brand' 
              ? mode('brand.50', 'rgba(106, 38, 255, 0.2)')(props) 
              : undefined,
          },
          _active: {
            transform: 'translateY(0)',
          },
          transition: 'all 0.2s ease',
        }),
        ghost: {
          _hover: {
            transform: 'translateY(-2px)',
          },
          _active: {
            transform: 'translateY(0)',
          },
          transition: 'all 0.2s ease',
        },
      },
    },
    Card: {
      baseStyle: (props: any) => ({
        container: {
          bg: mode('white', 'gray.800')(props),
          borderRadius: 'xl',
          boxShadow: 'lg',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          _hover: {
            boxShadow: 'xl',
            transform: 'translateY(-5px)',
          },
        },
        header: {
          padding: '6',
          borderBottom: '1px solid',
          borderColor: mode('gray.200', 'gray.700')(props),
        },
        body: {
          padding: '6',
        },
        footer: {
          padding: '6',
          borderTop: '1px solid',
          borderColor: mode('gray.200', 'gray.700')(props),
        },
      }),
    },
    Tabs: {
      variants: {
        'soft-rounded': (props: any) => ({
          tab: {
            borderRadius: 'full',
            fontWeight: 'medium',
            transition: 'all 0.2s ease',
            _selected: {
              fontWeight: 'semibold',
            },
            _hover: {
              bg: mode('gray.100', 'whiteAlpha.100')(props),
            },
          },
        }),
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: '700',
        lineHeight: '1.2',
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'md',
        },
      },
      variants: {
        outline: (props: any) => ({
          field: {
            _focus: {
              borderColor: 'brand.500',
              boxShadow: `0 0 0 1px ${mode('brand.500', 'brand.300')(props)}`,
            },
          },
        }),
      },
    },
    Textarea: {
      baseStyle: {
        borderRadius: 'md',
      },
      variants: {
        outline: (props: any) => ({
          _focus: {
            borderColor: 'brand.500',
            boxShadow: `0 0 0 1px ${mode('brand.500', 'brand.300')(props)}`,
          },
        }),
      },
    },
    Tooltip: {
      baseStyle: (props: any) => ({
        bg: mode('gray.700', 'gray.300')(props),
        color: mode('white', 'gray.800')(props),
        fontSize: 'sm',
        borderRadius: 'md',
        px: '2',
        py: '1',
      }),
    },
    Modal: {
      baseStyle: (props: any) => ({
        dialog: {
          borderRadius: 'xl',
          bg: mode('white', 'gray.800')(props),
        },
      }),
    },
    // Custom loading animation
    Spinner: {
      baseStyle: {
        color: 'brand.500',
      },
    },
  },
  shadows: {
    outline: '0 0 0 3px rgba(106, 38, 255, 0.4)',
  },
  layerStyles: {
    card: {
      bg: 'white',
      _dark: {
        bg: 'gray.800',
      },
      borderRadius: 'xl',
      boxShadow: 'lg',
      p: 5,
      transition: 'all 0.3s ease',
      _hover: {
        boxShadow: 'xl',
        transform: 'translateY(-5px)',
      },
    },
    gradientCard: {
      position: 'relative',
      borderRadius: 'xl',
      overflow: 'hidden',
      _before: {
        content: '""',
        position: 'absolute',
        top: '-2px',
        left: '-2px',
        right: '-2px',
        bottom: '-2px',
        zIndex: -1,
        borderRadius: 'xl',
        bg: 'linear-gradient(45deg, var(--chakra-colors-brand-500), var(--chakra-colors-accent-purple), var(--chakra-colors-accent-blue))',
        bgSize: '300% 300%',
        animation: 'gradientBorder 10s ease infinite',
      },
    },
  },
  textStyles: {
    gradient: {
      bgGradient: 'linear(to-r, brand.500, accent.purple, accent.blue)',
      bgClip: 'text',
      color: 'transparent',
      display: 'inline-block',
    },
    caption: {
      fontSize: 'sm',
      color: 'gray.500',
      _dark: {
        color: 'gray.400',
      },
    },
  },
});

export default theme; 