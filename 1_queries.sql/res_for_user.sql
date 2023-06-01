SELECT reservations.id, properties.title, properties.cost_per_night,
reservations.start_date, avg(property_reviews.rating) AS average_rating
FROM reservations
INNER JOIN properties ON properties.id = reservations.property_id
INNER JOIN property_reviews ON property_reviews.property_id = properties.id
WHERE reservations.guest_id = 56
GROUP BY properties.id, reservations.id
ORDER BY reservations.start_date
LIMIT 10;
