const factory_unit_costs = {
    'Footsolider': 1000,
    'Mech': 3000,
    'Artillery': 6000,
    'Tank': 7000,
    'Anti-Air': 8000,
};
const airport_unit_costs = {
    'T-Copter': 7000,
};
const port_unit_costs = {
    'BlackBoat': 1000,
};


let cost_modifier = 1.00;

let funds_available = 10000;
let num_factories = 10;
let num_airports = 0;
let num_ports = 0;
/** {[funds_available, num_factories. num_airports, num_ports]: [units...] */
const base_case_records = {};

function get_possible_purchases(unit_cost_lookup, funds) {
    return Object.entries(unit_cost_lookup)
        .filter(entry => funds >= entry[1])
        .map(entry => entry[0]);
}

function goanddoit([funds_available, num_factories, num_airports, num_ports, units]) {

    console.debug(
        'funds_available', funds_available, 
        'num_factories', num_factories,
        'num_airports', num_airports,
        'num_ports', num_ports,
        'units', units);
    const lookup = base_case_records[[funds_available, num_factories, num_airports, num_ports]];
    if (lookup) {
        
        //continue;
    }
    if (num_factories == 0) {
        // base case - all production tiles have been used
        base_case_records[[funds_available, num_factories, num_airports, num_ports]] = units;
        return;
    }
    const possible_factory_purchases = get_possible_purchases(factory_unit_costs, funds_available);
    if (possible_factory_purchases.length == 0) {
        // base case - can't afford anything from the factory
        base_case_records[[funds_available, num_factories, num_airports, num_ports]] = units;
        return;
    }
    // start with the most expensive purchase
    for (const factory_purchase_name of possible_factory_purchases) {
        const new_units = units.slice();
        new_units.push(factory_purchase_name);
        goanddoit([funds_available - factory_unit_costs[factory_purchase_name] * cost_modifier, 
            num_factories - 1,
            num_airports, 
            num_ports, 
            new_units]);
    }
    // if (num_airports > 0) {
    //     const possible_airport_purchases = get_possible_purchases(airport_unit_costs, funds_available);
    //     console.log(possible_airport_purchases);
    //     if (possible_airport_purchases.length > 0) {
    //         // start with the most expensive purchase
    //         const airport_purchase = possible_airport_purchases.at(-1);
    //         num_airports--;
    //         funds_available =- airport_purchase[1] * cost_modifier;
    //         units.push(airport_purchase[0]);
    //     } else {
    //         // can't afford anything from the airport
    //     }
    // }
    // if (num_ports > 0) {
    //     const possible_port_purchases = get_possible_purchases(port_unit_costs, funds_available);
    //     console.log(possible_port_purchases);
    //     if (possible_port_purchases.length > 0) {
    //         // start with the most expensive purchase
    //         const port_purchase = possible_port_purchases.at(-1);
    //         num_ports--;
    //         funds_available =- port_purchase[1] * cost_modifier;
    //         units.push(port_purchase[0]);
    //     } else {
    //         // can't afford anything from the port
    //     }
    // }
}


goanddoit([funds_available, num_factories, num_airports, num_ports, []]);
console.log('result', base_case_records);