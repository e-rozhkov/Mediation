// Existing bookmarks keep working after the document replaces the course and library.
export const lessonAliases: Record<string, string> = {
  "pravila-razgovora": "nash-obshchiy-plan",
  "chto-vazhno-mne": "ischem-varianty",
  "chto-vazhno-drugomu": "ischem-varianty",
};
export const resourceAliases: Record<string, string> = {
  slushat: "govorit-bez-obvineniya",
  "igra-pamyatka": "kak-dogovoritsya",
  "podderzhat-rebenka": "pomoshch-vzroslyh",
  "obsuzhdenie-v-klasse": "primiritelnaya-vstrecha",
  "razgovor-vzroslyh": "shkolnaya-mediaciya",
};
export const moduleAliases: Record<string, string> = {
  "slushat-i-govorit": "kto-pomogaet-module",
  "chto-vazhno-kazhdomu": "kto-pomogaet-module",
  "kak-dogovoritsya-module": "kto-pomogaet-module",
};
export const canonicalLesson = (slug = "") => lessonAliases[slug] ?? slug;
export const canonicalResource = (slug = "") => resourceAliases[slug] ?? slug;
export const canonicalModule = (slug = "") => moduleAliases[slug] ?? slug;
