$(function(){
    $("#compare").click(compareBTN);
    $("#location1").on("input", input);
    $("#location2").on("input", input);
});
// calls when the city input changes
function input(e){
    const cityID = e.target.id;
    const city = $(`#${cityID}`).val().trim();
   
    // Only show error message if no city 
    if (city.length === 0) {
       showElement("error-value-" + cityID);      
    }
    else{
       hideElement("error-value-" + cityID);
    }
}
 
 // Compare button is clicked
function compareBTN() {
    // Get user input
    const city1 = $("#location1").val().trim();
    const city2 = $("#location2").val().trim();
 

    // Show error messages if city fields left blank
    if (city1.length === 0) {
        showElement("error-value-location1");
    }
    if (city2.length === 0) {
        showElement("error-value-location2");
    }
     
    // Ensure both city names provided
    if (city1.length > 0 && city2.length > 0) {
        showElement("forecast");
        hideElement("error-loading-location1");
        hideElement("error-loading-location2");
        showElement("loading-location1");
        showText("loading-location1", `Loading ${city1}...`);
        showElement("loading-location2");
        showText("loading-location2", `Loading ${city2}...`);
        hideElement("results-location1");
        hideElement("results-location2");
        // Fetch forecasts
        getWeatherForecast(city1, "location1");
        getWeatherForecast(city2, "location2");
    }
}

// Request this city's forecast
function getWeatherForecast(city, cityID) {
    // Must supply API key
   const weatherurl = "https://api.openweathermap.org/data/2.5/forecast";
   const apiKey = "629278414bca8862c0bfea899ec12501";

   // Make GET request to API for the given city's forecast   
   $.get({
      url: weatherurl, 
      method: "GET",
      data: {q: city, units: "imperial", appid: apiKey},
      dataType: "json"      
   })

   .done(function(data) {
      displayForecast(data, cityID, city);
   })

   .fail(function() {
      displayError(cityID, city);
   });
}

function displayForecast(data, cityID, city) {
    // No longer loading
    hideElement("loading-" + cityID);
 
    // Display results table
    showElement("results-" + cityID);
 
    const cityName = data.city.name;
    showText(cityID + "-name", cityName);
 
    // Get 5 day forecast
    const forecast = getSummaryForecast(data.list);
 
    // Put forecast into the city's table
    let day = 1;
    for (const date in forecast) {
       // Only process the first 5 days
       if (day <= 5) {
          showText(`${cityID}-day${day}-name`, getDayName(date));
          showText(`${cityID}-day${day}-high`, Math.round(forecast[date].high) + "&deg;");
          showText(`${cityID}-day${day}-low`, Math.round(forecast[date].low) + "&deg;");
       }
       day++;
    }   
 }
 
 function displayError(cityID, city) {
    // Display appropriate error message
    hideElement("loading-" + cityID);
    const errorId = "error-loading-" + cityID;
    showElement(errorId);
    showText(errorId, "Unable to load city \"" + city + "\".");
 }
 
 // Return a map of objects that contain the high temp, low temp, and weather for the next 5 days
 function getSummaryForecast(forecastList) {  
    // Map for storing high, low, weather
    const forecast = [];
    
    // Determine high and low for each day
    forecastList.forEach(function (item) {
       // Extract just the yyyy-mm-dd 
       const date = item.dt_txt.substr(0, 10);
       
       // Extract temperature
       const temp = item.main.temp;
 
       // Have this date been seen before?
       if (date in forecast) {         
          // Determine if the temperature is a new low or high
          if (temp < forecast[date].low) {
             forecast[date].low = temp;
          }
          if (temp > forecast[date].high) {
             forecast[date].high = temp;
          }
       }
       else {
          // Initialize new forecast
          const temps = {
             high: temp,
             low: temp,
             weather: item.weather[0].main
          }   
          
          // Add entry to map 
          forecast[date] = temps;
       }
    });
    
    return forecast;
 }
 
 // Convert date string into Mon, Tue, etc.
 function getDayName(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: 'short', timeZone: 'UTC' });
 }
 

// Show the element
function showElement(elementId) {
    $(`#${elementId}`).show();
}

// Hide the element
function hideElement(elementId) {
     $(`#${elementId}`).hide();
}

// Display the text in the element
function showText(elementId, text) {
    $(`#${elementId}`).html(text);
}

