let dados = JSON.parse(localStorage.getItem("alugueis")) || [];

window.onload = renderizar;

function salvar() {
  localStorage.setItem("alugueis", JSON.stringify(dados));
}

// ===== DASHBOARD =====
function atualizarDashboard() {
  let total = dados.length;
  let pagos = dados.filter(d => d.pago).length;
  let atrasados = dados.filter(d => !d.pago && new Date().getDate() > d.vencimento).length;

  document.getElementById("total").innerText = total;
  document.getElementById("pagos").innerText = pagos;
  document.getElementById("atrasados").innerText = atrasados;
}

// ===== RENDER =====
function renderizar() {
  let tabela = document.getElementById("tabela");
  tabela.innerHTML = "";

  let busca = document.getElementById("busca").value?.toLowerCase() || "";
  let filtro = document.getElementById("filtro").value;

  let hoje = new Date().getDate();

  dados.forEach((item, index) => {

    let atrasado = !item.pago && hoje > item.vencimento;

    // filtro busca
    if (!item.nome.toLowerCase().includes(busca)) return;

    // filtro status
    if (filtro === "pagos" && !item.pago) return;
    if (filtro === "atrasados" && !atrasado) return;

    let linha = tabela.insertRow();

    linha.insertCell(0).innerText = item.nome;
    linha.insertCell(1).innerText = item.casa;
    linha.insertCell(2).innerText = "R$ " + item.valor;
    linha.insertCell(3).innerText = item.vencimento;

    let status = linha.insertCell(4);
    status.innerText = atrasado ? "🔴 ATRASADO" : "🟢 EM DIA";

    let pagoCell = linha.insertCell(5);
    let btn = document.createElement("button");

    btn.innerText = item.pago ? "PAGO" : "NÃO PAGO";
    btn.style.background = item.pago ? "green" : "red";
    btn.style.color = "white";

    if (item.pago) {
      linha.style.backgroundColor = "#d4f8d4";
    } else if (atrasado) {
      linha.style.backgroundColor = "#ffd6d6";
    }

    btn.onclick = () => {
      dados[index].pago = !dados[index].pago;
      salvar();
      renderizar();
    };

    pagoCell.appendChild(btn);

    linha.insertCell(6).innerHTML =
      `<button onclick="remover(${index})">Excluir</button>`;
  });

  salvar();
  atualizarDashboard();
}

// ===== ADICIONAR =====
function adicionar() {
  dados.push({
    nome: document.getElementById("nome").value,
    casa: document.getElementById("casa").value,
    valor: document.getElementById("valor").value,
    vencimento: document.getElementById("vencimento").value,
    pago: false
  });

  renderizar();
}

// ===== REMOVER =====
function remover(i) {
  dados.splice(i, 1);
  renderizar();
}

// ===== LIMPAR =====
function limparTudo() {
  if (confirm("Apagar tudo?")) {
    dados = [];
    renderizar();
  }
}

// ===== PDF =====
function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("Sistema de Aluguéis", 10, 10);

  let y = 20;

  dados.forEach(item => {
    doc.text(
      `${item.nome} | ${item.casa} | R$${item.valor} | ${item.pago ? "PAGO" : "NÃO PAGO"}`,
      10,
      y
    );
    y += 10;
  });

  doc.save("alugueis.pdf");
}