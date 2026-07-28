export const CBM = {
  CM: 1.0E-6,
  IN: 0.000016387,
  CFT: 0.02831657,
  CBM: 1,
  KGS: {
    'AIR': 1/166.67,   // IATA volumetric: 1 CBM = 166.67 kg (6000 cm³/kg)
    'OCN': 1/1000,     // Ocean W/M: 1 CBM = 1000 kg equivalent
    'RD':  1/333,      // Road density factor
    'RAL': 1/1000,     // Rail similar to ocean
    'COU': 1/166.67,   // Courier uses IATA volumetric
    'MMD': 0
  }
}
export const WEIGHT = {
  KGS: 1,
  LBS: 0.45359237
}
