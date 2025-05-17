const ORG_API = "http://localhost:8080/org";
const RESERVA_API = "http://localhost:8080/reserva";

// LISTAR TODAS
async function listarOrganizacoes() {
  try {
    const response = await fetch(ORG_API);
    const orgs = await response.json();
    renderizarOrgs(orgs);
  } catch (error) {
    console.error("Erro ao listar organizações:", error);
  }
}

// BUSCAR POR NOME
async function buscarPorNome() {
  const nome = document.getElementById("buscarNomee").value.trim();
  if (!nome) {
    alert("Digite um nome para buscar.");
    return;
  }

  try {
    const response = await fetch(`${ORG_API}/find_nome/${encodeURIComponent(nome)}`);
    const orgs = await response.json();
    renderizarOrgs(orgs);
  } catch (error) {
    console.error("Erro ao buscar por nome:", error);
    alert("Erro ao buscar organização.");
  }
}

// CADASTRAR NOVA ORG
async function cadastrarOrg(event) {
  event.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const agenda = document.getElementById("agenda").value.trim();
  const vagasDisponiveis = parseInt(document.getElementById("vagasDisponiveis").value, 10);

  const orgData = {
    nome,
    email,
    agenda,
    vagasDisponiveis,
    vagasReservadas: 0
  };

  try {
    const response = await fetch(ORG_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orgData)
    });

    if (!response.ok) {
      const msg = await response.text();
      throw new Error(msg);
    }

    alert("Organização cadastrada com sucesso!");
    document.getElementById("orgForm").reset();
    listarOrganizacoes();
  } catch (error) {
    alert("Erro ao cadastrar: " + error.message);
  }
}

// FAZER RESERVA
async function fazerReserva(orgId) {
  try {
    const response = await fetch(`${RESERVA_API}/${orgId}`, {
      method: "POST"
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Erro ao fazer reserva.");
    }

    alert("Reserva feita com sucesso!");
    listarOrganizacoes();
  } catch (error) {
    alert("Erro ao reservar: " + error.message);
  }
}

// CANCELAR RESERVA
async function cancelarReserva(orgId) {
  const clienteInput = document.getElementById(`cliente-${orgId}`);
  const clienteId = clienteInput.value;

  if (!clienteId) {
    alert("Informe o ID do cliente para cancelar a reserva.");
    return;
  }

  try {
    const response = await fetch(`${RESERVA_API}/${orgId}/${clienteId}`, {
      method: "DELETE"
    });

    if (response.status === 204) {
      alert("Reserva cancelada com sucesso!");
      listarOrganizacoes();
    } else {
      const text = await response.text();
      throw new Error(text || "Erro ao cancelar reserva.");
    }
  } catch (error) {
    alert("Erro ao cancelar: " + error.message);
  }
}

// RENDERIZAR ORGS
function renderizarOrgs(organizações) {
  orgList.innerHTML = "";
  organizações.forEach(org => {
    const card = document.createElement("div");
    card.className = "org-card";
    card.innerHTML = `
      <h3>${org.nome}</h3>
      <p><strong>Email:</strong> ${org.email}</p>
      <p><strong>Agenda:</strong> ${org.agenda}</p>
      <p><strong>Vagas Disponíveis:</strong> ${org.vagasDisponiveis}</p>
      <p><strong>Vagas Reservadas:</strong> ${org.vagasReservadas}</p>

      <button onclick="fazerReserva(${org.orgId})">
        <i data-lucide="calendar-plus"></i> Reservar
      </button>

      <div class="cancelar-reserva">
        <input type="number" placeholder="ID do Cliente" id="cliente-${org.orgId}" />
        <button onclick="cancelarReserva(${org.orgId})">
          <i data-lucide="calendar-x"></i> Cancelar Reserva
        </button>
      </div>

      <button class="collapsible" onclick="buscarClientesPorOrg(${org.orgId})">
        <i data-lucide="users"></i> Ver Clientes
      </button>
      <div id="clientes-${org.orgId}" class="clientes-container" style="display: none;"></div>
    `;
    orgList.appendChild(card);
  });
  lucide.createIcons(); // Atualiza ícones após renderização
}



function buscarClientesPorOrg(orgId) {
  const div = document.getElementById(`clientes-${orgId}`);
  const isVisible = div.style.display === "block";
  if (isVisible) {
    div.style.display = "none";
    return;
  }

  fetch(`http://localhost:8080/cliente/${orgId}`)
    .then(response => response.json())
    .then(clientes => {
      exibirClientes(orgId, clientes);
      div.style.display = "block";
    })
    .catch(error => {
      console.error("Erro ao buscar clientes:", error);
      alert("Erro ao buscar os clientes da organização.");
    });
}

function exibirClientes(orgId, clientes) {
  const div = document.getElementById(`clientes-${orgId}`);
  if (!clientes.length) {
    div.innerHTML = "<p><em>Nenhum cliente encontrado.</em></p>";
    return;
  }

  let html = "<ul>";
  clientes.forEach(cliente => {
    html += `<li>ID: ${cliente.clienteId} | Código: ${cliente.codAgendamento} | Status: ${cliente.status}</li>`;
  });
  html += "</ul>";

  div.innerHTML = html;
}



// Carregar ao iniciar
document.addEventListener("DOMContentLoaded", listarOrganizacoes);
