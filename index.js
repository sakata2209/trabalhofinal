import express from 'express';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const app = express();

// Configuração da sessão
app.use(session({
    secret: 'M1nh4Chav3S3cr3t4',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // Em produção, deve ser true se usando HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 30 // Sessão válida por 30 minutos
    }
}));

// Middleware para parsing de cookies
app.use(cookieParser());

// Middleware para parsing de dados de formulário (urlencoded)
app.use(express.urlencoded({ extended: true }));

// Serve arquivos estáticos da pasta 'public'
app.use(express.static(path.join(process.cwd(), 'pages/public')));

const porta = 3000;
const host = 'localhost';

// Dados em memória (substituir por banco de dados em um sistema real)
let listaEquipes = [];
let listaJogadores = [];

// Função auxiliar para exibir a data/hora do último login
function exibirUltimoLogin(req) {
    const dataHoraUltimoLogin = req.cookies['dataHoraUltimoLogin'];
    if (dataHoraUltimoLogin) {
        return `<p><span>Seu último acesso foi realizado em ${dataHoraUltimoLogin}</span></p>`;
    } else {
        return `<p><span>Este é seu primeiro acesso.</span></p>`;
    }
}

// Middleware de verificação de autenticação
function verificarAutenticacao(req, resp, next) {
    if (req.session.usuarioLogado) {
        next(); // Usuário autenticado, continua para a próxima rota
    } else {
        resp.redirect('/login.html'); // Usuário não autenticado, redireciona para a tela de login
    }
}

// Rotas de login e logout
app.get('/login', (req, resp) => {
    resp.redirect('/login.html');
});

app.post('/login', (req, resp) => {
    const usuario = req.body.usuario;
    const senha = req.body.senha;

    if (usuario === 'admin' && senha === '123') {
        req.session.usuarioLogado = true;
        // Define o cookie com a data e hora do login
        resp.cookie('dataHoraUltimoLogin', new Date().toLocaleString('pt-BR'), { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true });
        resp.redirect('/');
    } else {
        resp.send(`
            <html>
                <head>
                    <meta charset="utf-8">
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
                </head>
                <body>
                    <div class="container w-25">
                        </br>
                        <div class="alert alert-danger" role="alert">
                            Usuário ou senha inválidos!
                        </div>
                        <div>
                            <a href="/login.html" class="btn btn-primary">Tentar novamente</a>
                        </div>
                    </div>
                </body>
            </html>
        `);
    }
});

app.get('/logout', (req, resp) => {
    req.session.destroy(); // Destroi a sessão
    resp.redirect('/login.html');
});

