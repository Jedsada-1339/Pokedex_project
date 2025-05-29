// Type colors (same as main.js)
const typeColors = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
  grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
  ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
  rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746',
  steel: '#B7B7CE', fairy: '#D685AD'
};

const favoritesList = document.getElementById('favorites-list');
const favoritesCount = document.getElementById('favoritesCount');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in
  if (!window.authManager || !window.authManager.isLoggedIn()) {
    window.location.href = './login.html';
    return;
  }

  loadFavorites();
  setupEventListeners();
});

function loadFavorites() {
  const favorites = window.authManager.getFavorites();
  const favoriteArray = Object.values(favorites);
  
  // Update count
  favoritesCount.textContent = `You have ${favoriteArray.length} favorite Pokémon`;
  
  if (favoriteArray.length === 0) {
    favoritesList.innerHTML = `
      <div class="col-span-full text-center py-20">
        <img src="./src/img/loading.png" alt="No favorites" class="w-32 h-32 mx-auto mb-4 opacity-50">
        <p class="text-2xl text-gray-600 mb-4">No favorite Pokémon yet!</p>
        <p class="text-gray-500 mb-6">Start adding your favorite Pokémon from the main Pokédex.</p>
        <a href="./index.html" class="bg-indigo-500 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors">
          Browse Pokédex
        </a>
      </div>
    `;
    return;
  }

  // Sort favorites by timestamp (newest first)
  favoriteArray.sort((a, b) => b.timestamp - a.timestamp);
  
  renderFavoriteCards(favoriteArray);
}

function renderFavoriteCards(pokemons) {
  favoritesList.innerHTML = '';

  pokemons.forEach(p => {
    const card = document.createElement('div');
    const primaryType = p.types[0].type.name;
    const bgColor = typeColors[primaryType] || '#888';

    card.className = `
      text-white p-4 sm:p-6 lg:p-8 rounded-3xl shadow-xl 
      relative w-64 sm:w-72 md:w-80 h-60 sm:h-64 md:h-72 overflow-hidden 
      hover:scale-105 transition delay-100 duration-300 cursor-pointer`;
    card.style.backgroundColor = bgColor;
    card.innerHTML = `
      <p class="absolute top-2 right-4 text-white/30 text-2xl sm:text-3xl md:text-4xl font-bold">
        #${String(p.id).padStart(3, '0')}
      </p>
      <h2 class="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">${capitalize(p.name)}</h2>
      <div class="flex flex-col gap-2 sm:gap-3">
        ${p.types.map(t =>
      `<span class="bg-white/30 hover:bg-white/40 text-white px-3 py-1 rounded-xl text-xs sm:text-sm font-semibold w-fit cursor-pointer">
              ${capitalize(t.type.name)}
           </span>`).join('')}
      </div>
      <img src="${p.sprites.other['official-artwork'].front_default}" 
           alt="${p.name}" 
           class="absolute bottom-2 right-2 h-28 sm:h-32 md:h-36 drop-shadow-lg z-20"/>
      <img src="./src/img/BG/BG.png" 
           alt="${p.name}" 
           class="absolute bottom-1 right-1 h-24 sm:h-38 opacity-25 drop-shadow-lg"/>

      <!-- Remove from favorites button -->
      <button class="remove-favorite absolute bottom-4 left-2 bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg">
        ❤️ Remove
      </button>
      
      <!-- Added date -->
      <p class="absolute top-2 left-4 text-white/50 text-xs">
        Added ${formatDate(p.timestamp)}
      </p>
    `;

    // Add click event for the card
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.remove-favorite')) {
        openModal(p);
      }
    });

    // Add remove functionality
    const removeBtn = card.querySelector('.remove-favorite');
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      
      if (confirm(`Remove ${capitalize(p.name)} from favorites?`)) {
        window.authManager.removeFavorite(p.id);
        loadFavorites(); // Refresh the page
      }
    });

    favoritesList.appendChild(card);
  });
}

