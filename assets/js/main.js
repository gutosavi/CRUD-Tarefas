let tarefas = [];
let modoOnline = true;
let tarefaEmEdicao = null;

// Simulação simples de API
function simularAPISimples() {
  console.log("Simulando envio para servidor...");

  return new Promise((resolve) => {
    setTimeout(() => {
      msgErro(
        "Servidor offline no momento - tarefa pendente de sincronização!",
      );
      resolve({ success: true });
    }, 1000);
  });
}

// Consumindo API real:
async function sincronizarComApi(tarefa) {
  try {
    const resposta = await fetch("https://jsonplaceholder.typicode.com/todos", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        title: tarefa.titulo,
        completed: tarefa.status === "concluida",
      }),
    });

    if (!resposta.ok) throw new Error("Falha na requisição");

    const dados = await resposta.json();
    console.log("API respondeu com ID:", dados.id);

    const encontrada = tarefas.find((t) => t.id === tarefa.id);
    if (encontrada) {
      encontrada.sincronizado = true;
      salvarTarefas();
      atualizarContadores();
    }
  } catch (erro) {
    msgErro("Servidor offline - tarefa pendente de sincronização!");
    console.log(erro);
  }
}

// carregar da API
async function carregarDaAPI() {
  try {
    const resposta = await fetch(
      "https://jsonplaceholder.typicode.com/todos?_limit=5",
    );
    const dados = await resposta.json();

    const tarefasDaAPI = dados.map((item) => ({
      id: item.id,
      titulo: item.title,
      descricao: "Importada da API",
      status: item.completed ? "concluida" : "pendente",
      prioridade: "media",
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      sincronizado: true,
    }));

    tarefas = tarefasDaAPI;
    mostrarTarefas(tarefas);
    atualizarContadores();
  } catch (erro) {
    console.error("Erro ao carregar da API", erro);
    carregarTarefas();
  }
}

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

function handleClick() {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!renderizarTarefas()) return;
  });
}

// Definindo as funções
function renderizarTarefas() {
  let valid = true;
  const titulo = document.getElementById("titulo").value;
  const descricao = document.getElementById("descricao").value;
  const prioridade = document.getElementById("prioridade").value;
  const estado = document.getElementById("status").value;

  if (!titulo || !descricao) {
    msgErro("Preencha todos os campos");
    return false;
  }

  if (titulo.length <= 2) {
    document.getElementById("erro-titulo").innerHTML =
      "Título precisa ter no mínimo 3 carecteres";
    return false;
  } else if (descricao.length > 500) {
    msgErro("Descrição muito longa (max. 500 caracteres)");
    return false;
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
  const tarefaAtual = tarefas[tarefas.length - 1];

  salvarTarefas();
  mostrarTarefas(tarefas);
  atualizarContadores();
  sincronizarTarefas(tarefaAtual);
  // sincronizarComApi(tarefaAtual);
  form.reset();

  return valid;
}

function sincronizarTarefas(tarefaAtual) {
  const btnSincronizar = document.getElementById("btn-sincronizar");

  btnSincronizar.addEventListener("click", () => {
    btnSincronizar.textContent = "🔄 Sincronizando...";
    sincronizarComApi(tarefaAtual);
    atualizaPágina();
  });
}

function msgErro(texto) {
  const erro = document.getElementById("erro-geral");
  erro.innerHTML = texto;
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
  const tarefasNaoSincronizadas = tarefas.filter((t) => !t.sincronizado);

  document.getElementById("contador-tarefas").textContent =
    `${totalTarefas} tarefa(s)`;
  document.getElementById("contador-pendentes").textContent =
    `${tarefasNaoSincronizadas.length} tarefa(s) não sincronizada(s)`;
}

// Função para dar um refresh na página
function atualizaPágina() {
  setTimeout(() => {
    window.location.reload();
  }, 5000);
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

  // const tarefasDiv = event.target.closest(".tarefa-item");
  tarefaEmEdicao = Number(event.target.dataset.id);

  const buscandoTarefa = tarefas.find(
    (item) => Number(item.id) === tarefaEmEdicao,
  );

  document.getElementById("titulo").value = buscandoTarefa.titulo;
  document.getElementById("descricao").value = buscandoTarefa.descricao;
  document.getElementById("prioridade").value = buscandoTarefa.prioridade;
  document.getElementById("status").value = buscandoTarefa.status;

  document.getElementById("btn-cancelar").style.display = "block";
});

// Habilita botão cancelar após clicar em editar
const btnCancelar = document.getElementById("btn-cancelar");
btnCancelar.addEventListener("click", () => {
  tarefaEmEdicao = null;
  form.reset();
  btnCancelar.style.display = "none";
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

carregarDaAPI();
handleClick();
