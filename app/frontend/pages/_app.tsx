import { AppProps } from 'next/app';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Global, css } from '@emotion/react';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import { AuthProvider } from '../context/AuthContext';
import Layout from '../components/Layout';

// Create a client
const queryClient = new QueryClient();

// Global styles
const GlobalStyles = css`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
  
  html {
    scroll-behavior: smooth;
  }
  
  body {
    overflow-x: hidden;
    position: relative;
  }
  
  ::selection {
    background: #6a26ff;
    color: white;
  }
  
  .animate-fade-in {
    animation: fadeIn 0.8s ease-in-out forwards;
  }
  
  .animate-slide-up {
    animation: slideUp 0.8s ease-out forwards;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.1); opacity: 0.8; }
    100% { transform: scale(1); opacity: 0.6; }
  }
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  
  @keyframes glow {
    0% { box-shadow: 0 0 5px rgba(106, 38, 255, 0.3); }
    50% { box-shadow: 0 0 20px rgba(106, 38, 255, 0.6); }
    100% { box-shadow: 0 0 5px rgba(106, 38, 255, 0.3); }
  }
  
  .cursor-follower {
    width: 20px;
    height: 20px;
    background: rgba(106, 38, 255, 0.3);
    border-radius: 50%;
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    transition: transform 0.15s ease-out;
    mix-blend-mode: difference;
    backdrop-filter: invert(1);
  }
  
  .floating-element {
    animation: float 4s ease-in-out infinite;
  }
  
  .glowing-element {
    animation: glow 3s ease-in-out infinite;
  }
  
  .pulsing-element {
    animation: pulse 3s ease-in-out infinite;
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(106, 38, 255, 0.3);
    border-radius: 4px;
    transition: all 0.3s ease;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(106, 38, 255, 0.5);
  }
  
  /* Button and interactive element hover effects */
  button, a, .interactive-element {
    transition: all 0.2s ease-out !important;
  }
  
  button:hover, a:hover, .interactive-element:hover {
    transform: translateY(-2px);
  }
  
  button:active, a:active, .interactive-element:active {
    transform: translateY(1px);
  }
`;

// Extend the theme
const theme = extendTheme({
  colors: {
    brand: {
      50: '#f5e9ff',
      100: '#d9c2ff',
      200: '#bd9bff',
      300: '#a174ff',
      400: '#864dff',
      500: '#6a26ff',
      600: '#541bcc',
      700: '#3d1299',
      800: '#270a66',
      900: '#130333',
    },
    accent: {
      blue: '#36D6FF',
      purple: '#AF6EFF',
      pink: '#FF7ED4',
      green: '#39FFAA',
      yellow: '#FFE83A',
    },
    dark: {
      100: '#1A1A2E',
      200: '#16172B',
      300: '#0F0F1E',
      400: '#080811',
    }
  },
  fonts: {
    heading: "'Space Grotesk', sans-serif",
    body: "'Inter', sans-serif",
  },
  shadows: {
    glow: '0 0 15px rgba(106, 38, 255, 0.5)',
    cardHover: '0 10px 40px rgba(0, 0, 0, 0.2)',
    card: '0 8px 30px rgba(0, 0, 0, 0.12)',
    neon: '0 0 5px #6a26ff, 0 0 20px rgba(106, 38, 255, 0.5)',
    subtle: '0 4px 12px rgba(0, 0, 0, 0.08)'
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'dark.200' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
        lineHeight: 1.6,
        letterSpacing: '-0.01em',
      },
      h1: {
        letterSpacing: '-0.02em',
      },
      h2: {
        letterSpacing: '-0.01em',
      }
    }),
  },
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '500',
        borderRadius: 'md',
        _focus: {
          boxShadow: 'none',
        }
      },
      variants: {
        primary: (props: any) => ({
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
            boxShadow: 'glow',
            transform: 'translateY(-2px)',
          },
          _active: {
            bg: 'brand.700',
            transform: 'translateY(0)',
          },
          transition: 'all 0.2s ease-in-out',
        }),
        ghost: {
          _hover: {
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.2s ease-in-out',
        }
      },
      defaultProps: {
        variant: 'primary',
      }
    },
    Heading: {
      baseStyle: {
        fontWeight: '600',
      }
    },
    // Custom components styling
    Card: {
      baseStyle: (props: any) => ({
        p: 6,
        borderRadius: 'xl',
        bg: props.colorMode === 'dark' ? 'dark.100' : 'white',
        boxShadow: 'card',
        transition: 'all 0.3s ease',
        _hover: {
          boxShadow: 'cardHover',
          transform: 'translateY(-5px)',
        }
      }),
    },
    Tag: {
      baseStyle: {
        borderRadius: 'full',
      }
    },
    Tabs: {
      variants: {
        'soft-rounded': (props: any) => ({
          tab: {
            fontWeight: 'medium',
            transition: 'all 0.2s',
            _selected: {
              fontWeight: 'semibold',
            }
          }
        })
      }
    },
    Modal: {
      baseStyle: (props: any) => ({
        dialog: {
          bg: props.colorMode === 'dark' ? 'dark.100' : 'white',
          boxShadow: 'card',
          borderRadius: 'xl',
        }
      })
    },
    Tooltip: {
      baseStyle: {
        bg: 'brand.500',
        color: 'white',
        fontSize: 'xs',
        borderRadius: 'md',
        px: 2,
        py: 1,
      }
    }
  }
});

function MyApp({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Head>
        <title>MeVerse - Your Digital Twin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="MeVerse is your personal digital twin that learns and grows with you" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Global styles={GlobalStyles} />
      
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {isLoading ? (
              <Loader />
            ) : (
              <Layout>
                <Component {...pageProps} />
              </Layout>
            )}
          </AuthProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ChakraProvider>
    </>
  );
}

export default MyApp;