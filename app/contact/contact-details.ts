// Rhinox Scientifica contact details — the single place to update them.
// Used by the contact page and its enquiry form.
export const contactDetails = {
  email: "rhinoxscientifica@gmail.com",
  phones: ["08038384183", "08032924659"],
  addressLines: [
    "Block 45A, Flat 5,",
    "Goodluck Jonathan Housing Estate,",
    "Idimu, Lagos, Nigeria.",
  ],
  mapQuery: "Goodluck Jonathan Housing Estate, Idimu, Lagos, Nigeria",
};

// Nigerian local numbers (080...) as international tel: links (+23480...).
export function telHref(phone: string) {
  return `tel:${phone.startsWith("0") ? `+234${phone.slice(1)}` : phone}`;
}

export const enquiryAreas = [
  "STEM Education & Books",
  "Coding & Robotics Training",
  "Laboratory Solutions & Equipment",
  "Schools & Institutional Partnerships",
  "Teacher Training & Workshops",
  "Shop & Orders",
  "Something else",
];
