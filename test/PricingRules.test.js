const chai = require("chai");
const { expect } = chai;

const PricingRules = require("../src/classes/PricingRules");
const products = require("../src/products");
const InvalidItemException = require("../src/exceptions/InvalidItemException");

describe('PricingRules Unit Tests', () => {

    const pricingRules = new PricingRules(products);

    context("addDiscountCode", () => {
        afterEach(() => {
            pricingRules.resetState();
        });

        it('should add discount code to state', () => {
            pricingRules.addDiscountCode('I<3AMAYSIM', 0.10);
            expect(pricingRules.discountCodes).to.deep.equal({
                'I<3AMAYSIM': 0.10
            });
        });

        it('should save more than one discount code to state', () => {
            pricingRules.addDiscountCode('I<3AMAYSIM', 0.10);
            pricingRules.addDiscountCode('AMAYSIM', 0.25);
            expect(pricingRules.discountCodes).to.deep.equal({
                'I<3AMAYSIM': 0.10,
                'AMAYSIM': 0.25
            });
        });
    });

    context("addThreeForTwoPromo", () => {
        afterEach(() => {
            pricingRules.resetState();
        });

        it("should include product to three for two promo", () => {
            pricingRules.addThreeForTwoPromo("ult_large");
            expect(pricingRules.promo.threeForTwo).to.deep.equal({
                "ult_large": true
            });
        });

        it("should throw error if trying to add a product that does not exist", () => {
            expect(() => pricingRules.addThreeForTwoPromo("non_existent")).throws(InvalidItemException);
        });
    });

    context("addBulkDiscountPromo", () => {
        afterEach(() => {
            pricingRules.resetState();
        });

        it("should include product for bulk discount promo", () => {
            pricingRules.addBulkDiscountPromo("ult_medium", 2, 22.22);
            expect(pricingRules.promo.bulkDiscount["ult_medium"]).to.deep.equal({
                minQuantity: 2,
                discountPrice: 22.22
            });
        });

        it("should throw error if trying to add a product that does not exist", () => {
            expect(() => pricingRules.addBulkDiscountPromo("non_existent",2,22.22)).throws(InvalidItemException);
        });
    });

    context("addBundlePromo", () => {
        afterEach(() => {
            pricingRules.resetState();
        });

        it("should include product for bundle promo", () => {
            pricingRules.addBundlePromo("ult_small", 2, "1gb", 1);
            expect(pricingRules.promo.bundle["ult_small"]).to.deep.equal({
                minQuantity: 2,
                bonusProduct: "1gb",
                bonusQuantity: 1
            });
        });

        it("should throw error if trying to add a product that does not exist", () => {
            expect(() => pricingRules.addBundlePromo("non_existent",2,"1gb", 1)).throws(InvalidItemException);
        });

        it("should throw error if trying to add a bonus product that does not exist", () => {
            expect(() => pricingRules.addBundlePromo("ult_small",2,"non_existent", 1)).throws(InvalidItemException);
        });
    });
});