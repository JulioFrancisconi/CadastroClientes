document.addEventListener('DOMContentLoaded', function() {
    
    // Pega as referências.
    const formCliente = document.getElementById('formCliente');
    const tabelaClientes = document.getElementById('tabelaClientes');
    const btnExportar = document.getElementById('btnExportar');

    // Busca os clientes no banco.
    function carregarClientes() {
        const clientes = alasql('SELECT * FROM clientes');
        tabelaClientes.innerHTML = ''; // Limpa a tabela para evitar duplicar dados.

        // Para cada cliente encontrado, cria uma nova linha.
        clientes.forEach(cliente => {
            const tr = document.createElement('tr');
            // Preenche a linha com os dados do cliente e os botões.
            tr.innerHTML = `
                <td>${cliente.nomeCompleto}</td>
                <td>${cliente.cpf}</td>
                <td>${cliente.celular}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="editarCliente(${cliente.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="excluirCliente(${cliente.id})">Excluir</button>
                </td>
            `;
            tabelaClientes.appendChild(tr); // Adiciona a nova linha.
        });
    }

    // Verifica o evento submit, salvando um novo cliente ou atualizando.
    formCliente.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Agrupa os dados.
        const cliente = {
            nomeCompleto: document.getElementById('nomeCompleto').value,
            cpf: document.getElementById('cpf').value,
            dataNascimento: document.getElementById('dataNascimento').value,
            telefone: document.getElementById('telefone').value,
            celular: document.getElementById('celular').value
        };
        const clienteId = document.getElementById('clienteId').value;

        try {
            // Verifica se ja tem o CPF cadastrado.
            const existe = alasql('SELECT id FROM clientes WHERE cpf = ? AND id != ?', [cliente.cpf, clienteId || 0]);
            if (existe.length > 0) {
                alert('Este CPF já está cadastrado.');
                return;
            }

            // Verifica se o cliente já existe.
            if (clienteId) {
                alasql('UPDATE clientes SET nomeCompleto = ?, cpf = ?, dataNascimento = ?, telefone = ?, celular = ? WHERE id = ?', 
                       [cliente.nomeCompleto, cliente.cpf, cliente.dataNascimento, cliente.telefone, cliente.celular, clienteId]);
                alert('Cliente atualizado com sucesso!');
            } else {
                alasql('INSERT INTO clientes (nomeCompleto, cpf, dataNascimento, telefone, celular) VALUES (?,?,?,?,?)', 
                       [cliente.nomeCompleto, cliente.cpf, cliente.dataNascimento, cliente.telefone, cliente.celular]);
                alert('Cliente cadastrado com sucesso!');
            }
            
            // Limpa o formulário.
            formCliente.reset();
            document.getElementById('clienteId').value = '';

            // Atualiza a visualização.
            carregarClientes(); 
            window.carregarClientesDropdown(); // Atualiza também o cliente na aba de endereços.

        } catch (err) {
            console.error("Erro ao salvar cliente:", err);
            alert("Ocorreu um erro ao salvar o cliente.");
        }
    });

    // Verifica a edição do cliente.
    window.editarCliente = function(id) {
        const cliente = alasql('SELECT * FROM clientes WHERE id = ?', [id])[0];
        if (cliente) {
            document.getElementById('clienteId').value = cliente.id; 
            document.getElementById('nomeCompleto').value = cliente.nomeCompleto;
            document.getElementById('cpf').value = cliente.cpf;
            document.getElementById('dataNascimento').value = cliente.dataNascimento;
            document.getElementById('telefone').value = cliente.telefone;
            document.getElementById('celular').value = cliente.celular;
        }
    };

    // Verifica exclusão do cliente.
    window.excluirCliente = function(id) {
        if (confirm('Tem certeza que deseja excluir este cliente? Todos os seus endereços também serão removidos.')) {
            try {
                alasql('DELETE FROM enderecos WHERE clienteId = ?', [id]);
                alasql('DELETE FROM clientes WHERE id = ?', [id]);
                
                alert('Cliente excluído com sucesso!');
                carregarClientes(); // Atualiza a tabela.
            } catch (err) {
                console.error("Erro ao excluir cliente:", err);
                alert("Ocorreu um erro ao excluir o cliente.");
            }
        }
    };
    
    // Botão de exportar.
    btnExportar.addEventListener('click', exportarDados);
    
    carregarClientes();
});