import React from "react";

function TaskList() {
  const dummyTasks = ["Buy groceries", "Complete assignment", "Call John"];

  return (
    <div className="task-list">
      <h3>Task List</h3>
      <ul>
        {dummyTasks.map((task, index) => (
          <li key={index}>{task}</li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
