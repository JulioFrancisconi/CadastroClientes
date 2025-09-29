document.addEventListener('DOMContentLoaded', function() {
    
    // Pega as referências.
    const formLogin = document.getElementById('formLogin');
    const formCadastroUsuario = document.getElementById('formCadastroUsuario');
    const importarDbInput = document.getElementById('importarDbInput');

    // Verifica tentativa de login
    formLogin.addEventListener('submit', function(event) {
        // Impede o recarregamento padrão da página.
        event.preventDefault();

        // Pega os valores digitados.
        const usuario = document.getElementById('loginUsuario').value;
        const senha = document.getElementById('loginSenha').value;

        // Verifica usuário no banco.
        const res = alasql('SELECT * FROM usuarios WHERE usuario = ? AND senha = ?', [usuario, senha]);

        // Se encontrou um resultado, o login é bem-sucedido.
        if (res.length > 0) {
            alert('Login realizado com sucesso!');
            // Redireciona o usuário para a tela principal.
            window.location.href = 'home.html';
        } else {
            alert('Usuário ou senha inválidos.');
        }
    });

    // Verifica cadastro de novo usuário
    formCadastroUsuario.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Pega os valores digitado e remover espaços em branco do início e fim.
        const usuario = document.getElementById('cadastroUsuario').value.trim();
        const senha = document.getElementById('cadastroSenha').value;

        if (!usuario || !senha) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        try {
            [cite_start]// Verifica se o usuário já existe.
            const existe = alasql('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
            if (existe.length > 0) {
                alert('Este nome de usuário já está em uso.');
                return; 
            }

            // Insere o novo registro no banco.
            alasql('INSERT INTO usuarios (usuario, senha) VALUES (?, ?)', [usuario, senha]);
            alert('Usuário cadastrado com sucesso!');
            
            // API do Bootstrap para fechar a janela modal.
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalCadastroUsuario'));
            modal.hide();
            formCadastroUsuario.reset(); // Limpa os campos.

        } catch (err) {
            console.error("Erro ao cadastrar usuário:", err);
            alert("Ocorreu um erro ao tentar cadastrar. Tente novamente.");
        }
    });
    
    // Importação do arquivo.
    if(importarDbInput) {
        importarDbInput.addEventListener('change', importarDados);
    }
});