let tarefas = [];
let modoOnline = true;
let tarefaEmEdicao = null;

// Funções localStorage
function salvarTarefas() {
  localStorage.setItem("tarefas-app", JSON.stringify(tarefas));
}

function carregarTarefas() {
  const dados = localStorage.getItem("tarefas-app");
  if (!dados) return;
  tarefas = JSON.parse(dados);

  atualizarContadores();
  mostrarTarefas(tarefas);
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

  if (tarefaEmEdicao === null) {
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
  } else {
    const buscandoTarefas = tarefas.find((item) => item.id === tarefaEmEdicao);

    if (!buscandoTarefas) return;

    buscandoTarefas.titulo = titulo;
    buscandoTarefas.descricao = descricao;
    buscandoTarefas.prioridade = prioridade;
    buscandoTarefas.status = estado;

    tarefaEmEdicao = null;
  }

  salvarTarefas();
  mostrarTarefas(tarefas);
  atualizarContadores();
  form.reset();

  return valid;
}

function mostrarTarefas(listaTarefas) {
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

// Filtros e listeners
document.getElementById("btn-limpar-filtros").addEventListener("click", () => {
  document.getElementById("filtro-status").value = "todas";
  document.getElementById("filtro-prioridade").value = "todas";
  mostrarTarefas(tarefas);
});

document.getElementById("filtro-status").addEventListener("change", () => {
  const status = document.getElementById("filtro-status").value;
  if (status === "todas") {
    mostrarTarefas(tarefas);
  } else {
    const filtrados = tarefas.filter((tarefa) => tarefa.status === status);
    mostrarTarefas(filtrados);
  }
});

document.getElementById("filtro-prioridade").addEventListener("change", () => {
  const prioridade = document.getElementById("filtro-prioridade").value;
  if (prioridade === "todas") {
    mostrarTarefas(tarefas);
  } else {
    const filtrados = tarefas.filter(
      (tarefa) => tarefa.prioridade === prioridade,
    );
    mostrarTarefas(filtrados);
  }
});

// Editar tarefa
document.addEventListener("click", (event) => {
  if (!event.target.classList.contains("btn-editar")) return;

  const tarefasDiv = event.target.closest(".tarefa-item");
  tarefaEmEdicao = Number(event.target.dataset.id);

  const buscandoTarefa = tarefas.find(
    (item) => Number(item.id) === tarefaEmEdicao,
  );

  document.getElementById("titulo").value = buscandoTarefa.titulo;
  document.getElementById("descricao").value = buscandoTarefa.descricao;
  document.getElementById("prioridade").value = buscandoTarefa.prioridade;
  document.getElementById("status").value = buscandoTarefa.estado;
});

// Remover tarefa
const listaTarefas = document.getElementById("lista-tarefas");
listaTarefas.addEventListener("click", (event) => {
  if (!event.target.classList.contains("btn-remover")) return;

  const tarefa = event.target.closest(".tarefa-item");
  if (!tarefa) return;

  const id = Number(tarefa.dataset.id);
  const confirmar = confirm("Tem certeza que deseja excluir esta tarefa?");
  if (!confirmar) return;

  tarefas = tarefas.filter((t) => t.id !== id);

  mostrarTarefas(tarefas);
  salvarTarefas();
  atualizarContadores();
});

carregarTarefas();
