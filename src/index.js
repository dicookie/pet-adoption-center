require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db/index');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const port = 3000;

const fs = require('fs').promises;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', './views');

const sequelize = new Sequelize(process.env.DATABASE_URL);

const Pet = sequelize.define('Pet', {
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    age: DataTypes.STRING,
    size: DataTypes.STRING,
    description: {
        type: DataTypes.STRING(1000),
        allowNull: false
    },
    photoUrl: DataTypes.STRING
});

const Favorite = sequelize.define('Favorite', {
    petId: {
        type: DataTypes.INTEGER,
        references: {
            model: Pet,
            key: 'id',
        }
    },
}, {
    tableName: 'Favorites'
});

Favorite.belongsTo(Pet, { foreignKey: 'petId' });

async function seedPetsData() {
    try {
        const data = await fs.readFile('./public/pets.json', 'utf8');
        const pets = JSON.parse(data);
        
        await Pet.sync({ force: true });

        await Pet.bulkCreate(pets);
        
        console.log('Pets data seeded successfully');
    } catch (error) {
        console.error('Failed to seed pets data:', error);
    }
}

async function seedFavoritesData() {
    try {
        
        await Favorite.sync({ force: true });

        console.log('Favorites table created/updated successfully');
    } catch (error) {
        console.error('Failed to sync Favorites table:', error);
    }
}

(async () => {
    try {
        await sequelize.sync({ force: true });
        await seedPetsData();
        await seedFavoritesData();

        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to initialize server:', error);
    }
})();

async function getPetsDataFromDB() {
    try {
        const pets = await Pet.findAll();
        return pets;
    } catch (error) {
        console.error('Failed to fetch pets data from the database:', error);
        return [];
    }
}

async function getFavDataFromDB() {
    try {
        const favorites  = await Favorite.findAll({ include: Pet });
        return favorites ;
    } catch (error) {
        console.error('Failed to fetch fav data from the database:', error);
        return [];
    }
}

app.get('/', async (req, res) => {
    const pets = await getPetsDataFromDB();
    res.render('index', { pets });
});

app.get('/adopt', async (req, res) => {
    res.render('application');
});

app.get('/contact', async (req, res) => {
    res.render('contact');
});

app.get('/about', async (req, res) => {
    res.render('about');
});

app.get('/favorite', async (req, res) => {
    try {
        const favorites = await getFavDataFromDB();
        res.render('fav', { favorites });
    } catch (error) {
        console.error('Failed to fetch fav data from the database:', error);
        res.status(500).send('Internal server error');
    }
});



app.get('/pets', async (req, res) => {
    try {
        const pets = await getPetsDataFromDB();
        res.json(pets);
    } catch (error) {
        console.error('Failed to fetch pets data from the database:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/pets/details/:petName', async (req, res) => {
    const petName = req.params.petName;
    try {
        const pet = await Pet.findOne({ where: { name: petName } });
        if (pet) {
            res.render('details', { pet });
        } else {
            res.status(404).send('Pet not found');
        }
    } catch (error) {
        console.error('Failed to fetch pet details:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/submit_application_endpoint', async (req, res) => {
    const { firstName, phoneNumber, emailAddress, petChoice, additionalNote } = req.body;
    try {
        const query = 'INSERT INTO applications (firstName, phoneNumber, emailAddress, petChoice, additionalNote) VALUES ($1, $2, $3, $4, $5)';
        await pool.query(query, [firstName, phoneNumber, emailAddress, petChoice, additionalNote]);
        console.log('Application submitted successfully');
        res.redirect('/success-page');
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/success-page', (req, res) => {
    res.render('success-page');
});
  

app.post('/add-favorite/:petId', async (req, res) => {
    const { petId } = req.params;
    try {
        await Favorite.create({ petId: petId});
        res.json({ success: true, message: "Pet added to favorites successfully" });
    } catch (error) {
        console.error('Failed to add favorite:', error);
        res.status(500).json({ success: false, message: "Failed to add pet to favorites" });
    }
});

app.delete('/delete-favorite/:petId', async (req, res) => {
    const { petId } = req.params;
    try {
        const deletedFavorite = await Favorite.destroy({ where: { petId } });
        if (deletedFavorite) {
            res.json({ success: true, message: "Pet deleted from favorites successfully" });
        } else {
            res.status(404).json({ success: false, message: "Pet not found in favorites" });
        }
    } catch (error) {
        console.error('Error deleting favorite:', error);
        res.status(500).json({ success: false, message: "Failed to delete pet from favorites" });
    }
});

