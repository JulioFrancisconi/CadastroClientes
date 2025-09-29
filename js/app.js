document.addEventListener('DOMContentLoaded', function() {
    try {
        // Garante a conexão com o banco de dados local
        alasql('CREATE LOCALSTORAGE DATABASE IF NOT EXISTS agrosysdb');
        alasql('ATTACH LOCALSTORAGE DATABASE agrosysdb');
        alasql('USE agrosysdb');

        // Cria estrutura das tabelas
        alasql('CREATE TABLE IF NOT EXISTS usuarios (id INT AUTOINCREMENT PRIMARY KEY, usuario VARCHAR(100) UNIQUE, senha VARCHAR(100))');
        alasql('CREATE TABLE IF NOT EXISTS clientes (id INT AUTOINCREMENT PRIMARY KEY, nomeCompleto VARCHAR(255), cpf VARCHAR(14) UNIQUE, dataNascimento DATE, telefone VARCHAR(20), celular VARCHAR(20))');
        alasql('CREATE TABLE IF NOT EXISTS enderecos (id INT AUTOINCREMENT PRIMARY KEY, clienteId INT, cep VARCHAR(9), rua VARCHAR(255), bairro VARCHAR(100), cidade VARCHAR(100), estado VARCHAR(50), pais VARCHAR(50), principal BOOLEAN)');

        console.log("Banco de dados e tabelas prontos para uso.");
    } catch (err) {
        console.error("Erro ao inicializar o banco de dados:", err);
        alert("Não foi possível iniciar o banco de dados.");
    }
});

// Coleta os dados de todas as tabelas, converte para JSON e força o download de um arquivo .json
function exportarDados() {
    // Pega todos os dados do banco e agrupa.
    const data = {
        usuarios: alasql('SELECT * FROM usuarios'),
        clientes: alasql('SELECT * FROM clientes'),
        enderecos: alasql('SELECT * FROM enderecos')
    };

    // Converte o agrupamento para uma string JSON formatada.
    const jsonData = JSON.stringify(data, null, 2);

    // Salva em memória e simular um clique para download.
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup_banco_dados.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Faz a importação de um arquivo .json.
// Zera o banco de dados atual e o repopula com os dados do arquivo.
function importarDados(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    // API para ler arquivos locais.
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            // Destrói as tabelas antigas.
            alasql('DROP TABLE IF EXISTS usuarios');
            alasql('DROP TABLE IF EXISTS clientes');
            alasql('DROP TABLE IF EXISTS enderecos');

            // Recria a estrutura do banco.
            alasql('CREATE TABLE usuarios (id INT AUTOINCREMENT PRIMARY KEY, usuario VARCHAR(100) UNIQUE, senha VARCHAR(100))');
            alasql('CREATE TABLE clientes (id INT AUTOINCREMENT PRIMARY KEY, nomeCompleto VARCHAR(255), cpf VARCHAR(14) UNIQUE, dataNascimento DATE, telefone VARCHAR(20), celular VARCHAR(20))');
            alasql('CREATE TABLE enderecos (id INT AUTOINCREMENT PRIMARY KEY, clienteId INT, cep VARCHAR(9), rua VARCHAR(255), bairro VARCHAR(100), cidade VARCHAR(100), estado VARCHAR(50), pais VARCHAR(50), principal BOOLEAN)');

            // Percorre os dados do JSON e insere cada registro nas tabelas.
            if (data.usuarios && data.usuarios.length) {
                data.usuarios.forEach(usuario => {
                    alasql('INSERT INTO usuarios (id, usuario, senha) VALUES (?,?,?)', [usuario.id, usuario.usuario, usuario.senha]);
                });
            }

            if (data.clientes && data.clientes.length) {
                data.clientes.forEach(cliente => {
                    alasql('INSERT INTO clientes (id, nomeCompleto, cpf, dataNascimento, telefone, celular) VALUES (?,?,?,?,?,?)',
                           [cliente.id, cliente.nomeCompleto, cliente.cpf, cliente.dataNascimento, cliente.telefone, cliente.celular]);
                });
            }

            if (data.enderecos && data.enderecos.length) {
                data.enderecos.forEach(endereco => {
                    alasql('INSERT INTO enderecos (id, clienteId, cep, rua, bairro, cidade, estado, pais, principal) VALUES (?,?,?,?,?,?,?,?,?)',
                           [endereco.id, endereco.clienteId, endereco.cep, endereco.rua, endereco.bairro, endereco.cidade, endereco.estado, endereco.pais, endereco.principal]);
                });
            }

            alert("Dados importados com sucesso!");
            window.location.reload(); // Recarrega a página.

        } catch (err) {
            console.error("Erro ao importar dados:", err);
            alert("Falha ao importar. O arquivo pode estar corrompido ou em formato inválido.");
        }
    };
    
    // Inicia a leitura do arquivo como texto.
    reader.readAsText(file);
}