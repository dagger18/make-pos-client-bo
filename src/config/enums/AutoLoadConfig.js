import DepartmentService from '@/services/DepartmentService'
import LocationService from '@/services/LocationService'
import ClientService from '@/services/ClientService'
import CurrencyService from '@/services/CurrencyService'
// DatasetService removed - freight-specific service
const DatasetService = null;
import ExchangeRateGroupService from '@/services/ExchangeRateGroupService'
// PriceMarkupService removed - freight-specific service
const PriceMarkupService = null;
// ProviderService removed - freight-specific service
const ProviderService = null;
// RateService removed - freight-specific service
const RateService = null;
import UserGroupService from '@/services/UserGroupService'
import UserService from '@/services/UserService'
import CalculationTypeService from '@/services/library/CalculationTypeService'
import ChargeService from '@/services/library/ChargeService'
import CustomChargeTypeService from '@/services/library/CustomChargeTypeService'
import IncotermService from '@/services/library/IncotermService'
import PaymentMethodService from '@/services/library/PaymentMethodService'
import ShipmentModeService from '@/services/library/ShipmentModeService'
import TaxGroupService from '@/services/library/TaxGroupService'

export default {
  clients: {
    list: [],
    loader: ClientService.list,
    touched: false,
    clearRoute: 'client',
  },
  providers: {
    list: [],
    loader: ProviderService.list,
    touched: false,
    clearRoute: 'provider-provider-type',
  },
  users: {
    list: [],
    loader: UserService.list,
    touched: false,
    clearRoute: 'setting-users',
  },
  userGroups: {
    list: [],
    loader: UserGroupService.list,
    touched: false,
    clearRoute: 'setting-groups',
  },
  priceMarkups: {
    list: [],
    loader: PriceMarkupService.list,
    touched: false,
    clearRoute: 'price-markup',
  },
  calculationTypes: {
    list: [],
    loader: CalculationTypeService.list,
    touched: false,
  },
  customChargeTypes: {
    list: [],
    loader: CustomChargeTypeService.list,
    touched: false,
    clearRoute: 'library-charge-type-charge-type',
  },
  charges: {
    list: [],
    loader: ChargeService.list,
    touched: false,
    clearRoute: 'library-charge-type-charge-transport-type',
  },
  shipmentModes: {
    list: [],
    loader: ShipmentModeService.list,
    touched: false,
    clearRoute: 'library-shipment-mode',
  },
  currencies: {
    list: [],
    loader: CurrencyService.list,
    touched: false,
  },
  exchangeRateGroups: {
    list: [],
    loader: ExchangeRateGroupService.list,
    touched: false,
    clearRoute: 'setting-global-setting',
  },
  incoterms: {
    list: [],
    loader: IncotermService.list,
    touched: false,
    clearRoute: 'setting-global-setting',
  },
  paymentMethods: {
    list: [],
    loader: PaymentMethodService.list,
    touched: false,
    clearRoute: 'library-payment-method',
  },
  taxGroups: {
    list: [],
    loader: TaxGroupService.list,
    touched: false,
    clearRoute: 'library-tax-group',
  },
  rates: {
    list: [],
    loader: RateService.list,
    touched: false,
    clearRoute: [
      'rate-local-transport-type',
      'rate-service-transport-type',
      'rate-customs-transport-type',
      'rate-freight-transport-type',
    ],
  },
  datasets: {
    list: [],
    loader: DatasetService.list,
    touched: false,
    clearRoute: 'report-dataset',
  },
  departments: {
    list: [],
    loader: DepartmentService.list,
    touched: false,
    clearRoute: 'setting-department',
  },
  locations: {
    list: [],
    loader: LocationService.list,
    touched: false,
    clearRoute: 'setting-location',
  },
}
