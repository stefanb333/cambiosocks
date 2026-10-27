import { linkFields } from '@/fields/link'
import type { Block } from 'payload'

/** Gradivni blokovi za statične stranice (O nama, Kontakt, FAQ, Dostava, Uslovi...). */

export const PageHeroBlock: Block = {
  slug: 'pageHero',
  labels: { singular: 'Hero sa slikom', plural: 'Hero sekcije' },
  fields: [
    {
      name: 'heading',
      label: 'Naslov (opciono)',
      type: 'text',
      admin: { description: 'Prazno = samo fotografija, kao na stranici O nama u dizajnu.' },
    },
    { name: 'subheading', label: 'Podnaslov', type: 'textarea' },
    { name: 'image', label: 'Slika', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'mobileImage',
      label: 'Slika za telefon (opciono)',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'overlay',
      label: 'Zatamnjenje slike (%)',
      type: 'number',
      min: 0,
      max: 90,
      defaultValue: 40,
    },
  ],
}

export const StoryBlock: Block = {
  slug: 'story',
  labels: { singular: 'Priča sa slikama', plural: 'Priče sa slikama' },
  fields: [
    {
      name: 'theme',
      label: 'Pozadina',
      type: 'select',
      defaultValue: 'light',
      options: [
        { label: 'Svetla', value: 'light' },
        { label: 'Plava', value: 'blue' },
      ],
    },
    { name: 'heading', label: 'Naslov', type: 'text', required: true },
    { name: 'lead', label: 'Uvodna rečenica', type: 'textarea' },
    { name: 'text', label: 'Tekst', type: 'textarea' },
    {
      name: 'images',
      label: 'Slike',
      type: 'array',
      maxRows: 4,
      fields: [
        { name: 'image', label: 'Slika', type: 'upload', relationTo: 'media', required: true },
      ],
    },
    { name: 'note', label: 'Napomena ispod slika', type: 'text' },
  ],
}

export const StatsBlock: Block = {
  slug: 'stats',
  labels: { singular: 'Brojke', plural: 'Brojke' },
  fields: [
    { name: 'heading', label: 'Naslov', type: 'text', required: true },
    { name: 'description', label: 'Opis', type: 'textarea' },
    {
      name: 'items',
      label: 'Brojke',
      type: 'array',
      maxRows: 6,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'number',
              label: 'Broj',
              type: 'text',
              required: true,
              admin: { width: '33%' },
            },
            { name: 'label', label: 'Opis', type: 'text', required: true, admin: { width: '33%' } },
            {
              name: 'highlight',
              label: 'Žuta boja broja',
              type: 'checkbox',
              admin: { width: '33%' },
            },
          ],
        },
        { name: 'image', label: 'Slika u pozadini', type: 'upload', relationTo: 'media' },
      ],
    },
    { name: 'ctaText', label: 'Tekst poziva na akciju', type: 'text' },
    { ...linkFields('cta', 'Dugme'), admin: { description: 'Npr. "Pogledaj kolekciju".' } },
  ],
}

export const FaqBlock: Block = {
  slug: 'faq',
  labels: { singular: 'Česta pitanja', plural: 'Česta pitanja' },
  fields: [
    { name: 'heading', label: 'Naslov', type: 'text', required: true },
    { name: 'description', label: 'Opis', type: 'textarea' },
    {
      name: 'items',
      label: 'Pitanja',
      type: 'array',
      fields: [
        { name: 'question', label: 'Pitanje', type: 'text', required: true },
        { name: 'answer', label: 'Odgovor', type: 'textarea', required: true },
      ],
    },
    {
      name: 'support',
      label: 'Kartica "Niste pronašli odgovor?"',
      type: 'group',
      fields: [
        { name: 'show', label: 'Prikaži', type: 'checkbox', defaultValue: true },
        { name: 'title', label: 'Naslov', type: 'text' },
        { name: 'text', label: 'Tekst', type: 'textarea' },
        { name: 'buttonLabel', label: 'Tekst dugmeta', type: 'text' },
        { name: 'buttonUrl', label: 'Link dugmeta', type: 'text', defaultValue: '/kontakt' },
        { name: 'availability', label: 'Radno vreme', type: 'text' },
      ],
    },
  ],
}

export const ContactBlock: Block = {
  slug: 'contact',
  labels: { singular: 'Kontakt', plural: 'Kontakt' },
  fields: [
    { name: 'heading', label: 'Naslov', type: 'text', required: true },
    { name: 'description', label: 'Opis', type: 'textarea' },
    {
      type: 'row',
      fields: [
        { name: 'email', label: 'Email', type: 'text', admin: { width: '33%' } },
        { name: 'phone', label: 'Telefon', type: 'text', admin: { width: '33%' } },
        { name: 'address', label: 'Adresa', type: 'text', admin: { width: '33%' } },
      ],
    },
    { name: 'availability', label: 'Radno vreme', type: 'text' },
    { name: 'formHeading', label: 'Naslov forme', type: 'text' },
    { name: 'formDescription', label: 'Opis forme', type: 'text' },
    {
      name: 'topics',
      label: 'Teme (jedna po redu)',
      type: 'textarea',
    },
    { name: 'consentText', label: 'Tekst saglasnosti', type: 'text' },
    { name: 'responseNote', label: 'Napomena o odgovoru', type: 'text' },
    { name: 'successMessage', label: 'Poruka posle slanja', type: 'text' },
  ],
}

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'Tekst', plural: 'Tekst' },
  fields: [{ name: 'content', label: 'Sadržaj', type: 'richText', required: true }],
}

export const CtaBannerBlock: Block = {
  slug: 'ctaBanner',
  labels: { singular: 'CTA baner', plural: 'CTA baneri' },
  fields: [
    { name: 'headingLine1', label: 'Naslov, prvi red', type: 'text', required: true },
    { name: 'headingLine2', label: 'Naslov, drugi red', type: 'text' },
    { name: 'text', label: 'Tekst', type: 'textarea' },
    { name: 'image', label: 'Pozadinska slika', type: 'upload', relationTo: 'media' },
    linkFields('cta', 'Dugme'),
  ],
}

export const pageBlocks = [
  PageHeroBlock,
  StoryBlock,
  StatsBlock,
  FaqBlock,
  ContactBlock,
  RichTextBlock,
  CtaBannerBlock,
]
