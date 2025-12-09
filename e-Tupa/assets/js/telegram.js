
document.getElementById("telefone").addEventListener("input", function (e) {
    let v = e.target.value.replace(/\D/g, "");

    if (v.length > 11) v = v.slice(0, 11);

    if (v.length >= 2) v = "(" + v.slice(0,2) + ") " + v.slice(2);
    if (v.length >= 10) v = v.slice(0,10) + "-" + v.slice(10);

    e.target.value = v;
});

function limparNumero(numero) {
    return numero.replace(/\D/g, "");
}

function validarNumero(numero) {
    return /^(\d{11})$/.test(numero);
}

function toast(mensagem) {
  const toast = document.getElementById("toast");
  toast.textContent = mensagem;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

document.getElementById("btnCadastrarTele").addEventListener("click", async () => {
    const input = document.getElementById("telefone");
    const numeroLimpo = limparNumero(input.value);

    if (!validarNumero(numeroLimpo)) {
        toast("Número inválido!");
        return;
    }
    else {
        toast("Você receberá uma confirmação via Telegram em breve.");
        return;
    }
});
