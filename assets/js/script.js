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
const characterCard = document.getElementById('characterCard');
const characterImage = document.getElementById('characterImage');
const characterName = document.getElementById('characterName');
const characterStatus = document.getElementById('characterStatus');
const characterSpecies = document.getElementById('characterSpecies');
const characterGender = document.getElementById('characterGender');
const characterOrigin = document.getElementById('characterOrigin');
const characterLocation = document.getElementById('characterLocation');
const characterFirstEpisode = document.getElementById('characterFirstEpisode');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');

// Variável para controlar o debounce
let searchTimeout;

// Função para traduzir o status
function translateStatus(status) {
    return statusTranslations[status] || status;
}

// Função para traduzir o gênero
function translateGender(gender) {
    return genderTranslations[gender] || gender;
}

// Função para extrair o código do episódio da URL
function getEpisodeCode(episodeUrl) {
    if (!episodeUrl) return null;
    
    // Extrai o último segmento da URL que contém o ID do episódio
    const episodeId = episodeUrl.split('/').pop();
    
    // Faz uma requisição para obter os detalhes do episódio
    return fetch(`${API_BASE_URL.replace('character', 'episode')}/${episodeId}`)
        .then(response => {
            if (!response.ok) throw new Error('Episódio não encontrado');
            return response.json();
        })
        .then(episodeData => episodeData.episode) // Retorna apenas o código do episódio (ex: S01E01)
        .catch(() => `Episódio ${episodeId}`); // Fallback caso não consiga obter o código
}

// Função para buscar dados de um personagem
async function fetchCharacter(url) {
    try {
        loadingSpinner.style.display = 'block';
        characterCard.style.display = 'none';
        errorMessage.style.display = 'none';

        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Personagem não encontrado');
            }
            throw new Error(`Erro na requisição: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Lógica para lidar com diferentes tipos de resposta
        let actualCharacter;
        if (Array.isArray(data)) {
            actualCharacter = data[0];
        } else if (data.results && data.results.length > 0) {
            actualCharacter = data.results[0];
        } else if (data.id) {
            actualCharacter = data;
        } else {
            throw new Error('Personagem não encontrado');
        }
        
        if (!actualCharacter || !actualCharacter.id) {
            throw new Error('Personagem não encontrado');
        }

        displayCharacter(actualCharacter);
    } catch (error) {
        console.error('Erro ao buscar personagem:', error);
        errorMessage.style.display = 'block';
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

// Função para exibir os dados do personagem no card
async function displayCharacter(character) {
    characterImage.src = character.image;
    characterImage.alt = character.name;
    characterName.textContent = character.name;
    characterStatus.textContent = translateStatus(character.status);
    characterSpecies.textContent = character.species;
    characterGender.textContent = translateGender(character.gender);
    characterOrigin.textContent = character.origin.name;
    characterLocation.textContent = character.location.name;
    
    // Tratar o primeiro episódio
    if (character.episode && character.episode.length > 0) {
        try {
            const episodeCode = await getEpisodeCode(character.episode[0]);
            characterFirstEpisode.textContent = episodeCode;
            document.getElementById('firstEpisodeRow').style.display = 'flex';
        } catch (error) {
            console.warn('Erro ao carregar episódio:', error);
            document.getElementById('firstEpisodeRow').style.display = 'none';
        }
    } else {
        document.getElementById('firstEpisodeRow').style.display = 'none';
    }

    characterCard.style.display = 'block';
}

// Função para obter um personagem aleatório
async function getRandomCharacter() {
    // A API tem 826 personagens (até a data deste código)
    const randomId = Math.floor(Math.random() * 826) + 1;
    const url = `${API_BASE_URL}/${randomId}`;
    await fetchCharacter(url);
}

// Função para realizar a busca com debounce
function performSearch() {
    const name = searchInput.value.trim();
    if (name.length >= 2) { // Só busca se tiver 2 ou mais caracteres
        const url = `${API_BASE_URL}/?name=${encodeURIComponent(name)}`;
        fetchCharacter(url);
    } else if (name.length === 0) {
        // Se o campo estiver vazio, carrega um personagem aleatório
        getRandomCharacter();
    }
}

// Event Listeners
searchInput.addEventListener('input', () => {
    // Limpa o timeout anterior
    clearTimeout(searchTimeout);
    
    // Define um novo timeout
    searchTimeout = setTimeout(() => {
        performSearch();
    }, 500); // Aguarda 500ms após o usuário parar de digitar
});

// Carregar um personagem aleatório ao iniciar a página
window.addEventListener('DOMContentLoaded', () => {
    getRandomCharacter();
});
// Adicione este código junto com os outros event listeners no final do script.js

// Event listener para o botão "Todos os Personagens"
const allCharactersBtn = document.getElementById('allCharactersBtn');
if (allCharactersBtn) {
    allCharactersBtn.addEventListener('click', () => {
        // Redireciona para a página de todos os personagens
        window.location.href = 'all-characters.html';
    });
}