// --- Menu Principal ---
app.get('/', verificarAutenticacao, (req, resp) => {
    const mensagemUltimoLogin = exibirUltimoLogin(req);

    resp.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Menu Principal</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
        </head>
        <body>
            <nav class="navbar navbar-expand-lg bg-body-tertiary">
                <div class="container-fluid">
                    <a class="navbar-brand" href="#">Menu Principal</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Alternar navegação">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item">
                                <a class="nav-link active" aria-current="page" href="/cadastroEquipe">Cadastro de Equipes</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link active" aria-current="page" href="/cadastroJogador">Cadastro de Jogadores</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link active" aria-current="page" href="/logout">Sair</a>
                            </li>
                        </ul>
                        <div class="ms-auto">
                            ${mensagemUltimoLogin}
                        </div>
                    </div>
                </div>
            </nav>
            <div class="container mt-4">
                <h2>Bem-vindo ao Sistema de Gerenciamento de Times!</h2>
                <p>Use o menu acima para navegar entre as opções de cadastro.</p>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
        </body>
        </html>
    `);
});

// --- Cadastro de Equipes ---
app.get('/cadastroEquipe', verificarAutenticacao, (req, resp) => {
    const mensagemUltimoLogin = exibirUltimoLogin(req);
    resp.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cadastro de Equipe</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
        </head>
        <body>
            <div class="container mt-5">
                <h1>Cadastro de Equipe</h1>
                <form action="/cadastroEquipe" method="POST" novalidate>
                    <div class="mb-3">
                        <label for="nomeEquipe" class="form-label">Nome da Equipe</label>
                        <input type="text" class="form-control" id="nomeEquipe" name="nomeEquipe" required>
                        <div class="invalid-feedback">
                            O nome da equipe é obrigatório.
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="nomeTecnico" class="form-label">Nome do Técnico Responsável</label>
                        <input type="text" class="form-control" id="nomeTecnico" name="nomeTecnico" required>
                        <div class="invalid-feedback">
                            O nome do técnico é obrigatório.
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="telefoneTecnico" class="form-label">Telefone do Técnico Responsável</label>
                        <input type="text" class="form-control" id="telefoneTecnico" name="telefoneTecnico" required>
                        <div class="invalid-feedback">
                            O telefone do técnico é obrigatório.
                        </div>
                    </div>
                    <button type="submit" class="btn btn-dark">Cadastrar Equipe</button>
                    <a class="btn btn-secondary" href="/">Voltar ao Menu</a>
                </form>
                <div class="mt-3">
                    ${mensagemUltimoLogin}
                </div>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
            <script>
                // Adiciona validação de formulário do lado do cliente (opcional, já que a validação principal é no servidor)
                (function () {
                    'use strict'
                    var forms = document.querySelectorAll('form')
                    Array.prototype.slice.call(forms)
                        .forEach(function (form) {
                            form.addEventListener('submit', function (event) {
                                if (!form.checkValidity()) {
                                    event.preventDefault()
                                    event.stopPropagation()
                                }
                                form.classList.add('was-validated')
                            }, false)
                        })
                })()
            </script>
        </body>
        </html>
    `);
});

app.post('/cadastroEquipe', verificarAutenticacao, (req, resp) => {
    const { nomeEquipe, nomeTecnico, telefoneTecnico } = req.body;

    // Validação no lado do servidor
    if (!nomeEquipe || !nomeTecnico || !telefoneTecnico) {
        return resp.send(`
            <html>
                <head>
                    <meta charset="utf-8">
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
                </head>
                <body>
                    <div class="container w-50">
                        </br>
                        <div class="alert alert-danger" role="alert">
                            Todos os campos são obrigatórios para o cadastro da equipe!
                        </div>
                        <div>
                            <a href="/cadastroEquipe" class="btn btn-primary">Voltar ao Cadastro de Equipe</a>
                            <a href="/" class="btn btn-secondary">Voltar ao Menu</a>
                        </div>
                    </div>
                </body>
            </html>
        `);
    }

    const novaEquipe = {
        id: listaEquipes.length + 1, // ID simples para demonstração
        nome: nomeEquipe,
        tecnico: nomeTecnico,
        telefone: telefoneTecnico
    };
    listaEquipes.push(novaEquipe);

    // Redireciona para a lista de equipes após o cadastro
    resp.redirect('/listaEquipes');
});

