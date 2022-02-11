const fs = require('fs');

const CONFIG_FILE = 'config.json';
const ERROR_FILE = 'errors.json';

function readCsv(file) {
  const csv = fs.readFileSync(file, 'utf8')

  let lines = csv.split('\n');

  let columnNamesLine = lines[0];
  let columnNames = parse(columnNamesLine);

  let dataLines = lines.slice(1);
  let data = dataLines.map(parse);

  return data;
}

function parse(row) {
  let insideQuote = false,
    entries = [],
    entry = [];
  row.split('').forEach(function (character) {
    if (character === '"') {
      insideQuote = !insideQuote;
    } else {
      if (character == "," && !insideQuote) {
        entries.push(entry.join(''));
        entry = [];
      } else {
        entry.push(character);
      }
    }
  });
  entries.push(entry.join(''));
  return entries;
}

function Field(id, type, value) {
  this.id = id;
  this.type = type;
  this.value = value;
};

function getValue(field, line) {
  let value = ''

  if (field.value == null) {
    return null
  }

  if (typeof field.value == "boolean") {
    value = field.value
  }

  else if (field.type == "index") {
    if (field.value < line.length)
      value = line[field.value]
  }

  else if(field.type == "int"){
    if (field.value < line.length)
      value = parseInt(line[field.value])
  }

  else if (Array.isArray(field.value)) {
    let toJoin = [];
    for (let i of field.value)
      toJoin.push(line[i].trim())

    value = toJoin.join(" - ")
  }

  const formaCalculo = new Map()
  formaCalculo.set('S', 201)
  formaCalculo.set('N', 202)

  if (formaCalculo.has(value)) {
    value = formaCalculo.get(value)
  }
  return value
}

function populate(file) {
  // definindo a ordem dos valores conforme a ordem do csv
  let fields = [
    new Field("titulo", "text", [0, 1]),
    new Field("complexidade", "index", 2),
    new Field("definicaoComplexidade", "index", 3),
    new Field("permiteTrabalhoRemoto", "boolean", true),
    new Field("formaCalculoTempoItemCatalogoId", "index", 4),
    new Field("tempoExecucaoPresencial", "int", 5),
    new Field("tempoExecucaoRemoto", "int", 6),
    new Field("entregasEsperadas", "index", 8),
    new Field("descricao", "text", ""),
    new Field("assuntos", "text", null)
  ]

  let csv = readCsv(file)
  let lastLine = csv[0]
  let activities = []

  for (let line of csv) {
    if(line == '')
      continue
      
    // preencher colunas [0, 1, 8] vazias com base na última linha
    for (let i in line) {
      if (![0, 1, 8].includes(parseInt(i)))
        continue

      if (line[i].trim() === '')
        line[i] = lastLine[i]
    }

    const activity = fill(fields, line)
    validate(activity)
    activities.push(activity)

    // salva a última linha/atividade
    lastLine = line
  }

  return { activities }
}

function fill(fields, line) {
  const activity = {}

  for (let field of fields)
    activity[field.id] = getValue(field, line)

  return activity
}

function validate(activity) {
  const MAX_TITULO = 250;
  const MAX_ENTREGAS = 200;

  if (!activity.titulo.trim())
    throw new Error(`O campo <titulo> é obrigatório.`)

  if (activity.titulo.length > MAX_TITULO)
    throw new Error(`O campo <titulo> não pode exceder ${MAX_TITULO} caracteres.`)


  if (!activity.entregasEsperadas.trim())
    throw new Error(`O campo <entregasEsperadas> é obrigatório.`)

  if (activity.entregasEsperadas.length > MAX_ENTREGAS)
    throw new Error(`O campo <entregasEsperadas> não pode exceder ${MAX_ENTREGAS} caracteres.`)


  if (!activity.definicaoComplexidade.trim())
    throw new Error(`O campo <definicaoComplexidade> é obrigatório.`)

  if (activity.definicaoComplexidade.length > MAX_ENTREGAS)
    throw new Error(`O campo <definicaoComplexidade> não pode exceder ${MAX_ENTREGAS} caracteres.`)
}

async function auth({ hostname, port, auth_path, method }, data) {
  const querystring = require('querystring');
  const dataString = querystring.stringify(data)
  const https = port == '443' ? require('https') : require('http');

  const options = {
    hostname: hostname,
    port: port,
    path: auth_path || '/gateway/connect/token',
    method: method || 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      if (res.statusCode < 200 || res.statusCode > 299) 
        return reject(new Error(`${res.statusCode} ${res.statusMessage}`))

      const body = []
      res.on('data', (chunk) => body.push(chunk))
      res.on('end', () => resolve(JSON.parse(Buffer.concat(body).toString())))
    })

    req.on('error', (err) => reject(err))

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request time out'))
    })

    req.write(dataString)
    req.end()
  })
}

async function create({ hostname, port, item_path, method, access_token, token_type }, data) {
  const dataString = JSON.stringify(data)
  const https = port == '443' ? require('https') : require('http');

  const options = {
    hostname: hostname,
    port: port,
    path: item_path || '/gateway/itemcatalogo',
    method: method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${token_type} ${access_token}`
    }
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      if (res.statusCode < 200 || res.statusCode > 299) 
        return reject(new Error(`${res.statusCode} ${res.statusMessage}`))

      const body = []
      res.on('data', (chunk) => body.push(chunk))
      res.on('end', () => resolve(JSON.parse(Buffer.concat(body).toString())))
    })

    req.on('error', (err) => reject(err))

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request time out'))
    })

    req.write(dataString)
    req.end()
  })
}

async function add(activity, { hostname, port, item_path, access_token, token_type }) {
  console.log(activity);
  const res = await create({ hostname, port, item_path, access_token, token_type }, activity);
  console.log(`${res.mensagem} => ${JSON.stringify(res)}`);
}

function read(file) {
  try {
    return JSON.parse(fs.readFileSync(file))

  } catch (error) {
    console.error(error)
    return []
  }
}

function log(errors) {
  fs.writeFileSync(ERROR_FILE, JSON.stringify(errors))
}

async function main() {
  const { file, endpoint, body, paths } = read(CONFIG_FILE)
  
  const access = await auth({ ...endpoint, ...paths }, body)
  const { activities } = populate(file)

  let errors = []
  let indexes = read(ERROR_FILE)
  indexes = !indexes.length ? [...activities.keys()] : indexes

  for (const i of indexes) {
    try {
      await add(activities[i], { ...endpoint, ...access, ...paths })

    } catch (e) {
      console.error(e)
      errors.push(i)
    }
  }

  log(errors)
}

main()
