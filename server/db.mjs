import NeDB from 'nedb';

// Items Database
const itemsDb = new NeDB({
  filename: './data/items.db',
  autoload: true,
});

// Categories Database
const categoriesDb = new NeDB({
  filename: './data/categories.db',
  autoload: true,
});

// Ensure indexes
itemsDb.ensureIndex({ fieldName: 'name', unique: false });
categoriesDb.ensureIndex({ fieldName: 'category', unique: true });

// CRUD Helper Functions
const findAllItems = (query = {}) => {
  return new Promise((resolve, reject) => {
    itemsDb.find(query).exec((err, docs) => {
      if (err) reject(err);
      else resolve(docs);
    });
  });
};

const insertItem = item => {
  return new Promise((resolve, reject) => {
    itemsDb.insert(item, (err, newDoc) => {
      if (err) reject(err);
      else resolve(newDoc);
    });
  });
};

const updateItem = (id, updates) => {
  return new Promise((resolve, reject) => {
    itemsDb.update({ _id: id }, { $set: updates }, {}, (err, numReplaced) => {
      if (err) reject(err);
      else resolve(numReplaced);
    });
  });
};

const deleteItem = id => {
  return new Promise((resolve, reject) => {
    itemsDb.remove({ _id: id }, {}, (err, numRemoved) => {
      if (err) reject(err);
      else resolve(numRemoved);
    });
  });
};

const findAllCategories = (query = {}) => {
  return new Promise((resolve, reject) => {
    categoriesDb.find(query).exec((err, docs) => {
      if (err) reject(err);
      else resolve(docs);
    });
  });
};

const insertCategory = category => {
  return new Promise((resolve, reject) => {
    categoriesDb.insert(category, (err, newDoc) => {
      if (err) reject(err);
      else resolve(newDoc);
    });
  });
};

// Export CRUD operations
export { insertItem, findAllItems, updateItem, deleteItem, insertCategory, findAllCategories };