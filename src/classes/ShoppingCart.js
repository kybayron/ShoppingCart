import InvalidItemException from '../exceptions/InvalidItemException';
import products from '../products';

export default class ShoppingCart {
  constructor(pricingRules) {
    this.pricingRules = pricingRules;
    this.items = {};
    this.total = 0;
  }

  #addProductToCart = (item) => {
    if (products[item] === undefined) {
      throw new InvalidItemException(item);
    }

    let cartItems = this.items;
    if (cartItems[item]) {
      cartItems[item].quantity += 1;
    } else {
      cartItems = {
        ...cartItems,
        ...{
          [item]: {
            name: products[item].name,
            quantity: 1,
            freebies: 0,
          },
        },
      };
    }

    return cartItems;
  };

  add(item, promoCode) {
    this.items = this.#addProductToCart(item);
    this.pricingRules.runPricingRules(this, item, promoCode);
  }
}
