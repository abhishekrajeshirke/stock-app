// var AppConfig = require('./appConfig.js');
(function () {
  //Variable Declarations
  let stockListing = {},
      WebSocketURI = 'ws://stocks.mnet.website/';

  if (window.WebSocket) {
    // Open websocket connection
    const connection = new WebSocket(WebSocketURI)
    connection.onopen = (event) => {
      console.log('connection open', event)
    }
    connection.onerror = (error) => {
      console.log('Connection failed! ', error)
    }
    connection.onmessage = (response) => {
      let listing = JSON.parse(response.data)
      // Restructuring data into render friendly format
      for (let key in listing) {
        let stock = listing[key]
        let tickerName = stock[0]
        let price = stock[1]
        if (stockListing[tickerName]) {
          // Push price into the existing array
          stockListing[tickerName].push({
            price,
            updatedOn: new Date()
          })
        } else {
          // Assign price array if doesn't exist.
          stockListing[tickerName] = [{
            price,
            updatedOn: new Date()
          }]
        }
      }

      renderTemplate(stockListing, "#app-wrapper")

    }
  } else {
    console.log('Your browser doesn\'t support websockets')
  }
}())

function renderTemplate(stockListing, selector) {

  //Compiling JS object into handlebars template
  const source = document.getElementById("stock-template").innerHTML,
                template = Handlebars.compile(source),
                html = template(stockListing)

  document.querySelector(selector).innerHTML = html
  $.fn.peity.defaults.line = {
    delimiter: ",",
    fill: "#c6d9fd",
    height: 16,
    max: null,
    min: 0,
    stroke: "#4d89f9",
    strokeWidth: 1,
    width: 200
  }
  $(".line").peity("line");

}

// Register Helper to print stock price
Handlebars.registerHelper("priceHelper", function(array) {

  let priceTemplate,
      formattedPrice = array[array.length - 1].price.toFixed(2)
      lastElement = array[array.length - 1].price,
      secondLastElement = lastElement
      if (array[array.length - 2]) {
        secondLastElement =  array[array.length - 2].price
      }

  // Attaching classes as per growth / decline of stock price
  if(lastElement > secondLastElement) {
    priceTemplate = '<span class=\'increment price\'>' + formattedPrice + '</span>'
  } else if(lastElement < secondLastElement) {
    priceTemplate = '<span class=\'decrement price\'>' + formattedPrice + '</span>'
  } else {
    priceTemplate = '<span class=\'steady price\'>' + formattedPrice + '</span>'
  }

  return priceTemplate

});


// Register Helper to print update time
Handlebars.registerHelper("dateHelper", function(array) {

  let updatedOn = array[array.length - 1].updatedOn,
      differenceInSeconds = (Date.now() - updatedOn.getTime()) / 1000,
      displayString
      if(differenceInSeconds < 60){
        displayString = 'Just now'
      } else if(differenceInSeconds < 100){
        displayString = 'A minute ago'
      } else if(differenceInSeconds < 300){
        displayString = '5 minutes ago'
      } else if(differenceInSeconds < 900){
        displayString = '15 minutes ago'
      } else if(differenceInSeconds < 1800){
        displayString = '30 minutes ago'
      } else if(differenceInSeconds < 3200){
        displayString = 'An hour ago'
      }
  return displayString

});


// Register Helper to print sparkline
Handlebars.registerHelper("sparkline", function(array) {
  let priceArray = [];
  for(let key in array){
    priceArray[key] = array[key].price.toFixed(2)
  }
  return priceArray.join(',').toString()

});
