document.addEventListener('DOMContentLoaded', function() {
    
    // Pega as referências.
    const formEndereco = document.getElementById('formEndereco');
    const tabelaEnderecos = document.getElementById('tabelaEnderecos');
    const btnLimparEndereco = document.getElementById('btnLimparEndereco');

    //Função para popular o dropdown de clientes.
    window.carregarClientesDropdown = function() {
        const clientes = alasql('SELECT * FROM clientes');
        const clienteSelect = document.getElementById('enderecoClienteId');
        
        // Limpa o dropdown para não duplicar itens ao recarregar.
        clienteSelect.innerHTML = '<option value="">-- Selecione o Cliente --</option>';

        // Para cada cliente, adiciona uma nova opção no dropdown.
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id; 
            option.textContent = cliente.nomeCompleto; // O texto visivel é o Nome.
            clienteSelect.appendChild(option);
        });

        // a tabela de endereços também é recarregada.
        carregarEnderecos();
    }

    //Busca os endereços no banco de dados.
    function carregarEnderecos() {
        // Buscar o nome do cliente junto com os dados do endereço.
        const enderecos = alasql('SELECT E.*, C.nomeCompleto FROM enderecos AS E JOIN clientes AS C ON E.clienteId = C.id');
        tabelaEnderecos.innerHTML = ''; // Limpa a tabela antes.

        enderecos.forEach(endereco => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${endereco.nomeCompleto}</td>
                <td>${endereco.rua}</td>
                <td>${endereco.cidade}</td>
                <td>${endereco.principal ? 'Sim' : 'Não'}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="editarEndereco(${endereco.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="excluirEndereco(${endereco.id})">Excluir</button>
                </td>
            `;
            tabelaEnderecos.appendChild(tr);
        });
    }

    // Veririca a atualização do endereço.
    formEndereco.addEventListener('submit', function(event) {
        event.preventDefault();

        // Monta um objeto com todos os dados.
        const endereco = {
            clienteId: parseInt(document.getElementById('enderecoClienteId').value),
            cep: document.getElementById('cep').value,
            rua: document.getElementById('rua').value,
            bairro: document.getElementById('bairro').value,
            cidade: document.getElementById('cidade').value,
            estado: document.getElementById('estado').value,
            pais: document.getElementById('pais').value,
            principal: document.getElementById('enderecoPrincipal').checked
        };
        const enderecoId = document.getElementById('enderecoId').value;

        if (!endereco.clienteId) {
            alert("Por favor, selecione um cliente.");
            return;
        }

        try {
            // Garante que apenas um endereço seja o principal por cliente.
            if (endereco.principal) {
                alasql('UPDATE enderecos SET principal = false WHERE clienteId = ?', [endereco.clienteId]);
            }

            // Verifica se é para adicionar ou editar um endereço.
            if (enderecoId) {
                alasql('UPDATE enderecos SET clienteId = ?, cep = ?, rua = ?, bairro = ?, cidade = ?, estado = ?, pais = ?, principal = ? WHERE id = ?',
                       [endereco.clienteId, endereco.cep, endereco.rua, endereco.bairro, endereco.cidade, endereco.estado, endereco.pais, endereco.principal, enderecoId]);
                alert('Endereço atualizado com sucesso!');
            } else {
                alasql('INSERT INTO enderecos (clienteId, cep, rua, bairro, cidade, estado, pais, principal) VALUES (?,?,?,?,?,?,?,?)',
                       [endereco.clienteId, endereco.cep, endereco.rua, endereco.bairro, endereco.cidade, endereco.estado, endereco.pais, endereco.principal]);
                alert('Endereço cadastrado com sucesso!');
            }
            
            // Limpa o formulário e recarrega a tabela para mostrar a alteração.
            formEndereco.reset();
            document.getElementById('enderecoId').value = '';
            carregarEnderecos();

        } catch (err) {
            console.error("Erro ao salvar endereço:", err);
            alert("Ocorreu um erro ao salvar o endereço.");
        }
    });
    
    // Verifica edição de um endereço.
    window.editarEndereco = function(id) {
        const endereco = alasql('SELECT * FROM enderecos WHERE id = ?', [id])[0];
        if (endereco) {
            document.getElementById('enderecoId').value = endereco.id;
            document.getElementById('enderecoClienteId').value = endereco.clienteId;
            document.getElementById('cep').value = endereco.cep;
            document.getElementById('rua').value = endereco.rua;
            document.getElementById('bairro').value = endereco.bairro;
            document.getElementById('cidade').value = endereco.cidade;
            document.getElementById('estado').value = endereco.estado;
            document.getElementById('pais').value = endereco.pais;
            document.getElementById('enderecoPrincipal').checked = endereco.principal;
        }
    };
    
    // Verifica a exclusão de um endereço.
    window.excluirEndereco = function(id) {
        if (confirm('Tem certeza que deseja excluir este endereço?')) {
            try {
                alasql('DELETE FROM enderecos WHERE id = ?', [id]);
                alert('Endereço excluído com sucesso!');
                carregarEnderecos(); // Atualiza a tabela.
            } catch (err) {
                console.error("Erro ao excluir endereço:", err);
                alert("Ocorreu um erro ao excluir o endereço.");
            }
        }
    };

    // Função de limpeza.
    btnLimparEndereco.addEventListener('click', function() {
        formEndereco.reset();
        document.getElementById('enderecoId').value = '';
    });

    carregarClientesDropdown();
});