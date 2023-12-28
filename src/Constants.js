import Enum from '@/types/Enum'
import data from '@/data.yaml'

export const GENDERS = new Enum(data.genders)
export const MARKINGS = new Enum(data.markings.available)
export const TRAITS = new Enum(data.traits.available)
export const TRAIT_QUALITIES = new Enum(data.traits.qualities)
export const BUILDS = new Enum(data.builds.available)
export const COATS = new Enum(data.coats)
export const FURS = new Enum([data.furs.base_option, ...data.furs.rare_options])
export const MUTATIONS = new Enum(data.mutations.available)
export const ADDONS = new Enum(data.add_ons)
