const API_BASE_URL = 'https://rickandmortyapi.com/api/character';

// Mapeamento para tradução de status
const statusTranslations = {
    'Alive': 'Vivo',
    'Dead': 'Morto',
    'unknown': 'Desconhecido'
};

// Mapeamento para tradução de gênero
const genderTranslations = {
    'Male': 'Masculino',
    'Female': 'Feminino',
    'unknown': 'Desconhecido'
};

// Elementos do DOM
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const charactersGrid = document.getElementById('charactersGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const noResultsMessage = document.getElementById('noResultsMessage');
const backToTopBtn = document.getElementById('backToTop');

// Estado da aplicação
let currentPage = 1;
let isLoading = false;
let hasMore = true;
let currentSearchTerm = '';
let searchTimeout; // Para debounce

// Função para traduzir o status
function translateStatus(status) {
    return statusTranslations[status] || status;
}

// Função para traduzir o gênero
function translateGender(gender) {
    return genderTranslations[gender] || gender;
}

// Função para buscar personagens
async function fetchCharacters(page = 1, name = '') {
    if (isLoading) return;
    
    isLoading = true;
    loadingSpinner.style.display = 'block';
    noResultsMessage.style.display = 'none';
    
    try {
        let url = `${API_BASE_URL}/?page=${page}`;
        if (name) {
            url += `&name=${encodeURIComponent(name)}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                hasMore = false;
                if (page === 1) {
                    noResultsMessage.style.display = 'block';
                    charactersGrid.innerHTML = '';
                }
                return;
            }
            throw new Error(`Erro na requisição: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (page === 1) {
            charactersGrid.innerHTML = '';
        }
        
        if (data.results && data.results.length > 0) {
            displayCharacters(data.results);
            hasMore = !!data.info.next;
        } else {
            hasMore = false;
            if (page === 1) {
                noResultsMessage.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Erro ao buscar personagens:', error);
        if (currentPage === 1) {
            noResultsMessage.style.display = 'block';
        }
    } finally {
        isLoading = false;
        loadingSpinner.style.display = 'none';
    }
}

// Função para exibir os personagens no grid
function displayCharacters(characters) {
    characters.forEach(character => {
        const characterCard = document.createElement('div');
        characterCard.className = 'col-lg-3 col-md-4 col-sm-6';
        characterCard.innerHTML = `
            <div class="character-card" onclick="showCharacterDetails(${character.id})">
                <img src="${character.image}" class="character-image" alt="${character.name}">
                <div class="character-card-body">
                    <h5 class="character-name">${character.name}</h5>
                    <div class="character-info">
                        <div class="character-info-item">
                            <i class="fas fa-heartbeat"></i>
                            <strong>Status:</strong> 
                            <span class="status-badge status-${character.status.toLowerCase()}">
                                ${translateStatus(character.status)}
                            </span>
                        </div>
                        <div class="character-info-item">
                            <i class="fas fa-dna"></i>
                            <strong>Espécie:</strong> ${character.species}
                        </div>
                        <div class="character-info-item">
                            <i class="fas fa-venus-mars"></i>
                            <strong>Gênero:</strong> ${translateGender(character.gender)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        charactersGrid.appendChild(characterCard);
    });
}

// Função para mostrar detalhes do personagem (pode ser expandida)
function showCharacterDetails(characterId) {
    // Por enquanto, apenas mostra um alerta
    // Você pode expandir isso para mostrar um modal ou redirecionar para uma página de detalhes
    alert(`ID do personagem: ${characterId}\nFuncionalidade de detalhes pode ser implementada aqui!`);
}

// Função para verificar se precisa carregar mais personagens
function checkScroll() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Mostrar botão "Voltar ao Topo" após rolar 300px
    if (scrollY > 300) {
        backToTopBtn.style.display = 'block';
    } else {
        backToTopBtn.style.display = 'none';
    }
    
    // Carregar mais personagens quando chegar perto do final da página
    if (scrollY + windowHeight >= documentHeight - 1000 && hasMore && !isLoading) {
        currentPage++;
        fetchCharacters(currentPage, currentSearchTerm);
    }
}

// Função para voltar ao topo
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Função para realizar a busca com debounce
function performSearch() {
    const searchTerm = searchInput.value.trim();
    currentSearchTerm = searchTerm;
    currentPage = 1;
    hasMore = true;
    fetchCharacters(currentPage, searchTerm);
}

// Event Listeners
searchButton.addEventListener('click', performSearch);

searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        performSearch();
    }
});

// Busca automática com debounce
searchInput.addEventListener('input', () => {
    // Limpa o timeout anterior
    clearTimeout(searchTimeout);
    
    // Define um novo timeout
    searchTimeout = setTimeout(() => {
        performSearch();
    }, 500); // Aguarda 500ms após o usuário parar de digitar
});

window.addEventListener('scroll', checkScroll);

backToTopBtn.addEventListener('click', scrollToTop);

// Carregar personagens iniciais
window.addEventListener('DOMContentLoaded', () => {
    fetchCharacters();
});
document.addEventListener('DOMContentLoaded', function() {
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
});