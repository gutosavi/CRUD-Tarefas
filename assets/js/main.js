let tarefas = [];
let modoOnline = true;

function salvarTarefas() {
  localStorage.setItem("tarefas-app", JSON.stringify(tarefas));
}

function carregarTarefas() {
  const dados = localStorage.getItem("tarefas-app");
  if (!dados) return;
  tarefas = JSON.parse(dados);

  //atualizaContadores();
  //mostraTarefas();
}

const form = document.getElementById("form-tarefa");
form.addEventListener("submit", (e) => {
  handleSubmit(e);
});

function handleSubmit(e) {
  e.preventDefault();
}

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
