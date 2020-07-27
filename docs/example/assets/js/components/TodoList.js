import { h3, h } from "../h3.js";
import Todo from "./Todo.js";

export default function TodoList() {
    const { page, pagesize } = h3.state;
    const filteredTodos = h3.state.filteredTodos;
    const start = (page - 1) * pagesize;
    const end = Math.min(start + pagesize, filteredTodos.length);
    return h("div.todo-list", filteredTodos.slice(start, end).map(Todo));
}
