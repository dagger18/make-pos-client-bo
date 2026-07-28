import { displayFileSize, printDateTime } from "@/services/CommonService"
export const headers = () => {
  return [
    { key: 'category', text: $gettext('Type')},
    { key: 'note', text: $gettext('Note')},
    { key: 'name', text: $gettext('Name')},
    { key: 'size', 
      text: $gettext('Size'), 
      renderObject (item) {
        return item.size ?  displayFileSize(item.size) : ''
      }
    },
    { 
      key: 'createdBy', 
      text: $gettext('Created By'),
      sortable: false,
      renderAvatar: true,
      headerClass: 'text-center',
      bodyClass: 'text-center'
    },
    { 
      key: 'createdDate', 
      text: $gettext('Created On'),
      renderObject (item) {
        return item.createdDate ?  printDateTime(item.createdDate) : ''
      },
      bodyClass: 'pe-4'
    },
    { 
      key: 'id', 
      text: $gettext('Action'), 
      sortable: false, 
      renderSlot: 'action', 
      bodyClass: 'px-0',
      headerClass: 'text-end pe-4' 
    },
  ]
}
  