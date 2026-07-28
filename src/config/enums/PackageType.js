const list = [{
  title: "CRT",    value: "CRT"}, {
  title: "PKGS",    value: "PKGS"}, {
  title: "CAS",    value: "CAS"}, {
  title: "BAL",    value: "BAL"}, {
  title: "CTNS",    value: "CTNS"}, {
  title: "BAG(S)",    value: "BAG(S)"}, {
  title: "BALE(S)",    value: "BALE(S)"}, {
  title: "BOX(S)",    value: "BOX(S)"}, {
  title: "BULK(S)",    value: "BULK(S)"}, {
  title: "BUNDLE(S)",    value: "BUNDLE(S)"}, {
  title: "CARTON(S)",    value: "CARTON(S)"}, {
  title: "CASE(S)",    value: "CASE(S)"}, {
  title: "COIL(S)",    value: "COIL(S)"}, {
  title: "CRATE(S)",    value: "CRATE(S)"}, {
  title: "CYLINDER(S)",    value: "CYLINDER(S)"}, {
  title: "DRUM(S)",    value: "DRUM(S)"}, {
  title: "JUMBO BAG(S)",    value: "JUMBO BAG(S)"}, {
  title: "LINE DETENTION",    value: "LINE DETENTION"}, {
  title: "PACKAGE(S)",    value: "PACKAGE(S)"}, {
  title: "PACKING CARTON(S)",    value: "PACKING CARTON(S)"}, {
  title: "PALLET(S)",    value: "PALLET(S)"}, {
  title: "PIECES",    value: "PIECES"}, {
  title: "WOODEN BOX(S)",    value: "WOODEN BOX(S)"}, {
  title: "WOODEN CRATES",    value: "WOODEN CRATES"}, {
  title: "WOODEN CASE(S)",    value: "WOODEN CASE(S)"}, {
  title: "ROLL(S)",    value: "ROLL(S)"}, {
  title: "SET(S)",    value: "SET(S)"}, {
  title: "UNIT(S)",    value: "UNIT(S)"}, {
  title: "STEEL DRUMS",    value: "STEEL DRUMS"}, {
  title: "CLEATED PLYWOOD BOXES",    value: "CLEATED PLYWOOD BOXES"}, {
  title: "FIBREBOARD BOXES",    value: "FIBREBOARD BOXES"}, {
  title: "CARDBOARD BOXES",    value: "CARDBOARD BOXES"}, {
  title: "DOZEN",    value: "DOZEN"}, {
  title: "PAIR",    value: "PAIR"}, {
  title: "PAIL",    value: "PAIL"}, {
  title: "CASKS",    value: "CASKS"}, {
  title: "KEGS",    value: "KEGS"}, {
  title: "SLAB(S)",    value: "SLAB(S)"}, {
  title: "SACK",    value: "SACK"}, {
  title: "SKIDS",    value: "SKIDS"}, {
  title: "BARRELS",    value: "BARRELS"}, {
  title: "BLISTER",    value: "BLISTER"}, {
  title: "CAN",    value: "CAN"}, {
  title: "CUP",    value: "CUP"}, {
  title: "CAPSULE",    value: "CAPSULE"}, {
  title: "FOIL",    value: "FOIL"}, {
  title: "PACKET",    value: "PACKET"}, {
  title: "TABLET",    value: "TABLET"}, {
  title: "TANK",    value: "TANK"}, {
  title: "TOTE",    value: "TOTE"}, {
  title: "BOTTLE",    value: "BOTTLE"}, {
  title: "FLOWPACK",    value: "FLOWPACK"}, {
  title: "JAR",    value: "JAR"}, {
  title: "TRAY",    value: "TRAY"}, {
  title: "CAGE",    value: "CAGE"}, {
  title: "ROLL CAGE",    value: "ROLL CAGE"}, {
  title: "SLIT BOX",    value: "SLIT BOX"}, {
  title: "PRESSURIZED CONTAINER",    value: "PRESSURIZED CONTAINER"}, {
  title: "Barrel (Thùng)",    value: "BA"}, {
  title: "Bundle (Gói)",    value: "BE"}, {
  title: "Bag (Túi)",    value: "BG"}, {
  title: "Basket (Giỏ)",    value: "BK"}, {
  title: "BASKET(S)",    value: "BASKET(S)"}, {
  title: "Bale,compressed (Gói dạng nén)",    value: "BL"}, {
  title: "Bale,non-compressed (Gói không nén)",    value: "BN"}, {
  title: "Bar (Thanh)",    value: "BR"}, {
  title: "Box (Hộp)",    value: "BX"}, {
  title: "Can, rectangular (Thùng, hình hộp chữ nhật)",    value: "CA"}, {
  title: "Cage (Lồng)",    value: "CG"}, {
  title: "Cask (Thùng tô nô)",    value: "CK"}, {
  title: "Coil (Cuốn)",    value: "CL"}, {
  title: "Container",    value: "CN"}, {
  title: "Carboy, non-protected (Chai, không được bảo vệ)",    value: "CO"}, {
  title: "Carboy, protected (Chai đựng axit)",    value: "CP"}, {
  title: "Crate (Giỏ)",    value: "CR"}, {
  title: "Case (Thùng)",    value: "CS"}, {
  title: "Carton (Thùng carton)",    value: "CT"}, {
  title: "Can, cylindrical (Hộp hình trụ)",    value: "CX"}, {
  title: "Cylinder (Xylanh)",    value: "CY"}, {
  title: "Drum (Thùng)",    value: "DR"}, {
  title: "Keg (Thùng đựng cá mòi muối)",    value: "KG"}, {
  title: "Log (Khúc gỗ)",    value: "LG"}, {
  title: "Logs, in bundle/bunch/truss",    value: "LZ"}, {
  title: "MST",    value: "MST"}, {
  title: "Mat (Thảm)",    value: "MT"}, {
  title: "Unpacked  or unpackaged (Hàng rời, không đóng gói)",    value: "NE"}, {
  title: "Net (Cuộn)",    value: "NT"}, {
  title: "Packet (Gói)",    value: "PA"}, {
  title: "Parcel (Lô, bưu kiện, gói hàng)",    value: "PC"}, {
  title: "Pen (Lồng)",    value: "PE"}, {
  title: "Plate (Đĩa)",    value: "PG"}, {
  title: "Pipe (ống)",    value: "PI"}, {
  title: "Package (Kiện, gói)",    value: "PK"}, {
  title: "Pail (Thùng đựng nước)",    value: "PL"}, {
  title: "Pallet & Package",    value: "PP"}, {
  title: "Pallet (PLTS)",    value: "PLTS"}, {
  title: "Piece",    value: "PS"}, {
  title: "Tray (Khay)",    value: "PU"}, {
  title: "Roll(Cuộn)",    value: "RL"}, {
  title: "Tank  (Thùng, két, bể chứa hình trụ)",    value: "TY"}, {
  title: "Other (Loại khác)",    value: "ZZ"}]
export const enums = list.reduce(function(result, item, index) {
  result[item.enums] = item.value;
  return result;
}, {})
export const getList = list.map(({value, title}) => {return {value, title}})
export const getTitle = (findValue) => {
  if(!findValue) return null
  return list.find(({value}) => value === findValue).title
}

