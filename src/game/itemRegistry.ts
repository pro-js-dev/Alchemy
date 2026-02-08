import type { ItemDefinition } from './types'

// Helper to build a chain of items from a simple config
function buildChain(
  chainName: string,
  items: { id: string; name: string; model: string; scale?: number; offset?: [number, number, number]; color?: string }[],
): ItemDefinition[] {
  return items.map((item, i) => ({
    id: item.id,
    name: item.name,
    chain: chainName,
    level: i + 1,
    mergesInto: i < items.length - 1 ? items[i + 1].id : null,
    geometry: 'Sphere' as const,
    color: item.color ?? '#888888',
    scale: item.scale ?? 2.5,
    ...(item.offset ? { offset: item.offset } : {}),
    modelPath: `/models/${item.model}.glb`,
    scoreValue: i === 0 ? 0 : Math.round(10 * Math.pow(2.2, i - 1)),
  }))
}

const ITEM_DEFINITIONS: ItemDefinition[] = [
  // ========================
  // FRUITS & PRODUCE
  // ========================

  // --- 1. Fruit chain (10) ---
  ...buildChain('fruit', [
    { id: 'fruit_1', name: 'Cherries', model: 'cherries', scale: 5, color: '#c0392b' },
    { id: 'fruit_2', name: 'Strawberry', model: 'strawberry', scale: 5, color: '#e74c3c' },
    { id: 'fruit_3', name: 'Lemon', model: 'lemon', scale: 5, color: '#f1c40f' },
    { id: 'fruit_4', name: 'Orange', model: 'orange', scale: 5, color: '#e67e22' },
    { id: 'fruit_5', name: 'Apple', model: 'apple', scale: 5, color: '#c0392b' },
    { id: 'fruit_6', name: 'Banana', model: 'banana', scale: 2.5, color: '#f1c40f' },
    { id: 'fruit_7', name: 'Pear', model: 'pear', scale: 5, color: '#27ae60' },
    { id: 'fruit_8', name: 'Grapes', model: 'grapes', scale: 5, color: '#8e44ad' },
    { id: 'fruit_9', name: 'Pineapple', model: 'pineapple', scale: 5, color: '#f39c12' },
    { id: 'fruit_10', name: 'Watermelon', model: 'watermelon', scale: 5, color: '#27ae60' },
  ]),

  // --- 2. Vegetable chain (10) ---
  ...buildChain('vegetable', [
    { id: 'veg_1', name: 'Radish', model: 'radish', scale: 4.3, color: '#e74c3c' },
    { id: 'veg_2', name: 'Beet', model: 'beet', scale: 5, color: '#8e44ad' },
    { id: 'veg_3', name: 'Carrot', model: 'carrot', scale: 5, color: '#e67e22' },
    { id: 'veg_4', name: 'Mushroom', model: 'mushroom', scale: 5, color: '#d4a574' },
    { id: 'veg_5', name: 'Onion', model: 'onion', scale: 4.8, color: '#f5e6c8' },
    { id: 'veg_6', name: 'Capsicum', model: 'capsicum', scale: 5, color: '#e74c3c' },
    { id: 'veg_7', name: 'Leek', model: 'leek', scale: 5, color: '#27ae60' },
    { id: 'veg_8', name: 'Corn', model: 'corn', scale: 5, color: '#f1c40f' },
    { id: 'veg_9', name: 'Broccoli', model: 'broccoli', scale: 3, color: '#2ecc71' },
    { id: 'veg_10', name: 'Eggplant', model: 'eggplant', scale: 5, color: '#8e44ad' },
  ]),

  // --- 3. Garden chain (8) ---
  ...buildChain('garden', [
    { id: 'garden_1', name: 'Tomato Slice', model: 'tomato_slice', scale: 5, color: '#e74c3c' },
    { id: 'garden_2', name: 'Mushroom Half', model: 'mushroom_half', scale: 5, color: '#d4a574' },
    { id: 'garden_3', name: 'Onion Half', model: 'onion_half', scale: 5, offset: [0.06, 0, 0], color: '#f5e6c8' },
    { id: 'garden_4', name: 'Tomato', model: 'tomato', scale: 5, color: '#e74c3c' },
    { id: 'garden_5', name: 'Pepper', model: 'pepper', scale: 5, color: '#27ae60' },
    { id: 'garden_6', name: 'Cauliflower', model: 'cauliflower', scale: 2.5, color: '#ecf0f1' },
    { id: 'garden_7', name: 'Cabbage', model: 'cabbage', scale: 3.15, color: '#27ae60' },
    { id: 'garden_8', name: 'Pumpkin', model: 'pumpkin', scale: 3.05, color: '#e67e22' },
  ]),

  // --- 4. Salad chain (8) ---
  ...buildChain('salad', [
    { id: 'salad_1', name: 'Lemon Half', model: 'lemon_half', scale: 5, color: '#f1c40f' },
    { id: 'salad_2', name: 'Apple Half', model: 'apple_half', scale: 5, offset: [0.05, 0, 0], color: '#c0392b' },
    { id: 'salad_3', name: 'Pear Half', model: 'pear_half', scale: 5, offset: [0.03, 0, 0], color: '#27ae60' },
    { id: 'salad_4', name: 'Avocado Half', model: 'avocado_half', scale: 5, offset: [0.02, 0, 0], color: '#27ae60' },
    { id: 'salad_5', name: 'Coconut Half', model: 'coconut_half', scale: 5, color: '#d4a574' },
    { id: 'salad_6', name: 'Pumpkin', model: 'pumpkin_basic', scale: 3.45, color: '#e67e22' },
    { id: 'salad_7', name: 'Salad', model: 'salad', scale: 2.35, color: '#27ae60' },
    { id: 'salad_8', name: 'Skewer', model: 'skewer_vegetables', scale: 3, color: '#e67e22' },
  ]),

  // ========================
  // CANDY & DESSERTS
  // ========================

  // --- 5. Candy chain (10) ---
  ...buildChain('candy', [
    { id: 'candy_1', name: 'Candy Bar', model: 'candy_bar_wrapper', scale: 4.4, color: '#e74c3c' },
    { id: 'candy_2', name: 'Chocolate Wrap', model: 'chocolate_wrapper', scale: 4.35, color: '#6d4c41' },
    { id: 'candy_3', name: 'Chocolate', model: 'chocolate', scale: 4.1, color: '#6d4c41' },
    { id: 'candy_4', name: 'Lollipop', model: 'lollypop', scale: 5, color: '#e84393' },
    { id: 'candy_5', name: 'Popsicle', model: 'popsicle', scale: 5, color: '#e74c3c' },
    { id: 'candy_6', name: 'Choco Pop', model: 'popsicle_chocolate', scale: 5, color: '#6d4c41' },
    { id: 'candy_7', name: 'Ice Cream', model: 'ice_cream', scale: 4.9, color: '#f5c6d0' },
    { id: 'candy_8', name: 'Sundae', model: 'sundae', scale: 4.85, color: '#f5c6d0' },
    { id: 'candy_9', name: 'Whipped Cream', model: 'whipped_cream', scale: 5, color: '#ecf0f1' },
    { id: 'candy_10', name: 'Pudding', model: 'pudding', scale: 4.35, color: '#d4a574' },
  ]),

  // --- 6. Cookie chain (8) ---
  ...buildChain('cookie', [
    { id: 'cookie_1', name: 'Cookie', model: 'cookie', scale: 2.5, color: '#d4a574' },
    { id: 'cookie_2', name: 'Choco Cookie', model: 'cookie_chocolate', scale: 5, color: '#6d4c41' },
    { id: 'cookie_3', name: 'Gingerbread', model: 'ginger_bread', scale: 4.8, color: '#d4a574' },
    { id: 'cookie_4', name: 'Cinnamon Roll', model: 'cinnamon_roll', scale: 3.1, color: '#d4a574' },
    { id: 'cookie_5', name: 'Muffin', model: 'muffin', scale: 3.4, color: '#d4a574' },
    { id: 'cookie_6', name: 'Cupcake', model: 'cupcake', scale: 4.05, color: '#e84393' },
    { id: 'cookie_7', name: 'Donut', model: 'donut', scale: 3.05, color: '#f39c12' },
    { id: 'cookie_8', name: 'Sprinkle Donut', model: 'donut_sprinkles', scale: 5, color: '#e84393' },
  ]),

  // --- 7. Cake chain (12) ---
  ...buildChain('cake', [
    { id: 'cake_1', name: 'Pink Donut', model: 'donut_pink', scale: 3, color: '#e84393' },
    { id: 'cake_2', name: 'Choco Donut', model: 'donut_chocolate', scale: 3.05, color: '#6d4c41' },
    { id: 'cake_3', name: 'Berry Slice', model: 'cake_strawberry_slic', scale: 1.85, offset: [0, 0, 0.37], color: '#e84393' },
    { id: 'cake_4', name: 'Berry Cake Cut', model: 'cake_strawberry_cut', scale: 1, color: '#e84393' },
    { id: 'cake_5', name: 'Berry Cake', model: 'cake_strawberry', scale: 1.05, color: '#e84393' },
    { id: 'cake_6', name: 'Choco Slice', model: 'cake_chocolate_slice', scale: 1.5, offset: [0, 0, 0.34], color: '#6d4c41' },
    { id: 'cake_7', name: 'Choco Cake Cut', model: 'cake_chocolate_cut', scale: 1, color: '#6d4c41' },
    { id: 'cake_8', name: 'Choco Cake', model: 'cake_chocolate', scale: 1.1, color: '#6d4c41' },
    { id: 'cake_9', name: 'Birthday Slice', model: 'cake_birthday_slice', scale: 2.5, offset: [0, 0, 0.36], color: '#f1c40f' },
    { id: 'cake_10', name: 'Birthday Cut', model: 'cake_birthday_cut', scale: 1.1, color: '#f1c40f' },
    { id: 'cake_11', name: 'Cake', model: 'cake', scale: 2.05, color: '#d4a574' },
    { id: 'cake_12', name: 'Birthday Cake', model: 'cake_birthday', scale: 1.05, color: '#f1c40f' },
  ]),

  // --- 8. Pie chain (10) ---
  ...buildChain('pie', [
    { id: 'pie_1', name: 'Waffle', model: 'waffle', scale: 2.3, color: '#d4a574' },
    { id: 'pie_2', name: 'Waffle Stack', model: 'waffle_stacked', scale: 2.05, color: '#d4a574' },
    { id: 'pie_3', name: 'Apple Slice', model: 'pie_apple_slice', scale: 2.5, offset: [0.01, 0, 0.3], color: '#f39c12' },
    { id: 'pie_4', name: 'Apple Cut', model: 'pie_apple_cut', scale: 1.15, color: '#f39c12' },
    { id: 'pie_5', name: 'Apple Pie', model: 'pie_apple', scale: 1.15, color: '#f39c12' },
    { id: 'pie_6', name: 'Cherry Slice', model: 'pie_cherry_slice', scale: 2.5, offset: [0, 0, 0.3], color: '#c0392b' },
    { id: 'pie_7', name: 'Cherry Cut', model: 'pie_cherry_cut', scale: 1.3, color: '#c0392b' },
    { id: 'pie_8', name: 'Cherry Pie', model: 'pie_cherry', scale: 1.2, color: '#c0392b' },
    { id: 'pie_9', name: 'Mince Pie', model: 'mincemeat_pie', scale: 2.5, color: '#d4a574' },
    { id: 'pie_10', name: 'Grand Pie', model: 'pie', scale: 1.4, color: '#d4a574' },
  ]),

  // ========================
  // BREAD
  // ========================

  // --- 9. Bread chain (11) ---
  ...buildChain('bread', [
    { id: 'bread_1', name: 'Bread Slice', model: 'bread_slice', scale: 2.5, color: '#d4a574' },
    { id: 'bread_2', name: 'Bread Half', model: 'bread_half', scale: 2.2, offset: [0, 0, 0.14], color: '#d4a574' },
    { id: 'bread_3', name: 'Bread Roll', model: 'bread_roll', scale: 2.5, color: '#d4a574' },
    { id: 'bread_4', name: 'Baguette Slice', model: 'baguette_slice', scale: 3, color: '#d4a574' },
    { id: 'bread_5', name: 'Baguette Half', model: 'baguette_half', scale: 1.5, offset: [0, 0, 0.21], color: '#d4a574' },
    { id: 'bread_6', name: 'Croissant', model: 'croissant', scale: 1.85, color: '#f39c12' },
    { id: 'bread_7', name: 'Loaf', model: 'loaf', scale: 2.05, color: '#d4a574' },
    { id: 'bread_8', name: 'Baguette', model: 'baguette', scale: 1.45, color: '#d4a574' },
    { id: 'bread_9', name: 'Italian Loaf', model: 'loaf_baguette', scale: 1.85, color: '#d4a574' },
    { id: 'bread_10', name: 'Round Loaf', model: 'loaf_round', scale: 1.65, color: '#d4a574' },
    { id: 'bread_11', name: 'Bread', model: 'bread', scale: 1.5, color: '#d4a574' },
  ]),

  // ========================
  // PROTEIN & SAVORY
  // ========================

  // --- 10. Meat chain (11) ---
  ...buildChain('meat', [
    { id: 'meat_1', name: 'Bacon', model: 'bacon', scale: 3, color: '#c0392b' },
    { id: 'meat_2', name: 'Sausage', model: 'sausage', scale: 3.85, color: '#c0392b' },
    { id: 'meat_3', name: 'Link Sausage', model: 'meat_sausage', scale: 3.45, color: '#c0392b' },
    { id: 'meat_4', name: 'Patty', model: 'meat_patty', scale: 3.9, color: '#d4a574' },
    { id: 'meat_5', name: 'Raw Meat', model: 'meat_raw', scale: 2.35, color: '#e74c3c' },
    { id: 'meat_6', name: 'Fish', model: 'fish', scale: 2.85, color: '#3498db' },
    { id: 'meat_7', name: 'Mussel', model: 'mussel_open', scale: 4.95, color: '#e67e22' },
    { id: 'meat_8', name: 'Ribs', model: 'meat_ribs', scale: 2.5, color: '#c0392b' },
    { id: 'meat_9', name: 'Tenderizer', model: 'meat_tenderizer', scale: 2.2, color: '#7f8c8d' },
    { id: 'meat_10', name: 'Turkey', model: 'turkey', scale: 1.65, color: '#d4a574' },
    { id: 'meat_11', name: 'Whole Ham', model: 'whole_ham', scale: 1.75, color: '#e74c3c' },
  ]),

  // --- 11. Egg chain (7) ---
  ...buildChain('egg', [
    { id: 'egg_1', name: 'Egg', model: 'egg', scale: 5, color: '#f5e6c8' },
    { id: 'egg_2', name: 'Fried Egg', model: 'egg_cooked', scale: 3.15, color: '#f1c40f' },
    { id: 'egg_3', name: 'Egg Cup', model: 'egg_cup', scale: 5, color: '#ecf0f1' },
    { id: 'egg_4', name: 'Pancakes', model: 'pancakes', scale: 2.5, color: '#d4a574' },
    { id: 'egg_5', name: 'Cheese', model: 'cheese_cut', scale: 3.2, color: '#f1c40f' },
    { id: 'egg_6', name: 'Fish Bones', model: 'fish_bones', scale: 2.5, color: '#ecf0f1' },
    { id: 'egg_7', name: 'Honey', model: 'honey', scale: 3.9, color: '#f39c12' },
  ]),

  // --- 12. Fast Food chain (10) ---
  ...buildChain('fastfood', [
    { id: 'fast_1', name: 'Fries', model: 'fries', scale: 4.75, color: '#f1c40f' },
    { id: 'fast_2', name: 'Corn Dog', model: 'corn_dog', scale: 2.5, color: '#d4a574' },
    { id: 'fast_3', name: 'Hot Dog', model: 'hot_dog', scale: 2.5, color: '#e74c3c' },
    { id: 'fast_4', name: 'Taco', model: 'taco', scale: 3.1, color: '#f39c12' },
    { id: 'fast_5', name: 'Sandwich', model: 'sandwich', scale: 2.5, offset: [-0.02, 0, 0.04], color: '#d4a574' },
    { id: 'fast_6', name: 'Sub', model: 'sub', scale: 2.5, color: '#d4a574' },
    { id: 'fast_7', name: 'Burger', model: 'burger', scale: 3.25, color: '#d4a574' },
    { id: 'fast_8', name: 'Cheeseburger', model: 'burger_cheese', scale: 2.5, color: '#f1c40f' },
    { id: 'fast_9', name: 'Pizza', model: 'pizza', scale: 1.6, color: '#e74c3c' },
    { id: 'fast_10', name: 'Pizza Box', model: 'pizza_box', scale: 1.2, color: '#d4a574' },
  ]),

  // --- 13. Sushi chain (7) ---
  ...buildChain('sushi', [
    { id: 'sushi_1', name: 'Soy Sauce', model: 'soy', scale: 5, color: '#2c3e50' },
    { id: 'sushi_2', name: 'Chopsticks', model: 'chopsticks', scale: 5, color: '#d4a574' },
    { id: 'sushi_3', name: 'Fancy Sticks', model: 'chopstick_fancy', scale: 3.4, color: '#d4a574' },
    { id: 'sushi_4', name: 'Rice Ball', model: 'rice_ball', scale: 5, color: '#ecf0f1' },
    { id: 'sushi_5', name: 'Egg Sushi', model: 'sushi_egg', scale: 5, color: '#f1c40f' },
    { id: 'sushi_6', name: 'Salmon Sushi', model: 'sushi_salmon', scale: 5, color: '#e67e22' },
    { id: 'sushi_7', name: 'Chinese Box', model: 'chinese', scale: 2.45, color: '#e74c3c' },
  ]),

  // ========================
  // DRINKS
  // ========================

  // --- 14. Cold Drink chain (10) ---
  ...buildChain('cold_drink', [
    { id: 'cold_1', name: 'Crushed Can', model: 'soda_can_crushed', scale: 4.95, color: '#e74c3c' },
    { id: 'cold_2', name: 'Soda Can', model: 'soda_can', scale: 5, color: '#e74c3c' },
    { id: 'cold_3', name: 'Soda Bottle', model: 'soda', scale: 5, color: '#e74c3c' },
    { id: 'cold_4', name: 'Soda Glass', model: 'soda_glass', scale: 5, color: '#e74c3c' },
    { id: 'cold_5', name: 'Frappe', model: 'frappe', scale: 5, color: '#d4a574' },
    { id: 'cold_6', name: 'Cocktail', model: 'cocktail', scale: 3.65, color: '#e84393' },
    { id: 'cold_7', name: 'Pilsner', model: 'footed_pilsner', scale: 0.85, offset: [0, 2, 0], color: '#f1c40f' },
    { id: 'cold_8', name: 'Weizen', model: 'weizen_glass', scale: 2.5, offset: [0, 1.15, 0], color: '#f39c12' },
    { id: 'cold_9', name: 'Hurricane', model: 'hurricane_glass', scale: 2.5, color: '#e84393' },
    { id: 'cold_10', name: 'Margarita', model: 'margarita_glass', scale: 2.5, color: '#2ecc71' },
  ]),

  // --- 15. Hot Drink chain (8) ---
  ...buildChain('hot_drink', [
    { id: 'hot_1', name: 'Tea Cup', model: 'cup_tea', scale: 5, color: '#27ae60' },
    { id: 'hot_2', name: 'Teacup', model: 'teacup', scale: 2.5, color: '#ecf0f1' },
    { id: 'hot_3', name: 'Cup', model: 'cup', scale: 5, color: '#ecf0f1' },
    { id: 'hot_4', name: 'Mug', model: 'mug', scale: 0.55, color: '#c0392b' },
    { id: 'hot_5', name: 'Beer Mug', model: 'beer_mug', scale: 2.5, color: '#f39c12' },
    { id: 'hot_6', name: 'Irish Coffee', model: 'irish_coffee_glass', scale: 2.5, color: '#6d4c41' },
    { id: 'hot_7', name: 'Glass', model: 'glass', scale: 2.5, color: '#ecf0f1' },
    { id: 'hot_8', name: 'Wine Red', model: 'wine_red', scale: 5, color: '#c0392b' },
  ]),

  // --- 16. Wine chain (9) ---
  ...buildChain('wine', [
    { id: 'wine_1', name: 'Shot Glass', model: 'shot_glass', scale: 1.1, color: '#ecf0f1' },
    { id: 'wine_2', name: 'Vodka Glass', model: 'vodka_glass', scale: 2.5, color: '#ecf0f1' },
    { id: 'wine_3', name: 'Cognac', model: 'cognac_glass', scale: 2.5, color: '#d4a574' },
    { id: 'wine_4', name: 'Wine Glass', model: 'glass_wine', scale: 4.85, offset: [0, 2, 0], color: '#c0392b' },
    { id: 'wine_5', name: 'Crystal Wine', model: 'wine_glass', scale: 2.5, color: '#ecf0f1' },
    { id: 'wine_6', name: 'Champagne', model: 'champagne_flute', scale: 2.5, color: '#f1c40f' },
    { id: 'wine_7', name: 'Goblet', model: 'goblet', scale: 2.5, color: '#d4a520' },
    { id: 'wine_8', name: 'Cocktail Glass', model: 'cocktail_glass', scale: 0.5, offset: [0, -1.23, 0], color: '#e84393' },
  ]),

  // ========================
  // SEASONING & CONTAINERS
  // ========================

  // --- 17. Seasoning chain (8) ---
  ...buildChain('seasoning', [
    { id: 'seas_1', name: 'Ketchup', model: 'bottle_ketchup', scale: 5, color: '#e74c3c' },
    { id: 'seas_2', name: 'Mustard', model: 'bottle_musterd', scale: 5, color: '#f1c40f' },
    { id: 'seas_3', name: 'Peanut Butter', model: 'peanut_butter', scale: 5, color: '#d4a574' },
    { id: 'seas_4', name: 'Salt Shaker', model: 'salt_shaker', scale: 1.15, color: '#ecf0f1' },
    { id: 'seas_5', name: 'Salt', model: 'shaker_salt', scale: 5, color: '#ecf0f1' },
    { id: 'seas_6', name: 'Pepper Mill', model: 'pepper_mill', scale: 5, color: '#2c3e50' },
    { id: 'seas_7', name: 'Pepper Grinder', model: 'pepper_grinder', scale: 0.6, color: '#2c3e50' },
    { id: 'seas_8', name: 'Cookie Cutter', model: 'ginger_bread_cutter', scale: 3.8, color: '#bdc3c7' },
  ]),

  // --- 18. Container chain (11) ---
  ...buildChain('container', [
    { id: 'cont_1', name: 'Flat Bag', model: 'bag_flat', scale: 2.5, color: '#d4a574' },
    { id: 'cont_2', name: 'Bag', model: 'bag', scale: 2.5, color: '#d4a574' },
    { id: 'cont_3', name: 'Small Can', model: 'can_small', scale: 2.5, color: '#bdc3c7' },
    { id: 'cont_4', name: 'Can', model: 'can', scale: 2.5, color: '#bdc3c7' },
    { id: 'cont_5', name: 'Open Can', model: 'can_open', scale: 2.5, color: '#bdc3c7' },
    { id: 'cont_6', name: 'Small Carton', model: 'carton_small', scale: 2.5, color: '#d4a574' },
    { id: 'cont_7', name: 'Carton', model: 'carton', scale: 3.9, color: '#d4a574' },
    { id: 'cont_8', name: 'Barrel', model: 'barrel', scale: 1.65, color: '#8B4513' },
    { id: 'cont_9', name: 'Styrofoam', model: 'styrofoam', scale: 1.15, color: '#ecf0f1' },
    { id: 'cont_10', name: 'Takeout Box', model: 'styrofoam_dinner', scale: 1.15, color: '#ecf0f1' },
    { id: 'cont_11', name: 'Cooler', model: 'cooler_box', scale: 0.05, color: '#3498db' },
  ]),

  // --- 19. Bowl chain (8) ---
  ...buildChain('bowl', [
    { id: 'bowl_1', name: 'Soup Bowl', model: 'bowl_soup', scale: 2.2, color: '#d4a574' },
    { id: 'bowl_2', name: 'Cereal Bowl', model: 'bowl_cereal', scale: 2.3, color: '#ecf0f1' },
    { id: 'bowl_3', name: 'Broth Bowl', model: 'bowl_broth', scale: 2.15, color: '#d4a574' },
    { id: 'bowl_4', name: 'Mixing Bowl', model: 'mixing_bowl', scale: 0.55, color: '#bdc3c7' },
    { id: 'bowl_5', name: 'Serving Bowl', model: 'serving_bowl', scale: 0.65, color: '#ecf0f1' },
    { id: 'bowl_6', name: 'Stew Pot', model: 'pot_stew', scale: 1.75, color: '#7f8c8d' },
    { id: 'bowl_7', name: 'Stew Pan', model: 'pan_stew', scale: 1.8, color: '#2c3e50' },
    { id: 'bowl_8', name: 'Steamer', model: 'steamer', scale: 1.9, color: '#bdc3c7' },
  ]),

  // ========================
  // KNIVES
  // ========================

  // --- 20. Basic Knife chain (8) ---
  ...buildChain('knife_basic', [
    { id: 'kb_1', name: 'Butter Knife', model: 'butter_knife', scale: 5, color: '#bdc3c7' },
    { id: 'kb_2', name: 'Paring Knife', model: 'paring_knife', scale: 2.2, color: '#bdc3c7' },
    { id: 'kb_3', name: 'Peeling Knife', model: 'peeling_knife', scale: 2.5, color: '#bdc3c7' },
    { id: 'kb_4', name: 'Utility Knife', model: 'utility_knife', scale: 2.5, color: '#bdc3c7' },
    { id: 'kb_5', name: 'Steak Knife', model: 'steak_knife', scale: 2.5, color: '#bdc3c7' },
    { id: 'kb_6', name: 'Tomato Knife', model: 'tomato_knife', scale: 2.5, color: '#bdc3c7' },
    { id: 'kb_7', name: 'Bread Knife', model: 'bread_knife', scale: 2.5, color: '#bdc3c7' },
    { id: 'kb_8', name: 'Cooking Knife', model: 'cooking_knife', scale: 2.5, color: '#bdc3c7' },
  ]),

  // --- 21. Pro Knife chain (9) ---
  ...buildChain('knife_pro', [
    { id: 'kp_1', name: 'Chopping Knife', model: 'cooking_knife_chopping', scale: 2.5, color: '#bdc3c7' },
    { id: 'kp_2', name: 'Filleting Knife', model: 'filleting_knife', scale: 2.5, color: '#bdc3c7' },
    { id: 'kp_3', name: 'Boning Knife', model: 'boning_knife', scale: 2.5, color: '#bdc3c7' },
    { id: 'kp_4', name: 'Salmon Knife', model: 'salmon_knife', scale: 1.8, color: '#bdc3c7' },
    { id: 'kp_5', name: 'Santoku', model: 'santoku_knife', scale: 1.7, color: '#bdc3c7' },
    { id: 'kp_6', name: 'Nakiri', model: 'naikiri_knife', scale: 1.45, offset: [-0.28, 0, 0], color: '#bdc3c7' },
    { id: 'kp_7', name: 'Chef Knife', model: 'chef_knife', scale: 1.7, offset: [-0.17, 0, 0], color: '#bdc3c7' },
    { id: 'kp_8', name: 'Knife Block', model: 'knife_block', scale: 2.5, color: '#8B4513' },
    { id: 'kp_9', name: 'Cleaver', model: 'cleaver', scale: 1.35, offset: [-0.31, 0, 0], color: '#bdc3c7' },
  ]),

  // ========================
  // UTENSILS & TOOLS
  // ========================

  // --- 22. Utensil chain (13) ---
  ...buildChain('utensil', [
    { id: 'ut_1', name: 'Spoon', model: 'utensil_spoon', scale: 2.85, color: '#bdc3c7' },
    { id: 'ut_2', name: 'Fork', model: 'utensil_fork', scale: 3.25, color: '#bdc3c7' },
    { id: 'ut_3', name: 'Knife', model: 'utensil_knife', scale: 2.5, color: '#bdc3c7' },
    { id: 'ut_4', name: 'Silver Spoon', model: 'spoon', scale: 1.85, offset: [0, 2, 0], color: '#bdc3c7' },
    { id: 'ut_5', name: 'Silver Fork', model: 'fork', scale: 1.75, offset: [0, 2, 0], color: '#bdc3c7' },
    { id: 'ut_6', name: 'Cook Spoon', model: 'cooking_spoon', scale: 2.5, color: '#bdc3c7' },
    { id: 'ut_7', name: 'Cook Fork', model: 'cooking_fork', scale: 2.5, color: '#bdc3c7' },
    { id: 'ut_8', name: 'Spatula', model: 'cooking_spatula', scale: 2.5, color: '#bdc3c7' },
    { id: 'ut_9', name: 'Big Spoon', model: 'big_spoon', scale: 0.9, offset: [0, 0.86, 0], color: '#bdc3c7' },
    { id: 'ut_10', name: 'Wooden Spoon', model: 'wooden_spoon', scale: 0.3, offset: [0, 0.89, 0], color: '#d4a574' },
    { id: 'ut_11', name: 'Pasta Spoon', model: 'pasta_spoon', scale: 0.5, offset: [0, 1.41, 0], color: '#bdc3c7' },
    { id: 'ut_12', name: 'Ladle', model: 'laddle', scale: 0.35, offset: [-0.1, 0, 0.5], color: '#bdc3c7' },
    { id: 'ut_13', name: 'Asian Utensils', model: 'cutensils_asian_turn', scale: 0.6, color: '#bdc3c7' },
  ]),

  // --- 23. Small Tool chain (13) ---
  ...buildChain('small_tool', [
    { id: 'st_1', name: 'Measuring Spoon', model: 'measuring_spoon', scale: 0.8, color: '#bdc3c7' },
    { id: 'st_2', name: 'Measuring Spoons', model: 'measuring_spoons', scale: 0.75, color: '#bdc3c7' },
    { id: 'st_3', name: 'Measuring Cup', model: 'measuring_cup', scale: 0.3, color: '#bdc3c7' },
    { id: 'st_4', name: 'Peeler', model: 'peeler', scale: 0.75, color: '#bdc3c7' },
    { id: 'st_5', name: 'Melon Baller', model: 'melon_baller', scale: 1.5, color: '#bdc3c7' },
    { id: 'st_6', name: 'Ice Cream Scoop', model: 'ice_cream_scooper', scale: 0.7, color: '#bdc3c7' },
    { id: 'st_7', name: 'Bottle Opener', model: 'bottle_opener', scale: 1.15, color: '#bdc3c7' },
    { id: 'st_8', name: 'Can Opener', model: 'can_opener', scale: 0.75, offset: [-0.43, 0, 0], color: '#bdc3c7' },
    { id: 'st_9', name: 'Whisk', model: 'whisk', scale: 0.4, offset: [-0.04, 0, -0.47], color: '#bdc3c7' },
    { id: 'st_10', name: 'Rubber Spatula', model: 'rubber_spatula', scale: 0.8, color: '#e74c3c' },
    { id: 'st_11', name: 'Spatula', model: 'spatula', scale: 0.65, color: '#bdc3c7' },
    { id: 'st_12', name: 'Tongs', model: 'tongs', scale: 0.5, offset: [0, 2, 0], color: '#bdc3c7' },
    { id: 'st_13', name: 'Brush', model: 'brush', scale: 0.7, color: '#d4a574' },
  ]),

  // --- 24. Cutting chain (9) ---
  ...buildChain('cutting', [
    { id: 'cut_1', name: 'Scissors', model: 'scissors', scale: 0.45, color: '#bdc3c7' },
    { id: 'cut_2', name: 'Grater', model: 'grater', scale: 0.95, color: '#bdc3c7' },
    { id: 'cut_3', name: 'Box Grater', model: 'box_grater', scale: 0.45, color: '#bdc3c7' },
    { id: 'cut_4', name: 'Cheese Slicer', model: 'cheese_slicer', scale: 2.5, color: '#bdc3c7' },
    { id: 'cut_5', name: 'Cake Slicer', model: 'cake_slicer', scale: 1.9, color: '#bdc3c7' },
    { id: 'cut_6', name: 'Pizza Cutter', model: 'pizza_cutter', scale: 0.45, offset: [1.41, 0.01, 0], color: '#bdc3c7' },
    { id: 'cut_7', name: 'Rolling Pin', model: 'rolling_pin', scale: 0.2, color: '#d4a574' },
    { id: 'cut_8', name: 'Meat Mallet', model: 'meat_mallet', scale: 0.5, color: '#8B4513' },
    { id: 'cut_9', name: 'Rice Paddle', model: 'rice_paddle', scale: 0.85, offset: [0.09, 0.18, 0.32], color: '#d4a574' },
  ]),

  // --- 25. Filter chain (9) ---
  ...buildChain('filter', [
    { id: 'flt_1', name: 'Thermometer', model: 'food_thermometer', scale: 0.45, offset: [-1.17, 0, 0], color: '#e74c3c' },
    { id: 'flt_2', name: 'Funnel', model: 'funnel', scale: 0.65, color: '#bdc3c7' },
    { id: 'flt_3', name: 'Mesh Strainer', model: 'mesh_strainer', scale: 0.4, color: '#bdc3c7' },
    { id: 'flt_4', name: 'Strainer', model: 'strainer', scale: 0.2, color: '#bdc3c7' },
    { id: 'flt_5', name: 'Skimmer', model: 'skimmer', scale: 0.5, color: '#bdc3c7' },
    { id: 'flt_6', name: 'Mortar & Pestle', model: 'mortar_and_pestle', scale: 0.65, color: '#95a5a6' },
    { id: 'flt_7', name: 'Ice Tray', model: 'misc_ice_tray', scale: 0.25, color: '#3498db' },
    { id: 'flt_8', name: 'Hook', model: 'misc_hanger', scale: 0.15, color: '#bdc3c7' },
    { id: 'flt_9', name: 'Juicer', model: 'juicer', scale: 0.65, color: '#ecf0f1' },
  ]),

  // ========================
  // PANS, POTS & SURFACES
  // ========================

  // --- 26. Pan chain (10) ---
  ...buildChain('pan', [
    { id: 'pan_1', name: 'Sauce Pan', model: 'sauce_pan', scale: 0.25, offset: [0, 2, 0], color: '#7f8c8d' },
    { id: 'pan_2', name: 'Frying Pan', model: 'frying_pan', scale: 2.5, color: '#2c3e50' },
    { id: 'pan_3', name: 'Cast Iron', model: 'cast_iron_skillet', scale: 0.35, offset: [-0.06, 0, 1.25], color: '#2c3e50' },
    { id: 'pan_4', name: 'Skillet', model: 'pan_skillet', scale: 2.5, color: '#2c3e50' },
    { id: 'pan_5', name: 'Sauté Pan', model: 'pan_saute_pan', scale: 2.5, color: '#2c3e50' },
    { id: 'pan_6', name: 'Wok', model: 'pan_wok', scale: 0.15, offset: [-0.16, 0, -2], color: '#2c3e50' },
    { id: 'pan_7', name: 'Pan', model: 'pan', scale: 0.15, color: '#2c3e50' },
    { id: 'pan_8', name: 'Casserole', model: 'casserole_pot', scale: 0.25, color: '#e74c3c' },
    { id: 'pan_9', name: 'Dutch Oven', model: 'dutch_oven', scale: 0.2, color: '#e67e22' },
    { id: 'pan_10', name: 'Stock Pot', model: 'stock_pot', scale: 0.2, color: '#bdc3c7' },
  ]),

  // --- 27. Surface chain (10) ---
  ...buildChain('surface', [
    { id: 'srf_1', name: 'Pot Holder', model: 'pot_holder', scale: 0.35, color: '#e74c3c' },
    { id: 'srf_2', name: 'Oven Mitts', model: 'oven_mitts', scale: 0.25, color: '#e74c3c' },
    { id: 'srf_3', name: 'Wooden Pad', model: 'wooden_pad', scale: 0.85, color: '#d4a574' },
    { id: 'srf_4', name: 'Cutting Board', model: 'cutting_board', scale: 0.3, color: '#d4a574' },
    { id: 'srf_5', name: 'Cheese Board', model: 'charcuterie_board', scale: 0.25, color: '#d4a574' },
    { id: 'srf_6', name: 'Rect Plate', model: 'plate_rectangle', scale: 0.35, color: '#ecf0f1' },
    { id: 'srf_7', name: 'Oval Plate', model: 'plate_oval', scale: 0.45, color: '#ecf0f1' },
    { id: 'srf_8', name: 'Cloche', model: 'cloche', scale: 0.15, color: '#bdc3c7' },
    { id: 'srf_9', name: 'Loaf Pan', model: 'loaf_pan', scale: 0.15, offset: [0, -0.58, 0], color: '#bdc3c7' },
    { id: 'srf_10', name: 'Muffin Tray', model: 'muffin_tray', scale: 0.15, color: '#bdc3c7' },
  ]),

  // ========================
  // APPLIANCES
  // ========================

  // --- 28. Small Appliance chain (8) ---
  ...buildChain('appliance_sm', [
    { id: 'asm_1', name: 'Toaster', model: 'toaster', scale: 0.2, color: '#bdc3c7' },
    { id: 'asm_2', name: 'Toaster Oven', model: 'toaster_oven', scale: 0.15, color: '#bdc3c7' },
    { id: 'asm_3', name: 'Kettle', model: 'kettle', scale: 0.2, color: '#bdc3c7' },
    { id: 'asm_4', name: 'Rice Cooker', model: 'rice_cooker', scale: 0.15, color: '#ecf0f1' },
    { id: 'asm_5', name: 'Mini Blender', model: 'bullet_blender', scale: 0.55, color: '#bdc3c7' },
    { id: 'asm_6', name: 'Blender', model: 'blender', scale: 0.3, color: '#bdc3c7' },
    { id: 'asm_7', name: 'Food Processor', model: 'food_processor', scale: 0.3, color: '#ecf0f1' },
    { id: 'asm_8', name: 'Ceramic Pot', model: 'ceramic_pot_large', scale: 0.25, color: '#e74c3c' },
  ]),

  // --- 29. Large Appliance chain (8) ---
  ...buildChain('appliance_lg', [
    { id: 'alg_1', name: 'Stick Blender', model: 'immersion_blender', scale: 0.8, offset: [0, 1.26, 0], color: '#bdc3c7' },
    { id: 'alg_2', name: 'Microwave', model: 'microwave', scale: 0.1, color: '#bdc3c7' },
    { id: 'alg_3', name: 'Induction', model: 'induction_stove', scale: 0.1, color: '#2c3e50' },
    { id: 'alg_4', name: 'Stovetop', model: 'stovetop', scale: 0.1, color: '#2c3e50' },
    { id: 'alg_5', name: 'Stove', model: 'stove', scale: 0.1, color: '#bdc3c7' },
    { id: 'alg_6', name: 'Stove Oven', model: 'stove_oven', scale: 0.1, color: '#bdc3c7' },
    { id: 'alg_7', name: 'Electric Oven', model: 'electric_oven', scale: 0.1, color: '#2c3e50' },
    { id: 'alg_8', name: 'Refrigerator', model: 'refrigerator', scale: 0.1, color: '#bdc3c7' },
  ]),
]

export const itemRegistry: ReadonlyMap<string, ItemDefinition> = new Map(
  ITEM_DEFINITIONS.map((def) => [def.id, def]),
)

export function getItemDef(id: string): ItemDefinition {
  const def = itemRegistry.get(id)
  if (!def) throw new Error(`Unknown item definition: ${id}`)
  return def
}

export function getChain(chainName: string): ItemDefinition[] {
  return [...itemRegistry.values()]
    .filter((d) => d.chain === chainName)
    .sort((a, b) => a.level - b.level)
}

export function getChainNames(): string[] {
  return [...new Set([...itemRegistry.values()].map((d) => d.chain))]
}
