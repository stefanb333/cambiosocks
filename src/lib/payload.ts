import 'server-only'
import { getPayload as getPayloadInstance } from 'payload'
import config from '@payload-config'

/** Payload Local API za server komponente i server akcije storefront-a. */
export const getPayload = () => getPayloadInstance({ config })
