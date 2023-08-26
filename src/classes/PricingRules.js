export default class PricingRules {
  constructor(products) {
    this.products = products;
    this.discounts = {};
    this.discount = 0;
    this.promo = {
      threeForTwo: {},
      bulkDiscount: {},
      bundle: {},
    };
  }

  addDiscountCode(promoCode, discount) {
    this.discounts[promoCode] = discount;
  }

  addThreeForTwoPromo(product) {
    this.promo.threeForTwo[product] = true;
  }

  addBulkDiscountPromo(product, quantity, discountPrice) {
    const { bulkDiscount } = this.promo;
    this.bulkDiscount = {
      ...bulkDiscount,
      ...{
        [product]: {
          quantity,
          discountPrice,
        },
      },
    };
  }

  addBundlePromo(product, quantity, bonusProduct, bonusQuantity) {
    const { bundle } = this.promo;
    this.bundle = { ...bundle, ...{ [product]: { quantity, bonusProduct, bonusQuantity } } };
  }

  #evaluateThreeForTwoPromo(cart, productAdded) {
    if (!this.promo.threeForTwo[productAdded]) {
      return null;
    }
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
    const productPromo = this.promo.bulkDiscount[productAdded];

    if (!productPromo) {
      return null;
    }

    const cartInstance = cart;

    const { quantity, freebies } = cartInstance.items[productAdded];
    const quantityToPay = quantity - freebies;
    if (productPromo.quantity > quantityToPay) {
      return null;
    }

    return productPromo.discountPrice * quantity;
  }

  #evaluateBundlePromo(cart, productAdded) {
    const productPromo = this.promo.bundle[productAdded];

    if (!productPromo) {
      return;
    }
    const cartState = cart;
    const productInCart = cartState.items[productAdded];
    if (productPromo.quantity > productInCart.quantity) {
      return;
    }

    const { bonusProduct, bonusQuantity } = productPromo;

    if (cartState.items[bonusProduct]) {
      cartState.items[bonusProduct].quantity += bonusQuantity;
      cartState.items[bonusProduct].freebies += bonusQuantity;
    } else {
      cartState.items = {
        ...cartState.items,
        ...{
          [bonusProduct]: {
            name: this.products[bonusProduct].name,
            quantity: 1,
            freebies: bonusQuantity,
          },
        },
      };
    }
  }

  #getDiscountIfApplicable(promoCode) {
    return this.discounts[promoCode] ?? 0;
  }

  #applyDiscountIfApplicable = (cart, promoCode) => {
    this.discount = this.#getDiscountIfApplicable(promoCode);

    if (cart.discount > 0) {
      return cart.total * (1 - cart.discount);
    }

    return cart.total;
  };

  #computeTotal(cart) {
    const cartInstance = cart;
    Object.entries(cartInstance.items).forEach(([productCode, itemInCart]) => {
      cartInstance.total = 0;
      if (itemInCart.subTotal) {
        cartInstance.total += itemInCart.subTotal;
      } else {
        cartInstance.total += this.products[productCode].price * (itemInCart.quantity - itemInCart.freebies);
      }
    });
  }

  runPricingRules(cart, productAdded, promoCode) {
    const cartInstance = cart;

    cartInstance[productAdded].subTotal = this.#evaluateThreeForTwoPromo(cart, productAdded);
    cartInstance[productAdded].subTotal = this.#evaluateBulkDiscountPromo(cart, productAdded);
    this.#evaluateBundlePromo(cart, productAdded);

    this.#applyDiscountIfApplicable(cart, promoCode);
    this.#computeTotal(cart);
  }
}
