/* 
* @param {com.iftakhar.dealership.selectCarBasedOnModel} tx 
* @returns {com.iftakhar.dealership..Car[]}
* @transaction
*/

async function getCarBasedOnModel(tx) {
  let model = tx.model;
  console.log(model);
  const assetRegistry = await getAssetRegistry("com.iftakhar.dealership.Car");
  let allCar = await query('getCarBasedOnModel', { model: model });
  if (allCar.length > 0) {
    console.log(queryResult);
    return allCar;
  } else {
    throw new Error('No results');
  }
}

/* 
* @param {com.iftakhar.dealership.selectCarBasedOnMake} tx 
* @returns {com.iftakhar.dealership..Car[]}
* @transaction
*/

async function getCarBasedOnMake(tx) {
  let make = tx.make;
  console.log(make);
  const assetRegistry = await getAssetRegistry("com.iftakhar.dealership.Car");
  let allCar = await query('getCarBasedOnMake', { make: make });
  if (allCar.length > 0) {
    console.log(allCar);
    return allCar;
  } else {
    throw new Error('No results');
  }
}

/* 
* @param {com.iftakhar.dealership.selectCarBasedOnColor} tx 
* @returns {com.iftakhar.dealership..Car[]}
* @transaction
*/

async function getCarBasedOnColor(tx) {
  let color = tx.color;
  console.log(color);
  const assetRegistry = await getAssetRegistry("com.iftakhar.dealership.Car");
  let allCar = await query('getCarBasedOnColor', { color: color });
  if (allCar.length > 0) {
    console.log(allCar);
    return allCar;
  } else {
    throw new Error('No results');
  }
}

/* 
* @param {com.iftakhar.dealership.selectCarBasedTransmission} tx 
* @returns {com.iftakhar.dealership..Car[]}
* @transaction
*/

async function getCarBasedTransmission(tx) {
  let transmission = tx.transmission;
  console.log(transmission);
  const assetRegistry = await getAssetRegistry("com.iftakhar.dealership.Car");
  let allCar = await query('getCarBasedOnTransmission', { transmission: transmission });
  if (allCar.length > 0) {
    console.log(allCar);
    return allCar;
  } else {
    throw new Error('No results');
  }
}

/* 
* @param {com.iftakhar.dealership.selectCarBasedOnPrice} tx 
* @returns {com.iftakhar.dealership..Car[]}
* @transaction
*/

async function getCarBasedOnPrice(tx) {
  let price = tx.price;
  console.log(price);
  const assetRegistry = await getAssetRegistry("com.iftakhar.dealership.Car");
  let allCar = await query('getCarBasedOnPrice', { price: price });
  if (allCar.length > 0) {
    console.log(allCar);
    return allCar;
  } else {
    throw new Error('No results');
  }
}

/* 
* @param {com.iftakhar.dealership.bookCar} book 
* @transaction
*/
async function bookCar(book) {
  const { customer, car } = book;
  console.log(book)

  if (car.customer && car.orderState != 'CAR_AVAILABLE') {
    throw new Error("Car is already sold");
  }

  car.customer = customer;
  car.orderState = 'CAR_SOLD'

  const assetRegistry = await getAssetRegistry("com.iftakhar.dealership.Car");
  await assetRegistry.update(car);

  const order = getFactory().newResource("com.iftakhar.dealership", "Order", car.carId + Date.now());
  order.amount = car.price;
  order.date = new Date();
  order.status = "ORDER_PENDING";
  order.car = car;
  order.customer = customer;
  console.log(order)

  const orderRegistry = await getAssetRegistry("com.iftakhar.dealership.Order");
  await orderRegistry.add(order)
}