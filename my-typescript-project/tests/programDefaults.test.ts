import { getDefaultProgramValues } from '../src/utils/programDefaults';

describe('getDefaultProgramValues', () => {
  it('should return default values for surfaceShabM2 < 100', () => {
    expect(getDefaultProgramValues(99)).toEqual({
      bedroomCount: 2,
      bathroomCount: 1,
      wcCount: 1,
      roomCount: 4,
      interiorDoorCount: 5,
    });
  });

  it('should return default values for surfaceShabM2 < 160', () => {
    expect(getDefaultProgramValues(150)).toEqual({
      bedroomCount: 3,
      bathroomCount: 2,
      wcCount: 2,
      roomCount: 6,
      interiorDoorCount: 7,
    });
  });

  it('should return default values for surfaceShabM2 < 220', () => {
    expect(getDefaultProgramValues(200)).toEqual({
      bedroomCount: 4,
      bathroomCount: 2,
      wcCount: 2,
      roomCount: 7,
      interiorDoorCount: 8,
    });
  });

  it('should return default values for surfaceShabM2 >= 220', () => {
    expect(getDefaultProgramValues(250)).toEqual({
      bedroomCount: 5,
      bathroomCount: 3,
      wcCount: 3,
      roomCount: 9,
      interiorDoorCount: 10,
    });
  });
});