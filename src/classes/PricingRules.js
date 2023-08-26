const InvalidItemException = require('../exceptions/InvalidItemException');

class PricingRules {
  constructor(products) {
    this.products = products;
    this.discountCodes = {};
    this.discount = 0;
    this.promo = {
      threeForTwo: {},
      bulkDiscount: {},
      bundle: {},
    };
  }

  resetState() {
    this.discountCodes = {};
    this.discount = 0;
    this.promo = {
      threeForTwo: {},
      bulkDiscount: {},
      bundle: {},
    };
  }

  addDiscountCode(promoCode, discount) {
    this.discountCodes[promoCode] = discount;
  }

  addThreeForTwoPromo(product) {
    if (this.products[product] === undefined) {
      throw new InvalidItemException(product);
    }

    this.promo.threeForTwo[product] = true;
  }

  addBulkDiscountPromo(product, minQuantity, discountPrice) {
    if (this.products[product] === undefined) {
      throw new InvalidItemException(product);
    }

    this.promo.bulkDiscount[product] = {
      minQuantity,
      discountPrice,
    };
  }

  addBundlePromo(product, minQuantity, bonusProduct, bonusQuantity) {
    if (this.products[product] === undefined) {
      throw new InvalidItemException(product);
    }

    if (this.products[bonusProduct] === undefined) {
      throw new InvalidItemException(bonusProduct);
    }

    this.promo.bundle[product] = { minQuantity, bonusProduct, bonusQuantity };
  }

  #evaluateThreeForTwoPromo(cart, productAdded) {
    const cartInstance = cart;

    const { quantity, freebies } = cartInstance.items[productAdded];
    const quantityToPay = quantity - freebies;

    const setsOfThree = Math.floor(quantityToPay / 3);
    const { price } = this.products[productAdded];
    const totalPrice = quantityToPay * price;
    const totalDiscount = setsOfThree * price;

    return totalPrice - totalDiscount;
  }

  #evaluateBulkDiscountPromo(cart, productAdded) {
    const bulkDiscountPromo = this.promo.bulkDiscount[productAdded];

    const cartInstance = cart;

    const { quantity, freebies } = cartInstance.items[productAdded];
    const quantityToPay = quantity - freebies;

    if (bulkDiscountPromo.minQuantity > quantityToPay) {
      return null;
    }

    return bulkDiscountPromo.discountPrice * quantity;
  }

  #evaluateBundlePromo(cart, productAdded) {
    const bundlePromo = this.promo.bundle[productAdded];
    const cartInstance = cart;

    const { quantity, freebies } = cartInstance.items[productAdded];
    const quantityToPay = quantity - freebies;

    if (bundlePromo.minQuantity > quantityToPay) {
      return;
    }
    const { bonusProduct, bonusQuantity } = bundlePromo;

    const extraProductToAdd = cartInstance.items[bonusProduct];
    if (extraProductToAdd) {
      extraProductToAdd.quantity += bonusQuantity;
      extraProductToAdd.freebies += bonusQuantity;
    } else {
      cartInstance.items[bonusProduct] = {
        name: this.products[bonusProduct].name,
        quantity: 1,
        freebies: bonusQuantity,
      };
    }
  }

  #getDiscountIfApplicable(promoCode) {
    return this.discountCodes[promoCode] ?? 0;
  }

  #applyDiscountIfApplicable = (cart, promoCode) => {
    const cartInstance = cart;
    this.discount = this.#getDiscountIfApplicable(promoCode);

    if (this.discount > 0) {
      cartInstance.total *= (1 - this.discount);
    }
  };

  #computeTotal(cart, productAdded, newSubTotal) {
    const cartInstance = cart;
    const product = cartInstance.items[productAdded];
    cartInstance.total -= product.subTotal;

    if (newSubTotal) {
      product.subTotal = newSubTotal;
      cartInstance.total += newSubTotal;
    } else {
      const unitPrice = this.products[productAdded].price;
      const quantityToPay = product.quantity - product.freebies;
      product.subTotal = unitPrice * quantityToPay;

      cartInstance.total += product.subTotal;
    }
  }

  runPricingRules(cart, productAdded, promoCode) {
    let newSubTotal = 0;

    if (this.promo.threeForTwo[productAdded]) {
      newSubTotal = this.#evaluateThreeForTwoPromo(cart, productAdded);
    }

    if (this.promo.bulkDiscount[productAdded]) {
      newSubTotal = this.#evaluateBulkDiscountPromo(cart, productAdded);
    }

    if (this.promo.bundle[productAdded]) {
      this.#evaluateBundlePromo(cart, productAdded);
    }

    this.#computeTotal(cart, productAdded, newSubTotal);
    this.#applyDiscountIfApplicable(cart, promoCode);
  }
}

module.exports = PricingRules;
