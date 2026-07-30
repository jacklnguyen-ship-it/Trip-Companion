import fs from "node:fs";

const files = ["map-places-index.json", "map-places-maria.json"];
const categoryTags = {
  attractions: ["sightseeing", "landmark"],
  food: ["food", "restaurant"],
  coffee: ["coffee", "café"],
  drinks: ["drinks", "bar"],
  shopping: ["shopping"],
  art: ["art", "prints"],
  icecream: ["ice cream", "dessert"],
  afternoontea: ["afternoon tea", "tea", "pastries"],
  markets: ["market", "shopping", "street food"],
  hotel: ["hotel"],
};
const specialtyRules = [
  [/bakery|bakehouse|bread|pain|poilâne|stohrer|bontemps|hermé/i, ["bakery", "pastries"]],
  [/padella|noci/i, ["pasta", "italian"]],
  [/pizza/i, ["pizza", "italian"]],
  [/fish|oyster|rick stein/i, ["seafood"]],
  [/poppies/i, ["fish and chips"]],
  [/beigel/i, ["bagels", "salt beef"]],
  [/eel|cooke/i, ["pie and mash", "jellied eels"]],
  [/brindisa|chorizo/i, ["tapas", "spanish"]],
  [/gourmet goat/i, ["greek", "street food"]],
  [/juma|yuma/i, ["iraqi", "street food"]],
  [/humble crumble/i, ["crumble", "dessert"]],
  [/yellow bittern|st john|rochelle|camille|chesil|ivy|deux colombes|deux palais|café de la paix|capucines|fontaine gaillon|patio opéra/i, ["special occasion", "dinner"]],
  [/baguette du relais/i, ["steak frites", "sandwich"]],
  [/hotto potto/i, ["hot pot", "chinese"]],
  [/chick king/i, ["fried chicken"]],
  [/holybelly/i, ["brunch", "pancakes"]],
  [/patate/i, ["fries", "street food"]],
  [/auvergne/i, ["regional french", "aligot"]],
  [/fromagerie|dubois/i, ["cheese", "fromagerie"]],
  [/cassandra|old kitchen|pump room/i, ["tea room", "cakes"]],
  [/monmouth|boot café|motors|kb coffee|quartz|cortado|huddle|grounded/i, ["specialty coffee"]],
  [/candelaria|lavomatic|lounge bohemia|little red door|castor club|callooh|tayer/i, ["cocktails", "speakeasy"]],
  [/mary celeste|passione vino|bedales/i, ["wine", "small plates"]],
  [/culpeper|beehive|southwark|raven|huntsman/i, ["pub", "beer"]],
  [/berthillon|bachir|folderol|chin chin|gelupo|swoon|enzo/i, ["gelato", "ice cream"]],
  [/carette/i, ["hot chocolate", "chantilly", "millefeuille", "afternoon tea", "pastries"]],
  [/mariage frères/i, ["tea salon", "afternoon tea"]],
  [/enfants rouges/i, ["food market", "covered market", "street food", "moroccan", "creole"]],
  [/borough market/i, ["food market", "street food"]],
  [/vintage|free.?p.?star|kilo shop|atika|rokit|beyond retro/i, ["vintage", "secondhand"]],
];

function unique(values) {
  return [...new Set(values.map(value => value.toLowerCase().trim()).filter(Boolean))];
}

for (const file of files) {
  const places = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!places.some(place => place.title === "Marché des Enfants Rouges")) {
    places.push({
      query: "Marché des Enfants Rouges 39 Rue de Bretagne Paris",
      title: "Marché des Enfants Rouges",
      category: "food",
      lat: 48.862772,
      lng: 2.362357,
      address: "39 Rue de Bretagne, 75003 Paris, France",
    });
  }
  for (const place of places) {
    const text = `${place.title} ${place.query} ${place.address}`;
    const tags = [...(categoryTags[place.category] || [])];
    for (const [pattern, additions] of specialtyRules) {
      if (pattern.test(text)) tags.push(...additions);
    }
    place.tags = unique(tags);
  }
  fs.writeFileSync(file, `${JSON.stringify(places, null, 2)}\n`);
}
