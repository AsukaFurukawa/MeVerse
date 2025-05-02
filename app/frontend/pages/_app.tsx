import { AppProps } from 'next/app';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

// Create a client
const queryClient = new QueryClient();

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
  },
  fonts: {
    heading: '"Inter", sans-serif',
    body: '"Inter", sans-serif',
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.50',
      }
    }),
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default MyApp; 