import { useState, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  Text, 
  Button, 
  useColorMode,
  Textarea,
  Input,
  Grid,
  GridItem,
  HStack,
  VStack,
  IconButton,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Tag,
  Divider,
  Select
} from '@chakra-ui/react';
import { 
  FaBook, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes, 
  FaEllipsisV,
  FaCalendarAlt,
  FaHashtag,
  FaChevronLeft,
  FaChevronRight,
  FaSmile,
  FaImages,
  FaHeading
} from 'react-icons/fa';
import { motion } from 'framer-motion';

// Motion components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionText = motion(Text);
const MotionHeading = motion(Heading);

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  mood: string;
}

interface JournalProps {
  userId?: string;
}

// Mock data
const mockEntries: JournalEntry[] = [
  {
    id: '1',
    title: 'First day at new job',
    content: 'Today was my first day at the new job. I was nervous at first, but everyone was welcoming and helpful. Looking forward to learning more about the project tomorrow.',
    createdAt: new Date(2023, 5, 10),
    updatedAt: new Date(2023, 5, 10),
    tags: ['work', 'career'],
    mood: 'excited'
  },
  {
    id: '2',
    title: 'Weekend hike',
    content: 'Went for a hike in the mountains today. The weather was perfect and the views were breathtaking. Feeling refreshed and energized.',
    createdAt: new Date(2023, 5, 5),
    updatedAt: new Date(2023, 5, 5),
    tags: ['outdoors', 'exercise', 'nature'],
    mood: 'happy'
  },
  {
    id: '3',
    title: 'Project deadline approaching',
    content: 'Getting a bit anxious about the upcoming project deadline. Need to focus and prioritize the remaining tasks. Maybe I should discuss timeline concerns with the team tomorrow.',
    createdAt: new Date(2023, 4, 28),
    updatedAt: new Date(2023, 4, 29),
    tags: ['work', 'stress'],
    mood: 'anxious'
  }
];

