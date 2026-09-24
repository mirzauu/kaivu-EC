const fs = require('fs');

const menuJSON = [
  { "id": "cluck-riot", "name": "Cluck Riot", "desc": "Crispy fried chicken tossed in Nashville hot oil, dusted with our own seasoning, and piled high with slaw.", "price": 229, "category": "Burgers", "tag": "Nashville Hot", "rating": 4.9 },
  { "id": "mac-and-rooster", "name": "Mac and Rooster", "desc": "Crispy Nashville fried chicken stacked with creamy mac and cheese. A comfort-food favourite with a little heat.", "price": 269, "category": "Burgers", "tag": "Comfort", "rating": 4.9 },
  { "id": "classic-fried-bird", "name": "Classic Fried Bird", "desc": "A crispy fried chicken burger made for those who love a classic crunch.", "price": 219, "category": "Burgers", "tag": "Classic", "rating": 4.8 },
  { "id": "og-buff-smash", "name": "OG Buff Smash", "desc": "A double smashed beef patty burger, built for a rich, satisfying bite.", "price": 339, "category": "Burgers", "tag": "Double Beef", "rating": 5.0 },
  { "id": "classic-smash", "name": "Classic Smash", "desc": "A single smashed beef patty finished with chimichurri for a fresh, herby kick.", "price": 239, "category": "Burgers", "tag": "Single Beef", "rating": 4.8 },
  { "id": "yolk-me-up", "name": "Yolk Me Up", "desc": "Double smashed beef patties topped with a fried bullseye egg. Rich, hearty, and seriously satisfying.", "price": 369, "category": "Burgers", "tag": "Bullseye Egg", "rating": 5.0 },
  { "id": "beef-patty-melt", "name": "Beef Patty Melt", "desc": "A hearty beef patty sandwich made for a rich, savoury bite.", "price": 219, "category": "Sandos", "tag": "Sando", "rating": 4.8 },
  { "id": "grilled-chicken-sando", "name": "Grilled Chicken Sando", "desc": "Juicy grilled chicken served sandwich-style for a satisfying, savoury bite.", "price": 229, "category": "Sandos", "tag": "Sando", "rating": 4.8 },
  { "id": "normal-tenders", "name": "Normal Tenders", "desc": "Golden, crispy chicken tenders with a satisfying crunch.", "price": 259, "category": "Tenders", "tag": "Crispy", "rating": 4.8, "variants": { "groupTitle": "Sizes", "options": [ { "name": "Box of 4", "quantity": 4, "price": 259 }, { "name": "Box of 6", "quantity": 6, "price": 359 } ] } },
  { "id": "hot-bird-tenders", "name": "Hot Bird Tenders", "desc": "Crispy chicken tenders coated in bold Nashville-style heat.", "price": 279, "category": "Tenders", "tag": "Nashville Spicy", "rating": 4.9, "variants": { "groupTitle": "Sizes", "options": [ { "name": "Box of 4", "quantity": 4, "price": 279 }, { "name": "Box of 6", "quantity": 6, "price": 369 } ] } },
  { "id": "honey-bbq-glazed-tenders", "name": "Honey BBQ Glazed Tenders", "desc": "Crispy chicken tenders coated in a sweet, smoky honey BBQ glaze.", "price": 299, "category": "Tenders", "tag": "Honey BBQ", "rating": 5.0, "variants": { "groupTitle": "Sizes", "options": [ { "name": "Box of 4", "quantity": 4, "price": 299 }, { "name": "Box of 6", "quantity": 6, "price": 399 } ] } },
  { "id": "hot-honey-wings", "name": "Hot Honey Wings", "desc": "Crispy chicken wings coated in a sweet honey glaze with a spicy kick.", "price": 269, "category": "Wings", "tag": "Hot Honey", "rating": 4.9, "variants": { "groupTitle": "Sizes", "options": [ { "name": "Box of 3", "quantity": 3, "price": 269 }, { "name": "Box of 5", "quantity": 5, "price": 379 } ] } },
  { "id": "hot-chicken-wings", "name": "Hot Chicken Wings", "desc": "Crispy chicken wings tossed in bold, fiery Nashville-style seasoning.", "price": 249, "category": "Wings", "tag": "Fiery", "rating": 4.8, "variants": { "groupTitle": "Sizes", "options": [ { "name": "Box of 3", "quantity": 3, "price": 249 }, { "name": "Box of 5", "quantity": 5, "price": 359 } ] } },
  { "id": "honey-bbq-wings", "name": "Honey BBQ Wings", "desc": "Crispy chicken wings glazed with a sweet and smoky honey BBQ sauce.", "price": 259, "category": "Wings", "tag": "Smoky BBQ", "rating": 4.9, "variants": { "groupTitle": "Sizes", "options": [ { "name": "Box of 3", "quantity": 3, "price": 259 }, { "name": "Box of 5", "quantity": 5, "price": 369 } ] } },
  { "id": "mac-and-cheese-with-hot-tender", "name": "Mac and Cheese with Hot Tender", "desc": "Creamy mac and cheese topped with a crispy hot chicken tender and a drizzle of chipotle mayo.", "price": 249, "category": "Pasta", "tag": "Special", "rating": 4.9 },
  { "id": "nashville-loaded", "name": "Nashville Loaded", "desc": "Crispy fries loaded with bold Nashville flavour.", "price": 239, "category": "Loaded", "tag": "Loaded Fries", "rating": 4.8 },
  { "id": "hot-tender-addon", "name": "Hot Tender", "desc": "An extra crispy hot chicken tender.", "price": 89, "category": "Add-ons", "tag": "Add-on", "rating": 4.8 },
  { "id": "ranch-dip", "name": "Ranch", "desc": "Creamy ranch dip. (Size: 50 ml)", "price": 25, "category": "Add-ons", "tag": "50 ml", "rating": 4.8 },
  { "id": "hot-honey-dip", "name": "Hot Honey", "desc": "Sweet honey with a spicy kick. (Size: 50 ml)", "price": 30, "category": "Add-ons", "tag": "50 ml", "rating": 4.8 },
  { "id": "chipotle-mayo-dip", "name": "Chipotle Mayo", "desc": "Creamy chipotle mayo with a smoky kick. (Size: 50 ml)", "price": 30, "category": "Add-ons", "tag": "50 ml", "rating": 4.8 },
  { "id": "bread-addon", "name": "Bread", "desc": "An extra serving of bread.", "price": 5, "category": "Add-ons", "tag": "Add-on", "rating": 4.7 },
  { "id": "cola", "name": "Cola", "desc": "A chilled, refreshing cola.", "price": 20, "category": "Drinks", "tag": "Chilled", "rating": 4.7 },
  { "id": "sprite", "name": "Sprite", "desc": "A crisp, refreshing lemon-lime soft drink.", "price": 20, "category": "Drinks", "tag": "Chilled", "rating": 4.7 },
  { "id": "7up", "name": "7UP", "desc": "A refreshing lemon-lime soft drink.", "price": 20, "category": "Drinks", "tag": "Chilled", "rating": 4.7 },
  { "id": "pepsi", "name": "Pepsi", "desc": "A chilled, refreshing cola.", "price": 20, "category": "Drinks", "tag": "Chilled", "rating": 4.7 }
];

