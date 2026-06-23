let alugueis = JSON.parse(localStorage.getItem("meusAlugueis")) || [];

// Quando abrir o site, mostra os dados que já foram salvos
document.addEventListener("DOMContentLoaded", () => {
  renderizar();
  document.getElementById("busca").addEventListener("input", renderizar);
});

// Salva os dados automaticamente no navegador
function salvarDados() {
  localStorage.setItem("meusAlugueis", JSON.stringify(alugueis));
}

// Formata número como dinheiro brasileiro
function dinheiro(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// Descobre se está atrasado
function estaAtrasado(aluguel) {
  const hoje = new Date();
  const diaHoje = hoje.getDate();
  const mesAtual = hoje.toISOString().slice(0, 7);

  return !aluguel.pago &&
    aluguel.mes === mesAtual &&
    diaHoje > Number(aluguel.vencimento);
}

// Adiciona um novo aluguel
function adicionar() {
  const imovel = document.getElementById("imovel").value.trim();
  const endereco = document.getElementById("endereco").value.trim();
  const nome = document.getElementById("nome").value.trim();
  const moradores = document.getElementById("moradores").value;
  const valor = document.getElementById("valor").value;
  const agua = document.getElementById("agua").value;
const luz = document.getElementById("luz").value;
  const vencimento = document.getElementById("vencimento").value;
  const mes = document.getElementById("mes").value;
  const observacao = document.getElementById("observacao").value.trim();

  if (!imovel || !nome || !moradores || !valor || !vencimento || !mes) {
    alert("Preencha: imóvel, inquilino, moradores, valor, vencimento e mês.");
    return;
  }

  if (Number(vencimento) < 1 || Number(vencimento) > 31) {
    alert("O dia de vencimento deve ser entre 1 e 31.");
    return;
  }

  alugueis.push({
    id: Date.now(),
    imovel,
    endereco,
    nome,
    moradores: Number(moradores),
    valor: Number(valor),
agua: Number(agua) || 0,
luz: Number(luz) || 0,
vencimento: Number(vencimento),
    observacao,
    pago: false
  });

  salvarDados();
  limparFormulario();
  renderizar();
}

// Limpa os campos depois de salvar
function limparFormulario() {
  document.getElementById("imovel").value = "";
  document.getElementById("endereco").value = "";
  document.getElementById("nome").value = "";
  document.getElementById("moradores").value = "";
  document.getElementById("valor").value = "";
  document.getElementById("agua").value = "";
document.getElementById("luz").value = "";
  document.getElementById("vencimento").value = "";
  document.getElementById("mes").value = "";
  document.getElementById("observacao").value = "";
}

// Marca como pago ou não pago
function trocarPagamento(id) {
  const aluguel = alugueis.find(item => item.id === id);

  if (aluguel) {
    aluguel.pago = !aluguel.pago;
    salvarDados();
    renderizar();
  }
}

// Exclui um aluguel
function excluirAluguel(id) {
  const confirmar = confirm("Deseja excluir este aluguel?");

  if (!confirmar) return;

  alugueis = alugueis.filter(item => item.id !== id);
  salvarDados();
  renderizar();
}

// Atualiza os números do painel
function atualizarResumo() {
  const totalImoveis = alugueis.length;

  const totalPrevisto = alugueis.reduce((total, item) => {
    return total + Number(item.valor);
  }, 0);

  const totalRecebido = alugueis
    .filter(item => item.pago)
    .reduce((total, item) => {
      return total + Number(item.valor);
    }, 0);

  const totalAtrasado = alugueis.filter(estaAtrasado).length;

  document.getElementById("totalImoveis").textContent = totalImoveis;
  document.getElementById("totalPrevisto").textContent = dinheiro(totalPrevisto);
  document.getElementById("totalRecebido").textContent = dinheiro(totalRecebido);
  document.getElementById("totalAtrasado").textContent = totalAtrasado;
}

// Mostra os aluguéis na tabela
function renderizar() {
  const tabela = document.getElementById("tabela");
  const busca = document.getElementById("busca").value.toLowerCase();

  tabela.innerHTML = "";

  const listaFiltrada = alugueis.filter(item => {
    return (
      item.nome.toLowerCase().includes(busca) ||
      item.imovel.toLowerCase().includes(busca)
    );
  });

  if (listaFiltrada.length === 0) {
    tabela.innerHTML = `
      <tr>
        <td colspan="7" class="vazio">
          Nenhum aluguel encontrado.
        </td>
      </tr>
    `;
  }

  listaFiltrada.forEach(item => {
    const atrasado = estaAtrasado(item);

    let status = "🟢 Em dia";
    if (item.pago) status = "✅ Pago";
    if (atrasado) status = "🔴 Atrasado";

    let classeLinha = "";
    if (item.pago) classeLinha = "linha-paga";
    if (atrasado) classeLinha = "linha-atrasada";

    tabela.innerHTML += `
      <tr class="${classeLinha}">
        <td>
          <strong>${item.imovel}</strong><br>
          <small>${item.endereco || "Endereço não informado"}</small>
        </td>
        <td>${item.nome}</td>
        <td>${item.moradores}</td>
        <td>${dinheiro(item.valor)}</td>
<td>${dinheiro((item.agua || 0) + (item.luz || 0))}</td>
<td>${dinheiro(item.valor + (item.agua || 0) + (item.luz || 0))}</td>
<td>${dinheiro((item.valor + (item.agua || 0) + (item.luz || 0)) / item.moradores)}</td>
<td>Dia ${item.vencimento}</td>
        <td>${status}</td>
        <td>
          <button class="botao-pagamento" onclick="trocarPagamento(${item.id})">
            ${item.pago ? "Marcar não pago" : "Marcar como pago"}
          </button>
          <button class="botao-excluir" onclick="excluirAluguel(${item.id})">
            Excluir
          </button>
        </td>
      </tr>
    `;
  });

  atualizarResumo();
}
