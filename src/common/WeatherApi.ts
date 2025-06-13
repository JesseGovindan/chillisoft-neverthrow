export type WeatherCondition = {
  condition: string
  temperature: string
  temperatureScale: 'celsius' | 'farenheit'
}

export type WeatherApiError = 'networkError' | 'tooManyRequests' | 'invalidLocation'

// weatherRequest must follow the format: "city @ dd/mm/yyyy"
// Throws WeatherApiError on failed fetch
export function fetchWeatherCondition(weatherRequest: string): WeatherCondition {
  // Just for demonstration purposes
  throw 'invalidLocation'
}
