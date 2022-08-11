const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = []; // Formato {id: 'uuid', name: 'name', username: 'username', todos: [{id: 'uuid', title: 'titulo', done: false, deadline: 'data final', created_at: 'data atual'}]}

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  
  const userExists = users.find(user => user.username === username)
  if(!!userExists) {
    return next()
  }
}

app.post('/users', (request, response) => {
  // Recebe name e username, no corpo
  const { name, username } = request.body;

  const userExists = users.find(user => user.username === username)

  if (!!userExists) {
    return response.status(400).json({
      error: 'Username já cadastrado'
    })
  } else {
    const user = {
      id: v4(),
      name,
      username,
      todos: []
    }

    users.push(user);
    // Retorna User
    return response.json(user)
  }
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  // Recebe username, no header
  const { username } = request.headers;

  const { todos } = users.find(user => user.username === username)

  return response.json(todos)
  //Retorna lista de todos do usuário
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  // Recebe title e deadline, body
  // Recebe username, header
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const { todos } = users.find(user => user.username === username)

  const todo = {
    id: v4(), 
    title, 
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }
  
  todos.push(todo)
  // Armazena dentro da lista de todos do usuário

  return response.status(201).json(todo)
  // Retorna o objeto do todo
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  // Recebe username, header, e, title e deadline, corpo
  const { title, deadline } = request.body;
  const { username } = request.headers;
  const { id } = request.params;

  //Alterar title e deadline, apenas onde id for igual ao id nos parâmetros da rota
  const { todos } = users.find(user => user.username === username)
  
  try {
    let todo = todos.find(todo => todo.id === id )

    todo.title = title;
    todo.deadline = deadline;

    return response.json(todo)
  } catch (error) {
    return response.status(404).json({ 
      error: 'Não é possível alterar um todo não existente' 
    })
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  // Receber username, pelo header
  const { username } = request.headers;
  const { id } = request.params;

  // Alterar done para true, onde o id for igual ao id de parâmetro da rota
  const { todos } = users.find(user => user.username === username)
  

  try {
    const todo = todos.find(todo => todo.id === id )

    todo.done = true;

    return response.json(todo)
  } catch (error) {
    return response.status(404).json({ error: 'Não é possível alterar o done de um todo não existente' })
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
  // Recebe username pelo header
  const { username } = request.headers;
  const { id } = request.params;

  // exclui o todo onde id for igual id do parâmetro
  let { todos } = users.find(user => user.username === username)
  const index = todos.findIndex(todo => todo.id === id)
  if (index >= 0) {
    todos.splice(index, 1)

    return response.sendStatus(204).json("Excluído!")
  } else {
    return response.status(404).json({ 
      error: 'Não é possível deletar um todo não existente' 
    })
  }
  //todos = todos.filter(todo => todo.id !== id )
});

module.exports = app;