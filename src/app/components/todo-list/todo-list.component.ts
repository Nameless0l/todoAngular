import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo.service';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="todo-container">
      <h1>Nameless TODO APP</h1>
      <div class="current-time">{{ currentDate | date:'EEEE d MMMM y, HH:mm:ss' }}</div>

      <div class="add-todo">
        <div class="input-group">
          <input
            type="text"
            [(ngModel)]="newTodoTitle"
            (keyup.enter)="addTodo()"
            placeholder="Ajouter une nouvelle tâche..."
            class="todo-input"
          >
          <input
            type="datetime-local"
            [(ngModel)]="newTodoDeadline"
            class="deadline-input"
          >
        </div>
        <button (click)="addTodo()" class="add-button">Ajouter</button>
      </div>

      <div class="todos-list">
        <div *ngFor="let todo of todos" class="todo-item" [class.urgent]="isUrgent(todo)">
          <div class="todo-content">
            <input
              type="checkbox"
              [checked]="todo.completed"
              (change)="toggleTodo(todo.id)"
            >
            <div class="todo-text">
              <span [class.completed]="todo.completed">{{ todo.title }}</span>
              <div class="todo-dates">
                <small>Créé le: {{ todo.createdAt | date:'dd/MM/y, HH:mm' }}</small>
                <small *ngIf="todo.deadline">
                  Deadline: {{ todo.deadline | date:'dd/MM/y, HH:mm' }}
                  <span class="countdown" [class.urgent]="isUrgent(todo)">
                    ({{ getTimeRemaining(todo) }})
                  </span>
                </small>
              </div>
            </div>
          </div>
          <button (click)="deleteTodo(todo.id)" class="delete-button">×</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .todo-container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 1rem;
    }

    h1 {
      color: #333;
      text-align: center;
      margin-bottom: 0.5rem;
    }

    .current-time {
      text-align: center;
      color: #666;
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
    }

    .add-todo {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .input-group {
      display: flex;
      gap: 0.5rem;
      flex: 1;
    }

    .todo-input {
      flex: 2;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .deadline-input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .add-button {
      padding: 0.5rem 1rem;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .add-button:hover {
      background-color: #45a049;
    }

    .todo-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.8rem;
      border-bottom: 1px solid #eee;
      transition: background-color 0.3s ease;
    }

    .todo-item.urgent {
      background-color: #fff3f3;
    }

    .todo-content {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      flex: 1;
    }

    .todo-text {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .todo-dates {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      font-size: 0.85rem;
      color: #666;
    }

    .countdown {
      color: #666;
    }

    .countdown.urgent {
      color: #ff4444;
      font-weight: bold;
    }

    .completed {
      text-decoration: line-through;
      color: #888;
    }

    .delete-button {
      background-color: #ff4444;
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 1rem;
    }

    .delete-button:hover {
      background-color: #cc0000;
    }
  `]
})
export class TodoListComponent implements OnInit {
  todos: Todo[] = [];
  newTodoTitle: string = '';
  newTodoDeadline: string = '';
  currentDate: Date = new Date();

  constructor(private todoService: TodoService) {
    // Mettre à jour l'heure chaque seconde
    setInterval(() => {
      this.currentDate = new Date();
    }, 1000);
  }

  ngOnInit() {
    this.todoService.getTodos().subscribe(todos => {
      this.todos = todos;
    });
  }

  addTodo() {
    if (this.newTodoTitle.trim()) {
      const deadline = this.newTodoDeadline ? new Date(this.newTodoDeadline) : undefined;
      this.todoService.addTodo(this.newTodoTitle, deadline);
      this.newTodoTitle = '';
      this.newTodoDeadline = '';
    }
  }

  toggleTodo(id: number) {
    this.todoService.toggleTodo(id);
  }

  deleteTodo(id: number) {
    this.todoService.deleteTodo(id);
  }

  isUrgent(todo: Todo): boolean {
    if (!todo.deadline) return false;
    const timeRemaining = todo.deadline.getTime() - new Date().getTime();
    return timeRemaining > 0 && timeRemaining < 24 * 60 * 60 * 1000; // Moins de 24 heures
  }

  getTimeRemaining(todo: Todo): string {
    if (!todo.deadline) return '';
    
    const now = new Date().getTime();
    const deadline = todo.deadline.getTime();
    const timeRemaining = deadline - now;

    if (timeRemaining < 0) {
      return 'En retard !';
    }

    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`;
    }

    return `${hours}h ${minutes}min restantes`;
  }
}
