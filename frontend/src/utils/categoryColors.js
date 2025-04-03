const CATEGORY_COLORS = {
  food: "#FF9800",
  groceries: "#FF9800",
  dining: "#FF9800",
  restaurant: "#FF9800",
  travel: "#9C27B0",
  trip: "#9C27B0",
  vacation: "#9C27B0",
  shopping: "#2196F3",
  clothes: "#2196F3",
  entertainment: "#E91E63",
  movies: "#E91E63",
  games: "#E91E63",
  health: "#4CAF50",
  medical: "#4CAF50",
  fitness: "#4CAF50",
  education: "#3F51B5",
  books: "#3F51B5",
  tuition: "#3F51B5",
  bills: "#607D8B",
  utilities: "#607D8B",
  rent: "#607D8B",
  transport: "#FF5722",
  commute: "#FF5722",
  car: "#FF5722",
  gifts: "#00E676",
  presents: "#00E676",
  donation: "#00E676",
  investment: "#F44336",
  savings: "#F44336",
};

const FALLBACK_COLORS = [
  "#F44336",
  "#00BCD4",
  "#FFC107",
  "#8BC34A",
  "#673AB7",
  "#009688",
  "#FF4081",
  "#00E676",
  "#2979FF",
];

export const getCategoryColor = (categoryName) => {
  if (!categoryName) return "#9E9E9E";

  const name = categoryName.toLowerCase().trim();

  if (CATEGORY_COLORS[name]) {
    return CATEGORY_COLORS[name];
  }

  for (const [keyword, color] of Object.entries(CATEGORY_COLORS)) {
    if (name.includes(keyword)) {
      return color;
    }
  }

  return getFallbackColor(name);
};

const getFallbackColor = (categoryName) => {
  const charSum = categoryName
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  const colorIndex = charSum % FALLBACK_COLORS.length;
  return FALLBACK_COLORS[colorIndex];
};

export const getCategoryColorClass = (categoryName) => {
  if (!categoryName) return "";

  const name = categoryName.toLowerCase();

  if (name.includes("food")) return "food";
  if (name.includes("travel")) return "travel";
  if (name.includes("shopping")) return "shopping";
  if (name.includes("entertainment")) return "entertainment";
  if (name.includes("health")) return "health";
  if (name.includes("education")) return "education";
  if (name.includes("bills")) return "bills";

  const charSum = name
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return `category-${charSum % 5}`;
};

export default {
  getCategoryColor,
  getCategoryColorClass,
};