import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private todos: Todo[] = [];
  private todosSubject = new BehaviorSubject<Todo[]>([]);

  constructor() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      this.todos = JSON.parse(savedTodos, (key, value) => {
        if (key === 'createdAt' || key === 'deadline') {
          return new Date(value);
        }
        return value;
      });
      this.todosSubject.next(this.todos);
    }
  }

  getTodos(): Observable<Todo[]> {
    return this.todosSubject.asObservable();
  }

  addTodo(title: string, deadline?: Date): void {
    const todo: Todo = {
      id: Date.now(),
      title,
      completed: false,
      createdAt: new Date(),
      deadline: deadline
    };
    this.todos.push(todo);
    this.updateTodos();
  }

  toggleTodo(id: number): void {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.updateTodos();
    }
  }

  deleteTodo(id: number): void {
    this.todos = this.todos.filter(todo => todo.id !== id);
    this.updateTodos();
  }

  private updateTodos(): void {
    this.todos.sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.getTime() - b.deadline.getTime();
    });

    this.todosSubject.next(this.todos);
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }
}
