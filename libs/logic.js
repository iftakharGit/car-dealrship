/* 
* @param {com.iftakhar.dealership.selectCarBasedOnModel} tx 
* @returns {com.iftakhar.dealership..Car[]}
* @transaction
*/

async function getCarBasedOnModel(tx) {
  let model = tx.model;
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

  if (car.customer && car.orderState !== 'CAR_AVAILABLE') {
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

/* 
* @param {com.iftakhar.dealership.approveOrder} tx 
* @transaction
*/
async function approveOrder(tx) {
  let order = tx.order;
  let logisticsCompanyId = tx.logisticsCompanyId;
  const assetRegistry = await getAssetRegistry("com.iftakhar.dealership.Order");
  let getOrder = await query('getOrderByOrderId', { orderId: order.orderId });
  let getLogisticCompany = await query('getLogisticCompanyByLogisticCompanyId', { logisticsCompanyId: logisticsCompanyId });
  console.log(getLogisticCompany);
  if (getOrder.length > 0) {
    if (getLogisticCompany.length > 0) {
      getLogisticCompany.forEach(logisticCompany =>
        order.logisticCompany = logisticCompany);
      order.status = "ORDER_READY";
      console.log("before asset update")
      await assetRegistry.update(order);
      console.log("after asset update")
    } else {
      throw new Error('logisticId is invalid');
    }

  } else {
    throw new Error('OrderId is invalid');
  }
}

/* 
* @param {com.iftakhar.dealership.dispatchOrder} tx 
* @transaction
*/
async function dispatchOrder(tx) {
  let order = tx.order;
  const assetRegistry = await getAssetRegistry("com.iftakhar.dealership.Order");
  order.status = "ORDER_DISPATCH";
  await assetRegistry.update(order);
}