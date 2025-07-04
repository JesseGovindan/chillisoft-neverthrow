import { BadRequest, Ok } from "../common/Response"
import { getWeatherSummary } from "../exercises/exercise-3"
import * as weatherApi from '../common/WeatherApi'

describe('getWeatherSummary', () => {
  const fetchWeatherCondition = vi.spyOn(weatherApi, 'fetchWeatherCondition')

  it('returns 400 when request does not contain a city field', () => {
    // Arrange
    const request = createRequest({ city: undefined })
    // Act
    const result = sut(request)
    // Assert
    expect(result).toEqual(expectedErrorResponse("Request body did not contain a 'city' field"))
  })

  it('returns 400 when request does not contain a time field', () => {
    // Arrange
    const request = createRequest({ time: undefined })
    // Act
    const result = sut(request)
    // Assert
    expect(result).toEqual(expectedErrorResponse("Request body did not contain a 'time' field"))
  })

  it('returns 400 when time field is not a number', () => {
    // Arrange
    const request = createRequest({ time: 'abc' })
    // Act
    const result = sut(request)
    // Assert
    expect(result).toEqual(expectedErrorResponse("Request body did not contain a valid 'time' field"))
  })

  it('calls fetchWeatherCondition with the correctly formatted string', () => {
    // Arrange
    const date = Date.UTC(2025,0,25)
    const request = createRequest({ time: date.toString(), city: 'Joburg' })
    // Act
    sut(request)
    // Assert
    expect(fetchWeatherCondition).toHaveBeenCalledWith('Joburg @ 25/01/2025')
  })

  it.each([{ 
    condition: 'Sunny',
    temperature: '28',
    temperatureScale: 'celsius' as const,
    date: Date.UTC(2025, 2, 20).toString(),
    city: 'Durban',
    expectedSummary: 'It will be Sunny (28 C) in Durban on the 20th of March',
  }, { 
    condition: 'Rainy',
    temperature: '19',
    temperatureScale: 'farenheit' as const,
    date: Date.UTC(2025, 3, 1).toString(),
    city: 'Cape Town',
    expectedSummary: 'It will be Rainy (19 F) in Cape Town on the 1st of April',
  }])('returns the weather forecast with a summary', (fixture) => {
    // Arrange
    fetchWeatherCondition.mockReturnValue({
      condition: fixture.condition,
      temperature: fixture.temperature,
      temperatureScale: fixture.temperatureScale,
    })
    // Act
    const result = sut({ city: fixture.city, time: fixture.date })
    // Assert
    expect(result).toEqual(expectedWeatherSummary({ summary: fixture.expectedSummary }))
  })

  it('returns status 400 when weather api returns invalidLocation', () => {
    // Arrange
    fetchWeatherCondition.mockImplementation(() => { throw 'invalidLocation' })
    // Act
    const result = sut(createRequest({ city: 'Durban' }))
    // Assert
    expect(result).toEqual(expectedErrorResponse("Invalid city name provided ('Durban')."))
  })

  it('returns status 400 when weather api returns tooManyRequests', () => {
    // Arrange
    fetchWeatherCondition.mockImplementation(() => { throw 'tooManyRequests' })
    // Act
    const result = sut()
    // Assert
    expect(result).toEqual(expectedErrorResponse("Could not handle request at the moment. Please try again later."))
  })

  it('returns status 500 when weather api returns networkError', () => {
    // Arrange
    fetchWeatherCondition.mockImplementation(() => { throw 'networkError' })
    // Act
    const result = sut()
    // Assert
    expect(result).toEqual(expectedErrorResponse("Could not handle request at the moment. Please try again later."))
  })

  function createRequest(overrides: Partial<{ city: string, time: string }> = {}) {
    return {
      city: 'london',
      time: Date.now().toString(),
      ...overrides,
    }
  }

  function sut(request: Record<string, string> = createRequest()) {
    return getWeatherSummary({ query: request })
  }

  function expectedErrorResponse(errorMessage: string) {
    return BadRequest({ body: { error: errorMessage } })
  }

  function expectedWeatherSummary(summary: any) {
    return Ok({ body: summary })
  }
})
