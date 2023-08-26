const PricingRules = require("./src/classes/PricingRules");
const ShoppingCart = require("./src/classes/ShoppingCart");
const products = require("./src/products");
const { roundToTwoDecimals } = require("./src/utils/math-util");

const pricingRules = new PricingRules(products);
pricingRules.addDiscountCode('I<3AMAYSIM', 0.10);
pricingRules.addBulkDiscountPromo("ult_large", 4, 39.90);
pricingRules.addThreeForTwoPromo("ult_small");
pricingRules.addBundlePromo("ult_medium", 1, "1gb", 1);

function runScenario1() {
    const cart = new ShoppingCart(pricingRules);
    cart.add("ult_small");
    cart.add("ult_small");
    cart.add("ult_small");
    cart.add("ult_large");

    console.log("Scenario 1");
    console.log(`Cart Total: \$${roundToTwoDecimals(cart.total).toFixed(2)}`);
    const ultSmall = cart.items["ult_small"];
    const ultLarge = cart.items["ult_large"];
    console.log("Cart Items:");
    console.log(`${ultSmall.quantity}X ${ultSmall.name}`);
    console.log(`${ultLarge.quantity}X ${ultLarge.name}`);
    console.log("\n");
}

function runScenario2() {
    const cart = new ShoppingCart(pricingRules);
    cart.add("ult_small");
    cart.add("ult_small");
    cart.add("ult_large");
    cart.add("ult_large");
    cart.add("ult_large");
    cart.add("ult_large");

    console.log("Scenario 2");
    const ultSmall = cart.items["ult_small"];
    const ultLarge = cart.items["ult_large"];
    console.log(`Cart Total: \$${roundToTwoDecimals(cart.total).toFixed(2)}`);
    console.log(`${ultSmall.quantity}X ${ultSmall.name}`);
    console.log(`${ultLarge.quantity}X ${ultLarge.name}`);
    console.log("\n");
}

function runScenario3() {
    const cart = new ShoppingCart(pricingRules);
    cart.add("ult_small");
    cart.add("ult_medium");
    cart.add("ult_medium");

    console.log("Scenario 3");
    const ultSmall = cart.items["ult_small"];
    const ultMedium = cart.items["ult_medium"];
    const oneGb = cart.items["1gb"];
    console.log(`Cart Total: \$${roundToTwoDecimals(cart.total).toFixed(2)}`);
    console.log(`${ultSmall.quantity}X ${ultSmall.name}`);
    console.log(`${ultMedium.quantity}X ${ultMedium.name}`);
    console.log(`${oneGb.quantity}X ${oneGb.name}`);
    console.log("\n");
}

function runScenario4() {
    const cart = new ShoppingCart(pricingRules);
    cart.add("ult_small");
    cart.add('1gb','I<3AMAYSIM');

    console.log("Scenario 4");
    const ultSmall = cart.items["ult_small"];
    const oneGb = cart.items["1gb"];
    console.log(`Cart Total: \$${roundToTwoDecimals(cart.total).toFixed(2)}`);
    console.log(`${ultSmall.quantity}X ${ultSmall.name}`);
    console.log(`${oneGb.quantity}X ${oneGb.name}`);
}

function main() {
    
    runScenario1();
    runScenario2();
    runScenario3();
    runScenario4();
    // console.log(cart.items);
    // console.log(cart.total);
}

main();