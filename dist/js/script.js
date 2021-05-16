/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },    
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

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
      app.cart.add(thisProduct.prepareCartProduct());
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

  class AmountWidget{
    constructor(element){
      const thisWidget = this;
      
      thisWidget.value = settings.amountWidget.defaultValue;

      //console.log('AmountWidget:', thisWidget);
      //console.log('constructor arguments:', element);
      //wywolanie metod
      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
    }

    getElements(element){
      const thisWidget = this;
    
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);

      ///wyrzuciłam thisWidget.value = settings.amountWidget.defaultValue;

      /* TODO Add validation */
      if(thisWidget.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
        thisWidget.value = newValue;
        thisWidget.announce();
      }
      thisWidget.input.value = thisWidget.value;
    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
        
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value -1);
      });
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value +1);
      });
    }
    announce(){
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }

  }

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
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);//referencja do elementu pokazującego delivery cost
      thisCart.dom.subTotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);//referencja do elementu pokazującego cene końcową bez delivery
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);//referencja do elementów pokazujących cene końcową
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);//referencja do elementu pokazującego liczbe sztuk
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
  }

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

  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);
      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },
    initData: function(){
      const thisApp = this;

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);

          /* save parsedResponse as thisApp.data.products */
          thisApp.data.products = parsedResponse;

          /* execute initMenu method */
          thisApp.initMenu();
        });
      console.log('thisApp.data', JSON.stringify(thisApp.data));
    },
    initCart: function(){
      const thisApp = this;
      
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function(){
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
