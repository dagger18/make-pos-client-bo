const list = [
  {
    'enums': 'CARRIER',
    'value': 'CA',
    'slug': 'carrier',
    'single': $gettext('Carrier'),
    'plural': $gettext('Carriers')
  },
  {
    'enums': 'COLOADER',
    'value': 'CL',
    'slug': 'co-loader',
    'single': $gettext('Co-loader'),
    'plural': $gettext('Co-loaders')
  },
  {
    'enums': 'AIRLINE',
    'value': 'AL',
    'slug': 'airline',
    'single': $gettext('Airline'),
    'plural': $gettext('Airlines')
  },
  {
    'enums': 'AGENT',
    'value': 'AG',
    'slug': 'agent',
    'single': $gettext('Agent'),
    'plural': $gettext('Agents')
  },
  {
    'enums': 'TRUCKING',
    'value': 'TK',
    'slug': 'trucking-vendor',
    'single': $gettext('Trucking Vendor'),
    'plural': $gettext('Trucking Vendors')
  },
  {
    'enums': 'OTHER',
    'value': 'OT',
    'slug': 'other-vendor',
    'single': $gettext('Other Vendor'),
    'plural': $gettext('Other Vendors')
  },
]
export const getList = list
export const slugToProviderType = (findSlug) => {
  return {...list.find(({slug}) => slug === findSlug)}
}
export const valueToSlug = (findValue) => {
  return list.find(({value}) => value === findValue).slug
}

