const express = require('express');
const { ObjectID } = require('mongodb'); // Make sure to import ObjectID
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); // Import your authentication middleware

module.exports = (db) => { // Pass the database connection as an argument

  // GET all services
  router.get('/', async (req, res) => {
    try {
      const services = await db.collection('services').find().toArray();
      res.json(services);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  // POST a new service
  router.post('/', authMiddleware.authenticateJWT, authMiddleware.authorizeAdmin, async (req, res) => {
    try {
      const newService = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        imageUrl: req.body.imageUrl,
        category: req.body.category,
      };
      const result = await db.collection('services').insertOne(newService);
      res.status(201).json(result.ops[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  // PUT to update an existing service
  router.put('/:id', authMiddleware.authenticateJWT, authMiddleware.authorizeAdmin, async (req, res) => {
    try {
      const serviceId = req.params.id;
      const updatedService = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        imageUrl: req.body.imageUrl,
        category: req.body.category,
      };
      const result = await db.collection('services').updateOne({ _id: new ObjectID(serviceId) }, { $set: updatedService });
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Service not found' });
      }
      
      res.json({ message: 'Service updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  // DELETE a service
  router.delete('/:id', authMiddleware.authenticateJWT, authMiddleware.authorizeAdmin, async (req, res) => {
    try {
      const serviceId = req.params.id;
      const result = await db.collection('services').deleteOne({ _id: new ObjectID(serviceId) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Service not found' });
      }

      res.json({ message: 'Service deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  return router;
};
