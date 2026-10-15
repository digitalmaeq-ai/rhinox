// CBT practice for the electrolysis lab: an original bank following the
// Nigerian secondary Chemistry topics, plus fresh Faraday calculations in
// every exam. Written for Rhinox; not copied from past papers.

import { calcQuestion, makeBank, seed } from "../shell/cbt";
import { CALC_KINDS, generateCalc } from "./electrolysis-chem";

export const TOPICS = [
  { id: "basics", label: "Basic ideas" },
  { id: "products", label: "Products at the electrodes" },
  { id: "applications", label: "Uses of electrolysis" },
  { id: "faraday", label: "Faraday's laws" },
  { id: "practical", label: "Practical technique" },
  { id: "calculations", label: "Calculations" },
];

const Q = seed;

const SEEDS = [
  // Basic ideas
  Q("b1", "basics", "easy", "What is electrolysis?", "The decomposition of a molten or dissolved compound by passing an electric current through it", ["The melting of a metal by heating it", "The movement of electrons through a metal wire only", "The reaction of an acid with a metal"], "Electrolysis uses electrical energy to break down an ionic compound that is molten or in solution."),
  Q("b2", "basics", "easy", "Which of these is an electrolyte?", "Aqueous copper(II) sulfate", ["Copper wire", "Sugar solution", "Solid sodium chloride"], "An electrolyte contains ions that are free to move. Copper wire is a metal conductor, sugar is molecular, and in solid sodium chloride the ions are fixed in place."),
  Q("b3", "basics", "easy", "The cathode is the electrode connected to which terminal of the power supply?", "The negative terminal", ["The positive terminal", "Neither terminal", "Both terminals"], "The cathode is negative. Positive ions (cations) are attracted to it."),
  Q("b4", "basics", "easy", "During electrolysis, positive ions move towards the", "cathode", ["anode", "power supply", "salt bridge"], "Opposite charges attract: cations go to the negative cathode and anions go to the positive anode."),
  Q("b5", "basics", "medium", "Why does solid sodium chloride not conduct electricity?", "Its ions are held in fixed positions and cannot move", ["It contains no ions at all", "It is a covalent compound", "It is too cold"], "Solid sodium chloride is ionic, but the ions are locked in the lattice. When it is melted or dissolved the ions become free to move."),
  Q("b6", "basics", "medium", "How is the current carried through the electrolyte?", "By moving ions", ["By moving electrons", "By moving neutrons", "By the atoms of the electrodes"], "In the wires electrons carry the current. In the electrolyte it is carried by ions moving to the electrodes."),
  Q("b7", "basics", "medium", "At which electrode does oxidation (loss of electrons) take place?", "The anode", ["The cathode", "Both electrodes", "Neither electrode"], "Negative ions give up electrons at the positive anode, so oxidation happens there. Reduction happens at the cathode."),
  Q("b8", "basics", "medium", "What happens to a positive ion when it is discharged at the cathode?", "It gains electrons", ["It loses electrons", "It gains protons", "It loses neutrons"], "Positive ions gain electrons from the cathode and become neutral atoms or molecules."),
  Q("b9", "basics", "hard", "Which statement about inert electrodes is correct?", "They conduct electricity but do not take part in the reaction", ["They dissolve at the anode", "They are always made of copper", "They stop the current flowing"], "Graphite and platinum conduct but are unreactive, so only the ions in the electrolyte are discharged."),

  // Products at the electrodes
  Q("p1", "products", "easy", "Which gas forms at the cathode when dilute sulfuric acid is electrolysed?", "Hydrogen", ["Oxygen", "Sulfur dioxide", "Chlorine"], "Hydrogen ions gain electrons at the cathode: 2H⁺ + 2e⁻ → H₂."),
  Q("p2", "products", "easy", "Which gas forms at the anode when dilute sulfuric acid is electrolysed using inert electrodes?", "Oxygen", ["Hydrogen", "Sulfur trioxide", "Chlorine"], "Hydroxide ions are discharged in preference to sulfate ions, forming oxygen and water."),
  Q("p3", "products", "easy", "How is hydrogen gas identified?", "A lighted splint burns with a squeaky pop", ["It relights a glowing splint", "It turns limewater milky", "It bleaches damp litmus paper"], "Hydrogen burns explosively in air with a squeaky pop."),
  Q("p4", "products", "easy", "How is oxygen gas identified?", "It relights a glowing splint", ["It burns with a squeaky pop", "It turns limewater milky", "It bleaches damp litmus paper"], "Oxygen supports combustion, so a glowing splint bursts into flame."),
  Q("p5", "products", "medium", "Concentrated sodium chloride solution is electrolysed with inert electrodes. What forms at the anode?", "Chlorine", ["Oxygen", "Sodium", "Hydrogen"], "In a concentrated solution chloride ions are discharged in preference to hydroxide ions."),
  Q("p6", "products", "medium", "Concentrated sodium chloride solution is electrolysed with inert electrodes. What forms at the cathode?", "Hydrogen", ["Sodium", "Chlorine", "Oxygen"], "H⁺ ions from water are lower than Na⁺ in the electrochemical series, so hydrogen is formed, not sodium."),
  Q("p7", "products", "medium", "After concentrated brine has been electrolysed, which compound is left in the solution?", "Sodium hydroxide", ["Hydrochloric acid", "Sodium oxide", "Sodium chloride only, unchanged"], "Na⁺ ions stay in solution and OH⁻ ions build up as H⁺ is removed, so sodium hydroxide forms."),
  Q("p8", "products", "medium", "Copper(II) sulfate solution is electrolysed with graphite electrodes. What is seen at the cathode?", "A pink-brown deposit of copper", ["Bubbles of hydrogen", "A green gas", "The electrode dissolving"], "Cu²⁺ is lower than H⁺ in the electrochemical series, so copper is discharged: Cu²⁺ + 2e⁻ → Cu."),
  Q("p9", "products", "hard", "Copper(II) sulfate solution is electrolysed with copper electrodes. What happens at the anode?", "The anode dissolves as copper atoms become Cu²⁺ ions", ["Oxygen is given off", "Chlorine is given off", "Nothing happens"], "Copper atoms lose electrons more easily than OH⁻ ions, so the anode itself is oxidised: Cu → Cu²⁺ + 2e⁻."),
  Q("p10", "products", "hard", "Why does the blue colour fade with graphite electrodes but stay the same with copper electrodes?", "With copper electrodes, Cu²⁺ ions are replaced at the anode as fast as they are removed at the cathode", ["Copper electrodes give out blue light", "Graphite electrodes make the solution colder", "Copper electrodes stop the current"], "The blue colour is due to Cu²⁺. With graphite electrodes Cu²⁺ is removed and not replaced, so the colour fades."),
  Q("p11", "products", "medium", "In very dilute sodium chloride solution, what forms at the anode?", "Oxygen", ["Chlorine", "Hydrogen", "Sodium"], "When the chloride concentration is low, OH⁻ ions are discharged instead, giving oxygen."),
  Q("p12", "products", "hard", "Why is hydrogen, not sodium, formed at the cathode in aqueous sodium chloride?", "H⁺ is lower than Na⁺ in the electrochemical series, so it is discharged more easily", ["Sodium is a gas", "Sodium ions are negative", "Hydrogen is heavier than sodium"], "When two cations are present, the one lower in the electrochemical series is discharged first."),
  Q("p13", "products", "medium", "In the electrolysis of acidified water, the volumes of hydrogen and oxygen collected are in the ratio", "2 : 1", ["1 : 2", "1 : 1", "4 : 1"], "Each molecule of O₂ needs 4 electrons and each H₂ needs 2, so the same charge gives twice as many moles of hydrogen as oxygen."),
  Q("p14", "products", "hard", "Silver nitrate solution is electrolysed with inert electrodes. What forms at the cathode?", "Silver", ["Hydrogen", "Nitrogen dioxide", "Oxygen"], "Ag⁺ is far lower than H⁺ in the electrochemical series, so silver is deposited: Ag⁺ + e⁻ → Ag."),

  // Uses of electrolysis
  Q("a1", "applications", "easy", "In electroplating, the object to be plated is made the", "cathode", ["anode", "electrolyte", "power supply"], "The metal ions are discharged at the cathode, so the object to be coated is the cathode."),
  Q("a2", "applications", "easy", "Why are some objects electroplated?", "To protect them from corrosion or improve their appearance", ["To make them lighter", "To make them magnetic", "To make them dissolve"], "A thin layer of a resistant metal such as chromium or silver protects the surface and looks attractive."),
  Q("a3", "applications", "medium", "In the purification of copper, the impure copper is the", "anode", ["cathode", "electrolyte", "power supply"], "The impure copper anode dissolves and pure copper is deposited on the cathode."),
  Q("a4", "applications", "medium", "To silver-plate a spoon, which electrolyte is most suitable?", "Silver nitrate solution", ["Copper(II) sulfate solution", "Sodium chloride solution", "Dilute sulfuric acid"], "The electrolyte must contain the ions of the plating metal, so silver nitrate is used."),
  Q("a5", "applications", "medium", "Aluminium is extracted by electrolysis because", "it is too reactive to be extracted by heating with carbon", ["it is a very unreactive metal", "it is a gas at room temperature", "it has no ores"], "Metals above carbon in the reactivity series cannot be reduced by carbon, so electrolysis of the molten ore is used."),
  Q("a6", "applications", "medium", "Which pair of products is made industrially by the electrolysis of brine?", "Chlorine and sodium hydroxide", ["Ammonia and nitric acid", "Sulfuric acid and steel", "Carbon dioxide and water"], "Brine gives chlorine at the anode, hydrogen at the cathode and sodium hydroxide solution."),
  Q("a7", "applications", "hard", "When copper is purified, the 'anode sludge' that falls to the bottom contains", "unreactive impurities such as silver and gold", ["pure copper", "copper(II) sulfate", "hydrogen"], "Metals less reactive than copper do not dissolve. They fall off the anode as a sludge."),
  Q("a8", "applications", "easy", "Chromium plating on car parts is mainly used to", "resist corrosion and give a shiny finish", ["make the parts lighter", "make the parts magnetic", "make the parts conduct less"], "Chromium forms a hard, shiny, corrosion-resistant coating."),

  // Faraday's laws
  Q("f1", "faraday", "easy", "One faraday is the quantity of electricity carried by", "one mole of electrons", ["one electron", "one mole of protons", "one coulomb"], "One faraday is about 96 500 coulombs, the charge on one mole of electrons."),
  Q("f2", "faraday", "medium", "The quantity of electricity in coulombs is equal to", "current in amperes × time in seconds", ["voltage × time", "current ÷ time", "current × time in minutes"], "Q = I × t, with time in seconds."),
  Q("f3", "faraday", "medium", "The current is doubled and the time is kept the same. The mass of metal deposited", "doubles", ["halves", "stays the same", "quadruples"], "Mass is proportional to the charge, and charge = current × time."),
  Q("f4", "faraday", "medium", "How many faradays are needed to deposit one mole of copper from Cu²⁺?", "2 faradays", ["1 faraday", "3 faradays", "0.5 faraday"], "Cu²⁺ + 2e⁻ → Cu, so 2 moles of electrons are needed."),
  Q("f5", "faraday", "medium", "How many faradays are needed to deposit one mole of silver from Ag⁺?", "1 faraday", ["2 faradays", "3 faradays", "0.5 faraday"], "Ag⁺ + e⁻ → Ag, so 1 mole of electrons is needed."),
  Q("f6", "faraday", "hard", "The same charge flows through copper(II) sulfate and silver nitrate cells in series (Cu = 63.5, Ag = 108). Which cell gives the larger mass of metal?", "Silver, because 1 mol of electrons deposits 108 g of silver but only 31.75 g of copper", ["Copper, because copper ions carry two charges", "The masses are equal because the charge is equal", "Copper, because it has the smaller relative atomic mass"], "One mole of electrons deposits 1 mol of Ag (108 g) but only ½ mol of Cu (31.75 g)."),
  Q("f7", "faraday", "hard", "One faraday of charge liberates how many moles of hydrogen gas at the cathode?", "0.5 mol", ["1 mol", "2 mol", "0.25 mol"], "2H⁺ + 2e⁻ → H₂: one mole of electrons gives half a mole of H₂."),

  // Practical technique
  Q("x1", "practical", "easy", "How can the mass of copper deposited on a cathode be found?", "Dry and weigh the cathode before and after the experiment", ["Count the gas bubbles", "Measure the voltage only", "Weigh the electrolyte only"], "The increase in the cathode's mass is the mass of metal deposited."),
  Q("x2", "practical", "medium", "Why is the cathode rinsed gently and dried before it is weighed again?", "So that only the deposited metal is weighed, not the electrolyte", ["To make the copper dissolve", "To change the current", "To speed up the reaction"], "Electrolyte left on the surface would add to the mass."),
  Q("x3", "practical", "medium", "Why is the current kept constant during the experiment?", "So the charge passed can be found from current × time", ["So the electrodes do not dissolve", "So the electrolyte stays cold", "So the gases do not mix"], "With a steady current, Q = I × t is easy to calculate."),
  Q("x4", "practical", "medium", "Which instrument measures the current in the circuit?", "An ammeter connected in series", ["A voltmeter connected in series", "An ammeter connected in parallel", "A thermometer"], "An ammeter must be in series so the current flows through it."),
  Q("x5", "practical", "hard", "A learner finds the mass gained by the cathode is less than the calculated value. A likely reason is that", "some of the deposit flaked off when the cathode was removed", ["the current was larger than the ammeter reading", "the electrolysis ran for longer than recorded", "extra copper dissolved at the cathode"], "Loose deposit that falls off is not weighed, so the measured mass is too small."),
  Q("x6", "practical", "medium", "What is a rheostat used for in this circuit?", "To adjust the current", ["To measure the voltage", "To store charge", "To reverse the polarity"], "A variable resistor lets you set the current to a chosen value."),
];

export const electrolysisBank = makeBank({
  id: "electrolysis",
  intro: "Randomised multiple-choice questions on electrolysis, with fresh numbers in the Faraday calculations. You get a score and an explanation for every question at the end.",
  note: "Original Rhinox practice questions following the Nigerian secondary Chemistry topics. They are not taken from past papers.",
  topics: TOPICS,
  seeds: SEEDS,
  generated: {
    topic: "calculations",
    make: (rnd) => CALC_KINDS.map((k) => calcQuestion(generateCalc(Math.floor(rnd() * 1e9), k.id), rnd, "calculations")),
  },
});
