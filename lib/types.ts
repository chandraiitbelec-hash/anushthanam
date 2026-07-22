export type Language = 'en' | 'te' | 'ta' | 'hi';

export type Status = 'draft' | 'review' | 'published';

export type TranslationStatus = 'en-only' | 'partial' | 'complete';

export type TranslationResult = {
  value: string;
  isFallback: boolean;
  lang: Language;
};

export type God = {
  slug: string;
  name_en: string;
  name_te: string;
  name_ta: string;
  name_hi: string;
  name_sa: string;
  alternate_names_en: string;
  tradition: 'shaiva' | 'vaishnava' | 'shakta' | 'ganapatya' | 'saura' | 'kaumara' | 'smartha';
  description_en: string;
  description_te: string;
  description_ta: string;
  description_hi: string;
  iconography_en: string;
  illustration_filename: string;
  illustration_credit: string;
  image_drive_id: string;
  status: Status;
  translation_status: TranslationStatus;
};

export type GodLink = {
  god_slug: string;
  entity_type: 'shloka' | 'puja' | 'festival' | 'vratham';
  entity_slug: string;
  display_order: number;
};

export type ShlokaType =
  | 'shloka'
  | 'stotra'
  | 'sahasranama'
  | 'ashtothram'
  | 'mangalashtakam'
  | 'dhyanam'
  | 'kavacham'
  | 'suprabhatam'
  | 'chalisa';

export type Shloka = {
  slug: string;
  title_en: string;
  title_te: string;
  title_ta: string;
  title_hi: string;
  type: ShlokaType;
  deity_slug: string;
  source_scripture_en: string;
  language_of_composition: string;
  brief_intro_en: string;
  brief_intro_te: string;
  brief_intro_ta: string;
  brief_intro_hi: string;
  audio_drive_id: string;
  status: Status;
  translation_status: TranslationStatus;
};

export type ScriptLayer = 'script_devanagari' | 'script_telugu' | 'script_tamil' | 'roman_iast';

export type ShlokaStanza = {
  shloka_slug: string;
  stanza_number: number;
  stanza_label: string;
  script_devanagari: string;
  script_telugu: string;
  script_tamil: string;
  roman_iast: string;
  meaning_en: string;
  meaning_te: string;
  meaning_ta: string;
  meaning_hi: string;
  notes_en: string;
};

export type OccasionType = 'daily' | 'weekly' | 'monthly' | 'festival-specific' | 'vratham-specific' | 'general';

export type Puja = {
  slug: string;
  title_en: string;
  title_te: string;
  title_ta: string;
  title_hi: string;
  deity_slug: string;
  occasion_type: OccasionType;
  duration_minutes: number;
  brief_description_en: string;
  brief_description_te: string;
  brief_description_ta: string;
  brief_description_hi: string;
  materials_group_slug: string;
  prasad_en: string;
  prasad_te: string;
  prasad_ta: string;
  prasad_hi: string;
  regional_variation_notes_en: string;
  regional_variation_notes_te: string;
  regional_variation_notes_ta: string;
  regional_variation_notes_hi: string;
  status: Status;
  translation_status: TranslationStatus;
  // TRUE → shown in "Daily & Frequent" grid; FALSE → occasions-only.
  // A puja can be frequent AND mapped to occasions simultaneously.
  frequent: boolean;
};

// Life-occasion (samskara / one-time context).
// Section 2 of the Pujas experience: "Pujas for Occasions".
// Many-to-many with Puja via puja_occasions join tab.
export type Occasion = {
  slug: string;
  title_en: string;
  title_te: string;
  title_ta: string;
  title_hi: string;
  description_en: string;
  description_te: string;
  description_ta: string;
  description_hi: string;
  icon: string;
  display_order: number;
  status: Status;
};

// Join row from puja_occasions tab.
export type PujaOccasion = {
  occasion_slug: string;
  puja_slug: string;
  display_order: number;
};

