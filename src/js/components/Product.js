import {select, templates, classNames} from './settings.js';
import utils from './utils.js';
import AmountWidget from './components/AmountWidget.js';


class Product{
  constructor(id, data){
    const thisProduct = this;
    thisProduct.id = id; 
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    //console.log('new Product:', thisProduct);
  }
    
  renderInMenu(){
    const thisProduct = this;
    const generatedHTML = templates.menuProduct(thisProduct.data);
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    const menuContainer = document.querySelector(select.containerOf.menu);
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;
    
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    //console.log(thisProduct.accordionTrigger);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    //console.log(thisProduct.form);

    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    //console.log(thisProduct.formInputs);
    //w console.log wyswietla sie NodeList?nie wiem co to jest
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    //console.log(thisProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    //console.log(thisProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    //console.log(thisProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    //console.log(thisProduct.amountWidget);
  }
  
  initAccordion(){
    const thisProduct = this;
    thisProduct.accordionTrigger.addEventListener('click', function(event) {
      event.preventDefault();
      const activeProduct = document.querySelector(select.all.menuProductsActive);
      //console.log(this);
      //console.log(thisProduct);

      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if (activeProduct !== null && activeProduct !== thisProduct.element){
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }  
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
    });
  }

  initOrderForm(){
    const thisProduct = this;
    //console.log('initOrderForm'); //informujący o nazwie metody w której się znajduje??
    
    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
      
    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
      
    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder() {
    const thisProduct = this;

    //console.log('processOrder'); //pokazuje sie w konsoli kiedy klikne add to cart
    
    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData', formData);
    
    let price = thisProduct.data.price;
    
    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      //console.log(paramId, param);
      //console.log(paramId);
      //console.log (param);
    
      for(let optionId in param.options) {// nazwa stałej.klucz obiektu ??
        const option = param.options[optionId];
        
        //console.log(option);
        //console.log(param.options);
        //console.log(optionId);
          
        // check if there is param with a name of paramId in formData and if it includes optionId
        if(formData[paramId] && formData[paramId].includes(optionId)) {
          if(option.default !== true) {
            price+=option.price;
          }
        } else {
          if(option.default == true) {
            price-=option.price;
          }
        }
        const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId +'-' + optionId);
        //console.log(optionImage);

        if(optionImage){ 
          if(formData[paramId] && formData[paramId].includes(optionId)){
            
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          } else {
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }  
    }
    //multiply price by amount
    thisProduct.priceSingle = price;
    price *= thisProduct.amountWidget.value;// correct wrong order
    thisProduct.priceElem.innerHTML = price;
  }

  initAmountWidget(){
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget (thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }

  addToCart(){
    const thisProduct = this;

    //thisProduct.name = thisProduct.data.name;
    //thisProduct.amount = thisProduct.amountWidget.value;
    
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      }
    });
    thisProduct.element.dispatchEvent(event);
  }

  prepareCartProduct(){
    const thisProduct = this;
    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.priceSingle * thisProduct.amountWidget.value,
      params: thisProduct.prepareCartProductParams(),
    };
    return productSummary;
  }
  prepareCartProductParams(){
    const thisProduct = this;
    
    const formData = utils.serializeFormToObject(thisProduct.form);
    const params = {};
    
    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      params[paramId] = {
        label: param.label,
        options: {},
      };
    
      for(let optionId in param.options) {// nazwa stałej.klucz obiektu
        const option = param.options[optionId];
        if(formData[paramId] && formData[paramId].includes(optionId)) {
          params[paramId].options[optionId] = option.label;// nazwa stałej.klucz obiektu
        } 
      }  
    }
    return params;
  }
}
export default Product;