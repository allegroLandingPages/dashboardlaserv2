export const SERVICE_KEYWORDS = ['ACRÉSCIMO', 'ACRESCIMO', 'GARANTIA', 'RECARGA', 'SEGURO'];
export const SERVICE_CODES = ['19466', '15489'];
export const PIE_COLORS = ['#059669', '#f97316']; 

export const CATEGORY_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#f97316', '#64748b', '#84cc16'
];

const RAW_STORE_JSON = {
  "Lojas de Shoppping em Recife": { "04": "S.Guararapes", "33": "S.Boa Vista", "123": "S.North Way Paulista", "124": "S.Tacaruna", "130": "S.Patteo Olinda" },
  "Lojas Região Metropolitana Recife": { "01": "Centro", "09": "Palma", "13": "Paulista", "23": "Concordia", "24": "Camaragibe", "46": "Imbiribeira", "57": "C. Amarela 1", "58": "C Amarela 2", "60": "Afogados", "61": "S. Lourenço", "62": "Abreu e Lima", "64": "Agua Fria", "78": "Peixinhos 2", "79": "Peixinhos", "87": "Jaboatão centro", "89": "Palma/Concordia", "95": "Beberibe", "114": "Cavaleiro", "115": "Prazeres 01", "117": "Prazeres 02", "129": "Cavaleiro II", "132": "Igarassu" },
  "Lojas Interior PB": { "12": "Guarabira", "17": "Centro Campina Grande" },
  "Lojas do Interior Pernambuco": { "07": "Bezerros", "08": "Goiana 2", "37": "Garanhuns", "39": "Cabo", "55": "Palmares", "59": "Serra Talhada", "63": "Barreiros", "66": "Carpina", "70": "Timbauba", "71": "Goiana", "72": "Ipojuca", "76": "Toritama", "88": "Cabo 2", "91": "Af. Ingazeira", "92": "S.J. Egito", "102": "Petrolina", "105": "Escada", "107": "Sh Costa Dourada", "110": "Limoeiro", "125": "Santa Cruz", "133": "Surubim2" },
  "Lojas de Natal RN": { "14": "Cid. Alta", "15": "Alecrim", "16": "Cid. Alta", "50": "Sho Midway", "111": "Igapó", "134": "Parnamirim", "135": "Natal Alecrim II", "137": "Partage Shopping" },
  "Lojas de João Pessoa PB": { "10": "Shop Manaira", "35": "Centro", "81": "Mangabeira", "97": "Centro" },
  "Lojas de Fortaleza CE": { "19": "Centro", "20": "S. North way", "43": "Centro", "73": "Shop. Joquei", "100": "General Sampaio" },
  "Lojas da BA": { "99": "Juazeiro", "101": "P. Afonso" },
  "Lojas de Interior RN": { "38": "Centro", "54": "Centro", "118": "Mossoró", "131": "Caicó" },
  "Lojas de Vitoria": { "06": "Centro", "96": "VITORIA" },
  "Lojas de Caruaru": { "25": "Centro", "47A": "Nsª Sra das Dores", "47B": "Nsª Sra Dores", "122": "North Shopping" },
  "Lojas de Maceio AL": { "26": "Centro", "27": "Centro", "29": "Centro", "74": "São Miguel", "86": "Shop Pátio", "120": "Centro", "126": "Delmiro Gouveia", "127": "Palmeira Índios" },
  "Lojas de Arapiraca AL": { "30": "Centro", "67": "Centro" }
};

export const STORE_MAP = {};
Object.entries(RAW_STORE_JSON).forEach(([regionName, stores]) => {
  let state = 'BR';
  if (/Recife|Pernambuco|Vitoria|Caruaru/i.test(regionName)) state = 'PE';
  else if (/PB|Pessoa/i.test(regionName)) state = 'PB';
  else if (/RN|Natal/i.test(regionName)) state = 'RN';
  else if (/CE|Fortaleza/i.test(regionName)) state = 'CE';
  else if (/BA/i.test(regionName)) state = 'BA';
  else if (/AL|Maceio|Arapiraca/i.test(regionName)) state = 'AL';

  const cleanRegion = regionName.replace(/^Lojas (de |do |da )?/i, '');

  Object.entries(stores).forEach(([id, name]) => {
    const display = `[${id}] ${name} - ${cleanRegion} (${state})`;
    STORE_MAP[id] = display;
    STORE_MAP[parseInt(id, 10).toString()] = display; 
  });
});