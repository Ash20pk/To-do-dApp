import React, { useState, useEffect } from "react";
import {
  ChakraProvider,
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
  Divider,
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

  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [newTodoPriority, setNewTodoPriority] = useState("none");

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const headerBgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const accentColor = useColorModeValue("blue.500", "blue.300");

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <WarningIcon color="red.500" />;
      case 'medium': return <WarningIcon color="yellow.500" />;
      case 'low': return <WarningIcon color="green.500" />;
      default: return <QuestionIcon color="gray.500" />;
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckIcon color="green.500" />;
      case 'in_progress': return <TimeIcon color="blue.500" />;
      default: return <QuestionIcon color="gray.500" />;
    }
  };


  useEffect(() => {
    if (isConnected) {
      fetchTodos().then(setTodos);
    }
  }, [isConnected, fetchTodos]);

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodo(newTodo, newTodoPriority).then((newId) => {
        setTodos([...todos, { id: newId, description: newTodo, priority: newTodoPriority, status: "none" }]);
        setNewTodo("");
        setNewTodoPriority("none");
      });
    }
  };

  const handleSaveTodo = () => {
    if (editingTodo.id) {
      // Update existing todo
      updateTodo(editingTodo.id, editingTodo.description, editingTodo.status, editingTodo.priority).then(() => {
        setTodos(todos.map(todo => 
          todo.id === editingTodo.id ? { ...editingTodo } : todo
        ));
      });
    } else {
      // Add new todo
      addTodo(editingTodo.description, editingTodo.priority).then((newId) => {
        setTodos([...todos, { ...editingTodo, id: newId }]);
      });
    }
    setIsOpen(false);
    setNewTodo("");
    setEditingTodo(null);
  };

  const handleEditTodo = (todo) => {
    setEditingTodo(todo);
    setIsOpen(true);
  };

  const handleDeleteTodo = (id) => {
    deleteTodo(id).then(() => {
      setTodos(todos.filter(todo => todo.id !== id));
    });
  };


  return (
    <ChakraProvider>
      <Box minHeight="100vh" bg={bgColor} color={textColor}>
        <Flex direction="column" height="100vh">
          {/* Header */}
          <Box py={4} px={8} bg={headerBgColor} boxShadow="sm">
            <Flex justify="space-between" align="center">
              <Heading size="lg">Todo App</Heading>
              <HStack spacing={4}>
                {account && (
                  <Text fontSize="sm">
                    <Box border="dotted" p={1} borderRadius={5}>
                    {account.bech32Address.slice(0, 8)}...{account.bech32Address.slice(-4)}
                    </Box>
                  </Text>
                )}
                <Button
                  size="sm"
                  colorScheme={isConnected ? "red" : "blue"}
                  onClick={() => isConnected ? disconnect() : connect({ chainId: "mantra-hongbai-1" })}
                >
                  {isConnecting || isReconnecting ? "Connecting..." : null}
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

          {/* Main Content */}
          <Container maxW="container.xl" flex={1} py={8}>
            {isConnected ? (
              <VStack spacing={8} align="stretch">
                {/* Add Todo Section */}
                <Box bg={headerBgColor} p={6} borderRadius="lg" boxShadow="md">
                  <Heading size="md" mb={4}>Add New Todo</Heading>
                  <HStack>
                    <Input
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      placeholder="Enter a new todo"
                      flex={1}
                    />
                    <Select
                      value={newTodoPriority}
                      onChange={(e) => setNewTodoPriority(e.target.value)}
                      width="150px"
                    >
                      <option value="None">None</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </Select>
                    <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleAddTodo}>
                      Add
                    </Button>
                  </HStack>
                </Box>

                {/* Todo List */}
                <Box>
                  <Heading size="md" mb={4}>Your Todos</Heading>
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
                            textDecoration={todo.status === "Completed" ? "line-through" : "none"}
                          >
                            {todo.description}
                          </Text>
                          <Spacer />
                          <Tooltip label={`Status: ${todo.status}`}>
                            <Tag size="sm" colorScheme={todo.status === "Completed" ? "green" : "blue"} mr={3}>
                              {getStatusIcon(todo.status)}
                              <Text ml={1} fontSize="xs">{todo.status}</Text>
                            </Tag>
                          </Tooltip>
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
                <Text>Connect your wallet to start managing your todos</Text>
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
        </Flex>

        {/* Edit Todo Modal */}
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{editingTodo?.id ? 'Edit Todo' : 'Add Todo'}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input 
                  value={editingTodo?.description || ''}
                  onChange={(e) => setEditingTodo({...editingTodo, description: e.target.value})}
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Priority</FormLabel>
                <Select
                  value={editingTodo?.priority || 'None'}
                  onChange={(e) => setEditingTodo({...editingTodo, priority: e.target.value})}
                >
                  <option value="None">None</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Select>
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Status</FormLabel>
                <Select
                  value={editingTodo?.status || 'ToDo'}
                  onChange={(e) => setEditingTodo({...editingTodo, status: e.target.value})}
                >
                  <option value="ToDo">To Do</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
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
    </ChakraProvider>
  );
}

