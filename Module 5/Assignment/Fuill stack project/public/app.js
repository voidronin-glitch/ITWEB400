const API_ROOT = "/api/tasks";
const form = document.getElementById("task-form");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const dueDateInput = document.getElementById("dueDate");
const tasksUL = document.getElementById("tasks");
const countEl = document.getElementById("count");
const filterEl = document.getElementById("filter");
const clearBtn = document.getElementById("clear-btn");
let tasks = [];

async function fetchTasks(){const res=await fetch(API_ROOT);tasks=await res.json();render();}
function render(){const filter=filterEl.value;const filtered=tasks.filter(t=>filter==='all'||(filter==='active'?!t.completed:t.completed));tasksUL.innerHTML='';filtered.forEach(t=>{const li=document.createElement('li');li.className='task'+(t.completed?' completed':'');li.innerHTML=`<div class="left"><h3>${t.title}</h3><p>${t.description||''}</p></div><div><button class="small-btn" onclick="toggleTask('${t.id}')">${t.completed?'Undo':'Done'}</button><button class="small-btn" onclick="deleteTask('${t.id}')">Del</button></div>`;tasksUL.appendChild(li);});countEl.textContent=tasks.length;}
async function toggleTask(id){await fetch(API_ROOT+'/'+id+'/toggle',{method:'PATCH'});fetchTasks();}
async function deleteTask(id){await fetch(API_ROOT+'/'+id,{method:'DELETE'});fetchTasks();}
form.addEventListener('submit',async e=>{e.preventDefault();const title=titleInput.value.trim();if(!title)return;await fetch(API_ROOT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,description:descriptionInput.value,dueDate:dueDateInput.value})});form.reset();fetchTasks();});
clearBtn.onclick=()=>form.reset();filterEl.onchange=render;fetchTasks();
