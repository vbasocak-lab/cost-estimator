export function getDefaultProgramValues(surfaceShabM2: number) {
  if (surfaceShabM2 < 100) {
    return { bedroomCount: 2, bathroomCount: 1, wcCount: 1, roomCount: 4, interiorDoorCount: 5 };
  }
  if (surfaceShabM2 < 160) {
    return { bedroomCount: 3, bathroomCount: 2, wcCount: 2, roomCount: 6, interiorDoorCount: 7 };
  }
  if (surfaceShabM2 < 220) {
    return { bedroomCount: 4, bathroomCount: 2, wcCount: 2, roomCount: 7, interiorDoorCount: 8 };
  }
  return { bedroomCount: 5, bathroomCount: 3, wcCount: 3, roomCount: 9, interiorDoorCount: 10 };
}