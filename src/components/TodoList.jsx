import React, { useEffect, useState } from 'react';
import { useTodoContract } from '../hooks/useTodoContract';

export function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const { fetchTodos, addTodo, updateTodo, deleteTodo } = useTodoContract();

  useEffect(() => {
    fetchTodos().then(setTodos);
  }, [fetchTodos]);

  const handleAddTodo = async () => {
    await addTodo(newTodo);
    setNewTodo('');
    const updatedTodos = await fetchTodos();
    setTodos(updatedTodos);
  };

  const handleUpdateTodo = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ToDo' ? 'Done' : 'ToDo';
    await updateTodo(id, undefined, newStatus);
    const updatedTodos = await fetchTodos();
    setTodos(updatedTodos);
  };

  const handleDeleteTodo = async (id) => {
    await deleteTodo(id);
    const updatedTodos = await fetchTodos();
    setTodos(updatedTodos);
  };

  return (
    <div>
      <h1>Todo List</h1>
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="New todo"
      />
      <button onClick={handleAddTodo}>Add Todo</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.description} - {todo.status}
            <button onClick={() => handleUpdateTodo(todo.id, todo.status)}>
              Toggle Status
            </button>
            <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}