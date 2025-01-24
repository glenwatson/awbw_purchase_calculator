const factory_unit_costs = {
    'Infantry': 1000,
    'Mech': 3000,
    'Recon': 4000,
    'APC': 5000,
    'Artillery': 6000,
    'Tank': 7000,
    'Anti-Air': 8000,
    'Missile': 12000,
    'Rocket': 15000,
    'Md.Tank': 16000,
    'Piperunner': 20000,
    'Neotank': 22000,
    'Mega Tank': 28000,
};
const airport_unit_costs = {
    'T-Copter': 5000,
    'B-Copter': 9000,
    'Fighter': 20000,
    'Bomber': 22000,
    'Black Bomb': 25000,
    'Stealth': 24000,
};
const port_unit_costs = {
    'Black Boat': 7500,
    'Lander': 12000,
    'Cruiser': 18000,
    'Sub': 20000,
    'Battleship': 28000,
    'Carrier': 30000,
};
const all_units = {...factory_unit_costs, ...airport_unit_costs, ...port_unit_costs};
/** Set{"[funds_available, num_factories, num_airports, num_ports, Array<units>]"} */
let base_case_records = undefined;

let compareFn = function(unitX, unitY) {
    return all_units[unitY] - all_units[unitX];
};

/**
 * Calculates all possible purchases given funds and units to exclude
 * @param {Map<string, number} unit_cost_lookup cost of each unit
 * @param {number} funds available funds
 * @param {Set<string>} exclude_set units to exclude
 * @returns
 */
function get_possible_purchases(unit_cost_lookup, funds, exclude_set) {
    return Object.entries(unit_cost_lookup)
        .filter(entry => funds >= entry[1] && !exclude_set.has(entry[0]))
        .map(entry => entry[0]);
}

/**
 *
 * @param cost_modifier the ratio of the cost to pay for each unit
 * @param funds_available the money to spend
 * @param num_factories number of factories available to spend money
 * @param num_airports number of airports available to spend money
 * @param num_ports number of ports available to spend money
 * @param filters Array<string> names of the units to exclude
 * @returns {[number,number,number,number,{unit: string, cost: number}[]][]} [
 *  funds_left_over,
 *  factories_left_over,
 *  airports_left_over,
 *  ports_left_over,
 *  [units_purchased]]
 */
function getPurchaseOptions(cost_modifier, funds_available, num_factories, num_airports, num_ports, filters) {
    base_case_records = new Set();
    calculatePurchaseOptions(cost_modifier, funds_available, num_factories, num_airports, num_ports, filters, []);
    // Format these janky results
    return [...base_case_records]
        .map((e) => {
            const split = e.split(',');
            const funds_left = parseInt(split[0]);
            const factories_left = parseInt(split[1]);
            const airports_left = parseInt(split[2]);
            const ports_left = parseInt(split[3]);
            const unit_names = [];
            for (let i=4; i<split.length; i++) {
                unit_names.push(split[i]);
            }
            return [
                funds_left,
                factories_left,
                airports_left,
                ports_left,
                unit_names.map(unit_name => {
                    return {
                        'unit': unit_name,
                        'cost': all_units[unit_name]
                    }
                })
            ];
        }
    );
}
/**
 * Does the calculations and dumps the results into `base_case_records` as {string: Array<string>} {[<funds_left, factories_left, airports_left, ports_left] : [unit_name, ...]}
 * @param {float} cost_modifier 
 * @param {int} funds_available 
 * @param {int} num_factories 
 * @param {int} num_airports 
 * @param {int} num_ports 
 * @param {Array<string>} filters
 * @param {Array<string>} units
 */
function calculatePurchaseOptions(cost_modifier, funds_available, num_factories, num_airports, num_ports, filters, units) {
    const sorted_units = units.sort(compareFn);
    if ([funds_available, num_factories, num_airports, num_ports, sorted_units].toString() in base_case_records) {
        // skip calculating (duplicating work)
        return;
    }
    const exclude_set = new Set(filters);
    const possible_factory_purchases = num_factories == 0 ? [] : get_possible_purchases(factory_unit_costs, funds_available, exclude_set);
    const possible_airport_purchases = num_airports == 0 ? [] : get_possible_purchases(airport_unit_costs, funds_available, exclude_set);
    const possible_port_purchases = num_ports == 0 ? [] : get_possible_purchases(port_unit_costs, funds_available, exclude_set);
    if (possible_factory_purchases.length === 0 &&
        possible_airport_purchases.length === 0 &&
        possible_port_purchases.length === 0) {
        // base case - can't afford anything from and production tiles
        base_case_records.add([funds_available, num_factories, num_airports, num_ports, sorted_units].toString());
        return;
    }
    // TODO: start with the most expensive purchase
    if (num_factories > 0) {
        for (const factory_purchase_name of possible_factory_purchases) {
            const new_units = units.slice();
            new_units.push(factory_purchase_name);
            calculatePurchaseOptions(
                cost_modifier,
                funds_available - factory_unit_costs[factory_purchase_name] * cost_modifier, 
                num_factories - 1,
                num_airports, 
                num_ports, 
                filters,
                new_units);
        }
    }
    if (num_airports > 0) {
        for (const airport_purchase_name of possible_airport_purchases) {
            const new_units = units.slice();
            new_units.push(airport_purchase_name);
            calculatePurchaseOptions(
                cost_modifier,
                funds_available - airport_unit_costs[airport_purchase_name] * cost_modifier, 
                num_factories,
                num_airports - 1, 
                num_ports, 
                filters,
                new_units);
        }
    }
    if (num_ports > 0) {
        for (const port_purchase_name of possible_port_purchases) {
            const new_units = units.slice();
            new_units.push(port_purchase_name);
            calculatePurchaseOptions(
                cost_modifier,
                funds_available - port_unit_costs[port_purchase_name] * cost_modifier, 
                num_factories,
                num_airports, 
                num_ports - 1, 
                filters,
                new_units);
        }
    }
}

/* Helper functions */
// Source: https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript
// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;
    // if the argument is the same array, we can be sure the contents are same as well
    if(array === this)
        return true;
    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

onmessage = (e) => {
    postMessage(getPurchaseOptions(e.data[0], e.data[1], e.data[2], e.data[3], e.data[4], e.data[5]));
};


// quick testing
// let cost_modifier = 1;
// let funds_available = 18000;
// let num_factories = 3;
// let num_airports = 1;
// let num_ports = 1;
// console.log('result', getPurchaseOptions(cost_modifier, funds_available, num_factories, num_airports, num_ports));