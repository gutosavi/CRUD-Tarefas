let tarefas = [];
let modoOnline = true;

// Funções localStorage
function salvarTarefas() {
  localStorage.setItem("tarefas-app", JSON.stringify(tarefas));
}

function carregarTarefas() {
  const dados = localStorage.getItem("tarefas-app");
  if (!dados) return;
  tarefas = JSON.parse(dados);

  atualizaContadores();
  mostraTarefas();
}

// Capturando o formulário e interceptando o envio
const form = document.getElementById("form-tarefa");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!renderizarTarefas()) return;
});

// Definindo as funções
function renderizarTarefas() {
  let valid = true;
  const titulo = document.getElementById("titulo").value;
  const descricao = document.getElementById("descricao").value;
  const prioridade = document.getElementById("prioridade").value;
  const estado = document.getElementById("status").value;

  if (!titulo || !descricao) {
    alert("Preencha todos os campos");
    valid = false;
  }

  if (titulo.length <= 3) {
    alert("Título precisa ter no mínimo 3 carecteres");
    valid = false;
  } else if (descricao.length > 500) {
    alert("Descrição muito longa (max. 500 caracteres)");
    valid = false;
  }

  const novaTarefa = {
    id: Date.now(),
    titulo: titulo,
    descricao: descricao,
    status: estado,
    prioridade: prioridade,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
    sincronizado: false,
  };

  tarefas.push(novaTarefa);

  salvarTarefas();
  mostrarTarefas(tarefas);
  atualizarContadores();
  form.reset();

  return valid;
}

function mostraTarefas(listaTarefas) {
  const tarefas = document.getElementById("lista-tarefas");

  if (!listaTarefas) return;

  let html = "";
  listaTarefas.forEach((tarefa) => {
    html += `
            <div class='tarefa-item' data-id="${tarefa.id}"> 
            <strong>Título</strong>: ${tarefa.titulo} <br>
            <strong>Descrição</strong>: ${tarefa.descricao} <br>
            <strong>Status</strong>: ${tarefa.status} <br>
            <strong>Prioridade</strong>: ${tarefa.prioridade} 
            <button class="btn-editar" data-id="${tarefa.id}">Editar</button> 
            <button class="btn-remover" data-id="${tarefa.id}">Remover</button>
            </div>`; // &#8226;
  });

  tarefas.innerHTML = html;
}

function atualizarContadores() {
  const totalTarefas = tarefas.length;

  document.getElementById("contador-tarefas").textContent =
    `${totalTarefas} tarefa(s)`;
}

function atualizarStatusTarefas(id, novoStatus) {
  const tarefa = tarefas.find((t) => t.id === id);
  if (tarefa) {
    tarefa.status = novoStatus;
    salvarTarefas();
    mostraTarefas(tarefas);
  }
}
