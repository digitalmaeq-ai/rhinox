// CBT practice for the food-tests lab: an original bank following the
// Nigerian secondary Biology / Basic Science topics. Written for Rhinox;
// not copied from past papers.

import { makeBank, seed } from "../shell/cbt";

export const TOPICS = [
  { id: "classes", label: "Food classes and functions" },
  { id: "tests", label: "Tests and results" },
  { id: "practical", label: "Practical technique" },
  { id: "diet", label: "Diet and deficiency" },
];

const Q = seed;

const SEEDS = [
  // Food classes and functions
  Q("c1", "classes", "easy", "Which class of food is the body's main source of energy?", "Carbohydrates", ["Vitamins", "Mineral salts", "Water"], "Carbohydrates such as starch and sugars are broken down to release energy."),
  Q("c2", "classes", "easy", "Which class of food is needed for growth and repair of body tissues?", "Proteins", ["Carbohydrates", "Roughage", "Water"], "Proteins are the building material for new cells and for repairing damaged ones."),
  Q("c3", "classes", "easy", "Which of these is a good source of protein?", "Beans", ["Yam", "Palm oil", "Orange"], "Beans, meat, fish, eggs and milk are rich in protein."),
  Q("c4", "classes", "easy", "Which food is rich in starch?", "Yam", ["Egg white", "Palm oil", "Orange juice"], "Yam, rice, cassava, maize and potatoes store energy as starch."),
  Q("c5", "classes", "medium", "Fats and oils are useful to the body because they", "store energy and insulate the body", ["build muscle", "carry oxygen", "digest proteins"], "Fats store more than twice as much energy per gram as carbohydrate and form an insulating layer under the skin."),
  Q("c6", "classes", "medium", "Why is roughage (dietary fibre) needed in the diet?", "It helps food move through the gut", ["It gives the body energy", "It builds bones", "It is used to make blood"], "Fibre adds bulk, which helps prevent constipation."),
  Q("c7", "classes", "medium", "Which simple sugar is found in the blood and used in respiration?", "Glucose", ["Starch", "Cellulose", "Glycogen"], "Glucose is the sugar that cells break down to release energy."),
  Q("c8", "classes", "hard", "Starch is a carbohydrate made of many small units joined together. These units are", "glucose molecules", ["amino acids", "fatty acids", "vitamin molecules"], "Starch is a polymer of glucose. Proteins are polymers of amino acids."),
  Q("c9", "classes", "medium", "A balanced diet contains", "all the food classes in the right amounts", ["only proteins", "only carbohydrates and fats", "as much food as possible"], "A balanced diet supplies each food class, plus water and fibre, in the amounts the body needs."),

  // Tests and results
  Q("t1", "tests", "easy", "What colour does iodine solution turn when starch is present?", "Blue-black", ["Brick-red", "Purple", "Colourless"], "Starch turns orange-brown iodine solution blue-black."),
  Q("t2", "tests", "easy", "Which reagent is used to test for protein?", "Biuret solution", ["Iodine solution", "Benedict's solution", "Limewater"], "Biuret turns violet or purple when protein is present."),
  Q("t3", "tests", "easy", "A food gives a violet colour with Biuret solution. It contains", "protein", ["starch", "fat", "sugar"], "A violet or purple colour is the positive result for protein."),
  Q("t4", "tests", "easy", "Which reagent is used to test for a reducing sugar?", "Benedict's solution", ["Iodine solution", "Biuret solution", "Ethanol"], "Benedict's solution is heated with the sample. Sugar changes its colour."),
  Q("t5", "tests", "medium", "As the amount of reducing sugar increases, Benedict's solution changes from blue to", "green, yellow, orange, then brick-red", ["black, then purple", "red, then green", "yellow, then blue"], "The more sugar there is, the further the colour moves toward brick-red."),
  Q("t6", "tests", "medium", "In the ethanol emulsion test, a positive result for fat is", "a cloudy white emulsion", ["a brick-red precipitate", "a blue-black colour", "a violet colour"], "Fat dissolves in ethanol but not in water, so it forms tiny droplets when the solution is poured into water."),
  Q("t7", "tests", "medium", "The DCPIP solution is blue. Vitamin C makes it", "lose its colour", ["turn red", "turn black", "turn violet"], "Vitamin C reduces the blue dye and decolourises it."),
  Q("t8", "tests", "medium", "Two foods are tested with DCPIP. Food A decolourises 1 cm³ in 4 drops and Food B needs 20 drops. Which has more vitamin C?", "Food A, because fewer drops are needed", ["Food B, because more drops are needed", "They have the same amount", "Neither contains vitamin C"], "The more vitamin C in a sample, the fewer drops are needed to remove the blue."),
  Q("t9", "tests", "hard", "A sample gives a brick-red colour with Benedict's test only after it has been boiled with dilute acid. It most likely contains", "sucrose", ["glucose", "starch only", "protein"], "Sucrose is not a reducing sugar. Acid breaks it into glucose and fructose, which are."),
  Q("t10", "tests", "hard", "A food turns iodine blue-black and also gives an orange result with Benedict's test. It contains", "starch and a reducing sugar", ["starch only", "a reducing sugar only", "protein and fat"], "Each test responds to its own nutrient, so a food can pass several tests."),
  Q("t11", "tests", "medium", "Why is iodine solution used as the test for starch and not for sugar?", "It reacts with starch but not with sugars", ["It reacts with every food", "It only works when heated", "It dissolves starch"], "Iodine gives its blue-black colour only with starch."),

  // Practical technique
  Q("x1", "practical", "easy", "Why must Benedict's solution be heated?", "The colour change only happens at a high temperature", ["To dissolve the food", "To kill germs", "To make the solution blue"], "Reducing sugars react with Benedict's solution only when heated."),
  Q("x2", "practical", "medium", "Why is a water bath used for heating the Benedict's mixture instead of a naked flame?", "Heating is gentle and even, and the liquid cannot spurt out of the tube", ["The flame would turn the solution blue", "Water adds sugar to the test", "A flame would make the sample sweeter"], "Direct flame can make the liquid boil over and spit. A water bath is safer and steadier."),
  Q("x3", "practical", "medium", "A learner tests distilled water alongside the food samples. What is this for?", "It is a control showing what a negative result looks like", ["It makes the colours stronger", "It cleans the test tube", "It warms the reagent"], "A control with no nutrient lets you compare and confirm the reagent works as expected."),
  Q("x4", "practical", "medium", "Before the iodine test, a solid food such as yam is best", "crushed or ground and mixed with a little water", ["tested whole and dry", "boiled until black", "mixed with ethanol"], "Breaking the food up lets the reagent reach the starch."),
  Q("x5", "practical", "hard", "A learner gets a negative Benedict's result for a food that really contains sugar. A likely mistake is that", "the mixture was not heated long enough", ["too little iodine was used", "the test tube was too clean", "the food was too fresh"], "Without enough heating the colour stays blue, as with an unheated tube."),
  Q("x6", "practical", "medium", "Why should the test tube be pointed away from people when it is heated?", "The hot liquid may spurt out", ["The reagent glows when heated", "The colour is clearer", "The tube will cool faster"], "Always point the mouth of a heated tube away from yourself and others, and wear goggles."),
  Q("x7", "practical", "medium", "In the ethanol emulsion test, why is the clear ethanol liquid poured into water?", "Fat comes out of the solution as tiny droplets, making it cloudy", ["Water turns the fat brick-red", "Water makes the ethanol blue", "Water dissolves the fat completely"], "Fat dissolves in ethanol but not in water, so adding water leaves a cloudy white emulsion."),
  Q("x8", "practical", "hard", "To compare vitamin C in two juices fairly, a learner should", "use the same volume of DCPIP and the same size of drops for each juice", ["use a different amount of DCPIP for each", "heat one juice first", "add iodine to one juice"], "Only the juice should change. Everything else must be kept the same for a fair test."),

  // Diet and deficiency
  Q("d1", "diet", "easy", "A lack of vitamin C in the diet causes", "scurvy", ["rickets", "night blindness", "beriberi"], "Scurvy causes bleeding gums and slow healing. Citrus fruits are rich in vitamin C."),
  Q("d2", "diet", "easy", "Which food is a good source of vitamin C?", "Orange", ["Rice", "Palm oil", "Egg white"], "Citrus fruits, guava and tomatoes provide vitamin C."),
  Q("d3", "diet", "medium", "A child who does not get enough protein may develop", "kwashiorkor", ["scurvy", "rickets", "goitre"], "Kwashiorkor is caused by a severe lack of protein and shows as a swollen belly and thin limbs."),
  Q("d4", "diet", "medium", "Which deficiency disease is caused by too little vitamin D or calcium?", "Rickets", ["Scurvy", "Anaemia", "Kwashiorkor"], "Without enough vitamin D and calcium, bones become soft and bent."),
  Q("d5", "diet", "medium", "A lack of iron in the diet leads to", "anaemia", ["rickets", "goitre", "scurvy"], "Iron is needed to make haemoglobin in red blood cells."),
  Q("d6", "diet", "hard", "A diet with a lot more energy than the body uses is most likely to cause", "obesity", ["scurvy", "rickets", "night blindness"], "Excess energy is stored as fat in the body."),
  Q("d7", "diet", "medium", "Which of these is the best source of both protein and fat?", "Groundnut", ["Glucose", "Orange juice", "Rice"], "Groundnuts contain a lot of fat and a good amount of protein."),
  Q("d8", "diet", "hard", "A meal of yam and egg gives mainly which two nutrients?", "Starch and protein", ["Fat and vitamin C", "Sugar and fat", "Vitamin C and protein"], "Yam supplies starch and egg supplies protein."),
  Q("d9", "diet", "easy", "Which deficiency disease is caused by a lack of iodine?", "Goitre", ["Scurvy", "Rickets", "Anaemia"], "The thyroid gland needs iodine. Without it, the neck swells (goitre)."),
];

export const foodBank = makeBank({
  id: "food-tests",
  intro: "Randomised multiple-choice questions on food classes, the food tests and what they show. You get a score and an explanation for every question at the end.",
  note: "Original Rhinox practice questions following the Nigerian secondary Biology and Basic Science topics. They are not taken from past papers.",
  topics: TOPICS,
  seeds: SEEDS,
});
