import fs from 'fs';
import { menu } from './src/lib/menu-data';

const seedPath = './prisma/seed.ts';
let seedContent = fs.readFileSync(seedPath, 'utf8');

const mapCategory = (cat: string) => {
  if (cat === 'Add-ons') return 'MenuCategory.ADD_ONS';
  return `MenuCategory.${cat.toUpperCase()}`;
};

const menuItemsString = menu.map((item, index) => {
  const imgMap: Record<string, string> = {
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
  
  let description = item.desc || item.description || '';
  if (item.size) {
     description += ` (Size: ${item.size})`;
  }

  return `    {
      slug: "${item.id}",
      name: "${item.name}",
      description: "${description.replace(/"/g, '\\"')}",
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
