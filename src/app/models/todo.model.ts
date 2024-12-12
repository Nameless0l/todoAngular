export interface Todo {
    id: number;
    title: string;
    completed: boolean;
    createdAt: Date;
    deadline?: Date;
}
