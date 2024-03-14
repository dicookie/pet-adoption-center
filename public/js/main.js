let allPets = [];

document.addEventListener('DOMContentLoaded', function() {
    fetchPets();
});

function fetchPets() {
    fetch('/pets') 
    .then(response => response.json())
    .then(pets => {
        allPets = pets; 
        displayPets(pets); 
        populatePetDropdown(pets); 
    })
    .catch(error => console.error('Error loading pets:', error));
}

function populatePetDropdown(pets) {
    const dropdown = document.getElementById('petChoice');
    pets.forEach(pet => {
        const option = document.createElement('option');
        option.value = pet.name;
        option.textContent = pet.name;
        dropdown.appendChild(option);
    });
}

function displayPets(pets) {
    const petsList = document.getElementById('pets-list');
    petsList.innerHTML = ''; 
    pets.forEach(pet => {
        const petElement = document.createElement('div');
        petElement.className = 'pet';
        petElement.innerHTML = `
            <h3>${pet.name}</h3>
            <a href="pets/details/${encodeURIComponent(pet.name)}">
                <img src="${pet.photoUrl}" alt="${pet.name}">
            </a>
        `;
        petsList.appendChild(petElement);
    });
}

function applyFilters() {
    const typeFilter = document.getElementById('type').value;
    const ageFilter = document.getElementById('age').value;
    const sizeFilter = document.getElementById('size').value;

    const filteredPets = allPets.filter(pet => {
        return (typeFilter === 'All' || pet.type === typeFilter) &&
               (ageFilter === 'All' || pet.age === ageFilter) &&
               (sizeFilter === 'All' || pet.size === sizeFilter);
    });

    displayPets(filteredPets);
}
