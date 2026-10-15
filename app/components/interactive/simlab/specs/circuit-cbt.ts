// CBT practice for the electric circuit lab: an original bank following the
// Nigerian secondary Physics topics, plus fresh calculations in every exam.
// Written for Rhinox; not copied from past papers.

import { calcQuestion, makeBank, seed } from "../shell/cbt";
import { CALC_KINDS, generateCalc } from "./circuit-practice";

export const TOPICS = [
  { id: "basics", label: "Current, voltage, resistance" },
  { id: "arrangements", label: "Series and parallel" },
  { id: "ohm", label: "Ohm's law and power" },
  { id: "practical", label: "Practical technique" },
  { id: "calculations", label: "Calculations" },
];

const Q = seed;

const SEEDS = [
  // Basics
  Q("b1", "basics", "easy", "What is the SI unit of electric current?", "Ampere", ["Volt", "Ohm", "Watt"], "Current is measured in amperes (A)."),
  Q("b2", "basics", "easy", "What is the SI unit of resistance?", "Ohm", ["Ampere", "Volt", "Joule"], "Resistance is measured in ohms (Ω)."),
  Q("b3", "basics", "easy", "A battery provides a circuit with", "a voltage (energy for each unit of charge)", ["a supply of electrons that are used up", "resistance", "a magnetic field"], "A cell gives the charges energy. The electrons are already in the wires."),
  Q("b4", "basics", "easy", "Current will flow in a circuit only if", "the circuit is a complete loop", ["the switch is open", "there is no battery", "the wires are not connected"], "A gap, such as an open switch, stops the flow."),
  Q("b5", "basics", "medium", "Electric current is the", "rate of flow of electric charge", ["energy in a circuit", "opposition to flow", "push of the battery"], "Current = charge ÷ time."),
  Q("b6", "basics", "medium", "Which of these is a good conductor of electricity?", "Copper", ["Rubber", "Dry wood", "Glass"], "Metals have free electrons that carry charge."),
  Q("b7", "basics", "medium", "Which quantity is measured in volts?", "Potential difference", ["Current", "Resistance", "Power"], "Potential difference (voltage) is measured in volts."),
  Q("b8", "basics", "hard", "Why does a bulb's resistance rise as it gets brighter?", "The filament gets hotter and its atoms vibrate more, obstructing the electrons", ["The bulb gets bigger", "The battery gets weaker", "The wires get thicker"], "Heating the metal filament raises its resistance, so a lamp does not obey Ohm's law."),
  Q("b9", "basics", "medium", "A rheostat is used to", "change the resistance, and so the current", ["measure voltage", "store charge", "make the battery stronger"], "A variable resistor lets you adjust the current."),

  // Series and parallel
  Q("a1", "arrangements", "easy", "In a series circuit, the current is", "the same at every point", ["largest near the battery", "smallest at the first bulb", "zero"], "There is only one path, so the same current flows through every component."),
  Q("a2", "arrangements", "easy", "In a parallel circuit, each branch has", "the same voltage as the battery", ["a share of the voltage", "no current", "the highest resistance"], "Every branch is connected directly across the battery."),
  Q("a3", "arrangements", "easy", "Two identical bulbs in series are", "dimmer than one bulb on its own", ["brighter than one bulb", "the same as one bulb", "not lit"], "The voltage is shared between them, so each has less current."),
  Q("a4", "arrangements", "medium", "If one bulb in a parallel circuit breaks, the other bulbs", "stay lit", ["go out", "get dimmer", "blow"], "The other branches are still complete."),
  Q("a5", "arrangements", "medium", "If one bulb in a series circuit breaks, the other bulbs", "go out", ["get brighter", "stay lit", "blow"], "The loop is broken, so no current flows."),
  Q("a6", "arrangements", "medium", "Household lights are connected in parallel so that", "each works independently at full voltage", ["they all go out together", "they get dimmer", "they use no current"], "Parallel wiring gives every appliance the full mains voltage."),
  Q("a7", "arrangements", "hard", "Adding more bulbs in parallel makes the total current from the battery", "larger", ["smaller", "the same", "zero"], "Each new branch adds its own current."),
  Q("a8", "arrangements", "medium", "Adding more resistors in series makes the total resistance", "larger", ["smaller", "the same", "zero"], "Resistances in series add up."),
  Q("a9", "arrangements", "hard", "The total resistance of two resistors in parallel is always", "smaller than the smaller resistor", ["larger than both", "equal to their sum", "equal to their product"], "More paths for the current mean less resistance overall."),
  Q("a10", "arrangements", "medium", "The voltages across components in series", "add up to the battery voltage", ["are all equal to the battery voltage", "are zero", "are always the same"], "The battery's energy is shared among the components."),

  // Ohm's law and power
  Q("o1", "ohm", "easy", "Ohm's law says that for a metal at constant temperature, current is", "proportional to the voltage", ["inversely proportional to the voltage", "independent of the voltage", "proportional to the resistance"], "V = IR, so a V–I graph is a straight line through the origin."),
  Q("o2", "ohm", "easy", "Which formula is correct?", "V = I × R", ["V = I ÷ R", "I = V × R", "R = I ÷ V"], "Voltage = current × resistance."),
  Q("o3", "ohm", "medium", "The V–I graph for a filament lamp is a curve because", "its resistance increases as it heats up", ["its voltage is constant", "it has no resistance", "its current is constant"], "A straight line would mean constant resistance."),
  Q("o4", "ohm", "medium", "The voltage across a resistor is doubled. The current", "doubles", ["halves", "stays the same", "quadruples"], "Current is proportional to voltage."),
  Q("o5", "ohm", "medium", "The electrical power of a device is found from", "P = V × I", ["P = V ÷ I", "P = I ÷ V", "P = R ÷ V"], "Power = voltage × current, measured in watts."),
  Q("o6", "ohm", "hard", "A resistor has twice the resistance at the same voltage. The current is", "halved", ["doubled", "the same", "quadrupled"], "I = V ÷ R."),
  Q("o7", "ohm", "medium", "A battery with internal resistance gives a terminal voltage that is", "lower than its e.m.f. when a current flows", ["higher than its e.m.f.", "always zero", "always equal to its e.m.f."], "Some of the e.m.f. is lost as 'lost volts' across the internal resistance."),
  Q("o8", "ohm", "hard", "Why is a lamp's resistance higher when it is lit than when it is cold?", "The hot filament resists the flow of electrons more", ["The lit lamp is shorter", "The lit lamp is in series", "The battery is stronger"], "Resistance of a metal rises with temperature."),
  Q("o9", "ohm", "medium", "The unit of power is the", "watt", ["ohm", "ampere", "volt"], "1 watt = 1 joule per second."),

  // Practical technique
  Q("x1", "practical", "easy", "An ammeter is connected", "in series with the component", ["in parallel with the component", "across the battery only", "to the switch only"], "All the current must flow through the ammeter."),
  Q("x2", "practical", "easy", "A voltmeter is connected", "in parallel across the component", ["in series with the component", "in series with the battery", "after the switch only"], "It measures the potential difference between two points."),
  Q("x3", "practical", "medium", "Why should the switch be open while a circuit is being built?", "It stops current flowing while connections are made", ["It makes the battery last longer only", "It makes the bulb brighter", "It increases resistance"], "A circuit is safer and easier to change when no current flows."),
  Q("x4", "practical", "medium", "To get a range of readings for a V–I graph, you can", "change the rheostat", ["use a thicker table", "change the colour of the wires", "switch the lamp off"], "Moving the rheostat changes the current and the voltage across the lamp."),
  Q("x5", "practical", "medium", "A student's ammeter reads 0 although the lamp is not lit. A likely fault is", "a break in the circuit", ["the voltmeter is connected", "the resistance is too low", "the battery is too strong"], "No current means an open circuit somewhere."),
  Q("x6", "practical", "hard", "To find the resistance of a lamp you measure", "the voltage across it and the current through it", ["the temperature of the wire only", "the mass of the lamp", "the length of the wires only"], "Calculate R = V ÷ I."),
  Q("x7", "practical", "hard", "A V–I graph for a resistor is a straight line through the origin. This shows", "the resistance is constant", ["the resistance is increasing", "the voltage is constant", "the current is zero"], "Constant gradient means constant resistance."),
  Q("x8", "practical", "medium", "A bulb rated 4 V blows when connected to 6 V because", "too much current flows through the filament", ["the voltage is too low", "the resistance falls to zero", "the bulb is in series"], "More voltage means more current and power, and the filament overheats."),
];

export const circuitBank = makeBank({
  id: "electric-circuit",
  intro: "Randomised multiple-choice questions on circuits, Ohm's law and practical technique, with fresh numbers in the calculations. You get a score and an explanation for every question at the end.",
  note: "Original Rhinox practice questions following the Nigerian secondary Physics topics. They are not taken from past papers.",
  topics: TOPICS,
  seeds: SEEDS,
  generated: {
    topic: "calculations",
    make: (rnd) => CALC_KINDS.map((k) => calcQuestion(generateCalc(Math.floor(rnd() * 1e9), k.id), rnd, "calculations")),
  },
});
