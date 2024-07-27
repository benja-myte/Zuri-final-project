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
      clientProductItem.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <strong>${product.name}</strong>
        <p>Price: €${product.price}</p>
        <p>Stock: ${product.stock}</p>
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
  if (product.stock > 0) {
    const cartItem = cart.find(item => item.product.id === id);
    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      cart.push({ product, quantity: 1 });
    }
    product.stock -= 1;
    displayProducts();
    displayCart();
    checkStockLevels(product);
  } else {
    alert('This product is out of stock!');
  }
}

function removeFromCart(id) {
  const cartItemIndex = cart.findIndex(item => item.product.id === id);
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
    const { product, quantity } = cartItem;
    const cartItemElement = document.createElement('div');
    cartItemElement.className = 'product-item';
    cartItemElement.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <strong>${product.name}</strong>
      <p>Price: €${product.price}</p>
      <p>Quantity: ${quantity}</p>
      <button onclick="removeFromCart(${product.id})">Remove</button>
    `;
    cartContainer.appendChild(cartItemElement);
    totalCost += product.price * quantity;
  });

  const totalElement = document.createElement('div');
  totalElement.className = 'product-item';
  totalElement.innerHTML = `<strong>Total: €${totalCost.toFixed(2)}</strong>`;
  cartContainer.appendChild(totalElement);
}

function checkout() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  alert('Thank you for your purchase!');
  cart = [];
  displayCart();
  displayProducts();
}

function checkStockLevels(product) {
  const lowStockThreshold = 5; // You can set this threshold to any value
  if (product.stock <= lowStockThreshold) {
    alert(`Warning: Stock for ${product.name} is low (only ${product.stock} left)!`);
  }
}

displayProducts();
