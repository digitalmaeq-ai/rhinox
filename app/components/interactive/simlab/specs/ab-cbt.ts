// CBT practice for the acids and bases lab: an original bank following the
// Nigerian secondary Chemistry / Basic Science topics. Written for Rhinox;
// not copied from past papers.

import { makeBank, seed } from "../shell/cbt";

export const TOPICS = [
  { id: "indicators", label: "Indicators" },
  { id: "ph", label: "The pH scale" },
  { id: "properties", label: "Properties and reactions" },
  { id: "uses", label: "Uses and safety" },
];

const Q = seed;

const SEEDS = [
  // Indicators
  Q("i1", "indicators", "easy", "Blue litmus paper turns red in", "an acid", ["an alkali", "pure water", "sugar solution"], "Acids turn blue litmus red."),
  Q("i2", "indicators", "easy", "Red litmus paper turns blue in", "an alkali", ["an acid", "vinegar", "lemon juice"], "Alkalis turn red litmus blue."),
  Q("i3", "indicators", "easy", "What colour is phenolphthalein in an alkali?", "Pink", ["Colourless", "Yellow", "Red"], "Phenolphthalein is colourless in acids and neutral liquids and pink in alkalis."),
  Q("i4", "indicators", "easy", "What colour is methyl orange in a strong acid?", "Red", ["Yellow", "Blue", "Colourless"], "Methyl orange is red in acid and yellow in alkaline conditions."),
  Q("i5", "indicators", "medium", "What is the purpose of an indicator?", "To show whether a liquid is acidic or alkaline by its colour", ["To neutralise an acid", "To measure the mass of a solution", "To make a solution hot"], "Indicators change colour with pH."),
  Q("i6", "indicators", "medium", "Which indicator can be used to estimate the pH of a liquid?", "Universal indicator", ["Litmus", "Phenolphthalein", "Methyl orange"], "Universal indicator is a mixture that gives a different colour across the pH scale."),
  Q("i7", "indicators", "medium", "A liquid is colourless with phenolphthalein. Which statement must be true?", "It is not a strong alkali", ["It is an acid", "It is neutral", "It has a pH above 12"], "Phenolphthalein is colourless in acids, neutral liquids and weak alkalis, so you cannot tell which."),
  Q("i8", "indicators", "medium", "Litmus stays purple in a liquid. The liquid is most likely", "neutral", ["a strong acid", "a strong alkali", "an indicator"], "Purple litmus means the liquid is neither clearly acidic nor alkaline."),
  Q("i9", "indicators", "hard", "A liquid turns methyl orange yellow and phenolphthalein colourless. Its pH is most likely", "between about 5 and 8", ["below 2", "above 11", "exactly 14"], "Methyl orange is yellow above 4.4 and phenolphthalein is colourless below 8.2."),
  Q("i10", "indicators", "medium", "Natural indicators can be made from", "red cabbage or hibiscus flowers", ["table salt", "sand", "pure water"], "Many plant pigments change colour with pH."),

  // The pH scale
  Q("p1", "ph", "easy", "A liquid has a pH of 2. It is", "a strong acid", ["a weak acid", "neutral", "an alkali"], "A pH well below 7 means a strong acid."),
  Q("p2", "ph", "easy", "What is the pH of pure water?", "7", ["0", "10", "14"], "Pure water is neutral."),
  Q("p3", "ph", "easy", "A liquid has a pH of 13. It is", "a strong alkali", ["a weak alkali", "neutral", "an acid"], "A pH close to 14 means a strong alkali."),
  Q("p4", "ph", "medium", "Compared with a liquid of pH 5, a liquid of pH 3 has", "100 times more hydrogen ions", ["2 times more hydrogen ions", "100 times fewer hydrogen ions", "the same hydrogen ions"], "Each pH unit is a factor of ten, so two units is 10 × 10 = 100."),
  Q("p5", "ph", "medium", "A strong acid of pH 2 is diluted ten times with water. Its new pH is about", "3", ["1", "2", "7"], "Diluting a strong acid tenfold raises the pH by one unit."),
  Q("p6", "ph", "medium", "As an acid is diluted with a lot of water, its pH", "rises towards 7", ["falls towards 0", "becomes 14", "stays the same"], "Dilution lowers the concentration of H⁺ ions, so the pH moves up but never passes 7."),
  Q("p7", "ph", "hard", "Why can dilution never turn an acid into an alkali?", "Water is neutral, so the pH can only approach 7", ["Water is a base", "Water makes it stronger", "The acid is used up"], "Adding neutral water cannot make the liquid alkaline."),
  Q("p8", "ph", "medium", "Which of these has the lowest pH?", "Dilute hydrochloric acid", ["Vinegar", "Milk", "Pure water"], "Strong acids have the lowest pH."),
  Q("p9", "ph", "hard", "A pH meter gives 6.5 for milk. How should this be described?", "Very slightly acidic", ["Strongly acidic", "Neutral exactly", "Alkaline"], "6.5 is just below 7."),
  Q("p10", "ph", "medium", "Which ion is present in larger amounts in an acid than in pure water?", "Hydrogen ion, H⁺", ["Hydroxide ion, OH⁻", "Chloride ion only", "Sodium ion"], "Acids give hydrogen ions in water."),

  // Properties and reactions
  Q("r1", "properties", "easy", "What is made when an acid reacts with an alkali?", "A salt and water", ["Hydrogen only", "Carbon dioxide only", "A stronger acid"], "This is neutralisation."),
  Q("r2", "properties", "easy", "Which gas is given off when an acid reacts with a reactive metal such as magnesium?", "Hydrogen", ["Oxygen", "Carbon dioxide", "Chlorine"], "Acid + metal → salt + hydrogen."),
  Q("r3", "properties", "medium", "Which gas is given off when an acid reacts with a carbonate?", "Carbon dioxide", ["Hydrogen", "Oxygen", "Ammonia"], "Acid + carbonate → salt + water + carbon dioxide."),
  Q("r4", "properties", "medium", "Which ion do all alkalis have in solution?", "Hydroxide ion, OH⁻", ["Hydrogen ion, H⁺", "Chloride ion", "Sulfate ion"], "Alkalis release hydroxide ions in water."),
  Q("r5", "properties", "medium", "What is the difference between a strong acid and a weak acid?", "A strong acid is fully split into ions in water; a weak acid is only partly split", ["A strong acid is always more concentrated", "A weak acid has a pH of 7", "A strong acid contains no water"], "Strength is about how much the acid ionises, not how much is dissolved."),
  Q("r6", "properties", "hard", "Equal amounts of dilute hydrochloric acid and sodium hydroxide of the same concentration are mixed. The mixture is", "neutral, with a pH close to 7", ["strongly acidic", "strongly alkaline", "a gas"], "HCl + NaOH → NaCl + H₂O: a neutral solution of sodium chloride."),
  Q("r7", "properties", "medium", "Which is the best description of an alkali?", "A base that dissolves in water", ["Any substance that tastes sour", "A liquid with a pH of 7", "A salt"], "Bases that are soluble in water are called alkalis."),
  Q("r8", "properties", "hard", "Why does a strong acid have a lower pH than a weak acid of the same concentration?", "It produces more hydrogen ions", ["It is hotter", "It contains more water", "It contains hydroxide ions"], "A strong acid ionises fully, so the H⁺ concentration is higher."),
  Q("r9", "properties", "medium", "What is the general name for a substance that neutralises an acid?", "A base", ["An indicator", "A salt", "A solvent"], "Bases react with acids to form salt and water."),

  // Uses and safety
  Q("u1", "uses", "easy", "Why do people take antacid tablets for indigestion?", "They neutralise excess stomach acid", ["They add more acid", "They make stomach acid stronger", "They kill indicators"], "Antacids are weak bases."),
  Q("u2", "uses", "easy", "Which of these contains an acid?", "Lime juice", ["Soap", "Baking soda", "Milk of magnesia"], "Citrus fruits contain citric acid."),
  Q("u3", "uses", "medium", "A farmer adds lime (calcium hydroxide) to acidic soil to", "neutralise the acid", ["make it more acidic", "kill all plants", "add sodium"], "Lime is an alkali that raises the soil pH."),
  Q("u4", "uses", "medium", "Toothpaste is usually weakly alkaline because it", "neutralises acids made by bacteria in the mouth", ["makes teeth acidic", "contains vinegar", "is made from water only"], "Bacteria make acids that attack tooth enamel."),
  Q("u5", "uses", "medium", "An acid splashes on skin. The first thing to do is", "wash it with plenty of water", ["rub it in", "taste it", "pour on a strong alkali"], "Rinse at once with a lot of water. A strong alkali would add a second hazard."),
  Q("u6", "uses", "medium", "Why is it unsafe to taste unknown liquids in a laboratory?", "They may be corrosive or poisonous", ["They are always sour", "They are always neutral", "They change colour"], "Never taste anything in a laboratory."),
  Q("u7", "uses", "hard", "A bee sting is acidic and a wasp sting is alkaline. Which would soothe the wasp sting?", "A weak acid such as vinegar", ["Baking soda solution", "Soap solution", "Pure water has the same effect"], "A weak acid neutralises the alkaline sting."),
  Q("u8", "uses", "medium", "Which household substance is an alkali?", "Soap solution", ["Vinegar", "Lime juice", "Cola"], "Soaps and many cleaners are alkaline."),
  Q("u9", "uses", "easy", "Acid rain can damage", "buildings made of limestone", ["glass only", "plastic bottles only", "nothing"], "Acids react with the carbonate in limestone."),
];

export const abBank = makeBank({
  id: "acids-bases",
  intro: "Randomised multiple-choice questions on indicators, the pH scale and the properties of acids and alkalis. You get a score and an explanation for every question at the end.",
  note: "Original Rhinox practice questions following the Nigerian secondary Chemistry and Basic Science topics. They are not taken from past papers.",
  topics: TOPICS,
  seeds: SEEDS,
});
