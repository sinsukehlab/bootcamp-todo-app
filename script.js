// Todo App Module - すべての変数をモジュールスコープ内に封じ込める
(function() {
  'use strict';
  
  // 変数宣言&初期化（モジュールスコープ内のローカル変数）
  let todos = []; // タスクを管理する配列
  let currentFilter = "all"; // 現在のフィルター状態
  let editingId = null; // 編集中のタスクID

  // HTML要素（モジュールスコープ内のローカル変数）
  let todoInput, addBtn, todoList, filterBtns, clearCompletedBtn, clearAllBtn;
  let totalTasksEl, completedTasksEl, activeTasksEl;

  // HTMLの解析が終了したときに実行される処理
  document.addEventListener("DOMContentLoaded", () => {
  // HTML要素を取得して、変数に保存する
  todoInput = document.getElementById("todoInput");
  addBtn = document.getElementById("addBtn");
  todoList = document.getElementById("todoList");
  filterBtns = document.querySelectorAll(".filter-btn");
  clearCompletedBtn = document.getElementById("clearCompleted");
  clearAllBtn = document.getElementById("clearAll");
  totalTasksEl = document.getElementById("totalTasks");
  completedTasksEl = document.getElementById("completedTasks");
  activeTasksEl = document.getElementById("activeTasks");

  // 各イベントのリスナーを設定
  addBtn.addEventListener("click", addTodo);
  todoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTodo();
  });
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      setFilter(e.target.dataset.filter);
    });
  });
  clearCompletedBtn.addEventListener("click", clearCompleted);
  clearAllBtn.addEventListener("click", clearAll);

  // todoListにイベント委譲を設定（インラインイベントハンドラーの代替）

  // todoId抽出のヘルパー関数
  function getTodoIdFromEvent(e) {
    const item = e.target.closest(".todo-item");
    return item ? parseInt(item.dataset.todoId) : null;
  }

  todoList.addEventListener("change", (e) => {
    if (e.target.classList.contains("todo-checkbox")) {
      const todoId = getTodoIdFromEvent(e);
      toggleTodo(todoId);
    }
  });
  
  todoList.addEventListener("click", (e) => {
    if (e.target.closest(".delete-btn")) {
      const todoId = getTodoIdFromEvent(e);
      deleteTodo(todoId);
    }
  });

  // localStorageからタスクデータを読み込んで描画
  todos = loadTodos();
  renderTodos();

  // 統計情報の更新
  updateStats();
});

// タスク追加
function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;

  const todo = {
    id: Date.now(),
    text: text,
    completed: false,
  };

  todos.push(todo);
  saveTodos();
  renderTodos();
  updateStats();
  todoInput.value = "";
}

// タスク完了切替
function renderTodos() {
  const filteredTodos = getFilteredTodos();

  if (filteredTodos.length === 0) {
    todoList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-clipboard-list" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
        <p style="color: #666; text-align: center;">
          ${
            currentFilter === "all"
              ? "タスクがありません。新しいタスクを追加してください。"
              : currentFilter === "active"
              ? "未完了のタスクがありません。"
              : "完了済みのタスクがありません。"
          }
        </p>
      </div>
    `;
    return;
  }

  todoList.innerHTML = filteredTodos
    .map(
      (todo) => `
        <div class="todo-item ${
          todo.completed ? "completed" : ""
        }" data-todo-id="${todo.id}">
            <input type="checkbox"
                   class="todo-checkbox"
                   ${todo.completed ? "checked" : ""}>

            <span class="todo-text">${escapeHtml(todo.text)}</span>

            <div class="todo-actions">
                <button class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `
    )
    .join("");
}

// LocalStorageへの保存
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// LocalStorageからの読み込み
function loadTodos() {
  const todos = localStorage.getItem("todos");
  return todos ? JSON.parse(todos) : [];
}

// タスク完了切替
function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    renderTodos();
    updateStats();
  }
}

// タスク削除
function deleteTodo(id) {
  if (confirm("このタスクを削除しますか？")) {
    todos = todos.filter((t) => t.id !== id);
    saveTodos();
    renderTodos();
    updateStats();
  }
}

// 統計更新
function updateStats() {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const active = total - completed;

  totalTasksEl.textContent = total;
  completedTasksEl.textContent = completed;
  activeTasksEl.textContent = active;
}

// HTMLエスケープ
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// フィルタ切替
function setFilter(filter) {
  currentFilter = filter; // 現在のフィルター状態を更新

  // ボタンのアクティブ状態を更新
  filterBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });

  renderTodos(); // フィルターを適用して再描画
}

// フィルタ適用
function getFilteredTodos() {
  switch (currentFilter) {
    case "active":
      return todos.filter((t) => !t.completed);
    case "completed":
      return todos.filter((t) => t.completed);
    default: // "all" の場合
      return todos;
  }
}

// 完了済み削除
function clearCompleted() {
  if (confirm("完了済みのタスクをすべて削除しますか？")) {
    todos = todos.filter((t) => !t.completed); // 未完了のタスクだけを残す
    saveTodos();
    renderTodos();
    updateStats();
  }
}

// 全削除
function clearAll() {
  if (confirm("すべてのタスクを削除しますか？この操作は元に戻せません。")) {
    todos = []; // 配列を空にする
    saveTodos();
    renderTodos();
    updateStats();
  }
}

})(); // IIFE終了 - モジュールスコープを閉じる
