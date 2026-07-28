
import { gettext } from '@/plugins/gettext';
import { useAuthStore } from '@/stores/authStore';
import { enums as ChargeType, getList as chargeTypeList, valueToSlug as ChargeTypeSlug } from './ChargeType';
import { getAccountingMenuList } from './EbitNoteType';
import { enums as TransportType, valueToSlug as TransportTypeSlug } from './TransportType';
const { $gettext } = gettext
export const firstLibraryChargeRouteFromAbilities = () => {
  const abilities = useCookie('userAbilityRules').value ?? (useAuthStore ? useAuthStore() : {userAbilityRules: null}).userAbilityRules

  if(!abilities) return null

  const firstChargeType = chargeTypeList.find(
    cT => abilities.some(
      ability => (ability.action === 'MANAGE_' + cT.enums && ability.subject === 'Charge')
                || (ability.action === 'manage' && ability.subject === 'all')
    )
  )
  if(firstChargeType) {
    return {
      name: 'library-charge-type-charge-transport-type',
      params: { chargeType: firstChargeType.slug, transportType: TransportTypeSlug(TransportType.AIR) }
    }
  }
  return null
}
export const firstAccountingRouteFromAbilities = () => {
  const abilities = useCookie('userAbilityRules').value ?? (useAuthStore ? useAuthStore() : {userAbilityRules: null}).userAbilityRules

  if(!abilities) return null
  const firstType = getAccountingMenuList.find(
    ct => abilities.some(
      ability => (
        ability.action === ('MANAGE_' + (ct.value.startsWith('SOA') ? 'SOA' : ct.value))
        && ability.subject === 'EbitNote'
      ) || (ability.action === 'manage' && ability.subject === 'all')
    )
  )
  if(firstType) {
    return {
      name: 'accounting-' + firstType.value.toLowerCase(),
    }
  }
  return null
}
export const firstRateRouteFromAbilities = () => {
  const abilities = useCookie('userAbilityRules').value
                  ?? (useAuthStore
                      ? useAuthStore()
                      : {userAbilityRules: null}
                    ).userAbilityRules
  let chargeType = null
  if(abilities.some(({subject, action}) => subject === 'Rate' && action === 'MANAGE_Freight' || (action === 'manage' && subject === 'all'))) {
    chargeType = 'freight'
  } else if(abilities.some(({subject, action}) => subject === 'Rate' && action === 'MANAGE_Local')) {
    chargeType = 'local'
  } else if(abilities.some(({subject, action}) => subject === 'Rate' && action === 'MANAGE_Service')) {
    chargeType = 'service'
  } else if(abilities.some(({subject, action}) => subject === 'Rate' && action === 'MANAGE_Customs')) {
    chargeType = 'customs'
  }
  if(chargeType) {
    return {
      name: 'rate-charge-type-transport-type',
      params: { transportType: TransportTypeSlug(TransportType.AIR), chargeType }
    }
  }
  return null
}
export const firstLibraryRouteFromAbilities = () => {
  const abilities = useCookie('userAbilityRules').value ?? (useAuthStore ? useAuthStore() : {userAbilityRules: null}).userAbilityRules

  const chargeRoute = firstLibraryChargeRouteFromAbilities()
  if(chargeRoute) return chargeRoute

  if(abilities.some(({subject}) => subject === 'PackageType'))
    return {name: 'library-package-type', params : { transportType: TransportTypeSlug(TransportType.AIR) }}
  if(abilities.some(({subject}) => subject === 'Incoterm'))
    return {name: 'library-incoterm'}
  if(abilities.some(({subject}) => subject === 'TaxGroup'))
    return {name: 'library-tax-group'}
  if(abilities.some(({subject}) => subject === 'PaymentMethod'))
    return {name: 'library-payment-method'}
  if(abilities.some(({subject}) => subject === 'ShipmentMode'))
    return {name: 'library-shipment-mode'}
}
export const firstConfigRouteFromAbilities = () => {
  const abilities = useCookie('userAbilityRules').value ?? (useAuthStore ? useAuthStore() : {userAbilityRules: null}).userAbilityRules
  if(!abilities) return null
  const hasUserPermission = abilities.some(
    ability => ability.subject === 'User'
              || (ability.action === 'MANAGE' && ability.subject ==='all')
  )
  if(hasUserPermission) return {name: 'setting-user'}

  const hasGroupPermission = abilities.some(
    ability => ability.subject === 'Group'
  )
  if(hasGroupPermission) return {name: 'setting-group'}

  const hasConfigPermission = abilities.some(
    ability => ability.subject === 'Config'
  )
  if(hasConfigPermission) return {name: 'setting-global-setting'}
}
export const permissionModules = () => {
  return [
    {
      'value': 'Client',
      'text': $gettext('Clients Permissions'),
      'to': { name: 'client' },
      'permissions': [
        
        {'enums': 'Client_GET', 'value': '298', 'title': $gettext('View Client')},
        {'enums': 'Client_POST',   'value': '200', 'title': $gettext('Add Client')},
        {'enums': 'Client_PUT',    'value': '201', 'title': $gettext('Update Client')},
        {'enums': 'Client_DELETE', 'value': '202', 'title': $gettext('Delete Client')},
        {'enums': 'Client_SEEALL', 'value': '299', 'title': $gettext('Manage All Client')},
      ]
    },
    {
      'value': 'Provider',
      'text': $gettext('Providers Permissions'),
      'to': { name: 'provider-provider-type', params: {providerType: 'airline'} },
      'permissions': [
        {'enums': 'Provider_GET',    'value': '198', 'title': $gettext('View Provider')},
        {'enums': 'Provider_POST',   'value': '100', 'title': $gettext('Add Provider')},
        {'enums': 'Provider_PUT',    'value': '101', 'title': $gettext('Update Provider')},
        {'enums': 'Provider_DELETE', 'value': '102', 'title': $gettext('Delete Provider')},
        {'enums': 'Provider_SEEALL', 'value': '199', 'title': $gettext('Manage All Providers')},
      ],
    },
    {
      'value': 'Quote',
      'text': $gettext('Quotes Permissions'),
      'to': { name: 'quote-transport-type', params: {transportType: TransportTypeSlug(TransportType.AIR)} },
      'permissions': [
        {'enums': 'Quote_GET',   'value': '398', 'title': $gettext('View Quote')},
        {'enums': 'Quote_POST',   'value': '300', 'title': $gettext('Add Quote')},
        {'enums': 'Quote_PUT',    'value': '301', 'title': $gettext('Update Quote')},
        {'enums': 'Quote_DELETE', 'value': '302', 'title': $gettext('Delete Quote')},
        {'enums': 'Quote_SEEALL', 'value': '399', 'title': $gettext('Manage All Quotes')},
      ]
    },
    {
      'value': 'Rate',
      'text': $gettext('Rates Permissions'),
      get to() { return firstRateRouteFromAbilities() },
      'permissions': [
        {'enums': 'Rate_MANAGE_Freight', 'value': '853', 'title': $gettext('Manage Rate - Freight')},
        {'enums': 'Rate_MANAGE_Local', 'value': '851', 'title': $gettext('Manage Rate - Local')},
        {'enums': 'Rate_MANAGE_Service',     'value': '852', 'title': $gettext('Manage Rate - Service')},
        {'enums': 'Rate_MANAGE_Customs',      'value': '850', 'title': $gettext('Manage Rate - Customs')},
        {'enums': 'Rate_MANAGE_Import', 'value': '854', 'title': $gettext('Manage Rate - Import')},
      ]
    },
    {
      'value': 'Shipment',
      'text': $gettext('Shipment Permissions'),
      'to': { name: 'shipment-transport-type', params: {transportType: TransportTypeSlug(TransportType.AIR)} },
      'permissions': [
        {'enums': 'Shipment_GET',   'value': '498', 'title': $gettext('View Shipment')},
        {'enums': 'Shipment_POST',               'value': '400', 'title': $gettext('Add Shipment')},
        {'enums': 'Shipment_DELETE',             'value': '401', 'title': $gettext('Delete Shipment')},
        {'enums': 'Shipment_PUT_Status',         'value': '402', 'title': $gettext('Change Status (To Complete)')},
        {'enums': 'Shipment_PUT_StatusRevert',   'value': '410', 'title': $gettext('Change Status (Complete To Active)')},
        {'enums': 'Shipment_PUT_Manager',        'value': '404', 'title': $gettext('Change Account Manager')},
        {'enums': 'Shipment_MANAGE_Booking',     'value': '405', 'title': $gettext('Manage Booking')},
        {'enums': 'Shipment_MANAGE_Instruction', 'value': '406', 'title': $gettext('Manage Instruction')},
        {'enums': 'Shipment_PUT_Documents',      'value': '403', 'title': $gettext('Manage Documents')},
        {'enums': 'Shipment_MANAGE_Pricing',     'value': '408', 'title': $gettext('Manage Pricing')},
        {'enums': 'Shipment_MANAGE_Ebitnote',    'value': '407', 'title': $gettext('Manage Profit/Loss')},
        {'enums': 'Shipment_PUT_AssignedUsers',  'value': '409', 'title': $gettext('Manage Subscribers')},
        {'enums': 'Shipment_SEEALL',             'value': '499', 'title': $gettext('Manage All Shipments')},
        {'enums': 'Consolidation_GET', 'value': '910', 'title': $gettext('View Consolidations')},
      ]
    },
    {
      'value': 'Library',
      'aliasValues': ['Charge', 'PackageType', 'Incoterm','TaxGroup', 'PaymentMethod', 'ShipmentMode', 'HsCode', 'DutyRate', 'HsRestriction', 'CarrierEventMapping'],
      'text': $gettext('Library Permissions'),
      get to() { return firstLibraryRouteFromAbilities() },
      'permissions': [
        {'enums': 'Charge_MANAGE_Local',     'value': '801', 'title': $gettext('Manage Local Charge')},
        {'enums': 'Charge_MANAGE_Service',     'value': '802', 'title': $gettext('Manage Service Charge')},
        {'enums': 'Charge_MANAGE_Customs',     'value': '800', 'title': $gettext('Manage Custom Charge')},
        {'enums': 'Charge_MANAGE_Freight',     'value': '803', 'title': $gettext('Manage Freight Charge')},
        {'enums': 'PackageType_MANAGE',   'value': '804', 'title': $gettext('Manage Package Type')},
        {'enums': 'Incoterm_MANAGE',      'value': '805', 'title': $gettext('Manage Incoterm')},
        {'enums': 'TaxGroup_MANAGE',      'value': '806', 'title': $gettext('Manage Tax Group')},
        {'enums': 'PaymentMethod_MANAGE', 'value': '807', 'title': $gettext('Manage Payment Method')},
        {'enums': 'ShipmentMode_MANAGE',  'value': '808', 'title': $gettext('Manage Shipment Mode')},
        {'enums': 'HsCode_MANAGE',             'value': '809', 'title': $gettext('Manage HS Codes')},
        {'enums': 'DutyRate_MANAGE',           'value': '810', 'title': $gettext('Manage Duty Rates')},
        {'enums': 'HsRestriction_MANAGE',      'value': '811', 'title': $gettext('Manage HS Restrictions')},
        {'enums': 'CarrierEventMapping_MANAGE','value': '812', 'title': $gettext('Manage Carrier Event Mappings')},
      ],
    },
    {
      'value': 'Accounting',
      'icon': 'calculator',
      'text': $gettext('Accountings'),
      get to() { return firstAccountingRouteFromAbilities() },
      'permissions': [
        {'enums': 'EbitNote_MANAGE_ID',  'value': '500', 'title': $gettext('Manage Invoice Debit')},
        {'enums': 'EbitNote_MANAGE_IC',  'value': '501', 'title': $gettext('Manage Invoice Credit')},
        {'enums': 'EbitNote_MANAGE_DN',  'value': '502', 'title': $gettext('Manage Debit Note')},
        {'enums': 'EbitNote_MANAGE_PO',  'value': '503', 'title': $gettext('Manage POBO')},
        {'enums': 'EbitNote_MANAGE_CO',  'value': '504', 'title': $gettext('Manage COBO')},
        {'enums': 'EbitNote_MANAGE_RPT', 'value': '505', 'title': $gettext('Manage Receipt Record')},
        {'enums': 'EbitNote_MANAGE_PMT', 'value': '506', 'title': $gettext('Manage Payment Record')},
        {'enums': 'EbitNote_MANAGE_SOA', 'value': '507', 'title': $gettext('Manage SOA')},
      ]
    },
    {
      'value': 'Config',
      'aliasValues': ['User', 'Group', 'Config', 'PriceMarkup', 'Branch', 'Department', 'Warehouse', 'CRM', 'ChartOfAccounts'],
      'icon': 'settings-cog',
      'text': $gettext('Admin & Manager Permissions'),
      get to() { return firstConfigRouteFromAbilities() },
      'permissions': [
        {'enums': 'User_GET',           'value': '907', 'title': $gettext('View Users')},
        {'enums': 'User_POST',          'value': '900', 'title': $gettext('Invite User')},
        {'enums': 'User_PUT',           'value': '901', 'title': $gettext('Update User')},
        {'enums': 'User_DELETE',        'value': '902', 'title': $gettext('Remove User')},
        {'enums': 'Group_MANAGE',       'value': '903', 'title': $gettext('Manage Group')},
        {'enums': 'Config_MANAGE',      'value': '904', 'title': $gettext('Manage Settings')},
        {'enums': 'PriceMarkup_MANAGE', 'value': '905', 'title': $gettext('Manage Price Markup')},
        {'enums': 'Report_MANAGE',      'value': '906', 'title': $gettext('Manage Report')},
        {'enums': 'Branch_MANAGE',      'value': '908', 'title': $gettext('Manage Branches')},
        {'enums': 'Department_MANAGE',  'value': '909', 'title': $gettext('Manage Departments')},
        {'enums': 'Warehouse_MANAGE',   'value': '911', 'title': $gettext('Manage Warehouse')},
        {'enums': 'CRM_MANAGE',         'value': '912', 'title': $gettext('Manage CRM')},
        {'enums': 'ChartOfAccounts_MANAGE', 'value': '913', 'title': $gettext('Manage Chart of Accounts')},
      ]
    }
  ]
}
const permissionList = function() {
  return permissionModules().reduce(function(result, item, index) {
    result = result.concat(item.permissions.map(({enums: name, value}) => {return {name, value, module: item.value}}))
    return result
  }, [])
}
const getPermissionAction = function(permission) {
  if(permission.action) return permission.action
  const idx = permission.name.indexOf('_')
  return idx === -1 ? permission.name : permission.name.slice(idx + 1)
}
export const getPermissionFromValue = function(value) {
  if(value == '99') return {subject: 'all', action: 'manage'}
  return permissionList().reduce(function(result, item, index) {
    if(item.value == value) {
      const chunks = item.name.split(/_(.*)/s)
      result = {
        subject: chunks[0],
        action: getPermissionAction(item)
      }
    }

    return result;
  }, null)
}
export const enums = function() {
  return permissionList().reduce(function(result, item, index) {
  result[item.name] = item.value;
  return result;
}, {})
}

export const firstRouteFromAbilities = (abilities) => {

  if(!abilities) return null
  const firstModule = permissionModules().find(pModule => {
    if(pModule.value === 'Quote') return false
    if(pModule.value === 'Rate') return false
    if(abilities.some(ability => ability.action === 'manage' && ability.subject ==='all')) {
      return true
    }
    return abilities.some(
      ability => ability.subject === pModule.value
      || (
        pModule.aliasValues
        && pModule.aliasValues.includes(ability.subject)
      )
    )
  })
  console.log(firstModule, 'firstModule')
  return firstModule.to
}
