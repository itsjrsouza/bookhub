// Helper compartilhado pelas funções em api/livros/. O prefixo "_" na
// pasta faz a Vercel NÃO tratar isso como uma rota — é só código
// reaproveitado entre index.js e [id].js.

function getCrudcrudUrl() {
  const raw = process.env.CRUDCRUD_URL || '';
  // Remove barra(s) no final para nunca gerar "//livros" ao concatenar um id.
  return raw.replace(/\/+$/, '');
}

function parseBody(req) {
  if (req.body == null) return {};
  if (typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

async function parseResponseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    // O crudcrud às vezes devolve HTML em vez de JSON (ex: uma página de
    // erro 502 do nginx dele mesmo, sem relação com o nosso código —
    // confirmado testando o crudcrud direto, fora desta função). Devolve
    // o texto bruto em vez de estourar uma exceção sem contexto.
    return { raw: text.slice(0, 500) };
  }
}

/**
 * O crudcrud.com é um serviço gratuito de sandbox e falha de forma
 * intermitente (ex: 502 do próprio nginx dele, sem relação com o nosso
 * código — reproduzido e confirmado batendo direto na API dele).
 * Poucas tentativas com um intervalo pequeno resolvem a maioria dos casos.
 */
async function fetchWithRetry(url, options, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    console.log(`[crudcrud proxy] tentativa ${attempt}/${attempts} -> ${options?.method || 'GET'} ${url}`);
    try {
      const response = await fetch(url, options);
      console.log(`[crudcrud proxy] resposta recebida: status ${response.status}`);

      if (response.status >= 500 && attempt < attempts) {
        lastError = new Error(`upstream respondeu ${response.status}`);
        await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
        continue;
      }

      return response;
    } catch (error) {
      console.error(`[crudcrud proxy] falha de rede na tentativa ${attempt}/${attempts}:`, error);
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
      }
    }
  }
  throw lastError;
}

module.exports = { getCrudcrudUrl, parseBody, parseResponseBody, fetchWithRetry };
