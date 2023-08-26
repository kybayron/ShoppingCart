const chai = require("chai");
const { expect } = chai;

const ShoppingCart = require("../src/classes/ShoppingCart");
const PricingRules = require("../src/classes/PricingRules");
const products = require("../src/products");
const InvalidItemException = require("../src/exceptions/InvalidItemException");
const { roundToTwoDecimals } = require("../src/utils/math-util");

describe("ShoppingCart Unit Tests", () => {
    const pricingRules = new PricingRules(products);
    pricingRules.addDiscountCode('I<3AMAYSIM', 0.10);
    pricingRules.addBulkDiscountPromo("ult_large", 4, 39.90);
    pricingRules.addThreeForTwoPromo("ult_small");
    pricingRules.addBundlePromo("ult_medium", 1, "1gb", 1);
    const cart = new ShoppingCart(pricingRules);
    context("Scenario Based Requirements", () => {
        afterEach(() => {
            cart.resetState();
        });

        context("Scenario 1", () => {
            it("should have cart.total of 94.70 and cart.items consists of 3x ult_small and 1x ult_large", () => {
                cart.add("ult_small");
                cart.add("ult_small");
                cart.add("ult_small");
                cart.add("ult_large");

                expect(roundToTwoDecimals(cart.total)).to.equal(94.70);
                expect(cart.items["ult_small"].quantity).to.equal(3);
                expect(cart.items["ult_large"].quantity).to.equal(1);
            });
        });

        context("Scenario 2", () => {
            it("should have cart.total of 209.40 and cart.items consists of 2x ult_small and 4x ult_large", () => {
                cart.add("ult_small");
                cart.add("ult_small");
                cart.add("ult_large");
                cart.add("ult_large");
                cart.add("ult_large");
                cart.add("ult_large");

                expect(roundToTwoDecimals(cart.total)).to.equal(209.40);
                expect(cart.items["ult_small"].quantity).to.equal(2);
                expect(cart.items["ult_large"].quantity).to.equal(4);
            });
        });

        context("Scenario 3", () => {
            it("should have cart.total of 84.70 and cart.items consists of 1x ult_small, 2x ult_medium and 2x 1gb freebie", () => {
                cart.add("ult_small");
                cart.add("ult_medium");
                cart.add("ult_medium");

                expect(roundToTwoDecimals(cart.total)).to.equal(84.70);
                expect(cart.items["ult_small"].quantity).to.equal(1);
                expect(cart.items["ult_medium"].quantity).to.equal(2);
                expect(cart.items["1gb"].quantity).to.equal(2);
            });
        });

        context("Scenario 4", () => {
            it("should have cart.total of 31.32 and cart.items consists of 1x ult_small and 1x 1gb", () => {
                cart.add("ult_small");
                cart.add('1gb','I<3AMAYSIM');

                expect(roundToTwoDecimals(cart.total)).to.equal(31.32);
                expect(cart.items["ult_small"].quantity).to.equal(1);
                expect(cart.items["1gb"].quantity).to.equal(1);
            });
        });

        context("Edge Case Scenario", () => {
            it("should not include a freebie if it does not meet the required quantity requirements", () => {
                pricingRules.addBundlePromo("ult_medium", 2, "1gb", 1);
                cart.add("ult_medium");
                expect(cart.items).to.not.have.property("1gb");
                
                pricingRules.addBundlePromo("ult_medium", 1, "1gb", 1);
            });
            
        });
    });

    context("add", () => {
        it("should add product to cart", () => {
            cart.add("ult_small");
            expect(cart.items).to.have.property("ult_small");
            expect(cart.items["ult_small"]).to.have.property("quantity",1);
        });

        it("should throw error if trying to add a product that does not exist", () => {
            expect(() => cart.add("non_existent")).throws(InvalidItemException);
        });
    });
});