'use strict';
const axios = require('axios');
const crypto = require('crypto'); // Para anonimizar IPs

let ipSet = new Set(); // Conjunto para almacenar IPs que ya han dado like

// Función para anonimizar IP
function anonymizeIP(ip) {
  const hash = crypto.createHash('sha256');
  hash.update(ip);
  return hash.digest('hex').slice(0, 16); // Genera un hash truncado de la IP
}

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(function (req, res) {
      const stocks = req.query.stock;
      const like = req.query.like === 'true'; // Validar si se quiere dar like
      const stockArray = Array.isArray(stocks) ? stocks : [stocks]; // Asegurar que stocks sea un array
      const ip = req.ip; // Obtener la IP del cliente

      // Anonimizar IP
      const anonymizedIp = anonymizeIP(ip);

      // Lógica para obtener el precio de las acciones y manejar "likes"
      const fetchStockData = async () => {
        const stockData = await Promise.all(stockArray.map(async (stock) => {
          const response = await axios.get(`https://api.example.com/stock/${stock}`); // URL de la API externa
          const price = response.data.price;

          let likes = 0;
          if (like && !ipSet.has(anonymizedIp)) {
            likes = 1; // Solo un like por IP
            ipSet.add(anonymizedIp); // Guardar la IP
          }

          return { stock, price, likes };
        }));

        // Si hay más de una acción, se calcula la diferencia de likes
        if (stockData.length > 1) {
          const [stock1, stock2] = stockData;
          const rel_likes = stock1.likes - stock2.likes;
          stockData[0].rel_likes = rel_likes;
          stockData[1].rel_likes = rel_likes;
        }

        return stockData;
      };

      fetchStockData()
        .then(data => res.json({ stockData: data }))
        .catch(err => res.status(500).send('Error fetching stock data'));
    });
};
