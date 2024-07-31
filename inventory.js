const products = [];
let cart = [];

function readImage(input, callback) {
  const file = input.files[0];
  const reader = new FileReader();
  reader.onloadend = () => callback(reader.result);
  if (file) reader.readAsDataURL(file);
}

document.getElementById('add-product-form').addEventListener('submit', function(e) {
  e.preventDefault();
  readImage(document.getElementById('product-image'), (imageSrc) => {
    const newProduct = {
      id: Date.now(),
      name: document.getElementById('product-name').value,
      price: document.getElementById('product-price').value,
      stock: parseInt(document.getElementById('product-stock').value, 10),
      variations: document.getElementById('product-variations').value.split(',').map(v => v.trim()),
      image: imageSrc,
      visible: true
    };
    products.push(newProduct);
    displayProducts();
    e.target.reset();
  });
});

document.getElementById('edit-product-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const productId = parseInt(document.getElementById('edit-product-id').value, 10);
  const product = products.find(p => p.id === productId);

  readImage(document.getElementById('edit-product-image'), (imageSrc) => {
    product.name = document.getElementById('edit-product-name').value;
    product.price = document.getElementById('edit-product-price').value;
    product.stock = parseInt(document.getElementById('edit-product-stock').value, 10);
    product.variations = document.getElementById('edit-product-variations').value.split(',').map(v => v.trim());
    if (imageSrc) product.image = imageSrc; // Update image only if a new image is uploaded

    displayProducts();
    document.getElementById('edit-product-form').classList.add('hidden');
    e.target.reset();
  });
});

function displayProducts() {
  const productContainer = document.getElementById('product-list');
  const clientProductContainer = document.getElementById('client-product-list');
  productContainer.innerHTML = '';
  clientProductContainer.innerHTML = '';

  products.forEach(product => {
    const productItem = document.createElement('div');
    productItem.className = 'product-item';
    productItem.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <strong>${product.name}</strong>
      <p>Price: €${product.price}</p>
      <p>Stock: ${product.stock}</p>
      <p>Variations: ${product.variations.join(', ')}</p>
      <button onclick="editProduct(${product.id})">Edit</button>
      <button onclick="toggleVisibility(${product.id})">${product.visible ? 'Hide' : 'Show'}</button>
    `;
    productContainer.appendChild(productItem);

    if (product.visible) {
      const clientProductItem = document.createElement('div');
      clientProductItem.className = 'product-item';
      clientProductItem.draggable = true;
      clientProductItem.ondragstart = (event) => drag(event, product.id);
      clientProductItem.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <strong>${product.name}</strong>
        <p>Price: €${product.price}</p>
        <p>Stock: ${product.stock}</p>
        <select class="variation-select" id="color-select-${product.id}">
          <option value="">Select Color</option>
          ${product.variations.map(variation => `<option value="${variation}">${variation}</option>`).join('')}
        </select>
        <input type="number" placeholder="Size" id="size-input-${product.id}" class="size-input">
        <button onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>Add to Cart</button>
      `;
      clientProductContainer.appendChild(clientProductItem);
    }
  });
}


function editProduct(id) {
  const product = products.find(p => p.id === id);
  document.getElementById('edit-product-id').value = product.id;
  document.getElementById('edit-product-name').value = product.name;
  document.getElementById('edit-product-price').value = product.price;
  document.getElementById('edit-product-stock').value = product.stock;
  document.getElementById('edit-product-variations').value = product.variations.join(', ');
  document.getElementById('edit-product-form').classList.remove('hidden');
}

function toggleVisibility(id) {
  const product = products.find(p => p.id === id);
  product.visible = !product.visible;
  displayProducts();
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  const selectedColor = document.getElementById(`color-select-${id}`).value;
  const selectedSize = document.getElementById(`size-input-${id}`).value;

  if (!selectedColor || !selectedSize) {
    showNotification('Please select both color and size.', 'error');
    return;
  }

  if (product.stock > 0) {
    const cartItem = cart.find(item => item.product.id === id && item.color === selectedColor && item.size === selectedSize);
    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      cart.push({ product, color: selectedColor, size: selectedSize, quantity: 1 });
    }
    product.stock -= 1;
    displayProducts();
    displayCart();
    checkStockLevels(product);
  } else {
    showNotification('This product is out of stock!', 'error');
  }
}

function removeFromCart(id, color, size) {
  const cartItemIndex = cart.findIndex(item => item.product.id === id && item.color === color && item.size === size);
  if (cartItemIndex !== -1) {
    const cartItem = cart[cartItemIndex];
    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
    } else {
      cart.splice(cartItemIndex, 1);
    }
    cartItem.product.stock += 1;
    displayProducts();
    displayCart();
    checkStockLevels(cartItem.product);
  }
}

function displayCart() {
  const cartContainer = document.getElementById('cart');
  cartContainer.innerHTML = '';
  let totalCost = 0;

  cart.forEach(cartItem => {
    const { product, color, size, quantity } = cartItem;
    const cartItemElement = document.createElement('div');
    cartItemElement.className = 'product-item';
    cartItemElement.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <strong>${product.name}</strong>
      <p>Color: ${color}</p>
      <p>Size: ${size}</p>
      <p>Price: €${product.price}</p>
      <p>Quantity: ${quantity}</p>
      <button onclick="removeFromCart(${product.id}, '${color}', '${size}')">Remove</button>
    `;
    cartContainer.appendChild(cartItemElement);
    totalCost += product.price * quantity;
  });

  const totalCostElement = document.createElement('div');
  totalCostElement.className = 'total-cost';
  totalCostElement.innerHTML = `<strong>Total Cost: €${totalCost.toFixed(2)}</strong>`;
  cartContainer.appendChild(totalCostElement);
}

function initiateCheckout() {
  const modal = document.getElementById('checkout-modal');
  const summary = document.getElementById('checkout-summary');
  const totalElement = document.getElementById('checkout-total');
  summary.innerHTML = '';

  let totalCost = 0;

  cart.forEach(cartItem => {
    const { product, color, size, quantity } = cartItem;
    const summaryItem = document.createElement('div');
    summaryItem.className = 'summary-item';
    summaryItem.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="summary-details">
        <strong>${product.name}</strong>
        <p>Color: ${color}</p>
        <p>Size: ${size}</p>
        <p>Price: €${product.price}</p>
        <p>Quantity: ${quantity}</p>
      </div>
    `;
    summary.appendChild(summaryItem);
    totalCost += product.price * quantity;
  });

  totalElement.innerHTML = `Total Cost: €${totalCost.toFixed(2)}`;

  modal.classList.remove('hidden');
}

function confirmCheckout() {
  showNotification('Checkout successful!', 'success');
  cart = [];
  displayCart();
  closeModal();
}

function closeModal() {
  const modal = document.getElementById('checkout-modal');
  modal.classList.add('hidden');
}

function showNotification(message, type) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.remove('hidden');
  setTimeout(() => {
    notification.classList.add('hidden');
  }, 3000);
}

function checkStockLevels(product) {
  if (product.stock <= 5) {
    showNotification(`Low stock alert: Only ${product.stock} units left of ${product.name}`, 'warning');
  }
}

function allowDrop(event) {
  event.preventDefault();
}

function drag(event, id) {
  event.dataTransfer.setData("text", id);
}

function drop(event) {
  event.preventDefault();
  const productId = event.dataTransfer.getData("text");
  addToCart(Number(productId));
}

displayProducts();
