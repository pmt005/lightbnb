SELECT properties.city AS name, count(reservations) AS total_reservations
FROM properties
INNER JOIN reservations ON properties.id = property_id
GROUP BY properties.city
ORDER BY count(reservations) DESC
LIMIT 10;