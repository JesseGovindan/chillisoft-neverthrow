import { BadRequest, Ok } from "../common/Response";
import { fetchWeatherCondition, WeatherCondition, WeatherApiError } from "../common/WeatherApi";
import { Result } from "../Result";
import { AuthenticatedRequestHandler } from "../common/RequestHandler";

type RequestQuery = {
  city?: string;
  time?: string;
}

export const getWeatherSummary: AuthenticatedRequestHandler = (request) => {
  return validateRequest(request.query)
    .andThen(parsedRequest => getWeatherConditionResult(parsedRequest.city, parsedRequest.time))
    .map(weatherCondition => createWeatherSummary(weatherCondition, request.query?.city, request.query?.time))
    .match(
      (summary) => Ok({ body: { summary } }),
      createErrorResponse
    );
};

function validateRequest(query?: RequestQuery): Result<{ city: string, time: Date }, string> {
  if (!query) {
    return Result.err("Request query is missing.");
  }

  const { city, time } = query;

  if (!city) {
    return Result.err("Request body did not contain a 'city' field");
  }

  if (!time) {
    return Result.err("Request body did not contain a 'time' field");
  }

  const parsedTime = Number(time);
  if (isNaN(parsedTime)) {
    return Result.err("Request body did not contain a valid 'time' field");
  }

  return Result.ok({ city, time: new Date(parsedTime) });
}

function getWeatherConditionResult(city: string, time: Date): Result<WeatherCondition, string> {
  try {
    const formattedDate = `${time.getUTCDate().toString().padStart(2, '0')}/${(time.getUTCMonth() + 1).toString().padStart(2, '0')}/${time.getUTCFullYear()}`;
    const formattedString = `${city} @ ${formattedDate}`;
    const condition = fetchWeatherCondition(formattedString);
    return Result.ok(condition);
  } catch (error: any) {
    return Result.err(mapWeatherApiError(error, city));
  }
}

function mapWeatherApiError(error: WeatherApiError | string, city: string): string {
  switch (error) {
    case 'invalidLocation':
      return `Invalid city name provided ('${city}').`;
    case 'tooManyRequests':
    case 'networkError':
      return "Could not handle request at the moment. Please try again later.";
    default:
      return "An unknown error occurred.";
  }
}

function createWeatherSummary(weatherCondition: WeatherCondition, city?: string, time?: string): string {
  const date = new Date(Number(time));
  const day = date.getUTCDate();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const month = monthNames[date.getUTCMonth()];

  const temperatureScaleDisplay = weatherCondition.temperatureScale === 'celsius' ? 'C' : 'F';
  const temperatureDisplay = weatherCondition.temperature;

  return `It will be ${weatherCondition.condition} (${temperatureDisplay} ${temperatureScaleDisplay}) in ${city} on the ${day}${getOrdinalSuffix(day)} of ${month}`;
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

function createErrorResponse(errorMessage: string) {
  return BadRequest({ body: { error: errorMessage } });
}