const seedPath = './prisma/seed.ts';
let seedContent = fs.readFileSync(seedPath, 'utf8');

const mapCategory = (cat) => {
  if (cat === 'Add-ons') return 'MenuCategory.ADD_ONS';
  return `MenuCategory.${cat.toUpperCase()}`;
};

const menuItemsString = menuJSON.map((item, index) => {
  const imgMap = {
    'Cluck Riot': 'imgCluck',
    'Mac and Rooster': 'imgMac',
    'Nashville Loaded': 'imgLoaded',
    'Cola': 'imgShake',
    'Sprite': 'imgShake',
    '7UP': 'imgShake',
    'Pepsi': 'imgShake'
  };
  const imgStr = imgMap[item.name] || 'null';
  
  let variantsStr = 'null';
  if (item.variants) {
    variantsStr = JSON.stringify(item.variants);
  }

  return `    {
      slug: "${item.id}",
      name: "${item.name}",
      description: "${item.desc.replace(/"/g, '\\"')}",
      price: ${item.price},
      imageUrl: ${imgStr},
      category: ${mapCategory(item.category)},
      tag: ${item.tag ? `"${item.tag}"` : 'null'},
      rating: ${item.rating || 4.5},
      sortOrder: ${index + 1},
      variants: ${variantsStr}
    }`;
}).join(',\n');

const newMenuItemsBlock = `  const menuItems = [\n${menuItemsString}\n  ];`;

const startIdx = seedContent.indexOf('  const menuItems = [');
const endIdx = seedContent.indexOf('  // Remove existing cart items', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  seedContent = seedContent.substring(0, startIdx) + newMenuItemsBlock + '\n\n' + seedContent.substring(endIdx);
  fs.writeFileSync(seedPath, seedContent, 'utf8');
  console.log('Successfully updated seed.ts');
} else {
  console.error('Could not find menuItems array in seed.ts');
}
