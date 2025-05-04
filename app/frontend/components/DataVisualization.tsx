import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Select,
  HStack,
  VStack,
  useColorModeValue,
  useColorMode,
  IconButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Grid,
  GridItem,
  Tooltip,
  Badge,
  Skeleton,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FaChartPie,
  FaChartLine,
  FaChartBar,
  FaNetworkWired,
  FaDownload,
  FaSyncAlt,
  FaCalendarAlt,
  FaFilter,
  FaInfoCircle,
} from 'react-icons/fa';
import * as d3 from 'd3';

// Motion components - Use motion.div instead of motion(Box)
const MotionBox = motion.div;
const MotionFlex = motion.div;

// Sample data for visualization - in real app, this would come from an API
interface DataPoint {
  date: Date;
  mood: string;
  energy: number;
  productivity: number;
  sleep: number;
  exercise: number;
  socialInteraction: number;
}

interface Correlation {
  source: string;
  target: string;
  value: number;
}

interface DataVisualizationProps {
  timeRange?: 'week' | 'month' | 'year';
  onTimeRangeChange?: (range: 'week' | 'month' | 'year') => void;
  isLoading?: boolean;
}

export default function DataVisualization({
  timeRange = 'week',
  onTimeRangeChange,
  isLoading = false,
}: DataVisualizationProps) {
  const { colorMode } = useColorMode();
  const [activeTab, setActiveTab] = useState(0);
  const [correlationData, setCorrelationData] = useState<Correlation[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<DataPoint[]>([]);
  
  const lineChartRef = useRef<SVGSVGElement>(null);
  const networkChartRef = useRef<SVGSVGElement>(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const lineColor = useColorModeValue('blue.500', 'blue.300');
  const gridColor = useColorModeValue('gray.100', 'gray.700');
  
  // Generate sample data based on time range
  useEffect(() => {
    // In real app, we would fetch data from backend based on time range
    generateSampleData(timeRange);
  }, [timeRange]);
  
  // Generate sample time series data
  const generateSampleData = (range: 'week' | 'month' | 'year') => {
    const now = new Date();
    const data: DataPoint[] = [];
    const days = range === 'week' ? 7 : range === 'month' ? 30 : 365;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - i));
      
      // Generate some realistic-looking data with some patterns
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Base values with some patterns
      let energy = 5 + Math.sin(i / 5) * 2;
      let sleep = isWeekend ? 7 + Math.random() * 2 : 6 + Math.random() * 2;
      let exercise = isWeekend ? 60 + Math.random() * 30 : 20 + Math.random() * 40;
      let productivity = isWeekend ? 3 + Math.random() * 3 : 6 + Math.random() * 3;
      let socialInteraction = isWeekend ? 7 + Math.random() * 3 : 4 + Math.random() * 4;
      
      // Add some noise
      energy = Math.max(1, Math.min(10, energy + (Math.random() - 0.5) * 2));
      sleep = Math.max(3, Math.min(10, sleep + (Math.random() - 0.5) * 1.5));
      exercise = Math.max(0, Math.min(120, exercise + (Math.random() - 0.5) * 20));
      productivity = Math.max(0, Math.min(10, productivity + (Math.random() - 0.5) * 2));
      socialInteraction = Math.max(0, Math.min(10, socialInteraction + (Math.random() - 0.5) * 2));
      
      // Generate mood based on other factors
      const moodScore = (energy * 0.3) + (sleep * 0.25) + (exercise * 0.001) + 
                        (productivity * 0.2) + (socialInteraction * 0.25);
      
      let mood: string;
      if (moodScore > 7.5) mood = 'excited';
      else if (moodScore > 6.5) mood = 'happy';
      else if (moodScore > 5) mood = 'neutral';
      else if (moodScore > 4) mood = 'tired';
      else if (moodScore > 3) mood = 'sad';
      else mood = 'angry';
      
      data.push({
        date,
        mood,
        energy,
        sleep,
        exercise,
        productivity,
        socialInteraction,
      });
    }
    
    setTimeSeriesData(data);
    
    // Generate correlation data
    const factors = ['energy', 'sleep', 'exercise', 'productivity', 'socialInteraction'];
    const correlations: Correlation[] = [];
    
    // Generate realistic correlations
    correlations.push({ source: 'sleep', target: 'energy', value: 0.75 });
    correlations.push({ source: 'exercise', target: 'energy', value: 0.6 });
    correlations.push({ source: 'sleep', target: 'productivity', value: 0.65 });
    correlations.push({ source: 'energy', target: 'productivity', value: 0.7 });
    correlations.push({ source: 'exercise', target: 'sleep', value: 0.5 });
    correlations.push({ source: 'socialInteraction', target: 'mood', value: 0.55 });
    correlations.push({ source: 'energy', target: 'mood', value: 0.8 });
    correlations.push({ source: 'productivity', target: 'mood', value: 0.4 });
    
    setCorrelationData(correlations);
  };
  
  // Render line chart using D3.js
  useEffect(() => {
    if (!lineChartRef.current || !timeSeriesData.length || isLoading) return;
    
    const svg = d3.select(lineChartRef.current);
    svg.selectAll('*').remove();
    
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = lineChartRef.current.clientWidth - margin.left - margin.right;
    const height = lineChartRef.current.clientHeight - margin.top - margin.bottom;
    
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Add X axis
    const x = d3.scaleTime()
      .domain(d3.extent(timeSeriesData, d => d.date) as [Date, Date])
      .range([0, width]);
    
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .style('color', textColor)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => {
        const date = new Date(d as Date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }));
    
    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, 10])
      .range([height, 0]);
    
    g.append('g')
      .style('color', textColor)
      .call(d3.axisLeft(y));
    
    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('stroke', gridColor)
      .attr('stroke-opacity', 0.3)
      .attr('stroke-dasharray', '3,3')
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat(() => '')
      );
    
    // Add lines
    const factors = [
      { key: 'energy', color: '#4299E1' },   // blue.400
      { key: 'sleep', color: '#805AD5' },    // purple.500
      { key: 'productivity', color: '#38A169' }, // green.500
      { key: 'socialInteraction', color: '#ED8936' }, // orange.400
    ];
    
    factors.forEach(factor => {
      const line = d3.line<DataPoint>()
        .x(d => x(d.date))
        .y(d => y(d[factor.key as keyof DataPoint] as number))
        .curve(d3.curveCatmullRom.alpha(0.5));
      
      g.append('path')
        .datum(timeSeriesData)
        .attr('fill', 'none')
        .attr('stroke', factor.color)
        .attr('stroke-width', 2)
        .attr('d', line);
      
      // Add label at the end of the line
      const lastPoint = timeSeriesData[timeSeriesData.length - 1];
      g.append('text')
        .attr('x', x(lastPoint.date) + 5)
        .attr('y', y(lastPoint[factor.key as keyof DataPoint] as number))
        .attr('fill', factor.color)
        .attr('font-size', '10px')
        .attr('alignment-baseline', 'middle')
        .text(factor.key);
    });
    
    // Add mood points as circles
    const moodColors = {
      excited: '#FFD700',
      happy: '#4CAF50',
      neutral: '#9E9E9E',
      tired: '#9C27B0',
      sad: '#2196F3',
      angry: '#F44336',
    };
    
    g.selectAll('.mood-point')
      .data(timeSeriesData)
      .enter()
      .append('circle')
      .attr('class', 'mood-point')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.energy))
      .attr('r', 5)
      .attr('fill', d => moodColors[d.mood as keyof typeof moodColors])
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);
    
  }, [timeSeriesData, colorMode, textColor, gridColor, isLoading]);
  
  // Render network chart
  useEffect(() => {
    if (!networkChartRef.current || !correlationData.length || isLoading || activeTab !== 1) return;
    
    try {
      const svg = d3.select(networkChartRef.current);
      svg.selectAll('*').remove();
      
      const width = networkChartRef.current.clientWidth;
      const height = networkChartRef.current.clientHeight;
      
      // Create node objects directly from unique ids
      const nodeIds = Array.from(new Set(correlationData.flatMap(d => [d.source, d.target])));
      const nodes = nodeIds.map(id => ({ id }));
      
      // Create links using the node objects directly, not indices
      const links = correlationData.map(d => ({
        source: d.source,  // Use string id, D3 will resolve with our id accessor
        target: d.target,  // Use string id, D3 will resolve with our id accessor
        value: d.value
      }));
      
      // Initialize force simulation with id accessor to resolve string ids
      const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id((d: any) => d.id))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2));
      
      // Create links
      const link = svg.append('g')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('stroke-width', d => d.value * 5)
        .attr('stroke', d => d3.interpolateBlues(d.value))
        .attr('stroke-opacity', 0.6);
      
      // Create nodes
      const node = svg.append('g')
        .selectAll('g')
        .data(nodes)
        .enter().append('g');
      
      node.append('circle')
        .attr('r', 10)
        .attr('fill', (d: any) => d.id === 'mood' ? '#F56565' : '#4299E1')
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended) as any);
      
      node.append('text')
        .attr('dy', -15)
        .attr('text-anchor', 'middle')
        .text((d: any) => d.id)
        .attr('fill', textColor)
        .style('font-size', '12px');
      
      // Update positions on tick
      simulation.on('tick', () => {
        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);
        
        node
          .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
      });
      
      // Drag functions
      function dragstarted(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      
      function dragged(event: any, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      }
      
      function dragended(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    } catch (error) {
      console.error("Error rendering network chart:", error);
    }
  }, [correlationData, activeTab, colorMode, textColor, isLoading]);
  
  // Handle time range change
  const handleTimeRangeChange = (range: 'week' | 'month' | 'year') => {
    if (onTimeRangeChange) {
      onTimeRangeChange(range);
    }
  };
  
  return (
    <Box>
      <Flex
        direction="column"
        bg={bgColor}
        borderRadius="lg"
        borderWidth={1}
        borderColor={borderColor}
        overflow="hidden"
        boxShadow="md"
      >
        <Flex 
          p={4} 
          justify="space-between" 
          align="center" 
          borderBottomWidth={1}
          borderBottomColor={borderColor}
        >
          <Heading size="md">
            <Flex align="center">
              <Box as={FaChartLine} mr={2} color="blue.500" />
              Data Insights
            </Flex>
          </Heading>
          
          <HStack spacing={4}>
            <Flex align="center">
              <Box as={FaCalendarAlt} mr={2} color="gray.500" />
              <Select 
                size="sm"
                maxW="150px"
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value as any)}
              >
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </Select>
            </Flex>
            
            <IconButton
              aria-label="Refresh data"
              icon={<FaSyncAlt />}
              size="sm"
              isLoading={isLoading}
              onClick={() => generateSampleData(timeRange)}
            />
            
            <IconButton
              aria-label="Download data"
              icon={<FaDownload />}
              size="sm"
            />
          </HStack>
        </Flex>
        
        <Tabs isFitted onChange={(index) => setActiveTab(index)} colorScheme="blue">
          <TabList px={4} pt={2}>
            <Tab><Box as={FaChartLine} mr={2} /> Trends</Tab>
            <Tab><Box as={FaNetworkWired} mr={2} /> Correlations</Tab>
            <Tab><Box as={FaChartBar} mr={2} /> Statistics</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel p={0}>
              <Box p={4}>
                <Text fontSize="sm" color={textColor} mb={4}>
                  This chart shows how your key metrics have changed over time. The colored dots represent your mood each day.
                </Text>
                
                {isLoading ? (
                  <Skeleton height="300px" />
                ) : (
                  <MotionBox
                    height="300px"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <svg ref={lineChartRef} width="100%" height="100%"></svg>
                  </MotionBox>
                )}
                
                <Flex mt={4} wrap="wrap" gap={2}>
                  <Badge colorScheme="blue">Energy</Badge>
                  <Badge colorScheme="purple">Sleep</Badge>
                  <Badge colorScheme="green">Productivity</Badge>
                  <Badge colorScheme="orange">Social</Badge>
                </Flex>
              </Box>
            </TabPanel>
            
            <TabPanel p={0}>
              <Box p={4}>
                <Text fontSize="sm" color={textColor} mb={4}>
                  This network shows how different factors in your life are connected. Stronger connections are shown with thicker lines.
                </Text>
                
                {isLoading ? (
                  <Skeleton height="300px" />
                ) : (
                  <MotionBox
                    height="300px"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <svg ref={networkChartRef} width="100%" height="100%"></svg>
                  </MotionBox>
                )}
              </Box>
            </TabPanel>
            
            <TabPanel p={0}>
              <Box p={4}>
                <Text fontSize="sm" color={textColor} mb={4}>
                  Statistical insights into your data patterns and potential areas for improvement.
                </Text>
                
                <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                  {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                      <Skeleton key={i} height="100px" />
                    ))
                  ) : (
                    <>
                      <StatCard 
                        title="Sleep Quality" 
                        value={`${(timeSeriesData.reduce((acc, d) => acc + d.sleep, 0) / timeSeriesData.length).toFixed(1)} hrs`}
                        change="+0.5"
                        isPositive={true}
                      />
                      <StatCard 
                        title="Exercise" 
                        value={`${(timeSeriesData.reduce((acc, d) => acc + d.exercise, 0) / timeSeriesData.length).toFixed(0)} min`}
                        change="-10"
                        isPositive={false}
                      />
                      <StatCard 
                        title="Productivity" 
                        value={`${(timeSeriesData.reduce((acc, d) => acc + d.productivity, 0) / timeSeriesData.length).toFixed(1)}/10`}
                        change="+0.8"
                        isPositive={true}
                      />
                      <StatCard 
                        title="Social Connection" 
                        value={`${(timeSeriesData.reduce((acc, d) => acc + d.socialInteraction, 0) / timeSeriesData.length).toFixed(1)}/10`}
                        change="+1.2"
                        isPositive={true}
                      />
                      <StatCard 
                        title="Energy Level" 
                        value={`${(timeSeriesData.reduce((acc, d) => acc + d.energy, 0) / timeSeriesData.length).toFixed(1)}/10`}
                        change="+0.3"
                        isPositive={true}
                      />
                      <StatCard 
                        title="Positive Moods" 
                        value={`${(timeSeriesData.filter(d => d.mood === 'excited' || d.mood === 'happy').length / timeSeriesData.length * 100).toFixed(0)}%`}
                        change="+5%"
                        isPositive={true}
                      />
                    </>
                  )}
                </Grid>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>
    </Box>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

function StatCard({ title, value, change, isPositive }: StatCardProps) {
  return (
    <MotionBox
      p={4}
      borderRadius="md"
      bg={useColorModeValue('gray.50', 'gray.700')}
      borderWidth={1}
      borderColor={useColorModeValue('gray.200', 'gray.600')}
      whileHover={{ y: -3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.2 }}
    >
      <Text fontSize="sm" color="gray.500">{title}</Text>
      <Text fontSize="2xl" fontWeight="bold" my={1}>{value}</Text>
      <Flex align="center">
        <Text 
          fontSize="sm" 
          color={isPositive ? 'green.500' : 'red.500'}
          fontWeight="medium"
        >
          {change}
        </Text>
        <Box 
          as={isPositive ? 'span' : 'span'} 
          ml={1}
          fontSize="xs"
          color={isPositive ? 'green.500' : 'red.500'}
        >
          {isPositive ? '↑' : '↓'}
        </Box>
      </Flex>
    </MotionBox>
  );
} 