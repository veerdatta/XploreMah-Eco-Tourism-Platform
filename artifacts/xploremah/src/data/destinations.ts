export type Region = 'Sahyadri' | 'Konkan' | 'Vidarbha' | 'Marathwada';

export type Destination = {
  id: string;
  name: string;
  shortName: string;
  region: Region;
  district: string;
  host: string;
  price: number;
  score: number;
  visitors: number;
  coordinates: [number, number];
  tags: string[];
  description: string;
  story: string;
  image: string;
  gallery: string[];
  capacity: number;
  bestFor: string;
  stay: string;
  stayType: string;
  experiences: string[];
};

const photo = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1400`;

export const destinations: Destination[] = [
  {
    id: 'bhimashankar',
    name: 'Bhimashankar Forest Stay',
    shortName: 'Bhimashankar',
    region: 'Sahyadri',
    district: 'Pune',
    host: 'Madhuri Shinde',
    price: 3850,
    score: 4.9,
    visitors: 1248,
    coordinates: [19.0728, 73.5352],
    tags: ['Old-growth forest', 'Birding', 'Slow food'],
    description: 'Wake to Malabar whistlers, walk through old-growth forest and eat from Madhuri’s kitchen.',
    story: 'At the edge of the sanctuary, a three-generation home opens its verandah to the forest. Days here follow the light: a kettle at dawn, a quiet trail after breakfast, and bhakri on the wood-fired chulha when the rain arrives.',
    image: photo(1624496),
    gallery: [photo(1624496), photo(167404), photo(247599)],
    capacity: 2,
    bestFor: 'Birders, forest bathing, quiet weekends',
    stay: 'Mud-plastered cottage',
    stayType: 'Mud cottage',
    experiences: ['Local meals', 'Guided nature walks', 'Birding'],
  },
  {
    id: 'harishchandragad',
    name: 'Harishchandragad Ridge Camp',
    shortName: 'Harishchandragad',
    region: 'Sahyadri',
    district: 'Ahmednagar',
    host: 'Ramesh Gaikwad',
    price: 2400,
    score: 4.8,
    visitors: 932,
    coordinates: [19.391, 73.779],
    tags: ['Summit sunrise', 'Trek', 'Stargazing'],
    description: 'A simple ridge camp beneath the Konkan Kada, with fire-cooked meals and an enormous sky.',
    story: 'Ramesh knows every switchback and every weather sign on the ridge. He will point out the tiny shrine at Taramati peak, then leave you to watch the valley turn blue below.',
    image: photo(1485894),
    gallery: [photo(1485894), photo(1458694), photo(167404)],
    capacity: 4,
    bestFor: 'Trekkers, star watchers, first light',
    stay: 'Canvas ridge tent',
    stayType: 'Agro-tent',
    experiences: ['Local meals', 'Guided trek', 'Stargazing'],
  },
  {
    id: 'tarkarli',
    name: 'Tarkarli Backwater House',
    shortName: 'Tarkarli',
    region: 'Konkan',
    district: 'Sindhudurg',
    host: 'Asha and Nitin Sawant',
    price: 4600,
    score: 4.9,
    visitors: 1806,
    coordinates: [16.0466, 73.4933],
    tags: ['Mangrove paddle', 'Coastal kitchen', 'Dolphin watch'],
    description: 'Sleep beside the Karli river, paddle through mangroves and follow the coast by bicycle.',
    story: 'This is a house built around the tide. Asha cooks what arrives at the morning market; Nitin takes guests out before the river warms, when kingfishers skim the water like small blue sparks.',
    image: photo(247599),
    gallery: [photo(247599), photo(417074), photo(1458694)],
    capacity: 3,
    bestFor: 'Coastal food, paddling, families',
    stay: 'Riverside homestay',
    stayType: 'Village homestay',
    experiences: ['Local meals', 'Mangrove paddle', 'Village cycling'],
  },
  {
    id: 'kaas',
    name: 'Kaas Plateau Field Notes',
    shortName: 'Kaas Plateau',
    region: 'Sahyadri',
    district: 'Satara',
    host: 'Vaibhav Jadhav',
    price: 3200,
    score: 4.7,
    visitors: 742,
    coordinates: [17.718, 73.843],
    tags: ['Seasonal blooms', 'Botany walk', 'Local grains'],
    description: 'A field station for the short, electric season when Kaas turns pink, yellow and violet.',
    story: 'Vaibhav farms the plateau with the same patience he brings to his flower walks. Come in the shoulder season for a quieter view of laterite pools, rare orchids and millet cooked over a low flame.',
    image: photo(1458694),
    gallery: [photo(1458694), photo(1624496), photo(417074)],
    capacity: 2,
    bestFor: 'Botany, photography, gentle walks',
    stay: 'Farm loft',
    stayType: 'Farm stay',
    experiences: ['Local meals', 'Guided nature walks', 'Botany walk'],
  },
  {
    id: 'bhandardara',
    name: 'Bhandardara Lake Orchard',
    shortName: 'Bhandardara',
    region: 'Sahyadri',
    district: 'Nashik',
    host: 'Sonal and Pravin Pawar',
    price: 4100,
    score: 4.8,
    visitors: 1104,
    coordinates: [19.5446, 73.7701],
    tags: ['Lake mornings', 'Orchard', 'Village walks'],
    description: 'An orchard cottage with quiet water views, monsoon trails and a table set with what is in season.',
    story: 'The orchard was Pravin’s grandfather’s first planting. Today guava, jamun and custard apple surround two intimate cottages, while Sonal’s seasonal thali changes with the trees.',
    image: photo(417074),
    gallery: [photo(417074), photo(1485894), photo(247599)],
    capacity: 3,
    bestFor: 'Long lunches, lake swims, families',
    stay: 'Orchard cottage',
    stayType: 'Farm stay',
    experiences: ['Local meals', 'Village walk', 'Lake mornings'],
  },
  {
    id: 'nandur-madhameshwar',
    name: 'Nandur Madhameshwar Wetlands',
    shortName: 'Nandur Madhameshwar',
    region: 'Marathwada',
    district: 'Nashik',
    host: 'Shankar Borse',
    price: 2750,
    score: 4.6,
    visitors: 586,
    coordinates: [20.0112, 74.1159],
    tags: ['Wetland birds', 'Village breakfast', 'Cycling'],
    description: 'Follow a local naturalist through India’s birding capital, then cycle home through sugarcane fields.',
    story: 'Shankar grew up listening for the calls that gather around the wetlands. His route stays off the main track, moving between reeds, small temples and a breakfast table under a neem tree.',
    image: photo(167404),
    gallery: [photo(167404), photo(1624496), photo(417074)],
    capacity: 4,
    bestFor: 'Birding, cycling, curious mornings',
    stay: 'Courtyard rooms',
    stayType: 'Heritage wada',
    experiences: ['Local meals', 'Birding', 'Village cycling'],
  },
  {
    id: 'amboli',
    name: 'Amboli Mist House',
    shortName: 'Amboli',
    region: 'Konkan',
    district: 'Sindhudurg',
    host: 'Meera Khot',
    price: 3500,
    score: 4.9,
    visitors: 868,
    coordinates: [15.9586, 74.0005],
    tags: ['Rainforest', 'Waterfalls', 'Monsoon'],
    description: 'A mossy hill home wrapped in monsoon cloud, with hidden falls and a kitchen garden out back.',
    story: 'Meera’s house sits where the plateau gives way to the coast. In the rains, the road becomes a ribbon through fern and fog; in the evenings, her family gathers around kokum saar and stories.',
    image: photo(1458694),
    gallery: [photo(1458694), photo(1485894), photo(1624496)],
    capacity: 2,
    bestFor: 'Rain lovers, waterfalls, writing',
    stay: 'Hill home',
    stayType: 'Village homestay',
    experiences: ['Local meals', 'Waterfall trail', 'Guided nature walks'],
  },
  {
    id: 'tadoba-buffer',
    name: 'Tadoba Buffer Village',
    shortName: 'Tadoba Buffer',
    region: 'Vidarbha',
    district: 'Chandrapur',
    host: 'Kavita Tekam',
    price: 5200,
    score: 4.8,
    visitors: 1297,
    coordinates: [20.248, 79.295],
    tags: ['Wildlife corridor', 'Gond art', 'Night sky'],
    description: 'Stay with a forest-edge family and learn how a village is making room for the wild again.',
    story: 'Kavita’s home is part of a community-led buffer initiative. Mornings begin with tracks in the dust; evenings bring Gond stories, hand-painted walls and a sky with no city glow.',
    image: photo(1485894),
    gallery: [photo(1485894), photo(247599), photo(167404)],
    capacity: 3,
    bestFor: 'Wildlife, culture, wide skies',
    stay: 'Forest-edge home',
    stayType: 'Village homestay',
    experiences: ['Local meals', 'Wildlife watch', 'Gond art workshop'],
  },
];

export const allTags = Array.from(new Set(destinations.flatMap((destination) => destination.tags)));
export const allRegions: Region[] = ['Sahyadri', 'Konkan', 'Vidarbha', 'Marathwada'];
export const allStayTypes = Array.from(new Set(destinations.map((destination) => destination.stayType)));
export const allExperiences = Array.from(new Set(destinations.flatMap((destination) => destination.experiences)));