function setupEventListeners() {
  // Clear all favorites button
  document.getElementById('clearAllBtn').addEventListener('click', () => {
    const favorites = window.authManager.getFavorites();
    const count = Object.keys(favorites).length;
    
    if (count === 0) {
      alert('No favorites to clear!');
      return;
    }
    
    if (confirm(`Are you sure you want to remove all ${count} favorite Pokémon?`)) {
      // Remove all favorites
      Object.keys(favorites).forEach(pokemonId => {
        window.authManager.removeFavorite(pokemonId);
      });
      loadFavorites();
    }
  });

  // Modal setup (same as main.js)
  const modal = document.getElementById('modal');
  const modalCard = modal.querySelector('.modal-card');
  const detailBox = modal.querySelector('.bg-white');
  const overlay = document.getElementById('modalOverlay');
  const modalImage = modal.querySelector('.pokemon-image');

  function closeModal() {
    modalCard.classList.remove('opacity-100', 'scale-100');
    modalCard.classList.add('opacity-0', 'scale-90');

    detailBox.classList.remove('opacity-100', 'scale-100');
    detailBox.classList.add('opacity-0', 'scale-90');

    modalImage.classList.remove('opacity-100', 'scale-100');
    modalImage.classList.add('opacity-0', 'scale-90');

    setTimeout(() => {
      modal.classList.add('hidden');
    }, 300);
  }

  overlay.addEventListener('click', closeModal);
  document.getElementById('closeModal').addEventListener('click', closeModal);

  // Tab logic
  const tabAbout = document.getElementById('tabAbout');
  const tabStats = document.getElementById('tabStats');
  const aboutSection = document.getElementById('aboutSection');
  const statsSection = document.getElementById('statsSection');

  tabAbout.addEventListener('click', () => {
    aboutSection.classList.remove('hidden');
    statsSection.classList.add('hidden');
    tabAbout.classList.add('border-b-2', 'border-midnight-100');
    tabStats.classList.remove('border-b-2', 'border-midnight-100');
  });

  tabStats.addEventListener('click', () => {
    aboutSection.classList.add('hidden');
    statsSection.classList.remove('hidden');
    tabStats.classList.add('border-b-2', 'border-midnight-100');
    tabAbout.classList.remove('border-b-2', 'border-midnight-100');
  });
}

// Helper functions
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString();
}

function formatStatName(name) {
  switch (name) {
    case 'hp': return 'HP';
    case 'attack': return 'Attack';
    case 'defense': return 'Defense';
    case 'special-attack': return 'Sp. Atk';
    case 'special-defense': return 'Sp. Def';
    case 'speed': return 'Speed';
    default: return capitalize(name);
  }
}

// Modal function (same as main.js)
function openModal(pokemon) {
  const modal = document.getElementById('modal');
  const modalCard = modal.querySelector('.modal-card');
  const detailBox = modal.querySelector('.bg-white');

  const primaryType = pokemon.types[0].type.name;
  const bgColor = typeColors[primaryType] || '#60A5FA';

  modalCard.style.backgroundColor = bgColor;
  modal.querySelector('h2').textContent = capitalize(pokemon.name);
  modal.querySelector('.absolute.top-4.right-6').textContent = `#${String(pokemon.id).padStart(3, '0')}`;

  const modalImage = modal.querySelector('.pokemon-image');
  modalImage.src = pokemon.sprites.other['official-artwork'].front_default;
  modalImage.alt = pokemon.name;

  const typeContainer = modal.querySelector('.type-container');
  typeContainer.innerHTML = '';
  pokemon.types.forEach(t => {
    const span = document.createElement('span');
    span.className = 'bg-white/30 text-white px-4 py-1 rounded-full text-base font-semibold';
    span.textContent = capitalize(t.type.name);
    typeContainer.appendChild(span);
  });

  // About section
  const rows = detailBox.querySelectorAll('tbody tr');
  rows[0].children[1].textContent = pokemon.types.map(t => capitalize(t.type.name)).join(', ');
  rows[1].children[1].textContent = (pokemon.height / 10).toFixed(1) + ' m';
  rows[2].children[1].textContent = (pokemon.weight / 10).toFixed(1) + ' kg';
  rows[3].children[1].textContent = pokemon.abilities.map(a => capitalize(a.ability.name)).join(', ');

  // Stats
  const statsSection = document.getElementById('statsSection').querySelector('tbody');
  statsSection.innerHTML = '';
  let total = 0;
  pokemon.stats.forEach(stat => {
    const statName = formatStatName(stat.stat.name);
    const value = stat.base_stat;
    total += value;
    const barWidth = Math.min(value, 150);
    const barColor = value < 50 ? 'bg-orange-400' : 'bg-indigo-500';
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="font-[200] text-gray-700 pr-8 pt-4">${statName}</td>
      <td class="py-1 text-right w-12 pt-4">${value}</td>
      <td class="py-1 pl-2 w-50 pt-4">
        <div class="bg-gray-200 rounded h-3">
          <div class="${barColor} h-3 rounded" style="width: ${barWidth}px"></div>
        </div>
      </td>`;
    statsSection.appendChild(row);
  });

  const totalRow = document.createElement('tr');
  totalRow.innerHTML = `
    <td class="font-[200] text-gray-700 pr-8 pt-4">Total</td>
    <td class="py-1 text-right w-12 pt-4">${total}</td>
    <td class="py-1 pl-2 w-50 pt-4">
      <div class="bg-gray-200 rounded h-3">
        <div class="bg-green-600 h-3 rounded" style="width: ${Math.min(total / 3, 150)}px"></div>
      </div>
    </td>`;
  statsSection.appendChild(totalRow);

  // Show modal with animation
  modal.classList.remove('hidden');
  setTimeout(() => {
    modalCard.classList.remove('opacity-0', 'scale-90');
    modalCard.classList.add('opacity-100', 'scale-100');

    detailBox.classList.remove('opacity-0', 'scale-90');
    detailBox.classList.add('opacity-100', 'scale-100');

    modalImage.classList.remove('opacity-0', 'scale-90');
    modalImage.classList.add('opacity-100', 'scale-100');
  }, 10);
}