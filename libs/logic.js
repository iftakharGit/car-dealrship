/* 
* @param {com.iftakhar.dealership.selectCarBasedOnModel} tx 
* @returns {com.iftakhar.dealership..Car[]}
* @transaction
*/
async function getCarBasedOnModel(tx) {
  let model = tx.model;

  //Execute query to get all cars based on model
  let allCar = await query('getCarBasedOnModel', { model: model });
  if (allCar.length > 0) {
    //Print result in console
    console.log(queryResult);
    //return all cars for specified model
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

  //Execute query to get all cars based on make
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

  //Execute query to get all cars based on color
  let allCar = await query('getCarBasedOnColor', { color: color });
  if (allCar.length > 0) {
    console.log(allCar);
    return allCar;
  } else {
    throw new Error('No results');
  }
}
/* 
* @param {com.iftakhar.dealership.selectCarBasedHorsePower} tx 
* @returns {com.iftakhar.dealership..Car[]}
* @transaction
*/
async function getCarBasedOnHorsePower(tx) {
  let horsePower = tx.horsePower;

  //Execute query to get all cars based on horse power
  let allCar = await query('getCarBasedOnHorsePower', { horsePower: horsePower });
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

  //Execute query to get all cars based on transmission
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

  //Execute query to get all cars based on price
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

  //Get all attributes from book car transaction
  const { customer, car } = book;
  console.log(book)

  //If car is sold to any customer and car order is different from car available then throw error
  if (car.customer && car.orderState !== 'CAR_AVAILABLE') {
    throw new Error("Car is already sold");
  }

  //Assign customer to car
  car.customer = customer;

  //Update car status
  car.orderState = 'CAR_SOLD'

  //Get car registry
  const assetRegistry = await getAssetRegistry("com.iftakhar.dealership.Car");

  //Update car details to registry
  await assetRegistry.update(car);

  //Get factory method to create new order asset
  const order = getFactory().newResource("com.iftakhar.dealership", "Order", car.carId + Date.now());

  //Update order details
  order.amount = car.price;
  order.date = new Date();
  order.status = "ORDER_PENDING";
  order.car = car;
  order.customer = customer;
  console.log(order)

  //Get order registry
  const orderRegistry = await getAssetRegistry("com.iftakhar.dealership.Order");

  //Add order to registry
  await orderRegistry.add(order)
}

/* 
* @param {com.iftakhar.dealership.cancelOrder} tx 
* @transaction
*/
async function cancelOrder(tx) {

  //Get order from transaction attribute
  const { order } = tx;
  console.log(order)

  //Check order status and throw error if order status is different from order pending
  if (order.status !== 'ORDER_PENDING') {
    throw new Error('order is already processed, cant be canceled');
  }

  //Get order id from order asset
  carId = order.car.carId;

  //Get car asset from query for given car id
  let allCar = await query('getCarBasedOnCarId', { carId: carId });
  if (allCar.length > 0) {
    console.log(allCar);

    //Get car from first index
    car = allCar[0];
  } else {

    //Throw error if there is no car for given id
    throw new Error('No results');
  }
  //setting car to be available again
  car.orderState = 'CAR_AVAILABLE'

  //Remove customer from car after cancellation
  car.customer = null;

  //Get car registry
  const assetRegistry = await getAssetRegistry("com.iftakhar.dealership.Car");

  //Save updated car details
  await assetRegistry.update(car);

  //updating order status
  order.status = "ORDER_CANCELLED";

  //Get order registry
  const orderRegistry = await getAssetRegistry("com.iftakhar.dealership.Order");

  //Update order into registry
  await orderRegistry.update(order)
}

/* 
* @param {com.iftakhar.dealership.approveOrder} tx 
* @transaction
*/
async function approveOrder(tx) {

  //Get attribute details from transaction approve order
  let order = tx.order;
  let logisticsCompanyId = tx.logisticsCompanyId;

  //Get order registry
  const assetRegistry = await getAssetRegistry("com.iftakhar.dealership.Order");

  //Get order for given order id
  let getOrder = await query('getOrderByOrderId', { orderId: order.orderId });

  //Get logistic company for given logistic company id
  let getLogisticCompany = await query('getLogisticCompanyByLogisticCompanyId', { logisticsCompanyId: logisticsCompanyId });
  if (getOrder.length > 0) {
    if (getLogisticCompany.length > 0) {

      //Update logistic details in order
      getLogisticCompany.forEach(logisticCompany =>
        order.logisticCompany = logisticCompany);

      //Update order status
      order.status = "ORDER_READY";

      //Update order details in order registry
      await assetRegistry.update(order);
    } else {
      //Throw error if logistic id is invalid
      throw new Error('logisticId is invalid');
    }

  } else {
    //Throw error if order id is invalid
    throw new Error('OrderId is invalid');
  }
}

/* 
* @param {com.iftakhar.dealership.dispatchOrder} tx 
* @transaction
*/
async function dispatchOrder(tx) {

  //get attribute from transaction dispatch order
  let order = tx.order;

  //Get order registry
  const assetRegistry = await getAssetRegistry("com.iftakhar.dealership.Order");

  //Update order status
  order.status = "ORDER_DISPATCH";

  //Update order in registry
  await assetRegistry.update(order);
}

/* 
* @param {com.iftakhar.dealership.deliverOrder} tx 
* @transaction
*/
async function deliverOrder(tx) {

  //Get attribute from transaction deliver order
  let order = tx.order;

  //Get order registry
  const assetRegistry = await getAssetRegistry("com.iftakhar.dealership.Order");

  //Update order status
  order.status = "ORDER_DELIVERED";

  //Update order in registry
  await assetRegistry.update(order);
}

/*
* @param {com.iftakhar.dealership.initialiseAll} no param
* @transaction
*/
async function initialiseAll() {
  //values to populate Customer
  let customerIds = ['1000', '2000'];
  let firstNames = ['Mohd', 'Bilal'];
  let lastNames = ['Iftakhar', 'Khan'];
  let emails = ['iftakhar.ahamad@outlook.com', 'bilal.khan@outlook.com'];

  //values to cars commodities
  let carIDs = ['1000', '2000'];
  let makes = ['Mercedes Benz', 'BMW']
  let models = ['C-Class', 'X5'];
  let Years = [2022, 2023];
  let prices = [50000, 60000];
  let horsePowers = [375, 460];
  let colors = ['COLOR_WHITE', 'COLOR_RED'];
  let transmissions = ['TRANSMISSION_AUTOMATIC', 'TRANSMISSION_AUTOMATIC'];
  let orderStates = ['CAR_AVAILABLE', 'CAR_AVAILABLE']


  let customers = new Array();
  //adding customers
  for (let i = 0; i < customerIds.length; i++) {
    let newCustomer = getFactory().newResource("com.iftakhar.dealership", "Customer", customerIds[i]);

    newCustomer.firstName = firstNames[i];
    newCustomer.lastName = lastNames[i];
    newCustomer.email = emails[i];
    customers.push(newCustomer);
  }
  let customerReg = await getParticipantRegistry("com.iftakhar.dealership.Customer");
  await customerReg.addAll(customers);

  let cars = new Array();
  for (let i = 0; i < carIDs.length; i++) {
    let newCar = getFactory().newResource("com.iftakhar.dealership", "Car", carIDs[i]);

    newCar.make = makes[i];
    newCar.model = models[i];
    newCar.Year = models[i];
    newCar.price = prices[i];
    newCar.horsePower = horsePowers[i];
    newCar.color = colors[i];
    newCar.transmission = transmissions[i];
    newCar.orderState = orderStates[i];
    cars.push(newCar);
  }
  let carReg = await getAssetRegistry("com.iftakhar.dealership.Car");
  await carReg.addAll(cars);



  let dealer = getFactory().newResource("com.iftakhar.dealership", "Dealer", '1000');

  dealer.name = 'ABC Moters';

  let dealerReg = await getParticipantRegistry("com.iftakhar.dealership.Dealer");
  await dealerReg.add(dealer);

  let logisticPartner = getFactory().newResource("com.iftakhar.dealership", "LogisticCompany", '1000');

  logisticPartner.name = 'DHL';

  let logisticPartnerReg = await getParticipantRegistry("com.iftakhar.dealership.LogisticCompany");
  await logisticPartnerReg.add(logisticPartner);

}