export default function Journal({ userId }: JournalProps) {
  const { colorMode } = useColorMode();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [newEntry, setNewEntry] = useState<Partial<JournalEntry>>({ 
    title: '', 
    content: '', 
    tags: [], 
    mood: 'neutral' 
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [tagInput, setTagInput] = useState<string>('');
  const [filterTag, setFilterTag] = useState<string>('');
  const [filterMood, setFilterMood] = useState<string>('');
  const toast = useToast();
  
  const isDark = colorMode === 'dark';
  const bgColor = isDark ? 'gray.800' : 'white';
  const textColor = isDark ? 'white' : 'gray.800';
  const accentColor = isDark ? 'purple.400' : 'purple.500';
  const subtleColor = isDark ? 'whiteAlpha.100' : 'blackAlpha.50';
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
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
  
  // Load entries
  useEffect(() => {
    // In a real app, you would fetch from an API
    setEntries(mockEntries);
    
    // Set the first entry as active if available
    if (mockEntries.length > 0) {
      setActiveEntry(mockEntries[0]);
    }
  }, []);
  
  const handleCreateEntry = () => {
    setIsCreating(true);
    setActiveEntry(null);
    setNewEntry({ 
      title: '', 
      content: '', 
      tags: [], 
      mood: 'neutral' 
    });
  };
  
  const handleSaveNewEntry = () => {
    if (!newEntry.title || !newEntry.content) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content for your journal entry.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    const now = new Date();
    const entry: JournalEntry = {
      id: Date.now().toString(),
      title: newEntry.title || "Untitled",
      content: newEntry.content || "",
      createdAt: now,
      updatedAt: now,
      tags: newEntry.tags || [],
      mood: newEntry.mood || "neutral"
    };
    
    setEntries([entry, ...entries]);
    setActiveEntry(entry);
    setIsCreating(false);
    
    toast({
      title: "Entry created",
      description: "Your journal entry has been saved.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };
  
  const handleEditEntry = () => {
    if (!activeEntry) return;
    
    setIsEditing(true);
    setNewEntry({
      title: activeEntry.title,
      content: activeEntry.content,
      tags: [...activeEntry.tags],
      mood: activeEntry.mood
    });
  };
  
  const handleUpdateEntry = () => {
    if (!activeEntry || !newEntry.title || !newEntry.content) return;
    
    const updatedEntry: JournalEntry = {
      ...activeEntry,
      title: newEntry.title || activeEntry.title,
      content: newEntry.content || activeEntry.content,
      updatedAt: new Date(),
      tags: newEntry.tags || activeEntry.tags,
      mood: newEntry.mood || activeEntry.mood
    };
    
    setEntries(entries.map(entry => 
      entry.id === activeEntry.id ? updatedEntry : entry
    ));
    setActiveEntry(updatedEntry);
    setIsEditing(false);
    
    toast({
      title: "Entry updated",
      description: "Your journal entry has been updated.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };
  
  const handleDeleteEntry = (id: string) => {
    const entryToDelete = entries.find(entry => entry.id === id);
    
    if (!entryToDelete) return;
    
    setEntries(entries.filter(entry => entry.id !== id));
    
    if (activeEntry && activeEntry.id === id) {
      setActiveEntry(entries.length > 1 ? entries[0] : null);
    }
    
    toast({
      title: "Entry deleted",
      description: `The entry "${entryToDelete.title}" has been deleted.`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };
  
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    if (isEditing || isCreating) {
      setNewEntry({
        ...newEntry,
        tags: [...(newEntry.tags || []), tagInput.trim()]
      });
    }
    
    setTagInput('');
  };
  
  const handleRemoveTag = (tag: string) => {
    if (isEditing || isCreating) {
      setNewEntry({
        ...newEntry,
        tags: (newEntry.tags || []).filter(t => t !== tag)
      });
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput) {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const filterEntries = (entries: JournalEntry[]) => {
    return entries.filter(entry => {
      let matchesTag = true;
      let matchesMood = true;
      
      if (filterTag) {
        matchesTag = entry.tags.includes(filterTag);
      }
      
      if (filterMood) {
        matchesMood = entry.mood === filterMood;
      }
      
      return matchesTag && matchesMood;
    });
  };
  
  const getMoodEmoji = (mood: string) => {
    switch(mood) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'anxious': return '😰';
      case 'excited': return '😃';
      case 'tired': return '😴';
      case 'relaxed': return '😌';
      default: return '😐';
    }
  };
  
  const filteredEntries = filterEntries(entries);
  
  const gradientBg = isDark
    ? 'linear-gradient(180deg, rgba(124, 58, 237, 0.05) 0%, rgba(76, 29, 149, 0.05) 100%)'
    : 'linear-gradient(180deg, rgba(124, 58, 237, 0.05) 0%, rgba(76, 29, 149, 0.05) 100%)';
  
  return (
    <MotionBox
      as="section"
      bg={bgColor}
      borderRadius="xl"
      p={6}
      boxShadow="xl"
      bgGradient={gradientBg}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      w="100%"
      overflow="hidden"
      position="relative"
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
      
      <MotionHeading
        as="h2"
        fontSize="2xl"
        mb={6}
        variants={itemVariants}
        display="flex"
        alignItems="center"
      >
        <Box as={FaBook} mr={3} color={accentColor} />
        Personal Journal
        <Tag ml={3} size="sm" colorScheme="purple" borderRadius="full">Private</Tag>
      </MotionHeading>
      
      <Grid templateColumns={{ base: "1fr", md: "250px 1fr" }} gap={6}>
        {/* Entries sidebar */}
        <GridItem>
          <MotionBox variants={itemVariants}>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Entries</Heading>
              <Button
                size="sm"
                leftIcon={<FaPlus />}
                colorScheme="purple"
                onClick={handleCreateEntry}
              >
                New Entry
              </Button>
            </Flex>
            
            {/* Filters */}
            <HStack mb={4} spacing={2}>
              <Select 
                placeholder="Filter by mood" 
                size="sm"
                value={filterMood}
                onChange={(e) => setFilterMood(e.target.value)}
                bg={isDark ? "whiteAlpha.50" : "blackAlpha.50"}
                maxW="140px"
              >
                <option value="happy">Happy 😊</option>
                <option value="sad">Sad 😢</option>
                <option value="anxious">Anxious 😰</option>
                <option value="excited">Excited 😃</option>
                <option value="relaxed">Relaxed 😌</option>
                <option value="tired">Tired 😴</option>
                <option value="angry">Angry 😠</option>
              </Select>
              
              <Select
                placeholder="Filter by tag"
                size="sm"
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                bg={isDark ? "whiteAlpha.50" : "blackAlpha.50"}
              >
                {Array.from(new Set(entries.flatMap(entry => entry.tags))).map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </Select>
            </HStack>
            
            {/* Entry list */}
            <VStack spacing={3} align="stretch" maxH="500px" overflowY="auto">
              {filteredEntries.length === 0 ? (
                <Text color={isDark ? "gray.400" : "gray.500"} fontSize="sm" textAlign="center">
                  No entries found. {entries.length > 0 ? 'Try adjusting filters.' : 'Create your first journal entry!'}
                </Text>
              ) : (
                filteredEntries.map(entry => (
                  <Box
                    key={entry.id}
                    p={3}
                    bg={activeEntry?.id === entry.id ? 
                      isDark ? "purple.900" : "purple.50" : 
                      isDark ? "whiteAlpha.50" : "blackAlpha.50"
                    }
                    borderRadius="md"
                    borderLeft="3px solid"
                    borderLeftColor={activeEntry?.id === entry.id ? "purple.500" : "transparent"}
                    cursor="pointer"
                    onClick={() => {
                      if (!isEditing && !isCreating) {
                        setActiveEntry(entry);
                      }
                    }}
                    position="relative"
                    transition="all 0.2s"
                    _hover={{
                      bg: isDark ? "whiteAlpha.100" : "blackAlpha.100"
                    }}
                  >
                    <Flex justify="space-between" align="flex-start">
                      <Box>
                        <Heading size="sm" noOfLines={1}>{entry.title}</Heading>
                        <Text fontSize="xs" color={isDark ? "gray.400" : "gray.500"} mt={1}>
                          {entry.createdAt.toLocaleDateString()} {getMoodEmoji(entry.mood)}
                        </Text>
                      </Box>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FaEllipsisV />}
                          variant="ghost"
                          size="xs"
                          aria-label="Options"
                        />
                        <MenuList>
                          <MenuItem 
                            icon={<FaEdit />} 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveEntry(entry);
                              handleEditEntry();
                            }}
                          >
                            Edit
                          </MenuItem>
                          <MenuItem 
                            icon={<FaTrash />} 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEntry(entry.id);
                            }}
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Flex>
                    <Text fontSize="sm" noOfLines={2} mt={1} mb={2}>
                      {entry.content}
                    </Text>
                    {entry.tags.length > 0 && (
                      <Flex wrap="wrap" gap={2}>
                        {entry.tags.map(tag => (
                          <Tag 
                            key={tag} 
                            size="sm" 
                            colorScheme="purple" 
                            variant="subtle"
                            borderRadius="full"
                          >
                            {tag}
                          </Tag>
                        ))}
                      </Flex>
                    )}
                  </Box>
                ))
              )}
            </VStack>
          </MotionBox>
        </GridItem>
        
        {/* Entry editor or viewer */}
        <GridItem>
          <MotionBox variants={itemVariants}>
            {isCreating ? (
              // Create new entry
              <Box>
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="md">New Journal Entry</Heading>
                  <HStack>
                    <Button 
                      size="sm" 
                      leftIcon={<FaTimes />} 
                      variant="ghost" 
                      onClick={() => {
                        setIsCreating(false);
                        if (entries.length > 0 && !activeEntry) {
                          setActiveEntry(entries[0]);
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      leftIcon={<FaSave />} 
                      colorScheme="purple" 
                      onClick={handleSaveNewEntry}
                    >
                      Save
                    </Button>
                  </HStack>
                </Flex>
                
                <VStack spacing={4} align="stretch">
                  <Input
                    placeholder="Entry title"
                    value={newEntry.title || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                    bg={isDark ? "whiteAlpha.50" : "blackAlpha.50"}
                    focusBorderColor="purple.500"
                  />
                  
                  <HStack>
                    <Box as={FaCalendarAlt} color={accentColor} />
                    <Text fontSize="sm">{new Date().toLocaleDateString()}</Text>
                    
                    <Select 
                      value={newEntry.mood || 'neutral'} 
                      onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
                      size="sm"
                      maxW="140px"
                      ml={2}
                    >
                      <option value="happy">Happy 😊</option>
                      <option value="sad">Sad 😢</option>
                      <option value="anxious">Anxious 😰</option>
                      <option value="excited">Excited 😃</option>
                      <option value="relaxed">Relaxed 😌</option>
                      <option value="tired">Tired 😴</option>
                      <option value="angry">Angry 😠</option>
                      <option value="neutral">Neutral 😐</option>
                    </Select>
                  </HStack>
                  
                  <Textarea
                    placeholder="Write your journal entry here..."
                    value={newEntry.content || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                    bg={isDark ? "whiteAlpha.50" : "blackAlpha.50"}
                    focusBorderColor="purple.500"
                    h="250px"
                    resize="none"
                  />
                  
                  <HStack>
                    <Box as={FaHashtag} color={accentColor} />
                    <Text fontSize="sm">Tags:</Text>
                    <Input
                      placeholder="Add tag (press Enter)"
                      size="sm"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      maxW="200px"
                    />
                    <IconButton
                      aria-label="Add tag"
                      icon={<FaPlus />}
                      size="sm"
                      colorScheme="purple"
                      variant="ghost"
                      onClick={handleAddTag}
                      isDisabled={!tagInput.trim()}
                    />
                  </HStack>
                  
                  {newEntry.tags && newEntry.tags.length > 0 && (
                    <Flex wrap="wrap" gap={2}>
                      {newEntry.tags.map(tag => (
                        <Tag 
                          key={tag} 
                          colorScheme="purple" 
                          borderRadius="full"
                          size="sm"
                        >
                          {tag}
                          <Box 
                            as="span" 
                            ml={1} 
                            cursor="pointer" 
                            onClick={() => handleRemoveTag(tag)}
                          >
                            ✕
                          </Box>
                        </Tag>
                      ))}
                    </Flex>
                  )}
                </VStack>
              </Box>
            ) : isEditing ? (
              // Edit existing entry
              <Box>
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="md">Edit Journal Entry</Heading>
                  <HStack>
                    <Button 
                      size="sm" 
                      leftIcon={<FaTimes />} 
                      variant="ghost" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      leftIcon={<FaSave />} 
                      colorScheme="purple" 
                      onClick={handleUpdateEntry}
                    >
                      Update
                    </Button>
                  </HStack>
                </Flex>
                
                <VStack spacing={4} align="stretch">
                  <Input
                    placeholder="Entry title"
                    value={newEntry.title || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                    bg={isDark ? "whiteAlpha.50" : "blackAlpha.50"}
                    focusBorderColor="purple.500"
                  />
                  
                  <HStack>
                    <Box as={FaCalendarAlt} color={accentColor} />
                    <Text fontSize="sm">
                      {activeEntry ? activeEntry.createdAt.toLocaleDateString() : new Date().toLocaleDateString()}
                      {activeEntry && activeEntry.updatedAt > activeEntry.createdAt && 
                        ` (Edited: ${activeEntry.updatedAt.toLocaleDateString()})`
                      }
                    </Text>
                    
                    <Select 
                      value={newEntry.mood || 'neutral'} 
                      onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
                      size="sm"
                      maxW="140px"
                      ml={2}
                    >
                      <option value="happy">Happy 😊</option>
                      <option value="sad">Sad 😢</option>
                      <option value="anxious">Anxious 😰</option>
                      <option value="excited">Excited 😃</option>
                      <option value="relaxed">Relaxed 😌</option>
                      <option value="tired">Tired 😴</option>
                      <option value="angry">Angry 😠</option>
                      <option value="neutral">Neutral 😐</option>
                    </Select>
                  </HStack>
                  
                  <Textarea
                    placeholder="Write your journal entry here..."
                    value={newEntry.content || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                    bg={isDark ? "whiteAlpha.50" : "blackAlpha.50"}
                    focusBorderColor="purple.500"
                    h="250px"
                    resize="none"
                  />
                  
                  <HStack>
                    <Box as={FaHashtag} color={accentColor} />
                    <Text fontSize="sm">Tags:</Text>
                    <Input
                      placeholder="Add tag (press Enter)"
                      size="sm"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      maxW="200px"
                    />
                    <IconButton
                      aria-label="Add tag"
                      icon={<FaPlus />}
                      size="sm"
                      colorScheme="purple"
                      variant="ghost"
                      onClick={handleAddTag}
                      isDisabled={!tagInput.trim()}
                    />
                  </HStack>
                  
                  {newEntry.tags && newEntry.tags.length > 0 && (
                    <Flex wrap="wrap" gap={2}>
                      {newEntry.tags.map(tag => (
                        <Tag 
                          key={tag} 
                          colorScheme="purple" 
                          borderRadius="full"
                          size="sm"
                        >
                          {tag}
                          <Box 
                            as="span" 
                            ml={1} 
                            cursor="pointer" 
                            onClick={() => handleRemoveTag(tag)}
                          >
                            ✕
                          </Box>
                        </Tag>
                      ))}
                    </Flex>
                  )}
                </VStack>
              </Box>
            ) : activeEntry ? (
              // View entry
              <Box>
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="md">{activeEntry.title}</Heading>
                  <HStack>
                    <Button 
                      size="sm" 
                      leftIcon={<FaEdit />} 
                      colorScheme="purple" 
                      variant="outline"
                      onClick={handleEditEntry}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      leftIcon={<FaTrash />} 
                      colorScheme="red" 
                      variant="ghost"
                      onClick={() => handleDeleteEntry(activeEntry.id)}
                    >
                      Delete
                    </Button>
                  </HStack>
                </Flex>
                
                <HStack mb={4}>
                  <Box as={FaCalendarAlt} color={accentColor} />
                  <Text fontSize="sm">
                    {activeEntry.createdAt.toLocaleDateString()}
                    {activeEntry.updatedAt > activeEntry.createdAt && 
                      ` (Edited: ${activeEntry.updatedAt.toLocaleDateString()})`
                    }
                  </Text>
                  <Text fontSize="xl" ml={2}>
                    {getMoodEmoji(activeEntry.mood)}
                  </Text>
                </HStack>
                
                <Box 
                  bg={isDark ? "whiteAlpha.50" : "blackAlpha.50"} 
                  p={4} 
                  borderRadius="md" 
                  mb={4}
                  minH="250px"
                >
                  <Text whiteSpace="pre-wrap">{activeEntry.content}</Text>
                </Box>
                
                {activeEntry.tags.length > 0 && (
                  <Box>
                    <Flex align="center" mb={2}>
                      <Box as={FaHashtag} color={accentColor} mr={2} />
                      <Text fontSize="sm">Tags:</Text>
                    </Flex>
                    <Flex wrap="wrap" gap={2}>
                      {activeEntry.tags.map(tag => (
                        <Tag 
                          key={tag} 
                          colorScheme="purple" 
                          borderRadius="full"
                          size="sm"
                          onClick={() => setFilterTag(tag === filterTag ? '' : tag)}
                          cursor="pointer"
                        >
                          {tag}
                        </Tag>
                      ))}
                    </Flex>
                  </Box>
                )}
              </Box>
            ) : (
              // No entry selected
              <Flex 
                direction="column" 
                align="center" 
                justify="center" 
                h="100%" 
                minH="300px" 
                bg={isDark ? "whiteAlpha.50" : "blackAlpha.50"}
                borderRadius="md"
                p={6}
              >
                <Box as={FaBook} fontSize="5xl" color={accentColor} mb={4} />
                <Heading size="md" mb={2}>Your Journal</Heading>
                <Text textAlign="center" mb={4}>
                  Record your thoughts, track your journey, and reflect on your growth.
                </Text>
                <Button
                  colorScheme="purple"
                  leftIcon={<FaPlus />}
                  onClick={handleCreateEntry}
                >
                  Create Your First Entry
                </Button>
              </Flex>
            )}
          </MotionBox>
        </GridItem>
      </Grid>
    </MotionBox>
  );
} 