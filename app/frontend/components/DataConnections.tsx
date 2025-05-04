import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  SimpleGrid,
  useColorModeValue,
  Icon,
  Flex,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Select,
  Divider,
} from '@chakra-ui/react';
import { FiMusic, FiCalendar, FiActivity, FiGithub, FiTwitter, FiBook, FiLink, FiPlus } from 'react-icons/fi';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';

// Define connection types and their icons
const connectionTypes = [
  { id: 'spotify', name: 'Spotify', icon: FiMusic, color: 'green.400' },
  { id: 'google_calendar', name: 'Google Calendar', icon: FiCalendar, color: 'blue.400' },
  { id: 'google_fit', name: 'Google Fit', icon: FiActivity, color: 'red.400' },
  { id: 'github', name: 'GitHub', icon: FiGithub, color: 'gray.400' },
  { id: 'twitter', name: 'Twitter', icon: FiTwitter, color: 'blue.500' },
  { id: 'notion', name: 'Notion', icon: FiBook, color: 'gray.700' },
  { id: 'custom_api', name: 'Custom API', icon: FiLink, color: 'purple.400' },
];

// Add interface definition for a connection near the top of the file, after imports
interface Connection {
  id: string;
  type: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected';
  settings?: Record<string, any>;
}

// Connection card component
const ConnectionCard = ({ connection, onConnect, onDisconnect, onDelete, isConnected = false }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const { icon: IconComponent, color } = connectionTypes.find(
    type => type.id === connection.id
  ) || { icon: FiLink, color: 'gray.400' };
  
  return (
    <Box
      p={5}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      bg={bgColor}
      boxShadow="sm"
      position="relative"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-4px)', boxShadow: 'md' }}
    >
      <Flex alignItems="center" justifyContent="space-between" mb={3}>
        <Icon as={IconComponent} boxSize={8} color={color} />
        <Badge 
          colorScheme={isConnected ? 'green' : 'gray'} 
          variant="subtle"
          borderRadius="full"
        >
          {isConnected ? 'Connected' : 'Not Connected'}
        </Badge>
      </Flex>
      
      <Heading size="md" mb={2}>{connection.name}</Heading>
      <Text fontSize="sm" color="gray.500" mb={4}>
        {connection.description}
      </Text>
      
      {isConnected ? (
        <HStack spacing={2}>
          <Button 
            size="sm" 
            colorScheme="red" 
            variant="outline" 
            onClick={() => onDisconnect(connection.id)}
          >
            Disconnect
          </Button>
          <Button 
            size="sm" 
            colorScheme="red" 
            variant="ghost" 
            onClick={() => onDelete(connection.id)}
          >
            Delete
          </Button>
        </HStack>
      ) : (
        <Button 
          size="sm" 
          colorScheme="blue" 
          onClick={() => onConnect(connection.id)}
        >
          Connect
        </Button>
      )}
    </Box>
  );
};

// Main component for data connections
const DataConnections = () => {
  const { user } = useAuth();
  const { authFetch, loading, error } = useApi();
  const toast = useToast();
  
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConnectionType, setSelectedConnectionType] = useState('');
  
  // Modal for adding new connection
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newConnection, setNewConnection] = useState({
    name: '',
    type: '',
    description: '',
    settings: {}
  });
  
  // Load connections on component mount
  useEffect(() => {
    fetchConnections();
  }, [user?.id]);
  
  // Update the fetchConnections function with proper typing
  const fetchConnections = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    
    try {
      const response = await authFetch('/data/connections');
      // Add type assertion to fix the error
      const data = response as Connection[];
      setConnections(data || []);
    } catch (err) {
      toast({
        title: 'Error loading connections',
        description: error || 'Could not load your data connections',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle connection to a service
  const handleConnect = async (connectionId) => {
    try {
      // In a real implementation, this would typically redirect to OAuth flow
      // For now, we'll simulate successful connection
      const connectionType = connectionTypes.find(type => type.id === connectionId);
      
      toast({
        title: 'Connecting to service',
        description: `Redirecting to ${connectionType?.name} authorization...`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      
      // Here you would redirect to OAuth flow or other authentication mechanism
      
    } catch (err) {
      toast({
        title: 'Connection failed',
        description: error || 'Could not connect to the service',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle disconnection from a service
  const handleDisconnect = async (connectionId) => {
    try {
      await authFetch(`/data/connections/${connectionId}/disconnect`, {
        method: 'POST',
      });
      
      // Refresh connections list
      fetchConnections();
      
      toast({
        title: 'Service disconnected',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Disconnection failed',
        description: error || 'Could not disconnect from the service',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle deletion of a connection
  const handleDelete = async (connectionId) => {
    try {
      await authFetch(`/data/connections/${connectionId}`, {
        method: 'DELETE',
      });
      
      // Refresh connections list
      fetchConnections();
      
      toast({
        title: 'Connection deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Deletion failed',
        description: error || 'Could not delete the connection',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle input change for new connection form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewConnection({
      ...newConnection,
      [name]: value,
    });
  };
  
  // Handle form submission for new connection
  const handleAddConnection = async () => {
    try {
      const response = await authFetch('/data/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConnection),
      });
      
      // Reset form and close modal
      setNewConnection({
        name: '',
        type: '',
        description: '',
        settings: {}
      });
      onClose();
      
      // Refresh connections list
      fetchConnections();
      
      toast({
        title: 'Connection added',
        description: 'New data connection has been added',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Could not add connection',
        description: error || 'Failed to add the connection',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Heading as="h3" size="lg" mb={2}>Data Connections</Heading>
          <Text color="gray.500">
            Connect your digital twin with external services and data sources
          </Text>
        </Box>
        <Button 
          leftIcon={<FiPlus />} 
          colorScheme="blue" 
          onClick={onOpen}
        >
          Add Connection
        </Button>
      </Flex>
      
      <Divider mb={6} />
      
      {isLoading ? (
        <Text>Loading your connections...</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {connectionTypes.map((connection) => (
            <ConnectionCard
              key={connection.id}
              connection={{
                id: connection.id,
                name: connection.name,
                description: `Connect to your ${connection.name} account to enhance your digital twin.`
              }}
              isConnected={connections.some(c => c.type === connection.id && c.status === 'connected')}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onDelete={handleDelete}
            />
          ))}
        </SimpleGrid>
      )}
      
      {/* Modal for adding a new connection */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Connection</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Connection Type</FormLabel>
                <Select
                  name="type"
                  value={newConnection.type}
                  onChange={handleInputChange}
                  placeholder="Select connection type"
                >
                  {connectionTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Connection Name</FormLabel>
                <Input
                  name="name"
                  value={newConnection.name}
                  onChange={handleInputChange}
                  placeholder="Give this connection a name"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  name="description"
                  value={newConnection.description}
                  onChange={handleInputChange}
                  placeholder="Describe this connection (optional)"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleAddConnection}
              isDisabled={!newConnection.type || !newConnection.name}
            >
              Add Connection
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DataConnections; 