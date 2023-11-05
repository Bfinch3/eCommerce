const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const categories = await Category.findAll({
      include: [{ model: Product, as: 'products' }]
    });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const category = await Category.findOne({
      where: { id: req.params.id },
      include: [{ model: Product, as: 'products' }]
    });
    if (!category) {
      res.status(404).json({ message: 'No category found with this id!' });
      return;
    }
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new category
  Category.create({ category_name: req.body.category_name })
    .then((category) => {
      if (req.body.product_ids && req.body.product_ids.length) {
        const updates = req.body.product_ids.map((productId) => {
          return Product.update({ category_id: category.id }, { where: { id: productId } });
        });
        // Execute all the updates
        return Promise.all(updates).then(() => category);
      }
      // If no product_ids provided, just return the category
      return category;
    })
    .then((category) => res.status(200).json(category))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.put('/:id', (req, res) => {
  Category.update(req.body, {
    where: { id: req.params.id }
  })
    .then(() => {
      if (req.body.product_ids && req.body.product_ids.length) {
        // Update products to associate them with the new category
        const updatePromises = req.body.product_ids.map(productId =>
          Product.update({ category_id: req.params.id }, { where: { id: productId } })
        );

        // Execute all update promises
        return Promise.all(updatePromises);
      } else {
        return Promise.resolve();
      }
    })
    .then(() => {
      // After all operations, fetch the updated category
      return Category.findByPk(req.params.id);
    })
    .then(updatedCategory => {
      res.json(updatedCategory);
    })
    .catch(err => {
      console.error(err);
      res.status(400).json(err.message);
    });
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try {
    const categoryData = await Category.destroy({
      where: {
        id: req.params.id
      }
    });
    if (!categoryData) {
      res.status(404).json({ message: 'No category found with this id!' });
      return;
    }
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
