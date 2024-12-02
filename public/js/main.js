let categoriesData;

(async () => {
  try {
    categoriesData = await fetchCategories();
    populateAddCategoryDropdown('item-category');
    populateAddCategoryDropdown('filter-category');
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }
})();


async function fetchItems() {
  try {
    const response = await fetch('/api/items');
    const items = await response.json();
    displayItems(items);
  } catch (error) {
    showAlert(`Error fetching items: ${error.message}`, true);
  }
}

async function fetchCategories() {
  try {
    const response = await fetch('/api/categories');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.map(category => category.category);
  } catch (error) {
    console.error("Error fetching categories:", error);
    showAlert(`Error loading categories: ${error.message}`, true);
    return [];
  }
}

async function displayItems(items) {
  const itemsTableBody = document.getElementById('items-table').getElementsByTagName('tbody')[0];
  itemsTableBody.innerHTML = '';

  const [itemsData, categoriesData] = await Promise.all([
    Promise.resolve(items),
    fetchCategories() //Not needed here, fetched once globally
  ]).catch(error => {
    showAlert("Error loading data!", true);
    return [[], []];
  });

  if (!itemsData || !categoriesData) {
      console.error("Items or categories data not available.");
      return;
  }

  itemsData.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="item-display">${item.name}</td>
      <td class="item-display">${item.quantity}</td>
      <td class="item-display">${item.category}</td>
      <td class="item-display">
        <span class="edit-icon" data-id="${item._id}">
          <i class="fas fa-edit"></i>
        </span>
      </td>
      <td class="item-display">
        <span class="delete-icon" data-id="${item._id}">
          <i class="fas fa-trash"></i>
        </span>
      </td>
    `;
    itemsTableBody.appendChild(row);
  });
}

function createEditForm(item, categoriesData) {
  const editForm = document.createElement('tr');
  editForm.classList.add('edit-form');
  editForm.innerHTML = `
    <td colspan="5">
      <input type="text" value="${item.name}" id="edit-name-${item._id}">
      <input type="number" value="${item.quantity}" id="edit-quantity-${item._id}">
      <select id="edit-category-${item._id}">
        ${categoriesData.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
      </select>
      <button class="save-item" data-id="${item._id}">Save</button>
      <button class="cancel-edit" data-id="${item._id}">Cancel</button>
    </td>
  `;
  return editForm;
}

async function editItem(element) {
  const row = element.closest('tr');
  const itemId = element.dataset.id;

  const item = {
    _id: itemId,
    name: row.querySelector('.item-display:first-child').textContent,
    quantity: row.children[1].textContent,
    category: row.children[2].textContent
  };
  const editForm = createEditForm(item, categoriesData); 

  row.parentElement.replaceChild(editForm, row);
  editForm.dataset.originalRow = JSON.stringify(item);
}

async function saveEditItem(element) {
  const editForm = element.closest('tr');
  const itemId = element.dataset.id;
  const originalItemData = JSON.parse(editForm.dataset.originalRow);

  const editedName = editForm.querySelector(`#edit-name-${itemId}`).value;
  const editedQuantity = editForm.querySelector(`#edit-quantity-${itemId}`).value;
  const editedCategory = editForm.querySelector(`#edit-category-${itemId}`).value;

  const updatedItem = {
    _id: itemId,
    name: editedName,
    quantity: editedQuantity,
    category: editedCategory
  };

  try {
    await fetch(`/api/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedItem)
    });
    showAlert('Item updated!');
    const newRow = createRow(updatedItem);
    editForm.parentElement.replaceChild(newRow, editForm);
  } catch (error) {
    showAlert(`Error updating item: ${error.message}`, true);
  }
}

function createRow(item){
  const row = document.createElement('tr');
    row.innerHTML = `
      <td class="item-display">${item.name}</td>
      <td class="item-display">${item.quantity}</td>
      <td class="item-display">${item.category}</td>
      <td class="item-display">
        <span class="edit-icon" data-id="${item._id}">
          <i class="fas fa-edit"></i>
        </span>
      </td>
      <td class="item-display">
        <span class="delete-icon" data-id="${item._id}">
          <i class="fas fa-trash"></i>
        </span>
      </td>
    `;
    return row;
}

function cancelEditItem(element) {
  const editForm = element.closest('tr');
  const originalItemData = JSON.parse(editForm.dataset.originalRow);
  const newRow = createRow(originalItemData);
  editForm.parentElement.replaceChild(newRow, editForm);
}

async function deleteItem(element) {
  const id = element.dataset.id;

  try {
    await fetch(`/api/items/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    showAlert('Item deleted!');
    const row = document.querySelector(`tr:has(span[data-id="${id}"])`);
    row.remove();
  } catch (error) {
    showAlert(`Error deleting item: ${error.message}`, true);
  }
}

async function addItem() {
  const itemName = document.getElementById('item-name').value;
  const itemQuantity = document.getElementById('item-quantity').value;
  const itemCategory = document.getElementById('item-category').value;

  const newItem = {
    name: itemName,
    quantity: itemQuantity,
    category: itemCategory
  };
  console.log("Add item function:" + JSON.stringify(newItem));
  try {
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      
      body: JSON.stringify(newItem),
    });

    if (response.ok) {
      showAlert('Item added!');
      fetchItems(); 
    }else if(!response.ok){
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    showAlert(`Error adding item: ${error.message}`, true);
  }
}

function sortItems(column, order) {
  const table = document.getElementById('items-table');
  const rows = Array.from(table.querySelectorAll('tbody tr'));

  rows.sort((a, b) => {
    let aValue = a.cells[column].textContent.trim();
    let bValue = b.cells[column].textContent.trim();

    // Check if the column should be treated as numeric
    if (column === 1) { // Assuming column 1 (second column) is numeric
      aValue = parseFloat(aValue) || 0; // Convert to number, default to 0 if invalid
      bValue = parseFloat(bValue) || 0;
    } else {
      aValue = aValue.toLowerCase(); // Treat other columns as text
      bValue = bValue.toLowerCase();
    }

    if (order === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  table.querySelector('tbody').innerHTML = '';
  rows.forEach(row => table.querySelector('tbody').appendChild(row));
}

function populateAddCategoryDropdown(element){
    const categorySelect = document.getElementById(element);
    if(element === 'filter-category'){
      categorySelect.innerHTML = '<option value="all">All</option>'; // Add "All" option
    }
    if (categorySelect) {
        categoriesData.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.text = cat;
            categorySelect.appendChild(option);
        });
    } else {
        console.error("Select element with ID 'category' not found.");
    }
}

function filterItems() {
  const filterText = document.getElementById('filter-name').value.toLowerCase();
  const table = document.getElementById('items-table');
  const rows = Array.from(table.querySelectorAll('tbody tr'));

  rows.forEach(row => {
    const itemName = row.cells[0].textContent.toLowerCase(); // Assuming the item name is in the first column
    if (itemName.includes(filterText)) {
      row.style.display = ''; // Show the row
    } else {
      row.style.display = 'none'; // Hide the row
    }
  });
}

function filterItemsByCategory() {
  const selectedCategory = document.getElementById('filter-category').value.toLowerCase();
  const table = document.getElementById('items-table');
  const rows = Array.from(table.querySelectorAll('tbody tr'));

  rows.forEach(row => {
    const itemCategory = row.cells[2].textContent.toLowerCase(); // Assuming category is in the third column
    if (selectedCategory === 'all' || itemCategory === selectedCategory) {
      row.style.display = ''; // Show the row if category matches or 'all' is selected
    } else {
      row.style.display = 'none'; // Hide the row if category doesn't match
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const table = document.getElementById('items-table');
  if (table) {
    table.addEventListener('click', (event) => {
      let targetElement = event.target;

      if (targetElement.tagName === 'I') {
        targetElement = targetElement.parentElement;
      }

      if (targetElement.classList.contains('edit-icon')) {
        editItem(targetElement);
      } else if (targetElement.classList.contains('delete-icon')) {
        deleteItem(targetElement);
      } else if (targetElement.classList.contains('save-item')) {
        saveEditItem(targetElement);
      } else if (targetElement.classList.contains('cancel-edit')) {
        cancelEditItem(targetElement);
      }
    });

    fetchItems();
  } else {
    console.error("Table element with ID 'items-table' not found.");
  } 
  document.getElementById('filter-category').addEventListener('change', filterItemsByCategory);
  document.getElementById('filter-name').addEventListener('input', filterItems);
  document.getElementById('add-item-button').addEventListener('click', addItem);
  document.getElementById('sort-name').addEventListener('click', function () {
    const button = this;
    const currentOrder = button.getAttribute('data-order');
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    button.setAttribute('data-order', newOrder);
    sortItems(0, newOrder);
  });
  
  document.getElementById('sort-quantity').addEventListener('click', function () {
    const button = this;
    const currentOrder = button.getAttribute('data-order');
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    button.setAttribute('data-order', newOrder);
    sortItems(1, newOrder);
  });
  
  document.getElementById('sort-category').addEventListener('click', function () {
    const button = this;
    const currentOrder = button.getAttribute('data-order');
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    button.setAttribute('data-order', newOrder);
    sortItems(2, newOrder);
  });  
});


function showAlert(message, isError = false) {
  const alertDiv = document.createElement('div');
  alertDiv.classList.add('alert');
  if (isError) alertDiv.classList.add('error');
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}