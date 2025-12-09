import type { QuickAddItem } from '@/types/fridge';

/**
 * Predefiniowane popularne produkty do szybkiego dodania
 * Template z najczęściej używanymi produktami spożywczymi
 */
export const QUICK_ADD_PRODUCTS: QuickAddItem[] = [
  // Nabiał
  {
    name: 'Mleko 2%',
    categoryId: 1,
    categoryName: 'nabiał',
    defaultUnit: 'l',
    defaultQuantity: 1,
    icon: '🥛'
  },
  {
    name: 'Masło',
    categoryId: 1,
    categoryName: 'nabiał',
    defaultUnit: 'g',
    defaultQuantity: 200,
    icon: '🧈'
  },
  {
    name: 'Ser żółty',
    categoryId: 1,
    categoryName: 'nabiał',
    defaultUnit: 'g',
    defaultQuantity: 300,
    icon: '🧀'
  },
  {
    name: 'Jogurt naturalny',
    categoryId: 1,
    categoryName: 'nabiał',
    defaultUnit: 'g',
    defaultQuantity: 400,
    icon: '🍶'
  },

  // Mięso
  {
    name: 'Pierś z kurczaka',
    categoryId: 2,
    categoryName: 'mięso',
    defaultUnit: 'g',
    defaultQuantity: 500,
    icon: '🍗'
  },
  {
    name: 'Mięso mielone',
    categoryId: 2,
    categoryName: 'mięso',
    defaultUnit: 'g',
    defaultQuantity: 500,
    icon: '🥩'
  },

  // Pieczywo
  {
    name: 'Chleb pełnoziarnisty',
    categoryId: 3,
    categoryName: 'pieczywo',
    defaultUnit: 'szt',
    defaultQuantity: 1,
    icon: '🍞'
  },
  {
    name: 'Bułki',
    categoryId: 3,
    categoryName: 'pieczywo',
    defaultUnit: 'szt',
    defaultQuantity: 6,
    icon: '🥖'
  },

  // Warzywa
  {
    name: 'Pomidory',
    categoryId: 4,
    categoryName: 'warzywa',
    defaultUnit: 'g',
    defaultQuantity: 500,
    icon: '🍅'
  },
  {
    name: 'Cebula',
    categoryId: 4,
    categoryName: 'warzywa',
    defaultUnit: 'g',
    defaultQuantity: 300,
    icon: '🧅'
  },
  {
    name: 'Marchew',
    categoryId: 4,
    categoryName: 'warzywa',
    defaultUnit: 'g',
    defaultQuantity: 500,
    icon: '🥕'
  },
  {
    name: 'Ziemniaki',
    categoryId: 4,
    categoryName: 'warzywa',
    defaultUnit: 'g',
    defaultQuantity: 1000,
    icon: '🥔'
  },

  // Owoce
  {
    name: 'Banany',
    categoryId: 5,
    categoryName: 'owoce',
    defaultUnit: 'szt',
    defaultQuantity: 6,
    icon: '🍌'
  },
  {
    name: 'Jabłka',
    categoryId: 5,
    categoryName: 'owoce',
    defaultUnit: 'szt',
    defaultQuantity: 6,
    icon: '🍎'
  },

  // Dodatkowe popularne produkty
  {
    name: 'Jajka',
    categoryId: 1,
    categoryName: 'nabiał',
    defaultUnit: 'szt',
    defaultQuantity: 12,
    icon: '🥚'
  },
  {
    name: 'Ryż',
    categoryId: 4, // Można stworzyć osobną kategorię "suche produkty"
    categoryName: 'warzywa',
    defaultUnit: 'g',
    defaultQuantity: 500,
    icon: '🍚'
  }
];

/**
 * Get quick add products filtered by category
 */
export const getQuickAddProductsByCategory = (categoryId?: number): QuickAddItem[] => {
  if (!categoryId) {
    return QUICK_ADD_PRODUCTS;
  }
  
  return QUICK_ADD_PRODUCTS.filter(product => product.categoryId === categoryId);
};

/**
 * Get most popular quick add products (top 8)
 */
export const getPopularQuickAddProducts = (): QuickAddItem[] => {
  return QUICK_ADD_PRODUCTS.slice(0, 8);
};