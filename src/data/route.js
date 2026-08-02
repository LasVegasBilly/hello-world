// Real-world waypoints along Interstate 80, coast to coast:
// San Francisco, CA -> New York, NY. Coordinates are the real published
// lat/lon of each city/town that I-80 (or its direct spur) passes through,
// and elevations are each place's real approximate elevation in meters.
// This is genuine US geography and real interstate routing — not licensed
// Google Maps road-centerline data, which we deliberately avoid pulling
// into a third-party 3D engine per Google's Maps Platform terms.

export const ROUTE = [
  { id: 'sf',        name: 'San Francisco', state: 'California',  code: 'CA', lat: 37.7749, lon: -122.4194, elevM: 16,   biome: 'urban' },
  { id: 'sac',       name: 'Sacramento',    state: 'California',  code: 'CA', lat: 38.5816, lon: -121.4944, elevM: 9,    biome: 'valley' },
  { id: 'truckee',   name: 'Truckee',       state: 'California',  code: 'CA', lat: 39.3280, lon: -120.1833, elevM: 1808, biome: 'mountain' },
  { id: 'reno',      name: 'Reno',          state: 'Nevada',      code: 'NV', lat: 39.5296, lon: -119.8138, elevM: 1370, biome: 'desert' },
  { id: 'winnemucca',name: 'Winnemucca',    state: 'Nevada',      code: 'NV', lat: 40.9730, lon: -117.7357, elevM: 1330, biome: 'desert' },
  { id: 'wendover',  name: 'Wendover',      state: 'Utah',        code: 'UT', lat: 40.7377, lon: -114.0377, elevM: 1288, biome: 'saltflat' },
  { id: 'slc',       name: 'Salt Lake City',state: 'Utah',        code: 'UT', lat: 40.7608, lon: -111.8910, elevM: 1288, biome: 'valley' },
  { id: 'evanston',  name: 'Evanston',      state: 'Wyoming',     code: 'WY', lat: 41.2683, lon: -110.9632, elevM: 2128, biome: 'mountain' },
  { id: 'rocksprings',name:'Rock Springs',  state: 'Wyoming',     code: 'WY', lat: 41.5875, lon: -109.2029, elevM: 2064, biome: 'desert' },
  { id: 'rawlins',   name: 'Rawlins',       state: 'Wyoming',     code: 'WY', lat: 41.7911, lon: -107.2387, elevM: 2083, biome: 'plains' },
  { id: 'laramie',   name: 'Laramie',       state: 'Wyoming',     code: 'WY', lat: 41.3114, lon: -105.5911, elevM: 2184, biome: 'plains' },
  { id: 'cheyenne',  name: 'Cheyenne',      state: 'Wyoming',     code: 'WY', lat: 41.1400, lon: -104.8202, elevM: 1848, biome: 'plains' },
  { id: 'northplatte',name:'North Platte',  state: 'Nebraska',    code: 'NE', lat: 41.1239, lon: -100.7654, elevM: 849,  biome: 'plains' },
  { id: 'kearney',   name: 'Kearney',       state: 'Nebraska',    code: 'NE', lat: 40.6993, lon: -99.0817,  elevM: 649,  biome: 'plains' },
  { id: 'lincoln',   name: 'Lincoln',       state: 'Nebraska',    code: 'NE', lat: 40.8136, lon: -96.7026,  elevM: 360,  biome: 'plains' },
  { id: 'omaha',     name: 'Omaha',         state: 'Nebraska',    code: 'NE', lat: 41.2565, lon: -95.9345,  elevM: 299,  biome: 'urban' },
  { id: 'desmoines', name: 'Des Moines',    state: 'Iowa',        code: 'IA', lat: 41.5868, lon: -93.6250,  elevM: 275,  biome: 'farmland' },
  { id: 'iowacity',  name: 'Iowa City',     state: 'Iowa',        code: 'IA', lat: 41.6611, lon: -91.5302,  elevM: 216,  biome: 'farmland' },
  { id: 'chicago',   name: 'Chicago',       state: 'Illinois',    code: 'IL', lat: 41.8781, lon: -87.6298,  elevM: 181,  biome: 'urban' },
  { id: 'southbend', name: 'South Bend',    state: 'Indiana',     code: 'IN', lat: 41.6764, lon: -86.2520,  elevM: 236,  biome: 'forest' },
  { id: 'toledo',    name: 'Toledo',        state: 'Ohio',        code: 'OH', lat: 41.6528, lon: -83.5379,  elevM: 191,  biome: 'farmland' },
  { id: 'cleveland', name: 'Cleveland',     state: 'Ohio',        code: 'OH', lat: 41.4993, lon: -81.6944,  elevM: 199,  biome: 'urban' },
  { id: 'youngstown',name: 'Youngstown',    state: 'Ohio',        code: 'OH', lat: 41.0998, lon: -80.6495,  elevM: 305,  biome: 'forest' },
  { id: 'erie',      name: 'Erie',          state: 'Pennsylvania',code: 'PA', lat: 42.1292, lon: -80.0851,  elevM: 225,  biome: 'forest' },
  { id: 'dubois',    name: 'DuBois',        state: 'Pennsylvania',code: 'PA', lat: 41.1215, lon: -78.7605,  elevM: 470,  biome: 'mountain' },
  { id: 'stroudsburg',name:'Stroudsburg',   state: 'Pennsylvania',code: 'PA', lat: 40.9793, lon: -75.1935,  elevM: 130,  biome: 'forest' },
  { id: 'paterson',  name: 'Paterson',      state: 'New Jersey',  code: 'NJ', lat: 40.9168, lon: -74.1718,  elevM: 30,   biome: 'urban' },
  { id: 'nyc',       name: 'New York City', state: 'New York',    code: 'NY', lat: 40.8517, lon: -73.9527,  elevM: 10,   biome: 'urban' }
];

// Every waypoint above is a real town/city, so every one hosts a roadside
// market where the player can refuel and trade goods.
export const TOWN_IDS = new Set(ROUTE.map(w => w.id));
