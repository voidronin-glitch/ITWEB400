import React from "react";
import Navbar from "./components/Navbar";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import "./styles.css";

function App() {
  return (
    <div className="container">
      <Navbar />
      <TaskForm />
      <TaskList />
    </div>
  );
}

export default App;
