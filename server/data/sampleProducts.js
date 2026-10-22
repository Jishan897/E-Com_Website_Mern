// Sample catalogue loaded by `npm run seed`. Edit freely or manage products from the admin panel.

const SNEAKER_SIZES = ['6', '6.5', '7', '7.5', '8', '8.5', '9', '10', '11', '12']
const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL']

const sizes = (labels, soldOut = []) =>
  labels.map((label) => ({ label, stock: soldOut.includes(label) ? 0 : 10 }))

export const products = [
  {
    slug: 'air-jordan-1-low-black-toe', brand: 'Jordan', category: 'sneakers',
    name: 'Air Jordan 1 Low "Black Toe"', price: 12499, mrp: 14999, instantShip: true,
    tags: ['trending'], sizes: sizes(SNEAKER_SIZES, ['6', '12']),
    description: 'A low-top take on the 1985 original in black, white and varsity red, with a leather upper and Air cushioning in the sole.',
  },
  {
    slug: 'nike-dunk-low-panda', brand: 'Nike', category: 'sneakers',
    name: 'Dunk Low "Panda"', price: 10999, mrp: 12499, instantShip: false,
    tags: ['trending', 'steal'], sizes: sizes(SNEAKER_SIZES, ['11']),
    description: 'The black-and-white Dunk that goes with everything. Leather upper, padded low-cut collar and a grippy rubber cupsole.',
  },
  {
    slug: 'new-balance-550-white-green', brand: 'New Balance', category: 'sneakers',
    name: '550 "White Green"', price: 11499, mrp: 13999, instantShip: true,
    tags: ['trending'], sizes: sizes(SNEAKER_SIZES),
    description: 'A 1989 basketball silhouette brought back in clean white leather with green accents.',
  },
  {
    slug: 'adidas-samba-og-cloud-white', brand: 'Adidas', category: 'sneakers',
    name: 'Samba OG "Cloud White"', price: 9999, mrp: 10999, instantShip: false,
    tags: ['trending', 'steal'], sizes: sizes(SNEAKER_SIZES, ['6', '6.5']),
    description: 'Soft leather upper, suede T-toe overlay and the signature gum sole.',
  },
  {
    slug: 'asics-gel-kayano-14-silver', brand: 'Asics', category: 'sneakers',
    name: 'Gel-Kayano 14 "Silver"', price: 15499, mrp: 16999, instantShip: true,
    tags: ['trending'], sizes: sizes(SNEAKER_SIZES),
    description: 'A late-2000s runner with metallic overlays and GEL cushioning, back for everyday wear.',
  },
  {
    slug: 'on-cloudtilt-black-ivory', brand: 'On', category: 'sneakers',
    name: 'Cloudtilt "Black Ivory"', price: 15999, mrp: 17999, instantShip: false,
    tags: ['trending'], sizes: sizes(SNEAKER_SIZES, ['12']),
    description: 'Ultra-soft CloudTec cushioning and a stretch knit upper built for all-day comfort.',
  },
  {
    slug: 'yeezy-slide-onyx', brand: 'Yeezy', category: 'sneakers',
    name: 'Yeezy Slide "Onyx"', price: 2699, mrp: 3999, instantShip: true,
    tags: ['new', 'steal'], sizes: sizes(SNEAKER_SIZES),
    description: 'One-piece injected EVA foam slide with a grooved footbed and a deep-tread outsole.',
  },
  {
    slug: 'nike-air-force-1-07-triple-white', brand: 'Nike', category: 'sneakers',
    name: 'Air Force 1 \'07 "Triple White"', price: 8299, mrp: 9695, instantShip: false,
    tags: ['new', 'steal'], sizes: sizes(SNEAKER_SIZES),
    description: 'The all-white classic. Crisp leather, perforated toe box and Nike Air cushioning.',
  },
  {
    slug: 'crocs-classic-clog-bone', brand: 'Crocs', category: 'sneakers',
    name: 'Classic Clog "Bone"', price: 3499, mrp: 4295, instantShip: true,
    tags: ['new'], sizes: sizes(['6', '7', '8', '9', '10', '11']),
    description: 'Lightweight Croslite clog with pivoting heel straps and ventilation ports.',
  },
  {
    slug: 'air-jordan-4-military-black', brand: 'Jordan', category: 'sneakers',
    name: 'Air Jordan 4 "Military Black"', price: 24999, mrp: 27999, instantShip: false,
    tags: ['new'], sizes: sizes(SNEAKER_SIZES, ['6', '6.5', '12']),
    description: 'White leather with neutral grey suede and black accents on the iconic Jordan 4 shape.',
  },
  {
    slug: 'new-balance-9060-rain-cloud', brand: 'New Balance', category: 'sneakers',
    name: '9060 "Rain Cloud"', price: 18999, mrp: 20999, instantShip: true,
    tags: ['new'], sizes: sizes(SNEAKER_SIZES),
    description: 'A chunky, future-leaning runner with ABZORB and SBS cushioning in a tonal grey colourway.',
  },
  {
    slug: 'adidas-gazelle-indoor-blue-fusion', brand: 'Adidas', category: 'sneakers',
    name: 'Gazelle Indoor "Blue Fusion"', price: 10499, mrp: 11999, instantShip: false,
    tags: ['steal'], sizes: sizes(SNEAKER_SIZES),
    description: 'Suede upper, contrast 3-Stripes and a translucent gum sole.',
  },
  {
    slug: 'nike-air-max-1-patta-waves', brand: 'Nike', category: 'sneakers',
    name: 'Air Max 1 "Patta Waves"', price: 21999, mrp: 24999, instantShip: false,
    tags: ['trending'], sizes: sizes(SNEAKER_SIZES, ['8', '8.5']),
    description: 'A wavy mudguard and visible Air unit on one of the most-loved Air Max collaborations.',
  },
  {
    slug: 'essentials-pullover-hoodie-black', brand: 'Essentials', category: 'apparel',
    name: 'Fear of God Essentials Hoodie "Black"', price: 9499, mrp: 10999, instantShip: true,
    tags: ['new'], sizes: sizes(APPAREL_SIZES, ['XS']),
    description: 'Heavyweight cotton-blend fleece with a relaxed fit and rubberised logo on the chest.',
  },
  {
    slug: 'essentials-tee-oatmeal', brand: 'Essentials', category: 'apparel',
    name: 'Fear of God Essentials Tee "Oatmeal"', price: 4499, mrp: 4999, instantShip: false,
    tags: ['steal'], sizes: sizes(APPAREL_SIZES),
    description: 'Boxy-fit cotton jersey tee with a reflective logo across the back.',
  },
  {
    slug: 'jason-markk-essential-kit', brand: 'Jason Markk', category: 'accessories',
    name: 'Essential Sneaker Cleaning Kit', price: 1799, mrp: 1999, instantShip: true,
    tags: ['steal'], sizes: sizes(['One size']),
    description: 'Premium cleaning solution and a hog-hair brush to keep your pairs looking new.',
  },
  {
    slug: 'nike-everyday-crew-socks-3pk', brand: 'Nike', category: 'accessories',
    name: 'Everyday Cushioned Crew Socks (3 pairs)', price: 1295, mrp: 1295, instantShip: true,
    tags: [], sizes: sizes(['S', 'M', 'L']),
    description: 'Cushioned sole and arch band support for everyday comfort.',
  },
  {
    slug: 'bearbrick-basic-400', brand: 'Medicom', category: 'collectibles',
    name: 'Be@rbrick Basic 400%', price: 14999, mrp: 16999, instantShip: false,
    tags: ['new'], sizes: sizes(['One size']),
    description: 'The collectible 28 cm figure from Medicom Toy, shipped in its original box.',
  },
]

