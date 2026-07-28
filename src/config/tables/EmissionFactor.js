export const filterConfigs = []

export const headers = () => [
  { title: 'Mode', key: 'transportMode', renderSlot: 'transportMode', width: 80 },
  { title: 'Vehicle Type', key: 'vehicleType' },
  { title: 'Size / Class', key: 'sizeClass' },
  { title: 'EF TTW (kg CO₂e/t·km)', key: 'efTtw', renderSlot: 'efTtw', align: 'end', width: 190 },
  { title: 'EF WTW (kg CO₂e/t·km)', key: 'efWtw', renderSlot: 'efWtw', align: 'end', width: 190 },
  { title: 'Methodology', key: 'methodology', width: 130 },
  { title: 'Effective From', key: 'effectiveFrom', width: 120 },
  { title: 'Source', key: 'source' },
  { title: '', key: 'action', renderSlot: 'action', sortable: false, width: 80 },
]
