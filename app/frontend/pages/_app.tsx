import { AppProps } from 'next/app';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Global, css } from '@emotion/react';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import Loader from '../components/Loader';

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
  
  .cursor-follower {
    width: 20px;
    height: 20px;
    background: rgba(106, 38, 255, 0.3);
    border-radius: 50%;
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    transition: transform 0.1s ease;
    mix-blend-mode: difference;
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
    card: '0 8px 30px rgba(0, 0, 0, 0.12)',
    neon: '0 0 5px #6a26ff, 0 0 20px rgba(106, 38, 255, 0.5)'
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'dark.200' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
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
    }
  }
});

function MyApp({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate initial loading for demo purposes
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <Head>
          <title>MeVerse | Your Digital Twin</title>
          <meta name="description" content="MeVerse - A digital twin that learns from your behavior and provides guidance" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Global styles={GlobalStyles} />
        <Loader isLoading={loading} onLoadingComplete={() => setLoading(false)} />
        {!loading && <Component {...pageProps} />}
      </ChakraProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default MyApp; 