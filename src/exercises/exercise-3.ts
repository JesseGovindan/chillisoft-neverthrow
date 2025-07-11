import { RequestHandler } from "../common/RequestHandler";
import { BadRequest, Ok } from "../common/Response";
import {
  fetchWeatherCondition,
  WeatherApiError,
  WeatherCondition,
} from "../common/WeatherApi";
import { Result } from "../Result";

// In this exercise we don't have any Result usage to start with.
// Use what you've learnt in other exercises and your understanding of andThen to refactor this code.
// Remember to use the tests to check if you did not break the solution
//
// Hint. If you find you require variables used in one operation further down the chain,
// that might mean you are missing an abstraction or a function
export const getWeatherSummary: RequestHandler = (request) => {
  return validateRequest(request.query)
    .andThen(fetchWeatherSummary)
    .match(createOkResponse, createErrorResponse);
};

function fetchWeatherConditionResult(
  weatherRequest: string,
  city: string
): Result<WeatherCondition, string> {
  try {
    const weather = fetchWeatherCondition(weatherRequest);
    return Result.ok(weather);
  } catch (error) {
    if (error === "invalidLocation") {
      return Result.err(`Invalid city name provided ('${city}').`);
    } else {
      return Result.err(
        "Could not handle request at the moment. Please try again later."
      );
    }
  }
}

function fetchWeatherSummary(weatherData: WeatherData) {
  let { city, date } = weatherData;
  const request = createWeatherRequest(city, date);

  return fetchWeatherConditionResult(request, city).map((weather) =>
    formatSummary(weather, date, city)
  );
}

type WeatherData = { city: string; date: Date };
function validateRequest(body: any): Result<WeatherData, string> {
  const { city, time: timeString } = body;
  if (!city) {
    return Result.err("Request body did not contain a 'city' field");
  }

  if (!timeString) {
    return Result.err("Request body did not contain a 'time' field");
  }

  if (typeof city !== "string") {
    return Result.err("Request body did not contain a valid 'city' field");
  }

  const time = parseInt(timeString);
  if (isNaN(time)) {
    return Result.err("Request body did not contain a valid 'time' field");
  }

  return Result.ok({
    city,
    date: new Date(time),
  });
}

function createWeatherRequest(city: string, date: Date) {
  const d = date.getUTCDate().toString().padStart(2, "0");
  const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const y = date.getUTCFullYear();
  return `${city} @ ${d}/${m}/${y}`;
}

function formatSummary(weather: WeatherCondition, date: Date, city: string) {
  const temperatureSymbol = weather.temperatureScale.at(0)?.toUpperCase();
  const dateString = formatDateString(date);
  return `It will be ${weather.condition} (${weather.temperature} ${temperatureSymbol}) in ${city} on the ${dateString}`;
}

function formatDateString(date: Date) {
  return `${dateToString(date.getUTCDate())} of ${MONTHS[date.getUTCMonth()]}`;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function dateToString(date: number) {
  return `${date}${getDateSuffix(date)}`;
}

function getDateSuffix(date: number) {
  switch (date % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function createErrorResponse(errorMessage: string) {
  return BadRequest({
    body: {
      error: errorMessage,
    },
  });
}

function createOkResponse(summary: string) {
  return Ok({
    body: {
      summary,
    },
  });
}
