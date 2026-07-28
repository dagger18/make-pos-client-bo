const list = [
    { 'enums': '20DC', 'value': '20DC', 'title': $gettext("20'DC") },
    { 'enums': '40DC', 'value': '40DC', 'title': $gettext("40'DC") },
    { 'enums': '20RF', 'value': '20RF', 'title': $gettext("20'RF") },
    { 'enums': '40RF', 'value': '40RF', 'title': $gettext("40'RF") },
    { 'enums': '20OT', 'value': '20OT', 'title': $gettext("20'OT") },
    { 'enums': '40OT', 'value': '40OT', 'title': $gettext("40'OT") },
    { 'enums': '20FR', 'value': '20FR', 'title': $gettext("20'FR") },
    { 'enums': '40FR', 'value': '40FR', 'title': $gettext("40'FR") },
    { 'enums': '40HC', 'value': '40HC', 'title': $gettext("40'HC") },
    { 'enums': '45HC', 'value': '45HC', 'title': $gettext("45'HC") },
    { 'enums': '20TK', 'value': '20TK', 'title': $gettext("20'Tank") },
    { 'enums': '40TK', 'value': '40TK', 'title': $gettext("40'Tank") },
    { 'enums': 'FDC', 'value': 'FDC', 'title': $gettext("FOOCDC") },
    { 'enums': 'FHC', 'value': 'FHC', 'title': $gettext("FOOCHC") },
]
export const enums = list.reduce(function(result, item, index) {
  result[item.enums] = item.value;
  return result;
}, {})
export const getList = list.map(({value, title}) => {return {value, title}})
export const getTitle = (findValue) => {
  if(!findValue) return null
  return list.find(({value}) => value === findValue).title
}

