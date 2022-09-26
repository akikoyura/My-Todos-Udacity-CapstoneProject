import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import '../styles/custom.css'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardMeta,
  Checkbox,
  Container,
  Form,
  Grid,
  GridColumn,
  GridRow,
  Header,
  Icon,
  Image,
  Input,
  Loader,
  Message
} from 'semantic-ui-react'

import { createTodo, deleteImage, deleteTodo, downloadImage, getTodos, patchTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Todo[]
  newTodoName: string
  newTodoDesc: string
  loadingTodos: boolean
  todoNameValid: boolean
  createTodoSuccess: boolean
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    newTodoName: '',
    newTodoDesc: '',
    loadingTodos: true,
    todoNameValid: true,
    createTodoSuccess: false
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }

  onValidateTodoNameInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const todoName = event.target.value
    const valid = (!(!todoName || todoName.length < 1))
    this.setState({ todoNameValid: valid })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoDesc: event.target.value })
  }

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onTodoCreate = async (event: React.ChangeEvent<any>): Promise<any> => {
    event.preventDefault()
    try {
      const dueDate = this.calculateDueDate()
      const valid = (!(!this.state.newTodoName || this.state.newTodoName.length < 1))
      let success = false
      if (valid) {
        console.log(JSON.stringify({ name: this.state.newTodoName, description: this.state.newTodoDesc, dueDate }))
        const newTodo = await createTodo(this.props.auth.getIdToken(), {
          name: this.state.newTodoName,
          description: this.state.newTodoDesc,
          dueDate
        })

        this.setState({
          todos: [ ...this.state.todos, newTodo ],
          newTodoName: ''
        })
        success = true
      }
      this.setState({ createTodoSuccess: success })
      alert('Todo create success')
    } catch {
      alert('Todo creation failed')
    }
  }

  onTodoDelete = async (todoId: string) => {
    try {
      console.log('TodoId: ', todoId)
      await deleteTodo(this.props.auth.getIdToken(), todoId)
      this.setState({
        todos: this.state.todos.filter(todo => todo.todoId !== todoId)
      })
      alert('Todo delete success')
    } catch {
      alert('Todo deletion failed')
    }
  }

  onTodoDownloadImage = async (todoId: string) => {
    try {
      const url = await downloadImage(this.props.auth.getIdToken(), todoId)
      const newWindow = window.open(url, '_blank', 'noopener, noreferrer')
      if (newWindow) newWindow.opener = null
      return newWindow
    } catch {
      alert('Download image failed')
    }
  }

  onTodoImageDelete = async (todoId: string) => {
    try {
      await deleteImage(this.props.auth.getIdToken(), todoId)
      alert('Delete image success')
      window.location.reload()
    } catch {
      alert('Delete image failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      const todo = this.state.todos[pos]
      await patchTodo(this.props.auth.getIdToken(), todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      })
      alert('Todo update done success')
    } catch {
      alert('Todo deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const todos = await getTodos(this.props.auth.getIdToken())
      this.setState({
        todos,
        loadingTodos: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as='h1'>MY TODO LIST</Header>

        {this.renderCreateTodoInput()}

        {this.renderTodos()}
      </div>
    )
  }

  renderCreateTodoInput() {
    return (
      <Container>
        <Card className={'container fluid'}>
          <CardContent>
            <Form onSubmit={this.onTodoCreate}>
              <h4 className='ui dividing header'>Todos information</h4>
              <Form.Group widths='equal'>
                <Form.Field id='form-input-todo-name' control={Input} label='Todo Name' placeholder='Todo Name'
                            error={!this.state.todoNameValid ? {
                              content: 'Please enter a valid todo name',
                              pointing: 'above'
                            } : null} onChange={this.handleNameChange} onBlur={this.onValidateTodoNameInput} />
                <Form.Field id='form-control-description' control={Input} label='Todo description'
                            placeholder='Todo Description' onChange={this.handleDescriptionChange} />
              </Form.Group>

              <Message visible={this.state.createTodoSuccess} success header='Form completed'
                       content='You are create new todo success' />
              <Button id='form-button' type='submit' color='teal'>New task</Button>
            </Form>
          </CardContent>
        </Card>
      </Container>
    )
  }

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline='centered'>
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <Container>
        <GridRow className='ui four column doubling stackable grid container basic segment'>
          {this.state.todos.map((todo, pos) => {
            return (
              <GridColumn key={todo.todoId}>
                <Card>
                  {todo.attachmentUrl && (
                    <Image className='fluid' src={todo.attachmentUrl} wrapped />)}
                  <CardContent>
                    <CardHeader>
                      {todo.name}
                    </CardHeader>
                    <CardMeta>Created on {new Date(todo.createdAt).toLocaleDateString()}</CardMeta>
                    <CardDescription>
                      {todo?.description}
                      <div className='ui four column grid'>
                        <div className='column'>
                          <Button
                            animated='fade'
                            icon
                            size='medium'
                            color='red'
                            onClick={() => this.onEditButtonClick(todo.todoId)}>
                            <Button.Content visible>
                              <Icon name='images outline' size='small' aria-label='Upload image' />
                            </Button.Content>
                            <Button.Content hidden></Button.Content>
                          </Button>
                        </div>
                        <div className='column'>
                          <Button
                            animated='fade'
                            icon
                            color='orange'
                            onClick={() => this.onTodoDelete(todo.todoId)}>
                            <Button.Content visible>
                              <Icon name='delete' size='small' />
                            </Button.Content>
                            <Button.Content hidden></Button.Content>
                          </Button>
                        </div>
                        <div className='column'>
                          <Button animated='fade' icon color='green' onClick={() => this.onTodoDownloadImage(todo.todoId)}>
                            <Button.Content visible>
                              <Icon name='cloud download' size='small' />
                            </Button.Content>
                            <Button.Content hidden>
                            </Button.Content>
                          </Button>
                        </div>
                        <div className='column'>
                          <Button animated='fade' icon color='blue' onClick={() => this.onTodoImageDelete(todo.todoId)}>
                            <Button.Content visible>
                              <Icon name='low vision' size='small' />
                            </Button.Content>
                            <Button.Content hidden>
                            </Button.Content>
                          </Button>
                        </div>
                      </div>
                    </CardDescription>
                  </CardContent>
                  <CardContent className='extra content'>
                    <span>
                      <Checkbox slider onChange={() => this.onTodoCheck(pos)}
                                checked={todo.done} />
                    </span>
                    <span
                      className='right floated'>Due date: {todo.dueDate}</span>
                  </CardContent>
                </Card>
              </GridColumn>

            )
          })}
        </GridRow>
      </Container>
      // <Grid padded>
      //   {this.state.todos.map((todo, pos) => {
      //     return (
      //       <Grid.Row key={todo.todoId}>
      //         <Grid.Column width={1} verticalAlign='middle'>
      //
      //           />
      //         </Grid.Column>
      //         <Grid.Column width={8} verticalAlign='middle'>
      //
      //         </Grid.Column>
      //         <Grid.Column width={3} floated='right'>
      //           {todo.dueDate}
      //         </Grid.Column>
      //         <Grid.Column width={1} floated='right'>
      //           <Button
      //             icon
      //             color='blue'
      //             onClick={() => this.onEditButtonClick(todo.todoId)}
      //           >
      //             <Icon name='pencil' />
      //           </Button>
      //         </Grid.Column>
      //         <Grid.Column width={1} floated='right'>
      //
      //         </Grid.Column>
      //         <GridColumn width={1} floated='right'>

      //         </GridColumn>
      //         <GridColumn width={1} floated='right'>
      //
      //         </GridColumn>
      //
      //         )}
      //         <Grid.Column width={16}>
      //           <Divider horizontal>***</Divider>
      //         </Grid.Column>
      //       </Grid.Row>
      //     )
      //   })}
      // </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
