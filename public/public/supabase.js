// Configuração do Supabase
const SUPABASE_URL = 'https://fnbxprwnwhfpsgoasehs.supabase.co';
const SUPABASE_KEY = 'sb_publishable_TJKNXbZW1mVYnR96xu6Mrg_cuDRR2nC';

// Função auxiliar para fazer requisições ao Supabase
const supabase = {
  // Buscar todas as questões
  async buscarQuestoes() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/questoes?select=*&order=id.asc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    if (!res.ok) throw new Error(`Erro ao buscar: ${res.status}`);
    return await res.json();
  },

  // Inserir uma nova questão
  async inserirQuestao(questao) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/questoes`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(questao)
    });
    if (!res.ok) {
      const erro = await res.text();
      throw new Error(`Erro ao inserir: ${res.status} - ${erro}`);
    }
    return await res.json();
  },

  // Contar quantas questões existem
  async contarQuestoes() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/questoes?select=id`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'count=exact'
      }
    });
    if (!res.ok) throw new Error(`Erro ao contar: ${res.status}`);
    const range = res.headers.get('content-range');
    if (range) {
      return parseInt(range.split('/')[1], 10);
    }
    const data = await res.json();
    return data.length;
  }
};