export type Festival = {
  slug: string;
  title_en: string;
  title_te: string;
  title_ta: string;
  title_hi: string;
  alternate_names_en: string;
  deity_slugs: string;
  illustration_filename: string;
  illustration_drive_id: string;
  calendar_month: string;
  tithi: string;
  paksha: string;
  next_occurrence: string;
  next_occurrence_note_en: string;
  significance_en: string;
  significance_te: string;
  significance_ta: string;
  significance_hi: string;
  linked_puja_slug: string;
  linked_story_slug: string;
  materials_group_slug: string;
  regional_notes_en: string;
  status: Status;
  translation_status: TranslationStatus;
};

export type Vratham = {
  slug: string;
  title_en: string;
  title_te: string;
  title_ta: string;
  title_hi: string;
  deity_slug: string;
  observance_day: string;
  tithi: string;
  paksha: string;
  duration: string;
  next_occurrence: string;
  next_occurrence_note_en: string;
  fasting_rules_en: string;
  fasting_rules_te: string;
  fasting_rules_ta: string;
  fasting_rules_hi: string;
  benefits_en: string;
  benefits_te: string;
  benefits_ta: string;
  benefits_hi: string;
  linked_puja_slug: string;
  linked_story_slug: string;
  shloka_slug: string;
  shloka_start_date: string;
  status: Status;
  translation_status: TranslationStatus;
};

export type StoryType = 'vrata-katha' | 'mahatmya' | 'purana-story' | 'sthala-purana';

export type Story = {
  slug: string;
  title_en: string;
  title_te: string;
  title_ta: string;
  title_hi: string;
  deity_slug: string;
  story_type: StoryType;
  source_scripture_en: string;
  reading_instruction_en: string;
  brief_summary_en: string;
  brief_summary_te: string;
  brief_summary_ta: string;
  brief_summary_hi: string;
  gdoc_id_en: string;
  gdoc_id_te: string;
  gdoc_id_ta: string;
  gdoc_id_hi: string;
  parent_slug: string;
  parent_type: 'festival' | 'vratham' | '';
  status: Status;
  translation_status: TranslationStatus;
};

export type ProcedureStep = {
  parent_slug: string;
  parent_type: 'puja' | 'festival' | 'vratham';
  step_number: number;
  step_title_en: string;
  step_title_te: string;
  step_title_ta: string;
  step_title_hi: string;
  instruction_en: string;
  instruction_te: string;
  instruction_ta: string;
  instruction_hi: string;
  recite_shloka_slug: string;
  recite_stanza_range: string;
  notes_en: string;
  notes_te: string;
  notes_ta: string;
  notes_hi: string;
};

export type MaterialItem = {
  group_slug: string;
  item_order: number;
  item_name_en: string;
  item_name_te: string;
  item_name_ta: string;
  item_name_hi: string;
  // Quantity keeps numerals as digits; only the unit/descriptor words are localized
  // (e.g. en "2 cups" → te "2 కప్పులు"). quantity_en is the fallback.
  quantity_en: string;
  quantity_te: string;
  quantity_ta: string;
  quantity_hi: string;
  is_optional: boolean;
  substitution_note_en: string;
  substitution_note_te: string;
  substitution_note_ta: string;
  substitution_note_hi: string;
};

export type PanchangamDay = {
  date: string;
  tithi_en: string;
  tithi_number: number;
  paksha: string;
  nakshatra_en: string;
  yoga_en: string;
  karana_en: string;
  lunar_month_en: string;
  sunrise: string;
  sunset: string;
  rahu_kalam: string;
  special_event_en: string;
  special_event_te: string;
  special_event_ta: string;
  special_event_hi: string;
};

export type SearchRecord = {
  id: string;
  type: 'god' | 'festival' | 'vratham' | 'shloka';
  name_en: string;
  name_te: string;
  name_ta: string;
  name_hi: string;
  name_sa?: string;
  alternate_names?: string;
  shloka_type?: string;
  url: string;
  illustration_drive_id?: string;
};

export type ShlokaViewerState = {
  scriptLayers: Set<ScriptLayer>;
  showMeaning: boolean;
};
