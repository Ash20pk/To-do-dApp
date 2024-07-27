import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  List,
  ListItem,
  Flex,
  IconButton,
  useColorMode,
  useColorModeValue,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Tag,
  Tooltip,
  Container,
  Spacer,
  Progress,
  useToast,
} from "@chakra-ui/react";
import { 
  DeleteIcon, 
  EditIcon, 
  MoonIcon, 
  SunIcon, 
  CheckIcon, 
  TimeIcon, 
  WarningIcon, 
  QuestionIcon,
  AddIcon
} from "@chakra-ui/icons";
import { useAccount, useActiveChainIds, useConnect, useDisconnect } from "graz";
import { useTodoContract } from './hooks/useTodoContract';

export default function App() {
  const { data: account, isConnected, isConnecting, isDisconnected, isReconnecting } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { fetchTodos, addTodo, updateTodo, deleteTodo } = useTodoContract();
  const activeChainIds = useActiveChainIds();
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();

  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState("none");
  const [isOpen, setIsOpen] = useState(false);
  const [localEditTodo, setLocalEditTodo] = useState({});

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const headerBgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");

  const getPriorityIcon = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return <WarningIcon color="red.500" />;
      case 'medium': return <WarningIcon color="yellow.500" />;
      case 'low': return <WarningIcon color="green.500" />;
      default: return <QuestionIcon color="gray.500" />;
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckIcon color="green.500" />;
      case 'in_progress': return <TimeIcon color="blue.500" />;
      default: return <QuestionIcon color="gray.500" />;
    }
  };

  const formatStatus = (status) => {
    const words = status.split('_');
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const calculateProgress = useCallback(() => {
    const totalTodos = todos.length;
    const completedTodos = todos.filter(todo => todo.status.toLowerCase() === "completed").length;
    return totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;
  }, [todos]);

  useEffect(() => {
    if (isConnected) {
      fetchTodos().then(setTodos).catch(error => {
        console.error("Failed to fetch todos:", error);
        toast({
          title: "Error fetching todos",
          description: "Please try again later.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
    }
  }, [isConnected, fetchTodos, toast]);

  const handleAddTodo = useCallback(() => {
    if (newTodo.trim()) {
      addTodo(newTodo, newTodoPriority)
        .then((newId) => {
          setTodos(prev => [...prev, { id: newId, description: newTodo, priority: newTodoPriority, status: "to_do" }]);
          setNewTodo("");
          setNewTodoPriority("none");
          toast({
            title: "Todo added",
            status: "success",
            duration: 2000,
            isClosable: true,
          });
        })
        .catch(error => {
          console.error("Failed to add todo:", error);
          toast({
            title: "Error adding todo",
            description: "Please try again.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        });
    }
  }, [newTodo, newTodoPriority, addTodo, toast]);

  const handleEditTodo = useCallback((todo) => {
    setLocalEditTodo({ ...todo });
    setIsOpen(true);
  }, []);

  const handleEditInputChange = useCallback((e, field) => {
    setLocalEditTodo(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  }, []);

  const handleSaveTodo = useCallback(() => {
    updateTodo(localEditTodo.id, localEditTodo.description, localEditTodo.status, localEditTodo.priority)
      .then(() => {
        setTodos(prev => prev.map(todo => 
          todo.id === localEditTodo.id ? { ...localEditTodo } : todo
        ));
        setIsOpen(false);
        toast({
          title: "Todo updated",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(error => {
        console.error("Failed to update todo:", error);
        toast({
          title: "Error updating todo",
          description: "Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  }, [localEditTodo, updateTodo, toast]);

  const handleDeleteTodo = useCallback((id) => {
    deleteTodo(id)
      .then(() => {
        setTodos(prev => prev.filter(todo => todo.id !== id));
        toast({
          title: "Todo deleted",
          status: "info",
          duration: 2000,
          isClosable: true,
        });
      })
      .catch(error => {
        console.error("Failed to delete todo:", error);
        toast({
          title: "Error deleting todo",
          description: "Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  }, [deleteTodo, toast]);

  return (
    <Box height="100vh" width="100vw" overflow="hidden">
      <Flex direction="column" height="100%">
        {/* Header */}
        <Box py={4} px={8} bg={headerBgColor} boxShadow="sm">
          <Flex justify="space-between" align="center">
            <Heading size="lg" color={textColor}>Todo App</Heading>
            <HStack spacing={4}>
              {account && (
                <Text fontSize="sm" color={textColor}>
                  <Box border="dotted" p={1} borderRadius={5}>
                    {account.bech32Address.slice(0, 8)}...{account.bech32Address.slice(-4)}
                  </Box>
                </Text>
              )}
              <Button
                size="sm"
                colorScheme={isConnected ? "red" : "blue"}
                onClick={() => isConnected ? disconnect() : connect({ chainId: "mantra-hongbai-1" })}
                isLoading={isConnecting || isReconnecting}
                loadingText="Connecting"
              >
                {isConnected ? "Disconnect" : "Connect Wallet"}
              </Button>
              <IconButton
                icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                aria-label="Toggle color mode"
              />
            </HStack>
          </Flex>
        </Box>

        {/* Progress Bar */}
        {isConnected && (
          <Box px={8} py={2} bg={headerBgColor}>
            <Text mb={2} color={textColor}>Overall Progress: {calculateProgress().toFixed(0)}%</Text>
            <Progress value={calculateProgress()} colorScheme="blue" size="sm" />
          </Box>
        )}

        {/* Main Content */}
        <Box flex="1" overflow="auto" bg={bgColor}>
          <Container maxW="container.xl" py={8}>
            {isConnected ? (
              <VStack spacing={8} align="stretch">
                {/* Add Todo Section */}
                <Box bg={headerBgColor} p={6} borderRadius="lg" boxShadow="md">
                  <Heading color={textColor} size="md" mb={4}>Add New Todo</Heading>
                  <HStack>
                    <Input
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      placeholder="Enter a new todo"
                      flex={1}
                      color={textColor}
                    />
                    <Select
                      value={newTodoPriority}
                      onChange={(e) => setNewTodoPriority(e.target.value)}
                      width="150px"
                      color={textColor}
                    >
                      <option value="none">None</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </Select>
                    <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleAddTodo}>
                      Add
                    </Button>
                  </HStack>
                </Box>

                {/* Todo List */}
                <Box>
                  <Heading color={textColor} size="md" mb={4}>You have so much to do...</Heading>
                  <List spacing={3}>
                    {todos.map((todo) => (
                      <ListItem
                        key={todo.id}
                        p={4}
                        bg={headerBgColor}
                        borderRadius="md"
                        boxShadow="sm"
                        _hover={{ boxShadow: "md" }}
                        transition="all 0.2s"
                      >
                        <Flex align="center">
                          <Tooltip label={`Priority: ${todo.priority}`}>
                            <Box mr={3}>{getPriorityIcon(todo.priority)}</Box>
                          </Tooltip>
                          <Text
                            flex={1}
                            color={textColor}
                            textDecoration={todo.status.toLowerCase() === "completed" ? "line-through" : "none"}
                          >
                            {todo.description}
                          </Text>
                          <Spacer />
                          <Tag size="sm" colorScheme={todo.status.toLowerCase() === "completed" ? "green" : "blue"} mr={3}>
                            {getStatusIcon(todo.status)}
                            <Text color={textColor} ml={1} fontSize="xs">{formatStatus(todo.status)}</Text>
                          </Tag>
                          <IconButton
                            icon={<EditIcon />}
                            onClick={() => handleEditTodo(todo)}
                            size="sm"
                            colorScheme="teal"
                            variant="ghost"
                            mr={2}
                            aria-label="Edit todo"
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            onClick={() => handleDeleteTodo(todo.id)}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            aria-label="Delete todo"
                          />
                        </Flex>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </VStack>
            ) : (
              <VStack spacing={4} align="center" justify="center" height="100%">
                <Heading size="xl">Welcome to Todo App</Heading>
                <Text color={textColor}>Connect your wallet to start managing your todos</Text>
                <Button
                  size="lg"
                  colorScheme="blue"
                  onClick={() => connect({ chainId: "mantra-hongbai-1" })}
                >
                  Connect Wallet
                </Button>
              </VStack>
            )}
          </Container>
        </Box>
      </Flex>

      {/* Edit Todo Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>Edit Todo</ModalHeader>
          <ModalCloseButton color={textColor}/>
          <ModalBody>
            <FormControl>
              <FormLabel color={textColor}>Description</FormLabel>
              <Input 
                value={localEditTodo.description || ''}
                onChange={(e) => handleEditInputChange(e, 'description')}
                color={textColor}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel color={textColor}>Priority</FormLabel>
              <Select
                value={localEditTodo.priority || 'none'}
                onChange={(e) => handleEditInputChange(e, 'priority')}
                color={textColor}
              >
                <option value="none">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel color={textColor}>Status</FormLabel>
              <Select
                value={localEditTodo.status || 'to_do'}
                onChange={(e) => handleEditInputChange(e, 'status')}
                color={textColor}
              >
                <option value="to_do">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveTodo}>
              Save
            </Button>
            <Button onClick={() => setIsOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}