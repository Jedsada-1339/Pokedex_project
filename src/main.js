const genRanges = [
  [1, 151], [152, 251], [252, 386], [387, 493],
  [494, 649], [650, 721], [722, 809], [810, 905], [906, 1010]
];

const typeColors = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
  grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
  ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
  rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746',
  steel: '#B7B7CE', fairy: '#D685AD'
};

const genButtonsContainer = document.getElementById('gen-buttons');
const sortSelect = document.getElementById('sort');
const pokemonList = document.getElementById('pokemon-list');
const itemsPerPageSelect = document.getElementById('itemsPerPage');

// Pagination variables
let currentGen = 0;
let currentType = 'all';
let currentPage = 1;
let itemsPerPage = parseInt(itemsPerPageSelect.value);
let allPokemonData = []; // Store all loaded pokemon data

// Create generation buttons
genRanges.forEach((_, index) => {
  const btn = document.createElement('button');
  btn.textContent = indexToRoman(index + 1);
  btn.className = 'px-3 py-2 hover:bg-gray-200 cursor-pointer border-b-4 border-transparent text-sm sm:text-base';
  btn.dataset.gen = index;
  genButtonsContainer.appendChild(btn);
});

// Load types into dropdown
fetch('https://pokeapi.co/api/v2/type')
  .then(res => res.json())
  .then(data => {
    data.results.forEach(type => {
      const opt = document.createElement('option');
      opt.value = type.name;
      opt.textContent = capitalize(type.name);
      sortSelect.appendChild(opt);
    });
  });

// Event listeners
genButtonsContainer.addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') {
    currentGen = parseInt(e.target.dataset.gen);
    currentPage = 1; // Reset to first page when changing generation
    document.querySelectorAll('#gen-buttons button').forEach(btn => {
      btn.classList.remove('bg-gray-200', 'border-b-4', 'border-indigo-500', 'border-transparent');
    });
    e.target.classList.add('bg-gray-200', 'border-b-4', 'border-indigo-500');
    fetchAndDisplay();
  }
});

sortSelect.addEventListener('change', e => {
  currentType = e.target.value;
  currentPage = 1; // Reset to first page when changing filter
  renderCurrentPage();
});

itemsPerPageSelect.addEventListener('change', e => {
  itemsPerPage = parseInt(e.target.value);
  currentPage = 1; // Reset to first page when changing items per page
  renderCurrentPage();
});

function fetchAndDisplay() {
  const [start, end] = genRanges[currentGen];
  pokemonList.innerHTML = `
    <div role="status" class="fixed inset-0 flex items-center justify-center z-50 bg-white/50">
      <img src="./src/img/loading.png" alt="Loading..." class="h-44 sm:h-62 animate-spin" />
      <span class="sr-only">Loading...</span>
    </div>`;
  
  const promises = [];
  for (let i = start; i <= end; i++) {
    promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${i}`).then(res => res.json()));
  }
  
  Promise.all(promises).then(pokemons => {
    allPokemonData = pokemons;
    renderCurrentPage();
  });
}

function renderCurrentPage() {
  // Filter Pokemon based on selected type
  let filteredPokemon = allPokemonData;
  if (currentType !== 'all') {
    filteredPokemon = allPokemonData.filter(p => p.types.some(t => t.type.name === currentType));
  }
  
  // Calculate pagination
  const totalItems = filteredPokemon.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Ensure current page is valid
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }
  if (currentPage < 1) {
    currentPage = 1;
  }
  
  // Get items for current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredPokemon.slice(startIndex, endIndex);
  
  // Render cards
  renderCards(currentItems);
  
  // Update pagination UI
  updatePaginationUI(totalPages);
}

function updatePaginationUI(totalPages) {
  const paginationNav = document.querySelector('nav[aria-label="Pagination"]');
  let paginationHTML = `
    <a href="#" class="pagination-prev relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}">
      <span class="sr-only">Previous</span>
      <svg class="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
      </svg>
    </a>
  `;
  
  // Generate page buttons
  const displayedPages = getDisplayedPages(currentPage, totalPages);
  
  displayedPages.forEach(page => {
    if (page === '...') {
      paginationHTML += `
        <span class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-gray-300 ring-inset">...</span>
      `;
    } else {
      const isActive = page === currentPage;
      paginationHTML += `
        <a href="#" data-page="${page}" class="pagination-page relative ${isActive ? 'z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white' : 'inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-200'} focus:z-20 focus:outline-offset-0">
          ${page}
        </a>
      `;
    }
  });
  
  paginationHTML += `
    <a href="#" class="pagination-next relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-200 focus:z-20 focus:outline-offset-0 ${currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}">
      <span class="sr-only">Next</span>
      <svg class="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
      </svg>
    </a>
  `;
  
  paginationNav.innerHTML = paginationHTML;
  
  // Add event listeners to pagination controls
  document.querySelector('.pagination-prev').addEventListener('click', e => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      renderCurrentPage();
    }
  });
  
  document.querySelector('.pagination-next').addEventListener('click', e => {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      renderCurrentPage();
    }
  });
  
  document.querySelectorAll('.pagination-page').forEach(pageLink => {
    pageLink.addEventListener('click', e => {
      e.preventDefault();
      currentPage = parseInt(e.target.dataset.page);
      renderCurrentPage();
    });
  });
}

// Helper function to determine which page numbers to show
function getDisplayedPages(currentPage, totalPages) {
  const displayedPages = [];
  
  if (totalPages <= 7) {
    // If few pages, show all
    for (let i = 1; i <= totalPages; i++) {
      displayedPages.push(i);
    }
  } else {
    // Always show first page
    displayedPages.push(1);
    
    // Determine start and end of displayed pages
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust to show 3 pages minimum
    if (startPage === 2) endPage = Math.min(4, totalPages - 1);
    if (endPage === totalPages - 1) startPage = Math.max(2, totalPages - 3);
    
    // Add ellipsis if needed before startPage
    if (startPage > 2) displayedPages.push('...');
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      displayedPages.push(i);
    }
    
    // Add ellipsis if needed after endPage
    if (endPage < totalPages - 1) displayedPages.push('...');
    
    // Always show last page
    displayedPages.push(totalPages);
  }
  
  return displayedPages;
}

function renderCards(pokemons) {
  pokemonList.innerHTML = '';
  
  if (pokemons.length === 0) {
    pokemonList.innerHTML = `
      <div class="col-span-full text-center py-10">
        <p class="text-xl text-gray-600">No Pokémon found matching your criteria.</p>
      </div>
    `;
    return;
  }
  
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
    `;
    card.addEventListener('click', () => openModal(p));
    pokemonList.appendChild(card);
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function indexToRoman(num) {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
  return roman[num - 1];
}

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

// DOM Ready: setup modal and tab logic
document.addEventListener('DOMContentLoaded', () => {
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
  
  // Initialize pagination
  genButtonsContainer.querySelector('button').click();
});