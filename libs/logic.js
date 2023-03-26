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