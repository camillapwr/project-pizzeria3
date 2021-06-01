import {settings, select, templates, classNames} from './settings.js';
import utils from './utils.js';
import CartProduct from './components/CartProduct.js';
class Cart{
  constructor(element){
    const thisCart = this;
    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
    // console.log('new Cart', thisCart);
  }
  getElements(element){
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = element.querySelector(select.cart.toggleTrigger);//element zdefiniowany powyzej wiec moge go tu zastos
    thisCart.dom.productList = element.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);//referencja do elementu pokazującego delivery cost
    thisCart.dom.subTotalPrice = element.querySelector(select.cart.subtotalPrice);//referencja do elementu pokazującego cene końcową bez delivery
    thisCart.dom.totalPrice = element.querySelectorAll(select.cart.totalPrice);//referencja do elementów pokazujących cene końcową
    thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber);//referencja do elementu pokazującego liczbe sztuk
    thisCart.dom.form = element.querySelector(select.cart.form);//referencja do elementu formularza
    thisCart.dom.formPhone = thisCart.dom.form.querySelector(select.cart.phone);//referencja do inputa telefonu formularza
    thisCart.dom.formAddress = thisCart.dom.form.querySelector(select.cart.address);//referencja do inputa adresu w formularzu
  }
  initActions(){
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function(event){
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  add(menuProduct){
    const thisCart = this;
    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(generatedDOM);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
    console.log('thisCart.products', thisCart.products); 
  }

  update(){
    const thisCart = this;
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0;
    thisCart.subTotalPrice = 0;

    for(let product of thisCart.products){
      thisCart.totalNumber = thisCart.totalNumber + product.amount;
      thisCart.subTotalPrice = thisCart.subTotalPrice + product.price;
    }
    if (thisCart.totalNumber !== 0){
      thisCart.totalPrice = thisCart.subTotalPrice + thisCart.deliveryFee;
    } if (thisCart.totalNumber == 0){
      thisCart.totalPrice = 0;
    }
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.subTotalPrice.innerHTML = thisCart.subTotalPrice;
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    for(let price of thisCart.dom.totalPrice){
      price.innerHTML = thisCart.totalPrice;
    }

    console.log(thisCart.deliveryFee, thisCart.totalNumber);
    console.log(thisCart.subTotalPrice, thisCart.totalPrice);
  }
  remove(cartProduct){
    const thisCart = this;
    const indexOfProduct = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(indexOfProduct, 1);

    cartProduct.dom.wrapper.remove();
    thisCart.update();
  }

  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;
    const payload = {
      address: thisCart.dom.formAddress.value,
      phone: thisCart.dom.formPhone.value,
      totalPrice: thisCart.totalPrice,
      subTotalPrice: thisCart.subTotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
      
    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });
  }
}
export default Cart;