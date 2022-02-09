const totalPrice = document.querySelector('.total-price');
let sumPrices = 0;

async function getContentList(product) {
  const loading = document.createElement('h2');
  loading.className = 'loading';
  loading.innerHTML = 'loading...';
  document.body.appendChild(loading);
  if (product === 'computador') {
    return fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${product}`)
      .then((response) => response.json())
      .then((response) => response.results.map((element) => {
        const item = {
          sku: element.id,
          name: element.title,
          image: element.thumbnail,
        };
        loading.remove();
        return item;
      }));
  }
  throw new Error('Pesquisa deve ser sobre computador');
}

async function getItem(id) {
  return fetch(`https://api.mercadolibre.com/items/${id}`)
  .then((response) => response.json())
  .then((response) => ({
      sku: response.id,
      name: response.title,
      salePrice: response.price,
    }));
}

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function cartItemClickListener(event) {
  // coloque seu código aqui
  event.target.remove();
}

function saveCart(data) {
  const values = JSON.parse(window.localStorage.getItem('cart'));
  const array = values || [];
  if (array.indexOf(data) === -1) {
    array.push(data);
    const newStorageValue = JSON.stringify(array);
    window.localStorage.setItem('cart', newStorageValue);
  }
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  const data = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.className = 'cart__item';
  li.innerText = data;
  saveCart(`<li>${data}</li>`);
  li.addEventListener('click', (event) => {
    sumPrices -= salePrice; 
    totalPrice.innerHTML = sumPrices;
    cartItemClickListener(event);
  });
  return li;
}

function getTotalPrice(price) {
  let result = 0;
  result += price;
  return result;
}

function clearCart() {
  const clearBtn = document.querySelector('.empty-cart');
  const cartItems = document.querySelectorAll('.cart__item');
  clearBtn.addEventListener('click', () => {
    cartItems.forEach((element) => element.remove());
    totalPrice.innerHTML = 0;
  });
}

function addToCart() {
  const listItem = document.querySelectorAll('.item');
  const cart = document.querySelector('.cart__items');
  listItem.forEach((element) => {
    element.lastChild.addEventListener('click', async () => {
      await getItem(getSkuFromProductItem(element))
      .then((data) => {
        cart.appendChild(createCartItemElement(data));
        sumPrices += getTotalPrice(data.salePrice);
        console.log(sumPrices);
        return data;
      });
      totalPrice.innerHTML = sumPrices;
      clearCart();
    });
  });
}

window.onload = () => {
  const items = document.querySelector('.items');
  const cart = document.querySelector('.cart__items');
  const storageItems = window.localStorage.getItem('cart');
  cart.innerHTML = storageItems;
  getContentList('computador')
  .then((data) => {
    data.forEach((element) => {
      items.appendChild(createProductItemElement(element));
    });
  })
  .then(() => {
    addToCart();
  });
};
