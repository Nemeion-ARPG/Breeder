import Enum from '@/types/Enum'
import DATA from '@/data.yaml'

export const GENDERS = new Enum(DATA.genders)
export const MARKINGS = new Enum(DATA.markings.available)
export const MARKING_QUALITIES = new Enum(DATA.markings.qualities)
export const LIMITED_MARKINGS = new Enum(
    Object
        .entries(DATA.markings.available)
        .filter(entry => entry[1].quality === MARKING_QUALITIES.Limited)
        .map(entry => entry[0])
)
export const TRAITS = new Enum(DATA.traits.available)
export const TRAIT_QUALITIES = new Enum(DATA.traits.qualities)
export const TITAN_TRAITS = new Enum(DATA.titan_traits.available)
export const TITAN_TRAIT_QUALITIES = new Enum(DATA.titan_traits.qualities)
export const BUILDS = new Enum(DATA.builds.available)
export const COATS = new Enum(DATA.coats.available)
export const FURS = new Enum([DATA.furs.default, ...DATA.furs.rare_options])
export const MUTATIONS = new Enum(DATA.mutations.available)
export const ADDONS = new Enum(DATA.add_ons)
