export interface ProgramValues {
  bedroomCount: number;
  bathroomCount: number;
  wcCount: number;
  roomCount: number;
  interiorDoorCount: number;
}

export type SurfaceAreaRange = {
  min: number;
  max: number;
  values: ProgramValues;
};