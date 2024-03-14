let allPets = [];

document.addEventListener('DOMContentLoaded', function() {
    fetchPets();
});

function fetchPets() {
    fetch('/pets')
    .then(response => response.json())
    .then(pets => {
        allPets = pets;
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

function addFavorite() {
    alert("test");
}