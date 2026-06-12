// mascaras e validacoes de formato usadas nos formularios
// cpf: 000.000.000-00 | celular: +55 (DD) 9XXXX-XXXX (sempre comeca com 9)

export function maskCpf(valor) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  let out = d.slice(0, 3);
  if (d.length > 3) out += "." + d.slice(3, 6);
  if (d.length > 6) out += "." + d.slice(6, 9);
  if (d.length > 9) out += "-" + d.slice(9, 11);
  return out;
}

export function maskTelefone(valor) {
  let d = valor.replace(/\D/g, "");
  if (d.startsWith("55")) d = d.slice(2); // aceita colar numero com o +55 junto
  d = d.slice(0, 11); // ddd (2) + numero (9)
  if (!d) return "";
  let out = "+55 (" + d.slice(0, 2);
  if (d.length >= 2) out += ")";
  if (d.length > 2) out += " " + d.slice(2, 7);
  if (d.length > 7) out += "-" + d.slice(7, 11);
  return out;
}

export function validarCpf(valor) {
  return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(valor);
}

export function validarTelefone(valor) {
  return /^\+55 \(\d{2}\) 9\d{4}-\d{4}$/.test(valor);
}
