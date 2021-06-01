import {select} from './settings.js';
import AmountWidget from './components/AmountWidget.js';
class CartProduct{
  constructor(menuProduct, element) {
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id,
    thisCartProduct.name = menuProduct.name,
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.priceSingle = menuProduct.priceSingle,
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.params = menuProduct.params;

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
    console.log(thisCartProduct);
  }
  getElements(element){
    const thisCartProduct = this;
    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = element.querySelector(select.cartProduct.price); //element zdefiniowany powyzej wiec moge go tu zastos
    thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
  }

  initAmountWidget(){
    const thisCartProduct = this;
    thisCartProduct.amountWidget = new AmountWidget (thisCartProduct.dom.amountWidget);
    thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    });
  }

  remove(){
    const thisCartProduct = this;
    const event = new CustomEvent ('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });
    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }

  initActions(){
    const thisCartProduct = this;
    thisCartProduct.dom.edit.addEventListener('click', function(event){
      event.preventDefault();
    });
    thisCartProduct.dom.remove.addEventListener('click', function(event){
      event.preventDefault();
      thisCartProduct.remove();
    });
  }
  getData(){
    const thisCartProduct = this;
    const getProducts = {
      id: thisCartProduct.id,
      name: thisCartProduct.name,
      amount: thisCartProduct.amount,
      priceSingle: thisCartProduct.priceSingle,
      price: thisCartProduct.price,
      params: thisCartProduct.params,
    };
    return getProducts;
  }

}
export default CartProduct;