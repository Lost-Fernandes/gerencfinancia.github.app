document.addEventListener('DOMContentLoaded', () => {
    const financeForm = document.getElementById('financeForm');
    const descricaoInput = document.getElementById('descricao');
    const valorInput = document.getElementById('valor');
    const tipoInput = document.getElementById('tipo');
    const addBtn = document.getElementById('addBtn');
    const updateBtn = document.getElementById('updateBtn');
    const financeList = document.getElementById('financeList');

    let finances = JSON.parse(localStorage.getItem('finances')) || [];
    let editIndex = -1;

    // Inicializa o gráfico
    let chart = null;

    // Função para renderizar o gráfico
    function renderChart() {
        const receitas = finances
            .filter(f => f.tipo === 'Receita')
            .reduce((acc, cur) => acc + cur.valor, 0);

        const despesas = finances
            .filter(f => f.tipo === 'Despesa')
            .reduce((acc, cur) => acc + cur.valor, 0);

        if (chart) {
            chart.destroy(); // Destruir gráfico anterior para evitar sobreposição
        }

        const ctx = document.getElementById('financeChart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Receitas', 'Despesas'],
                datasets: [{
                    data: [receitas, despesas],
                    backgroundColor: ['#28a745', '#dc3545']
                }]
            }
        });
    }

    // Função para adicionar ou atualizar uma finança
    financeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const descricao = descricaoInput.value.trim();
        const valor = parseFloat(valorInput.value.trim());
        const tipo = tipoInput.value;

        if (descricao === '' || isNaN(valor)) {
            alert('Preencha todos os campos corretamente.');
            return;
        }

        const finance = { descricao, valor, tipo };

        if (editIndex === -1) {
            // Adicionar nova finança
            finances.push(finance);
        } else {
            // Atualizar finança existente
            finances[editIndex] = finance;
            editIndex = -1;
        }

        saveToLocalStorage();
        clearForm();
        renderFinances();
        renderChart();
        simulateBackendSync(finance);
    });

    // Função para salvar no LocalStorage
    function saveToLocalStorage() {
        localStorage.setItem('finances', JSON.stringify(finances));
    }

    // Função para limpar o formulário
    function clearForm() {
        descricaoInput.value = '';
        valorInput.value = '';
        tipoInput.value = 'Receita';
        addBtn.style.display = 'inline-block';
        updateBtn.style.display = 'none';
    }

    // Função para renderizar a lista de finanças
    function renderFinances() {
        financeList.innerHTML = '';
        finances.forEach((finance, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${finance.descricao}</td>
                <td>${finance.tipo}</td>
                <td>${finance.valor.toFixed(2)}</td>
                <td class="actions">
                    <button class="edit" onclick="editFinance(${index})">Editar</button>
                    <button class="delete" onclick="deleteFinance(${index})">Excluir</button>
                </td>
            `;
            financeList.appendChild(tr);
        });
    }

    // Função para editar uma finança
    window.editFinance = function(index) {
        const finance = finances[index];
        descricaoInput.value = finance.descricao;
        valorInput.value = finance.valor;
        tipoInput.value = finance.tipo;

        editIndex = index;
        addBtn.style.display = 'none';
        updateBtn.style.display = 'inline-block';
    };

    // Função para excluir uma finança
    window.deleteFinance = function(index) {
        finances.splice(index, 1);
        saveToLocalStorage();
        renderFinances();
        renderChart();
    };

    // Função para limpar o formulário e cancelar a edição
    updateBtn.addEventListener('click', (e) => {
        clearForm();
    });

    // Função para simular integração com o back-end
    function simulateBackendSync(finance) {
        console.log('Enviando finança para o servidor...');
        fetch('https://exemplo.com/api/financas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(finance)
        })
        .then(response => response.json())
        .then(data => console.log('Sucesso ao sincronizar com o back-end:', data))
        .catch(error => console.error('Erro ao sincronizar com o back-end:', error));
    }

    // Inicializar a página com finanças armazenadas e gráfico
    renderFinances();
    renderChart();
});
