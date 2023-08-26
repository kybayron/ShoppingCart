const InvalidItemException = require('../exceptions/InvalidItemException');

class ShoppingCart {
  constructor(pricingRules) {
    this.pricingRules = pricingRules;
    this.items = {};
    this.total = 0;
  }

  #addProductToCart = (item) => {
    const { products } = this.pricingRules;
    if (products[item] === undefined) {
      throw new InvalidItemException(item);
    }

    const cartItems = this.items;
    if (cartItems[item]) {
      cartItems[item].quantity += 1;
    } else {
      cartItems[item] = {
        name: products[item].name,
        quantity: 1,
        freebies: 0,
        subTotal: 0,
      };
    }

    return cartItems;
  };

  add(item, promoCode) {
    this.items = this.#addProductToCart(item);
    this.pricingRules.runPricingRules(this, item, promoCode);
  }
}

module.exports = ShoppingCart;
