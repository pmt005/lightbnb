const { Pool } = require('pg');
//const properties = require("./json/properties.json");
//const users = require("./json/users.json");

const pool = new Pool({
  user: 'patricktumu',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

// the following assumes that you named your connection variable `pool`
//pool.query(`SELECT title FROM properties LIMIT 10;`).then(response => {console.log(response)})


/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithEmail = function(email) {
  return pool
    .query(`SELECT * FROM users WHERE email = $1`, [email])
    .then((result) => {
      console.log(result.rows);
      return (result.rows[0] || null);
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool
    .query(`SELECT * FROM users WHERE id = $1`, [id])
    .then((result) => {
      console.log(result.rows);
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */

const addUser = function(user) {

  return pool
    .query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *;`, [user.name, user.email, user.password])
    //.query(`INSERT INTO users (name, email, password) VALUES ('patrick', 'u@u.com','password' )`)
    .then((result) => {
      //console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err);
    });
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  const queryString = `SELECT (reservations.*), (properties.*)
                       FROM reservations
                       JOIN properties ON reservations.property_id = properties.id
                       WHERE guest_id = $1  
                       LIMIT $2;`;

  return pool
    .query(queryString, [guest_id, limit])
    .then((result) => {
      //console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {
  let queryString = `SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id `;
  const queryValues = [];
  if (options.city) {
    queryValues.push(`%${options.city}%`);
    queryString += `
    WHERE city LIKE $${queryValues.length} `;
  }

  if (options.owner_id) {
    queryValues.push(options.owner_id);
    queryString += `AND properties.owner_id = $${queryValues.length} `;
  }

  if (options.minimum_price_per_night) {
    queryValues.push(options.minimum_price_per_night);
    queryString += `AND cost_per_night > $${queryValues.length} `;
  }

  if (options.maximum_price_per_night) {
    queryValues.push(options.maximum_price_per_night);
    queryString += `AND cost_per_night < $${queryValues.length} `;
  }

  if (options.minimum_rating) {
    queryValues.push(options.minimum_rating);
    queryString += `AND rating > $${queryValues.length} `;
  }

  queryValues.push(limit);
  queryString +=  `GROUP BY properties.id
                   ORDER BY cost_per_night
                   LIMIT $${queryValues.length};`;
  

  return pool
    .query(queryString, queryValues)
    .then((result) => {
      
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const queryValues = [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.street, property.city, property.province, property.post_code, property.country, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms];

  let queryString = `
  INSERT INTO properties
  (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  RETURNING *;
  `;

  console.log(queryString, queryValues);
  
  return pool
    .query(queryString, queryValues)
    .then((result) => {
      //console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
//VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *;`