// --- Lista de Equipes ---
app.get('/listaEquipes', verificarAutenticacao, (req, resp) => {
    const mensagemUltimoLogin = exibirUltimoLogin(req);
    let equipesHTML = '';
    if (listaEquipes.length === 0) {
        equipesHTML = '<p>Nenhuma equipe cadastrada ainda.</p>';
    } else {
        equipesHTML = `
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Nome da Equipe</th>
                        <th scope="col">Técnico</th>
                        <th scope="col">Telefone do Técnico</th>
                    </tr>
                </thead>
                <tbody>
        `;
        listaEquipes.forEach(equipe => {
            equipesHTML += `
                <tr>
                    <td>${equipe.id}</td>
                    <td>${equipe.nome}</td>
                    <td>${equipe.tecnico}</td>
                    <td>${equipe.telefone}</td>
                </tr>
            `;
        });
        equipesHTML += `
                </tbody>
            </table>
        `;
    }

    resp.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Lista de Equipes</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
        </head>
        <body>
            <div class="container mt-5">
                <h1>Equipes Cadastradas</h1>
                ${equipesHTML}
                <a class="btn btn-dark" href="/cadastroEquipe" role="button">Cadastrar Nova Equipe</a>
                <a class="btn btn-secondary" href="/" role="button">Voltar ao Menu</a>
                <div class="mt-3">
                    ${mensagemUltimoLogin}
                </div>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
        </body>
        </html>
    `);
});

// --- Cadastro de Jogadores ---
app.get('/cadastroJogador', verificarAutenticacao, (req, resp) => {
    const mensagemUltimoLogin = exibirUltimoLogin(req);
    let opcoesEquipes = '<option value="">Selecione a equipe</option>';
    listaEquipes.forEach(equipe => {
        opcoesEquipes += `<option value="${equipe.id}">${equipe.nome}</option>`;
    });

    resp.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cadastro de Jogador</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
        </head>
        <body>
            <div class="container mt-5">
                <h1>Cadastro de Jogador</h1>
                <form action="/cadastroJogador" method="POST" novalidate>
                    <div class="mb-3">
                        <label for="nomeJogador" class="form-label">Nome do Jogador</label>
                        <input type="text" class="form-control" id="nomeJogador" name="nomeJogador" required>
                        <div class="invalid-feedback">
                            O nome do jogador é obrigatório.
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="numeroCamisa" class="form-label">Número da Camisa</label>
                        <input type="number" class="form-control" id="numeroCamisa" name="numeroCamisa" required>
                        <div class="invalid-feedback">
                            O número da camisa é obrigatório.
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="dataNascimento" class="form-label">Data de Nascimento</label>
                        <input type="date" class="form-control" id="dataNascimento" name="dataNascimento" required>
                        <div class="invalid-feedback">
                            A data de nascimento é obrigatória.
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="alturaCm" class="form-label">Altura (cm)</label>
                        <input type="number" class="form-control" id="alturaCm" name="alturaCm" required>
                        <div class="invalid-feedback">
                            A altura é obrigatória.
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="genero" class="form-label">Gênero</label>
                        <select class="form-select" id="genero" name="genero" required>
                            <option value="">Selecione</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Feminino">Feminino</option>
                            <option value="Outro">Outro</option>
                        </select>
                        <div class="invalid-feedback">
                            O gênero é obrigatório.
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="posicao" class="form-label">Posição</label>
                        <select class="form-select" id="posicao" name="posicao" required>
                            <option value="">Selecione</option>
                            <option value="Goleiro">Goleiro</option>
                            <option value="Zagueiro">Zagueiro</option>
                            <option value="Lateral">Lateral</option>
                            <option value="Meio-Campo">Meio-Campo</option>
                            <option value="Atacante">Atacante</option>
                        </select>
                        <div class="invalid-feedback">
                            A posição é obrigatória.
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="equipeJogador" class="form-label">Equipe</label>
                        <select class="form-select" id="equipeJogador" name="equipeJogador" required>
                            ${opcoesEquipes}
                        </select>
                        <div class="invalid-feedback">
                            A equipe é obrigatória.
                        </div>
                    </div>
                    <button type="submit" class="btn btn-dark">Cadastrar Jogador</button>
                    <a class="btn btn-secondary" href="/">Voltar ao Menu</a>
                </form>
                <div class="mt-3">
                    ${mensagemUltimoLogin}
                </div>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
            <script>
                // Adiciona validação de formulário do lado do cliente (opcional, já que a validação principal é no servidor)
                (function () {
                    'use strict'
                    var forms = document.querySelectorAll('form')
                    Array.prototype.slice.call(forms)
                        .forEach(function (form) {
                            form.addEventListener('submit', function (event) {
                                if (!form.checkValidity()) {
                                    event.preventDefault()
                                    event.stopPropagation()
                                }
                                form.classList.add('was-validated')
                            }, false)
                        })
                })()
            </script>
        </body>
        </html>
    `);
});

app.post('/cadastroJogador', verificarAutenticacao, (req, resp) => {
    const { nomeJogador, numeroCamisa, dataNascimento, alturaCm, genero, posicao, equipeJogador } = req.body;

    // Validação no lado do servidor
    if (!nomeJogador || !numeroCamisa || !dataNascimento || !alturaCm || !genero || !posicao || !equipeJogador) {
        return resp.send(`
            <html>
                <head>
                    <meta charset="utf-8">
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
                </head>
                <body>
                    <div class="container w-50">
                        </br>
                        <div class="alert alert-danger" role="alert">
                            Todos os campos são obrigatórios para o cadastro do jogador!
                        </div>
                        <div>
                            <a href="/cadastroJogador" class="btn btn-primary">Voltar ao Cadastro de Jogador</a>
                            <a href="/" class="btn btn-secondary">Voltar ao Menu</a>
                        </div>
                    </div>
                </body>
            </html>
        `);
    }

    // Busca o nome da equipe a partir do ID
    const equipeSelecionada = listaEquipes.find(equipe => equipe.id === parseInt(equipeJogador));
    const nomeEquipe = equipeSelecionada ? equipeSelecionada.nome : 'Equipe Desconhecida';

    const novoJogador = {
        id: listaJogadores.length + 1, // ID simples para demonstração
        nome: nomeJogador,
        numero: parseInt(numeroCamisa),
        nascimento: dataNascimento,
        altura: parseFloat(alturaCm),
        genero: genero,
        posicao: posicao,
        equipeId: parseInt(equipeJogador),
        equipeNome: nomeEquipe
    };
    listaJogadores.push(novoJogador);

    // Redireciona para a lista de jogadores após o cadastro
    resp.redirect('/listaJogadores');
});

// --- Lista de Jogadores Agrupados por Equipe ---
app.get('/listaJogadores', verificarAutenticacao, (req, resp) => {
    const mensagemUltimoLogin = exibirUltimoLogin(req);
    let jogadoresHTML = '';

    if (listaJogadores.length === 0) {
        jogadoresHTML = '<p>Nenhum jogador cadastrado ainda.</p>';
    } else {
        // Agrupa jogadores por equipe
        const jogadoresAgrupados = listaJogadores.reduce((acc, jogador) => {
            const equipeNome = jogador.equipeNome;
            if (!acc[equipeNome]) {
                acc[equipeNome] = [];
            }
            acc[equipeNome].push(jogador);
            return acc;
        }, {});

        for (const equipe in jogadoresAgrupados) {
            jogadoresHTML += `
                <div class="card mb-3">
                    <div class="card-header bg-dark text-white">
                        <h3>Equipe: ${equipe}</h3>
                    </div>
                    <div class="card-body">
                        <table class="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">Nome do Jogador</th>
                                    <th scope="col">Número</th>
                                    <th scope="col">Nascimento</th>
                                    <th scope="col">Altura (cm)</th>
                                    <th scope="col">Gênero</th>
                                    <th scope="col">Posição</th>
                                </tr>
                            </thead>
                            <tbody>
            `;
            jogadoresAgrupados[equipe].forEach(jogador => {
                jogadoresHTML += `
                    <tr>
                        <td>${jogador.id}</td>
                        <td>${jogador.nome}</td>
                        <td>${jogador.numero}</td>
                        <td>${jogador.nascimento}</td>
                        <td>${jogador.altura}</td>
                        <td>${jogador.genero}</td>
                        <td>${jogador.posicao}</td>
                    </tr>
                `;
            });
            jogadoresHTML += `
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
    }

    resp.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Lista de Jogadores</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
        </head>
        <body>
            <div class="container mt-5">
                <h1>Jogadores Cadastrados</h1>
                ${jogadoresHTML}
                <a class="btn btn-dark" href="/cadastroJogador" role="button">Cadastrar Novo Jogador</a>
                <a class="btn btn-secondary" href="/" role="button">Voltar ao Menu</a>
                <div class="mt-3">
                    ${mensagemUltimoLogin}
                </div>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
        </body>
        </html>
    `);
});

// Inicialização do servidor
app.listen(porta, host, () => {
    console.log(`Servidor iniciado e em execução no endereço http://${host}:${porta}`);
});